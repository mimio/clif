import { expect, type Page, test } from '@playwright/test';
import {
  collectProblems,
  installSceneDebug,
  settle,
  waitForScene,
} from '../fixtures/app';
import { stubMapboxNetwork } from '../fixtures/mapbox-stub';

/*
 * The map has to survive being used.
 *
 * One navigation proves almost nothing about a persistent map, and this
 * suite learned that the expensive way: the scene died on the SIXTH
 * client-side navigation, and every single-hop test passed throughout.
 *
 * Why it took six is worth keeping, because it is the shape of the whole
 * hazard. Entering a detail route attaches terrain and then unmounts the
 * projects layer set, and Map.removeSource re-runs the terrain
 * evaluation -- which reads style.terrain.properties, a thing that does
 * not exist between setTerrain() and mapbox's next recalculate. On the
 * FIRST visit to a terrain route the DEM has not loaded yet, so terrain
 * parks itself and nothing is attached when the sources go. Only on a
 * later visit, with the DEM already resolved, is terrain attached at the
 * moment of the removal.
 *
 * So the state that matters is not reachable in one hop, or two. It
 * needs terrain routes entered repeatedly, from both a terrain and a
 * non-terrain predecessor, which is what this cycle does.
 */
/*
 * Each hop names the scene it must arrive at, so every step waits on the
 * app reporting that it got there rather than on a clock. The suite ran
 * on a fixed 900ms interval and flaked roughly once in five full runs --
 * never in isolation, only under the parallel workers, which is exactly
 * what a timing dependency looks like on a gate that guards a crash.
 */
const CYCLE = [
  ['/', 'hello'],
  ['/projects', 'projects'],
  ['/projects/gopro', 'projectDetail'],
  ['/about', 'about'],
  ['/projects', 'projects'],
  ['/projects/haikumi', 'projectDetail'],
  ['/', 'hello'],
  ['/about?stop=3', 'about'],
] as const;

/** Completed scene passes, from the debug handle. */
const scenePasses = (page: Page): Promise<number> =>
  page.evaluate(() => window.__SCENE__?.passes() ?? 0);

/**
 * Waits for the scene to finish reacting to a route change, and gives up
 * early the moment something has already gone wrong, so the failure
 * names the real cause rather than a timeout.
 */
const waitForPass = async (
  page: Page,
  problems: string[],
  before: number,
): Promise<boolean> => {
  const deadline = Date.now() + 15_000;
  while (Date.now() < deadline) {
    if (problems.length > 0) return false;
    if ((await scenePasses(page)) > before) return true;
    await page.waitForTimeout(50);
  }
  return false;
};

/*
 * Two laps: every edge in the cycle is taken twice, which is the property
 * that matters -- the crash needs a terrain route entered a second time,
 * with the DEM already resolved. A third lap only bought minutes of CI.
 */
const LAPS = 2;

test('survives repeated navigation through terrain routes', async ({
  context,
  page,
}) => {
  test.setTimeout(240_000);
  await stubMapboxNetwork(context);
  const problems = collectProblems(page);

  // settle() reads mapbox's own idle event through window.__SCENE__; the
  // handle has to be asked for before the app boots or it falls back to
  // a fixed sleep, which is the timing dependency this spec is removing.
  await installSceneDebug(page);

  await page.goto('/', { waitUntil: 'load' });
  await waitForScene(page, 'live');
  // The crash needs a map that has already settled -- navigating straight
  // away does not reproduce it.
  await settle(page);

  const scene = page.getByTestId('scene-root');

  for (let step = 0; step < CYCLE.length * LAPS; step += 1) {
    // Offset by one: the page already loaded on CYCLE[0], and pushing
    // the route you are already on is not a navigation -- nothing
    // re-renders and no scene pass ever runs.
    const [href, expected] = CYCLE[(step + 1) % CYCLE.length];
    const before = await scenePasses(page);
    await page.evaluate((to) => {
      (
        window as unknown as {
          next?: { router?: { push(to: string): void } };
        }
      ).next?.router?.push(to);
    }, href);

    /*
     * Three signals, no clock: the router arrived, SceneRoot re-rendered
     * for the new route, and the map finished the move and went idle.
     * The teardown that used to crash happens inside that last one.
     *
     * Not the map's idle event: a terrain route does not reliably
     * report idle at all, because its DEM keeps draping, so settle()
     * burns its whole budget and then a fallback sleep on every one of
     * them. The scene's own pass counter is the precise signal, and it
     * only advances on a pass that ran to the end -- a pass that throws
     * never counts, which is exactly the failure being watched for.
     */
    await page.waitForURL(`**${href}`);
    await expect(scene).toHaveAttribute('data-scene', expected);
    const ran = await waitForPass(page, problems, before);

    // Fail on the navigation that broke it, not sixteen later.
    expect(
      problems,
      `after ${step + 1} navigations, last ${href}`,
    ).toEqual([]);
    expect(ran, `the scene never finished its pass for ${href}`).toBe(
      true,
    );
  }

  // Still mounted, and still painting into a canvas of its own.
  await expect(page.getByTestId('scene-root')).toBeAttached();
  expect(
    await page.locator('[data-testid="scene-root"] canvas').count(),
  ).toBeGreaterThan(0);
  await expect(page.locator('main')).toBeVisible();
});
