import { test } from '@playwright/test';
import {
  DESKTOP,
  installSceneDebug,
  MOBILE,
  ROUTES,
  seedTheme,
  settle,
  THEME_IDS,
  waitForScene,
} from '../fixtures/app';
import { capture } from '../fixtures/capture';

/*
 * TIER 2, THE SOFT RECORD. Nothing in this file can fail the build.
 *
 * It photographs the review app -- the five routes at 1440x900 and
 * 390x844, and the globe under each of the eight themes -- attaches every
 * capture to the report, and mirrors it into test-results/review-captures
 * so the owner can accept a run with one copy. If a baseline exists the
 * capture is diffed against it, and a drift lands as an annotation rather
 * than a failure. See e2e/fixtures/capture.ts for why.
 *
 * ./scene.spec.ts is the half that fails a build, and it is a separate
 * file on purpose: a capture that hangs, drifts or crashes must not be
 * able to stop the assertions about the real basemap from running and
 * reporting.
 *
 * `expect` is deliberately not imported here. There is nothing in this
 * file to assert.
 */

test.beforeEach(async ({ page }) => {
  await installSceneDebug(page);
});

const SIZES = [
  { name: 'desktop', viewport: DESKTOP },
  { name: 'mobile', viewport: MOBILE },
];

for (const size of SIZES) {
  test.describe(size.name, () => {
    test.use({ viewport: size.viewport });

    for (const route of ROUTES) {
      test(`${route.path}`, async ({ page }, testInfo) => {
        await page.goto(route.path, { waitUntil: 'load' });
        // Whatever the scene ends up as, it gets photographed: a
        // fallback plate where a globe should be is exactly the picture
        // someone needs to see. scene.spec.ts is what calls it a failure.
        await waitForScene(page, 'live').catch(() => undefined);
        await settle(page);
        await capture(page, testInfo, `${route.name}-${size.name}`);
      });
    }
  });
}

/*
 * Each theme is seeded into localStorage and the page loaded fresh, not
 * picked from the lens. Three reasons, and they all point the same way:
 * the blocking bootstrap in _document applies the attribute before first
 * paint, so there is no 400ms crossfade for a capture to read a blend of;
 * the lens panel does not have to be open, so it is not sitting over the
 * right-hand third of the globe in every picture; and the eight run in
 * parallel instead of in a chain.
 *
 * The runtime path -- picking from the lens on a map that is already
 * rendering -- is the one that could go wrong, and ./scene.spec.ts
 * asserts it. What this file wants is a clean photograph.
 */
test.describe('themes', () => {
  test.use({ viewport: DESKTOP });

  for (const theme of THEME_IDS) {
    test(`the globe wearing ${theme}`, async ({ page }, testInfo) => {
      await seedTheme(page, theme);
      await page.goto('/', { waitUntil: 'load' });
      await waitForScene(page, 'live').catch(() => undefined);
      await settle(page);
      await capture(page, testInfo, `globe-${theme}`);
    });
  }
});
