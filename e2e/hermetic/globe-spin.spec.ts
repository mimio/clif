import { expect, type Page, test } from '@playwright/test';
import { cameras } from 'content/cameras';
import {
  installSceneDebug,
  waitForMapIdle,
  waitForScene,
} from '../fixtures/app';
import { stubMapboxNetwork } from '../fixtures/mapbox-stub';

/*
 * IS THE GLOBE TURNING, HOW FAST, AND WHICH WAY.
 *
 * The complaint was "the rotation needs to increase and the rotation is
 * supposed to be going to the left". Both halves of that are claims about
 * what the visitor SEES, and neither one is answered by reading a number
 * out of content/cameras.ts. A spin rate in a table is a number somebody
 * typed; it says nothing about how many degrees a second the transform
 * actually traverses, and a sign in a table says nothing at all about
 * which way the ground goes -- the app spent its whole life turning the
 * BEARING, which at pitch 0 spins the sphere about the screen's view
 * axis, poles and all, and moves a point near the projection centre
 * essentially nowhere. Every camera-table assertion in the repository was
 * green throughout.
 *
 * So both claims are measured here, off the real mapbox-gl transform,
 * over a measured wall-clock interval:
 *
 *   THE RATE       degrees of centre longitude traversed per second,
 *                  against the prototype's one revolution per 240s.
 *   THE DIRECTION  where a FIXED PLACE lands on the screen, sampled
 *                  through mapbox's own `project`. If the Earth is
 *                  turning the way the prototype turns it, a place must
 *                  walk LEFT across the glass -- smaller screen x, frame
 *                  after frame. That is the user's sentence, and it is
 *                  the only form of it that a camera table cannot fake.
 *
 * No tiles are needed for any of this: rotation is transform state, and
 * `project` is arithmetic over the transform. The network is stubbed and
 * the real library runs, the same as scene-box and stress-nav.
 */

/** The prototype's `orbit()`: `rot = t * (Math.PI * 2 / 240)`. */
const REVOLUTION_S = 240;
const WANT_DEG_PER_S = 360 / REVOLUTION_S;

/*
 * A tenth of the rate. The error this guards against was 16.7x -- the
 * table's 0.0015 degrees a FRAME is 0.09 degrees a second, one revolution
 * every 67 minutes -- so nothing this test is for lands anywhere near the
 * band. What sets the floor on the other side is the sampling: the window
 * is read between rAF ticks at both ends, so up to two frames of the
 * traversal can fall outside it, which is 1% of a 3s window at 60fps and
 * 4% at 15fps. A tenth clears a badly loaded runner and still fails a
 * rate that is wrong by a factor of anything.
 */
const RATE_TOLERANCE = 0.1;

/** How long to watch the transform for. */
const WINDOW_MS = 3_000;

/*
 * Two fixed places, both on the hemisphere the hello camera faces and
 * neither near a pole, where longitude is degenerate.
 *
 * The first is the hello camera's own resting centre, and it is the
 * sharpest probe there is: under a BEARING spin it is the point the
 * rotation is about, so it does not move at all, while under an axial
 * rotation it walks left at the full rate. The second is 35 degrees south
 * of it, which moves under either and pins down that the whole visible
 * face travels together rather than pivoting.
 */
const PROBES: [number, number][] = [
  [cameras.hello.center[0], cameras.hello.center[1]],
  [cameras.hello.center[0], 10],
];

/*
 * The smallest leftward walk worth calling a direction.
 *
 * At the hello framing the painted sphere's radius is 0.44 of the
 * viewport height, so about 317px on this project's 720px-tall window. A
 * 3s window at 1.5 deg/s turns the Earth 4.5 degrees, which carries the
 * centre probe 317 * cos(45.5) * sin(4.5) = about 17px left. Ten is
 * comfortably under that and enormously over the sub-pixel drift a
 * bearing spin at the old rate produces at the same place.
 */
const MIN_WALK_PX = 10;

/** One read of the transform, taken inside a frame. */
type Sample = {
  /** performance.now(), so the interval is measured where it happens. */
  t: number;
  lng: number;
  bearing: number;
  /** Screen x of each probe, in CSS pixels. */
  x: number[];
};

