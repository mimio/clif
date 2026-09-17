import { expect, type Page, test } from '@playwright/test';
import {
  cameras,
  SPIN_DEG_PER_SECOND,
  type CameraSpec,
} from 'content/cameras';
import { frameCamera } from 'scene/camera';
import { anchors } from 'content/anchors';
import { installSceneDebug, waitForScene } from '../fixtures/app';
import { stubMapboxNetwork } from '../fixtures/mapbox-stub';

/*
 * A ROUTE DECLARES A CAMERA AND THE SCENE FLIES TO IT. This asks whether
 * the globe actually ARRIVES.
 *
 * The complaint was "anytime I go back to home, it doesn't reset to the
 * globe", together with "the globe is nowhere near the correct location".
 * Both were flights that went out correctly and were then cancelled by
 * something else writing the transform, and there were two of those:
 *
 *   THE SPIN.  `map.setBearing` is `jumpTo({ bearing })`, and jumpTo
 *              opens with `_stop()`. The scene's rotation loop took the
 *              frame after the route's easeTo went out, so on every route
 *              whose resting camera spins -- hello, and the 404 -- the
 *              flight died about one frame in and the map sat at
 *              whatever the last route had left it at.
 *   THE STYLE. A Map constructed without a centre or a zoom keeps
 *              `transform.unmodified`, and mapbox jumps to the
 *              STYLESHEET's own camera when the style loads. That landed
 *              on roughly half of cold loads -- whichever ones the
 *              style beat an ease frame to.
 *
 * Nothing that records calls can see either. `easeTo` WAS called, with
 * the right camera, at the right moment, with the right duration -- the
 * stub tier would report all four and be wrong about every one of them,
 * because what failed happened afterwards, inside mapbox-gl. So this runs
 * against the REAL library with only the network answered, and reads the
 * map's own transform: getCenter, getZoom, getPitch, getBearing. There is
 * no assertion here that a recording could satisfy.
 */

/** What the map's transform actually says, plus whether it is still flying. */
type Transform = {
  lng: number;
  lat: number;
  zoom: number;
  pitch: number;
  bearing: number;
  easing: boolean;
};

/** One read of the map, alongside the scene's own progress counter. */
type Sample = {
  at: Transform | null;
  passes: number;
};

/**
 * A transform that has stopped flying, and how far the rotation could
 * have carried it by the time it was read.
 *
 * The globe turns by walking its CENTRE LONGITUDE east, so on a spinning
 * route there is no such thing as a resting longitude to compare against
 * -- only "the one it landed on, plus however much it has turned since".
 * That budget is not a guess: the spin cannot start before the scene pass
 * that issues the flight, so the wall-clock time from the pass to the
 * read bounds it, and the bound is carried here rather than baked in as a
 * tolerance that would have to cover the slowest imaginable runner.
 */
type Rest = {
  at: Transform | null;
  /** Degrees of rotation the read could legitimately include. */
  drift: number;
};

const readSample = (page: Page): Promise<Sample> =>
  page.evaluate(() => {
    const scene = window.__SCENE__;
    const map = scene?.map;
    const passes = scene?.passes() ?? 0;
    if (!map) return { at: null, passes };
    const center = map.getCenter();
    return {
      passes,
      at: {
        lng: center.lng,
        lat: center.lat,
        zoom: map.getZoom(),
        pitch: map.getPitch(),
        bearing: map.getBearing(),
        easing: map.isEasing(),
      },
    };
  });

const readTransform = async (page: Page): Promise<Transform | null> =>
  (await readSample(page)).at;

const scenePasses = (page: Page): Promise<number> =>
  page.evaluate(() => window.__SCENE__?.passes() ?? 0);

/*
 * WHAT "SETTLED" HAS TO MEAN HERE, and why none of the three parts is
 * removable.
 *
 * A scene PASS has to have run, because the flight is issued from inside
 * one and nothing before that has been asked to move. Waiting on the
 * route instead would read the previous route's camera and call it an
 * answer -- and would have read [0, 0] zoom 0 on a cold load, which is
 * the map's constructed default rather than any camera at all.
 *
 * Then a DWELL past the longest flight (SCENE_MOVE_LONG_MS, 900ms), plus
 * a STILLNESS: not easing, and the transform unchanged since the previous
 * sample. `isEasing()` alone is not enough and is the trap this bug set --
 * the broken build's flight was cancelled inside its first frame, so the
 * map was genuinely not easing a few milliseconds in, sitting on the
 * camera of the route before.
 *
 * LONGITUDE is left out of the stillness test on the spinning routes, and
 * that is not a loosening -- it is the same allowance this file already
 * made for the bearing, moved to the axis the globe now turns on. The
 * hello globe walks its centre meridian east for ever, so its longitude
 * is never twice the same and requiring it to be would hang here rather
 * than assert anything. Everything else about the arrival -- latitude,
 * zoom, pitch, and the longitude it landed on, to within what the
 * rotation can account for -- is still asserted.
 */
