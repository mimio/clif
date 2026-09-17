import { expect, type Page, test } from '@playwright/test';
import { cameras } from 'content/cameras';
import { installSceneDebug, waitForScene } from '../fixtures/app';
import { stubMapboxNetwork } from '../fixtures/mapbox-stub';

/*
 * THE PILL READS THE MAP, NOT THE ROUTE TABLE.
 *
 * The globe's rotation used to roll the BEARING, and nothing in the
 * chrome read bearing -- so a readout derived from the route's declared
 * camera was, on a spinning route, still telling the truth. The rotation
 * is a walk of the CENTRE MERIDIAN now: on / and on the 404 the camera's
 * longitude advances 1.5 degrees a second, all the way round every four
 * minutes, while a derived readout sits on the table's -122.700 for ever.
 * Within two seconds they disagree by three degrees; within two minutes
 * by a hundred and eighty.
 *
 * So the two claims measured here are the two the fix makes:
 *
 *   IT MOVES     the longitude the visitor can read actually changes
 *                over a couple of seconds on /.
 *   IT AGREES    at every sample it is the map's own centre, within a
 *                stated tolerance, rather than a second opinion about it.
 *
 * Both are read off the RENDERED PILL -- the text in the DOM -- against
 * the real mapbox-gl transform, sampled in the same task so the pair is
 * simultaneous. The network is stubbed and the real library runs, the
 * same as globe-spin, which measures the transform this one has to track.
 *
 * And the third claim is the one a live reading could easily have broken:
 * the detail route holds the map, its caption says `held`, and nothing
 * there may tick.
 */

/** content/cameras.ts's SPIN_DEG_PER_SECOND, as the visitor sees it. */
const SPIN_DEG_PER_S = 1.5;

/** How long to watch the readout for. */
const WINDOW_MS = 2_500;
const SAMPLE_MS = 120;

/*
 * A quarter of what the window should traverse.
 *
 * 2.5s at 1.5 deg/s is 3.75 degrees. The failure this guards against is
 * a readout that does not move AT ALL -- the derived value is constant to
 * the last decimal -- so any floor above the pill's own 0.001 resolution
 * separates the two cases. A quarter leaves room for a runner that spends
 * most of the window easing (the spin yields to a flight) without leaving
 * room for a stuck number.
 */
const MIN_TRAVEL_DEG = (SPIN_DEG_PER_S * WINDOW_MS) / 1_000 / 4;

/*
 * How far the pill may lag the transform.
 *
 * The pill is React state driven by mapbox's `move` event, so the text in
 * the DOM is the centre as of the last committed render and the transform
 * is the centre as of now. The gap is at most one frame of rotation plus
 * one React commit. The globe renders at 6-11fps on this runner, so a
 * frame is up to ~170ms, which at 1.5 deg/s is 0.25 degrees; a quarter of
 * a degree again for the commit and the DOM read. Half a degree is
 * generous for the lag and still two orders of magnitude tighter than the
 * error it exists to catch, which grows without bound.
 */
const MAX_LAG_DEG = 0.5;

type Sample = {
  /** The longitude printed on the pill. */
  shown: number;
  /** The map's centre longitude, read in the same task. */
  actual: number;
  caption: string;
};

/*
 * CoordPill prints `lat, lng` -- latitude first, which is how a
 * coordinate is said and not how a CameraSpec stores it.
 */
const sample = (page: Page): Promise<Sample | null> =>
  page.evaluate(() => {
    const map = window.__SCENE__?.map;
    const readout = document.querySelector(
      '[data-testid="coord-readout"]',
    );
    const caption = document.querySelector(
      '[data-testid="coord-caption"]',
    );
    if (!map || !readout || !caption) return null;
    const parts = (readout.textContent ?? '').split(',');
    if (parts.length !== 2) return null;
    return {
      shown: Number(parts[1]),
      actual: map.getCenter().lng,
      caption: (caption.textContent ?? '').trim(),
    };
  });

