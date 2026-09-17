import { expect, type Page, test } from '@playwright/test';
import { cameras, type CameraSpec } from 'content/cameras';
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
 * Bearing is left out of the stillness test on purpose: the hello globe
 * spins, so its bearing is never twice the same and requiring it to be
 * would hang here rather than assert anything.
 */
const MIN_DWELL_MS = 1_200;
const REST_BUDGET_MS = 25_000;
const SAMPLE_MS = 150;

const framing = (at: Transform): string =>
  [at.lng, at.lat, at.zoom, at.pitch].join(',');

const restingTransform = async (
  page: Page,
  beforePasses: number,
): Promise<Transform | null> => {
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
      framing(at) === previous
    ) {
      return at;
    }
    previous = at === null ? null : framing(at);
    await page.waitForTimeout(SAMPLE_MS);
  }
  return at;
};

/** The first route the tab ever sees, settled. */
const loadAndSettle = async (
  page: Page,
  href: string,
): Promise<Transform | null> => {
  await page.goto(href, { waitUntil: 'load' });
  await waitForScene(page, 'live');
  return restingTransform(page, 0);
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
): Promise<Transform | null> => {
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
  return restingTransform(page, before);
};

/*
 * Centre, zoom and pitch are asserted to three decimal places -- the
 * camera table's own precision, and far tighter than any of the wrong
 * answers this guards against, which were whole routes away.
 *
 * Bearing gets a tolerance instead, and only on the spinning routes: the
 * globe is turning by the time anything can read it. 0.0015 degrees a
 * frame is a degree every eleven seconds, so a degree is generous for a
 * read taken a second or two after the flight lands, and still nowhere
 * near /projects' -12 or the detail route's -20.
 */
const SPIN_SLACK_DEG = 1;

const expectArrivedAt = (
  at: Transform | null,
  want: CameraSpec,
  where: string,
): void => {
  expect(at, `no transform to read at ${where}`).not.toBeNull();
  const got = at as Transform;
  expect(got.lng, `${where}: longitude`).toBeCloseTo(
    want.center[0],
    3,
  );
  expect(got.lat, `${where}: latitude`).toBeCloseTo(
    want.center[1],
    3,
  );
  expect(got.zoom, `${where}: zoom`).toBeCloseTo(want.zoom, 3);
  expect(got.pitch, `${where}: pitch`).toBeCloseTo(want.pitch, 3);
  if (want.spin === null) {
    expect(got.bearing, `${where}: bearing`).toBeCloseTo(
      want.bearing,
      3,
    );
    return;
  }
  // A spinning route only ever turns forward from the bearing it landed on.
  expect(got.bearing, `${where}: bearing`).toBeGreaterThanOrEqual(
    want.bearing,
  );
  expect(got.bearing, `${where}: bearing`).toBeLessThan(
    want.bearing + SPIN_SLACK_DEG,
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
      await loadAndSettle(page, '/'),
      cameras.hello,
      'cold /',
    );
  });

  test('returns to it from /projects', async ({ page }) => {
    expectArrivedAt(
      await loadAndSettle(page, '/'),
      cameras.hello,
      'cold /',
    );

    expectArrivedAt(
      await hop(page, '/projects', 'projects'),
      cameras.projects,
      '/projects',
    );
    expectArrivedAt(
      await hop(page, '/', 'hello'),
      cameras.hello,
      'back at /',
    );
  });

  test('returns to it from a detail route by way of /about', async ({
    page,
  }) => {
    expectArrivedAt(
      await loadAndSettle(page, '/'),
      cameras.hello,
      'cold /',
    );

    expectArrivedAt(
      await hop(page, '/projects', 'projects'),
      cameras.projects,
      '/projects',
    );
    expectArrivedAt(
      await hop(page, '/projects/gopro', 'projectDetail'),
      detailCamera,
      '/projects/gopro',
    );
    expectArrivedAt(
      await hop(page, '/about', 'about'),
      cameras.about,
      '/about',
    );

    const home = await hop(page, '/', 'hello');
    expectArrivedAt(home, cameras.hello, 'back at /');

    /*
     * And it is turning again. The spin loop stops whenever the scene is
     * not live and is only ever rearmed by the scene pass, so "the globe
     * came home" and "the globe is a spinning globe again" are two
     * different claims and both are the user's.
     */
    const before = (home as Transform).bearing;
    await page.waitForTimeout(2_000);
    const after = await readTransform(page);
    expect(
      after,
      'no transform to read after the spin',
    ).not.toBeNull();
    expect(
      (after as Transform).bearing,
      'the hello globe is not turning',
    ).toBeGreaterThan(before);
  });
});
