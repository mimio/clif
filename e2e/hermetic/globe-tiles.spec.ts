import { expect, test } from '@playwright/test';
import { installSceneDebug, waitForScene } from '../fixtures/app';
import {
  stubMapboxNetwork,
  TILE_PROBE_HOST,
} from '../fixtures/mapbox-stub';

/*
 * WHAT A REVOLUTION COSTS IN TILES.
 *
 * The rotation walks the CENTRE MERIDIAN -- one revolution every four
 * minutes, for the life of the tab, on `/` and on the 404 -- which sounds
 * like a map that fetches the whole Earth over and over and never stops
 * paying for it. Mapbox tiles are billed, so "sounds like" is not good
 * enough in either direction. This measures it.
 *
 * MEASURED, at the project's 1280x720 and at 2560x1440:
 *
 *                       1280x720   2560x1440
 *   globe zoom             1.876       2.876
 *   tiles to draw it          16          31
 *   ...a whole revolution      1          22   (new, requested once)
 *   re-requested               0           0
 *   distinct, ever            17          53
 *   mapbox's cache            60         120
 *
 * So the rotation's tile cost is ONE-OFF AND SMALL, and the reason is
 * arithmetic rather than luck: the hello frame paints the sphere at 44%
 * of the viewport height, which resolves to a zoom just under 2 on this
 * runner and just under 3 on a retina desktop. The whole Earth is 16
 * tiles at covering zoom 2 and 64 at zoom 3, and mapbox sizes its cache
 * at five times the visible set -- so once the camera has been all the
 * way round, every tile it will ever want is already in memory and
 * nothing is ever fetched again.
 *
 * WHAT THIS IS A GUARD AGAINST, and why it is worth a spec rather than a
 * note. The bound holds because the globe is FRAMED SMALL. Two ordinary
 * edits break it: raising the hello zoom (a bigger sphere, a wider
 * frame radius) and giving the spinning route terrain, which adds a
 * second tiled source with its own pyramid. At covering zoom 5 the Earth
 * is 1,024 tiles against a cache of a few hundred, and then the rotation
 * really would evict and re-fetch for ever, on the site's front page,
 * billed. Nothing else in the suite would notice: the globe would look
 * exactly the same.
 *
 * The revolution is walked rather than waited out. Four minutes of real
 * time would measure the runner's frame rate; stepping the centre
 * through 360 degrees and letting mapbox recompute its coverage measures
 * the thing the spin actually asks of the tile pipeline, which is
 * geometry and not duration.
 */

/** How finely the revolution is walked. 2 degrees a step. */
const STEPS = 180;

/*
 * The whole Earth at covering zoom 3, plus its parents, with room to
 * spare. It is a CEILING on a measured 17, not a target: what would fail
 * it is the pyramid moving up a level or two, which is the regression
 * this is for.
 */
const TILE_BUDGET = 96;

test.describe('turning the globe does not churn tiles', () => {
  test('a whole revolution fetches the world once and no more', async ({
    context,
    page,
  }) => {
    test.setTimeout(120_000);
    const asked: string[] = [];
    await stubMapboxNetwork(context, { tiled: true });
    // Registered last, so it is matched first: the tiles are counted
    // here and answered here.
    await context.route(`${TILE_PROBE_HOST}/**`, (route) => {
      asked.push(route.request().url());
      return route.fulfill({
        status: 200,
        contentType: 'image/png',
        body: Buffer.from(
          'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
          'base64',
        ),
      });
    });
    await installSceneDebug(page);
    await page.goto('/', { waitUntil: 'load' });
    await waitForScene(page, 'live');
    // Past the route's flight, so the resting globe has what it needs.
    await page.waitForTimeout(6_000);

    const resting = asked.length;
    expect(
      resting,
      'the style asked for no tiles at all: the probe source is not drawing',
    ).toBeGreaterThan(0);
    const before = new Set(asked);

    const walked = await page.evaluate(async (steps) => {
      const map = window.__SCENE__?.map;
      if (!map) throw new Error('no map');
      const { lat, lng } = map.getCenter();
      let half = lng;
      for (let step = 1; step <= steps; step += 1) {
        map.setCenter([lng + (step * 360) / steps, lat]);
        // One frame per step: tile coverage is recomputed on render.
        await new Promise((done) => {
          requestAnimationFrame(() => done(null));
        });
        if (step * 2 === steps) half = map.getCenter().lng;
      }
      return { zoom: map.getZoom(), from: lng, half };
    }, STEPS);
    await page.waitForTimeout(3_000);

    const turning = asked.slice(resting);
    const fresh = turning.filter((url) => !before.has(url));
    const again = turning.length - fresh.length;
    const everything = new Set(asked);

    test.info().annotations.push({
      type: 'tiles',
      description: JSON.stringify({
        zoom: walked.zoom,
        resting,
        whileTurning: turning.length,
        fresh: fresh.length,
        reRequested: again,
        distinct: everything.size,
      }),
    });

    /*
     * (a) NOTHING IS FETCHED TWICE. This is the claim that separates a
     * one-off cost from a bill: a re-request means mapbox evicted a tile
     * the camera came back to, which on a camera that comes back every
     * four minutes never stops.
     */
    expect(
      again,
      `${again} tiles were fetched again after a revolution`,
    ).toBe(0);

    /*
     * (b) AND THE WHOLE THING IS BOUNDED. Every tile the rotation will
     * ever ask for, for the life of the tab, is in this set.
     */
    expect(
      everything.size,
      `a revolution asked for ${everything.size} distinct tiles`,
    ).toBeLessThanOrEqual(TILE_BUDGET);

    /*
     * And the walk really did go round. A camera that never moved asks
     * for nothing and would pass both of the above, so the halfway
     * sample has to be on the far side of the Earth -- measured as a
     * wrapped separation, because mapbox folds the longitude it is
     * handed and 179 to -179 is two degrees, not 358.
     */
    const apart = Math.abs(
      ((walked.half - walked.from + 540) % 360) - 180,
    );
    expect(
      apart,
      `the centre only moved ${apart.toFixed(1)} degrees`,
    ).toBeGreaterThan(90);
  });
});