const watch = async (page: Page, ms: number): Promise<Sample[]> => {
  const samples: Sample[] = [];
  const deadline = Date.now() + ms;
  while (Date.now() < deadline) {
    const one = await sample(page);
    if (one !== null) samples.push(one);
    await page.waitForTimeout(SAMPLE_MS);
  }
  return samples;
};

/*
 * Wait for a loaded style and a completed scene pass before watching.
 * The pill is fed by `move`, and before the style is ready the rotation
 * has not started, so a window opened too early measures the flight
 * rather than the spin.
 */
const READY_BUDGET_MS = 30_000;

const settle = async (page: Page): Promise<void> => {
  await waitForScene(page, 'live');
  await expect
    .poll(
      () =>
        page.evaluate(() => {
          const scene = window.__SCENE__;
          if (!scene) return false;
          return (
            scene.styleStatus() === 'ready' && scene.passes() > 0
          );
        }),
      { timeout: READY_BUDGET_MS },
    )
    .toBe(true);
  // Past the route's own 800ms flight, which the spin yields to.
  await page.waitForTimeout(1_500);
};

test.describe('the coordinate pill', () => {
  test.beforeEach(async ({ context, page }) => {
    await stubMapboxNetwork(context);
    await installSceneDebug(page);
  });

  test('tracks the spinning globe on /', async ({ page }) => {
    await page.goto('/', { waitUntil: 'load' });
    await settle(page);

    const samples = await watch(page, WINDOW_MS);
    expect(
      samples.length,
      'the pill was never sampled',
    ).toBeGreaterThan(5);

    /* ---- (a) it moves ------------------------------------------------ */

    const shown = samples.map((one) => one.shown);
    for (const value of shown) {
      expect(
        Number.isFinite(value),
        'the pill printed no number',
      ).toBe(true);
    }
    const travelled = Math.max(...shown) - Math.min(...shown);
    expect(
      travelled,
      'the pill did not move while the globe turned',
    ).toBeGreaterThan(MIN_TRAVEL_DEG);

    /*
     * And it is not the table's number. /'s declared centre is
     * -122.700; a readout that leads the globe reads exactly that for
     * the life of the tab, so a single sample equal to it to the
     * printed precision is the bug.
     */
    const declared = cameras.hello.center[0];
    for (const value of shown) {
      expect(
        Math.abs(value - declared),
        'the pill is still reading the route table',
      ).toBeGreaterThan(0.0005);
    }

    /* ---- (b) it agrees with the map ---------------------------------- */

    for (const one of samples) {
      /*
       * Compared as a wrapped coordinate. The camera crosses the
       * antimeridian every four minutes and both sides of this wrap
       * there, so 179.9 and -179.9 are a tenth of a degree apart, not
       * 359.8.
       */
      const gap = Math.abs(
        ((one.shown - one.actual + 540) % 360) - 180,
      );
      expect(
        gap,
        `the pill read ${one.shown} while the map was at ${one.actual}`,
      ).toBeLessThan(MAX_LAG_DEG);
    }

    /* ---- and it still reads like a coordinate ------------------------ */

    for (const value of shown) {
      expect(
        Math.abs(value),
        'the longitude ran off the end of the range',
      ).toBeLessThanOrEqual(180);
    }

    for (const one of samples) {
      expect(one.caption).toBe('camera');
    }
  });

  test('stays held, and still, on the detail route', async ({
    page,
  }) => {
    await page.goto('/projects/haikumi', { waitUntil: 'load' });
    await settle(page);

    const samples = await watch(page, WINDOW_MS);
    expect(
      samples.length,
      'the pill was never sampled',
    ).toBeGreaterThan(5);

    // The camera is not the visitor's there, and the caption says so.
    for (const one of samples) {
      expect(one.caption, 'the held caption was lost').toBe('held');
    }

    // Nothing turns, so nothing ticks: every sample is the same number.
    const shown = samples.map((one) => one.shown);
    for (const value of shown) {
      expect(value, 'the held readout ticked').toBeCloseTo(
        shown[0],
        6,
      );
    }
  });
});