/*
 * SETTLING, and why it is the same three-part wait camera-return.spec.ts
 * uses rather than a sleep.
 *
 * The route opens with an 800ms easeTo, the spin yields for the whole of
 * it (`isEasing()`, which is what keeps `jumpTo` from cancelling the
 * flight), and a window that straddles the landing measures a rate the
 * spin never ran at. So: a completed scene pass, because the flight is
 * issued from inside one; a dwell past the longest flight; and then
 * stillness -- not easing, and a zoom that has stopped changing. Centre
 * and bearing are no use as a stillness test on this route, for the
 * obvious reason.
 */
const MIN_DWELL_MS = 1_200;
const SETTLE_BUDGET_MS = 25_000;
const SAMPLE_MS = 150;

type Rest = { zoom: number; easing: boolean; passes: number };

const readRest = (page: Page): Promise<Rest | null> =>
  page.evaluate(() => {
    const scene = window.__SCENE__;
    const map = scene?.map;
    if (!scene || !map) return null;
    return {
      zoom: map.getZoom(),
      easing: map.isEasing(),
      passes: scene.passes(),
    };
  });

const settle = async (page: Page): Promise<void> => {
  const deadline = Date.now() + SETTLE_BUDGET_MS;
  let passedAt: number | null = null;
  let previous: number | null = null;
  while (Date.now() < deadline) {
    const rest = await readRest(page);
    if (rest !== null) {
      if (passedAt === null && rest.passes > 0) passedAt = Date.now();
      if (
        passedAt !== null &&
        Date.now() - passedAt >= MIN_DWELL_MS &&
        !rest.easing &&
        rest.zoom === previous
      ) {
        return;
      }
      previous = rest.zoom;
    }
    await page.waitForTimeout(SAMPLE_MS);
  }
  throw new Error('the hello camera never settled');
};

/**
 * Watches the transform for `WINDOW_MS`, one read per animation frame.
 *
 * Sampling inside rAF rather than over the wire is what makes the rate
 * trustworthy: `performance.now()` is read in the same frame as the
 * transform, so the interval is the browser's own and carries none of the
 * round-trip jitter a poll from Node would add to both ends.
 */