const MIN_DWELL_MS = 1_200;
const REST_BUDGET_MS = 25_000;
const SAMPLE_MS = 150;

/** Whether the route this is settling is one whose globe turns. */
const spins = (spec: CameraSpec): boolean =>
  spec.spinDegPerSecond !== null;

const framing = (at: Transform, spec: CameraSpec): string =>
  [spins(spec) ? '' : at.lng, at.lat, at.zoom, at.pitch].join(',');

const since = (from: number | null): number =>
  from === null ? 0 : Date.now() - from;

const restingTransform = async (
  page: Page,
  beforePasses: number,
  spec: CameraSpec,
): Promise<Rest> => {
  const deadline = Date.now() + REST_BUDGET_MS;
  let passedAt: number | null = null;
  let previous: string | null = null;
  let at: Transform | null = null;
  while (Date.now() < deadline) {
    const sample = await readSample(page);
    at = sample.at;
    if (passedAt === null && sample.passes > beforePasses) {
      passedAt = Date.now();
    }
    if (
      at !== null &&
      passedAt !== null &&
      Date.now() - passedAt >= MIN_DWELL_MS &&
      !at.easing &&
      framing(at, spec) === previous
    ) {
      return {
        at,
        drift: (SPIN_DEG_PER_SECOND * since(passedAt)) / 1_000,
      };
    }
    previous = at === null ? null : framing(at, spec);
    await page.waitForTimeout(SAMPLE_MS);
  }
  return {
    at,
    drift: (SPIN_DEG_PER_SECOND * since(passedAt)) / 1_000,
  };
};

/** The first route the tab ever sees, settled. */
const loadAndSettle = async (
  page: Page,
  href: string,
  spec: CameraSpec,
): Promise<Rest> => {
  await page.goto(href, { waitUntil: 'load' });
  await waitForScene(page, 'live');
  return restingTransform(page, 0, spec);
};

/**
 * One hop, driven through the router rather than by clicking a link: what
 * is under test is the persistent scene's response to a route change, not
 * another lane's markup.
 */
const hop = async (
  page: Page,
  href: string,
  scene: string,
  spec: CameraSpec,
): Promise<Rest> => {
  const before = await scenePasses(page);
  await page.evaluate((to) => {
    (
      window as unknown as {
        next?: { router?: { push(to: string): void } };
      }
    ).next?.router?.push(to);
  }, href);
  await page.waitForURL(`**${href}`);
  await expect(page.getByTestId('scene-root')).toHaveAttribute(
    'data-scene',
    scene,
  );
  return restingTransform(page, before, spec);
};

/*
 * Latitude, zoom, pitch and bearing are asserted to three decimal places
 * -- the camera table's own precision, and far tighter than any of the
 * wrong answers this guards against, which were whole routes away.
 *
 * BEARING IS NOW AMONG THEM, and that is a claim in its own right. The
 * globe used to turn by rolling the bearing, which meant this file could
 * only ever ask that it be near the camera's; it turns the centre
 * meridian instead, so the bearing must now be exactly what the route
 * declared and a route that rolls is a failure.
 *
 * LONGITUDE is the one that moves, because that is what the rotation is.
 * It gets the drift budget the settle measured -- the rotation rate times
 * the time from the scene pass to the read -- plus a hundredth of a
 * degree for the arithmetic. The window is about a second in practice,
 * so the band is a degree and a half wide against wrong answers that are
 * whole routes away: /projects' centre is 24.7 degrees east of hello's.
 */
const LNG_SLACK_DEG = 0.01;

/*
 * The table's `zoom` and `padding` are the frame at the ARTBOARD size, and
 * this spec does not run there -- the project's viewport is Desktop
 * Chrome's. A hello camera compared against the literal therefore fails by
 * exactly log2(900 / viewportHeight), which is a fact about the window and
 * not about coming home. So the expectation is framed for the viewport the
 * page actually has, the same way scene/SceneRoot.tsx frames it, and this
 * spec keeps asserting only its own question.
 *
 * Framing across viewports is e2e/hermetic/globe-frame.spec.ts's job.
 */
