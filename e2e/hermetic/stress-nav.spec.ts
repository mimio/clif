import { expect, test } from '@playwright/test';
import {
  collectProblems,
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
const CYCLE = [
  '/',
  '/projects',
  '/projects/gopro',
  '/about',
  '/projects',
  '/projects/haikumi',
  '/',
  '/about?stop=3',
] as const;

/** Three laps: enough for every edge in the cycle to repeat. */
const LAPS = 3;

test('survives repeated navigation through terrain routes', async ({
  context,
  page,
}) => {
  test.setTimeout(240_000);
  await stubMapboxNetwork(context);
  const problems = collectProblems(page);

  await page.goto('/', { waitUntil: 'load' });
  await waitForScene(page, 'live');
  // The crash needs a map that has already settled -- navigating straight
  // away does not reproduce it. settle() waits on mapbox's own idle event
  // rather than a clock, which is what replaced the fixed tile sleep.
  await settle(page);

  for (let step = 0; step < CYCLE.length * LAPS; step += 1) {
    const to = CYCLE[step % CYCLE.length];
    await page.evaluate((href) => {
      (
        window as unknown as {
          next?: { router?: { push(href: string): void } };
        }
      ).next?.router?.push(href);
    }, to);
    // Long enough for the camera move to finish and the scene pass to
    // have run, which is when the teardown happens.
    await page.waitForTimeout(900);

    // Fail on the navigation that broke it, not twenty-four later.
    expect(
      problems,
      `after ${step + 1} navigations, last ${to}`,
    ).toEqual([]);
  }

  // Still mounted, and still painting into a canvas of its own.
  await expect(page.getByTestId('scene-root')).toBeAttached();
  expect(
    await page.locator('[data-testid="scene-root"] canvas').count(),
  ).toBeGreaterThan(0);
  await expect(page.locator('main')).toBeVisible();
});