const watch = (page: Page, ms: number): Promise<Sample[]> =>
  page.evaluate(
    ([duration, probes]) =>
      new Promise<Sample[]>((done) => {
        const map = window.__SCENE__?.map;
        if (!map) {
          done([]);
          return;
        }
        const samples: Sample[] = [];
        const opened = performance.now();
        const step = (): void => {
          const now = performance.now();
          const centre = map.getCenter();
          samples.push({
            t: now,
            lng: centre.lng,
            bearing: map.getBearing(),
            x: probes.map((at) => map.project(at).x),
          });
          if (now - opened >= duration) {
            done(samples);
            return;
          }
          requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }),
    [ms, PROBES] as const,
  );

/**
 * Longitude as a continuous quantity.
 *
 * A camera that keeps turning east crosses the antimeridian, and the
 * transform wraps there. Unwrapping is a property of the reading, not of
 * the camera: the traversal between two consecutive frames is a fraction
 * of a degree, so the nearest equivalent is never ambiguous.
 */
const unwrap = (lngs: number[]): number[] => {
  const out: number[] = [];
  let carry = 0;
  for (let i = 0; i < lngs.length; i += 1) {
    if (i > 0) {
      const step = lngs[i] - lngs[i - 1];
      if (step > 180) carry -= 360;
      if (step < -180) carry += 360;
    }
    out.push(lngs[i] + carry);
  }
  return out;
};

test.describe('the globe turns', () => {
  test.beforeEach(async ({ context, page }) => {
    await stubMapboxNetwork(context);
    await installSceneDebug(page);
  });

  test('one revolution per four minutes, to the left', async ({
    page,
  }) => {
    await page.goto('/', { waitUntil: 'load' });
    await waitForScene(page, 'live');
    await settle(page);

    const samples = await watch(page, WINDOW_MS);
    /*
     * Enough frames for the walk below to be a walk rather than two
     * points. The globe renders at 6-11fps on this runner, so a 3s window
     * is 17-34 of them; five is a floor on something having happened at
     * all, not an expectation about the display.
     */
    expect(samples.length, 'no frames were sampled').toBeGreaterThan(
      5,
    );

    const first = samples[0];
    const last = samples[samples.length - 1];
    const seconds = (last.t - first.t) / 1_000;
    expect(seconds, 'the window did not run').toBeGreaterThan(1);

    /* ---- (a) the rate ---------------------------------------------- */

    const lngs = unwrap(samples.map((s) => s.lng));
    const rate = (lngs[lngs.length - 1] - lngs[0]) / seconds;
    expect(
      rate,
      `degrees of longitude per second over ${seconds.toFixed(2)}s`,
    ).toBeGreaterThan(WANT_DEG_PER_S * (1 - RATE_TOLERANCE));
    expect(
      rate,
      `degrees of longitude per second over ${seconds.toFixed(2)}s`,
    ).toBeLessThan(WANT_DEG_PER_S * (1 + RATE_TOLERANCE));

    /* ---- (b) the direction ----------------------------------------- */

    for (let p = 0; p < PROBES.length; p += 1) {
      const xs = samples.map((s) => s.x[p]);
      const where = `${PROBES[p][0]},${PROBES[p][1]}`;
      expect(
        xs[xs.length - 1],
        `${where} did not travel left across the screen`,
      ).toBeLessThan(xs[0] - MIN_WALK_PX);
      /*
       * And it went left the whole way rather than averaging left. A
       * half-pixel of slack per frame is the reading's own noise --
       * project() is float arithmetic over a matrix -- and is two orders
       * of magnitude under the per-frame step this is describing.
       */
      for (let i = 1; i < xs.length; i += 1) {
        expect(
          xs[i],
          `${where} turned back at frame ${i}`,
        ).toBeLessThanOrEqual(xs[i - 1] + 0.5);
      }
    }

    /* ---- and it is the Earth turning, not the picture ---------------- */

    /*
     * The bearing does not move. A globe that turns on its axis keeps
     * north up; rolling the bearing instead is the motion this replaced,
     * and it would read as the whole sphere rotating in the plane of the
     * screen.
     */
    for (const s of samples) {
      expect(s.bearing, 'the bearing rolled').toBeCloseTo(
        cameras.hello.bearing,
        6,
      );
    }
  });
});

/*
 * AND IT DOES NOT TURN FOR A VISITOR WHO ASKED FOR LESS MOTION.
 *
 * scene/camera.ts's spinRateFor answers the preference by returning null
 * rather than a smaller number, and SceneRoot hands that straight to
 * setAnimation, which never starts the loop. That is the app's own
 * switch, and it is asserted here because TIER 2 RESTS ITS WHOLE BUDGET
 * ON IT.
 *
 * The review project sets reducedMotion: 'reduce' (see
 * playwright.config.ts) and e2e/review/scene.spec.ts settles by waiting
 * on the map's `idle` event with a 30s budget per route. A globe that
 * kept turning under the preference would keep the transform dirty for
 * as long as the tab is open, so every settle would spend its whole
 * budget and then carry on with a 3s tail -- five routes, twice over,
 * against a 150s timeout. It would not fail loudly; it would time out,
 * and the report would say the page had closed.
 *
 * So: the centre does not move, and the map reaches idle well inside the
 * budget.
 */
test.describe('under reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test.beforeEach(async ({ context, page }) => {
    await stubMapboxNetwork(context);
    await installSceneDebug(page);
  });

  test('the globe stands still and the map goes idle', async ({
    page,
  }) => {
    await page.goto('/', { waitUntil: 'load' });
    await waitForScene(page, 'live');
    // Past the route's own flight, which reduced motion shortens to
    // 200ms rather than removing.
    await page.waitForTimeout(2_000);

    const opened = Date.now();
    expect(
      await waitForMapIdle(page, 10_000),
      'the map never went idle, which is tier 2 spending its whole budget',
    ).toBe(true);
    expect(
      Date.now() - opened,
      'idle arrived, but only after a wait tier 2 cannot afford five times over',
    ).toBeLessThan(10_000);

    const first = await page.evaluate(
      () => window.__SCENE__?.map.getCenter().lng,
    );
    await page.waitForTimeout(2_500);
    const second = await page.evaluate(
      () => window.__SCENE__?.map.getCenter().lng,
    );
    /*
     * Exactly, to six places. At 1.5 degrees a second a spin that was
     * merely slowed rather than stopped would move 3.75 degrees over
     * this window, and one that was stopped moves nothing at all.
     */
    expect(
      second,
      'the globe turned under reduced motion',
    ).toBeCloseTo(first as number, 6);
  });
});