const expectArrivedAt = (
  rest: Rest,
  spec: CameraSpec,
  where: string,
  viewport: { width: number; height: number } | null,
): void => {
  expect(rest.at, `no transform to read at ${where}`).not.toBeNull();
  const got = rest.at as Transform;
  const want = frameCamera(spec, viewport);
  expect(got.lat, `${where}: latitude`).toBeCloseTo(
    want.center[1],
    3,
  );
  expect(got.zoom, `${where}: zoom`).toBeCloseTo(want.zoom, 3);
  expect(got.pitch, `${where}: pitch`).toBeCloseTo(want.pitch, 3);
  expect(got.bearing, `${where}: bearing`).toBeCloseTo(
    want.bearing,
    3,
  );
  if (!spins(want)) {
    expect(got.lng, `${where}: longitude`).toBeCloseTo(
      want.center[0],
      3,
    );
    return;
  }
  /*
   * A spinning route only ever turns EAST from the longitude it landed
   * on, and only as far as the clock allows.
   */
  expect(got.lng, `${where}: longitude`).toBeGreaterThanOrEqual(
    want.center[0] - LNG_SLACK_DEG,
  );
  expect(got.lng, `${where}: longitude`).toBeLessThan(
    want.center[0] + rest.drift + LNG_SLACK_DEG,
  );
};

const detailCamera: CameraSpec = {
  ...cameras.projectDetail,
  center: anchors.vail.center,
};

test.describe('the camera comes home', () => {
  test.beforeEach(async ({ context, page }) => {
    await stubMapboxNetwork(context);
    await installSceneDebug(page);
  });

  test('lands on the hello camera on a cold load of /', async ({
    page,
  }) => {
    expectArrivedAt(
      await loadAndSettle(page, '/', cameras.hello),
      cameras.hello,
      'cold /',
      page.viewportSize(),
    );
  });

  test('returns to it from /projects', async ({ page }) => {
    expectArrivedAt(
      await loadAndSettle(page, '/', cameras.hello),
      cameras.hello,
      'cold /',
      page.viewportSize(),
    );

    expectArrivedAt(
      await hop(page, '/projects', 'projects', cameras.projects),
      cameras.projects,
      '/projects',
      page.viewportSize(),
    );
    expectArrivedAt(
      await hop(page, '/', 'hello', cameras.hello),
      cameras.hello,
      'back at /',
      page.viewportSize(),
    );
  });

  test('returns to it from a detail route by way of /about', async ({
    page,
  }) => {
    expectArrivedAt(
      await loadAndSettle(page, '/', cameras.hello),
      cameras.hello,
      'cold /',
      page.viewportSize(),
    );

    expectArrivedAt(
      await hop(page, '/projects', 'projects', cameras.projects),
      cameras.projects,
      '/projects',
      page.viewportSize(),
    );
    expectArrivedAt(
      await hop(
        page,
        '/projects/gopro',
        'projectDetail',
        detailCamera,
      ),
      detailCamera,
      '/projects/gopro',
      page.viewportSize(),
    );
    expectArrivedAt(
      await hop(page, '/about', 'about', cameras.about),
      cameras.about,
      '/about',
      page.viewportSize(),
    );

    const home = await hop(page, '/', 'hello', cameras.hello);
    expectArrivedAt(
      home,
      cameras.hello,
      'back at /',
      page.viewportSize(),
    );

    /*
     * And it is turning again. The spin loop stops whenever the scene is
     * not live and is only ever rearmed by the scene pass, so "the globe
     * came home" and "the globe is a spinning globe again" are two
     * different claims and both are the user's.
     */
    const before = (home.at as Transform).lng;
    const waited = 2_000;
    await page.waitForTimeout(waited);
    const after = await readTransform(page);
    expect(
      after,
      'no transform to read after the spin',
    ).not.toBeNull();
    /*
     * Eastward, and by roughly what two seconds of it should be. Half the
     * nominal traversal is the floor: it says the globe is turning at
     * something like the right speed rather than merely not being stuck,
     * which is the difference this whole change was about -- the old rate
     * would have moved it a thirtieth of a degree and passed any test
     * that only asked for "more than before".
     */
    const turned = (after as Transform).lng - before;
    expect(turned, 'the hello globe is not turning').toBeGreaterThan(
      (SPIN_DEG_PER_SECOND * waited) / 1_000 / 2,
    );
  });
});
