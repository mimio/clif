import { expect, type Page, test } from '@playwright/test';
import { installSceneDebug, waitForScene } from '../fixtures/app';
import { stubMapboxNetwork } from '../fixtures/mapbox-stub';

/*
 * THE GLOBE CARRIES NOTHING OF ITS OWN ON / AND ON A 404.
 *
 * The prototype's layer-stack note described a mid band for those two
 * routes -- "great-circle work path Albany->Portland, yellow 60% 1px +
 * travelling dash", plus the city dots and the Portland glow -- and the
 * scene built it. It was illustration, not content: an example of what a
 * mid band could hold. The cities the site does claim something about
 * are drawn by /projects and /about, collapsed and counted and labelled.
 * The two routes that mounted the work path are the two with nothing of
 * their own to say, so the right number of layers there is zero and the
 * globe is just the globe.
 *
 * The routes that DO have content keep it, and this asserts that too --
 * the whole risk in taking a layer set out is taking the wrong one, or
 * taking the mechanism with it.
 *
 * READ OFF THE MAP, NOT OFF THE TABLE. A test that asks
 * `layerSetsFor('hello', ...)` for its length is asking the same function
 * the change edited, and would have passed before and after any mistake
 * in between. So this reads the REAL mapbox-gl style back through
 * `window.__SCENE__.map` -- what is actually on the map -- and the
 * registry's own mount record beside it, and requires the two to agree.
 * The network is stubbed and the real library runs, the same as
 * scene-box, stress-nav and globe-spin.
 *
 * The expected ids below are written out rather than imported for the
 * same reason THEMEABLE_STYLE in e2e/fixtures/app.ts is a hand copy: a
 * constant compared against itself is not a check. These are compared
 * against the running app, and cannot drift without this spec going red.
 */

/** The one layer e2e/fixtures/mapbox-stub.ts's basemap fragment owns. */
const STUB_LAYERS = ['basemap-background'];

/** What /projects draws, and the set it draws them in. */
const PROJECT_SITES_SET = 'project-sites';
const PROJECT_SITE_LAYERS = [
  'project-site-points',
  'project-site-labels',
  'project-site-counts',
];

type Mounted = {
  /** App layers on the style, in draw order. */
  layers: string[];
  /** Set ids the registry has a mount record for. */
  sets: string[];
};

const readMounted = (page: Page): Promise<Mounted> =>
  page.evaluate((stub) => {
    const scene = window.__SCENE__;
    if (!scene) {
      throw new Error(
        'window.__SCENE__ is not published: installSceneDebug() has to run before the app boots',
      );
    }
    const style = scene.map.getStyle();
    return {
      layers: (style?.layers ?? [])
        .map((layer) => layer.id)
        .filter((id) => !stub.includes(id)),
      sets: scene.mountedSets(),
    };
  }, STUB_LAYERS);

/*
 * A completed scene pass over a loaded style, and then a dwell.
 *
 * The pass is what mounts layers, and it is counted only when it runs to
 * the end -- but a pass that happens BEFORE style.load records its wants
 * and applies nothing, so the style has to be ready too. The dwell is for
 * the opposite failure: asserting "nothing is mounted" the instant the
 * route opens would be satisfied by a scene that simply had not got round
 * to mounting it yet.
 */
const READY_BUDGET_MS = 30_000;
const DWELL_MS = 1_500;

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
  await page.waitForTimeout(DWELL_MS);
};

test.describe('the globe carries only content', () => {
  test.beforeEach(async ({ context, page }) => {
    await stubMapboxNetwork(context);
    await installSceneDebug(page);
  });

  for (const [name, path] of [
    ['/', '/'],
    ['a 404', '/no-such-page'],
  ] as const) {
    test(`${name} mounts no layers at all`, async ({ page }) => {
      await page.goto(path, { waitUntil: 'load' });
      await settle(page);

      const mounted = await readMounted(page);
      expect(
        mounted.layers,
        'the decorative work path is still on the map',
      ).toEqual([]);
      expect(
        mounted.sets,
        'the registry still holds a mount record',
      ).toEqual([]);
    });
  }

  test('/projects still mounts its site layers', async ({ page }) => {
    await page.goto('/projects', { waitUntil: 'load' });
    await settle(page);

    const mounted = await readMounted(page);
    expect(mounted.sets).toEqual([PROJECT_SITES_SET]);
    expect(mounted.layers).toEqual(PROJECT_SITE_LAYERS);
  });

  /*
   * And the map does not accumulate. The registry unmounts what the next
   * route does not want, so arriving at / from a route that HAD layers
   * has to leave the globe as clean as a cold load does -- which is the
   * one thing a per-route check cannot see.
   */
  test('a route change back to / takes the site layers off again', async ({
    page,
  }) => {
    await page.goto('/projects', { waitUntil: 'load' });
    await settle(page);
    expect((await readMounted(page)).layers.length).toBeGreaterThan(
      0,
    );

    await page.evaluate(() =>
      (
        window as unknown as {
          next: { router: { push: (to: string) => void } };
        }
      ).next.router.push('/'),
    );
    await settle(page);

    const mounted = await readMounted(page);
    expect(mounted.layers).toEqual([]);
    expect(mounted.sets).toEqual([]);
  });
});
