import { expect, test } from '@playwright/test';
import {
  collectMapboxFailures,
  collectProblems,
  DESKTOP,
  MOBILE,
  ROUTES,
  settle,
  waitForScene,
} from '../fixtures/app';

/*
 * TIER 2. The review app, and the only place the real basemap exists.
 *
 * This runs against the Vercel preview a deployment_status event has just
 * announced, with the owner's own Mapbox token, and nothing is stubbed --
 * not the library, not the network. Everything here is a statement about
 * the deployed site that no local run can make: that Mapbox Standard
 * actually serves this style at this token, that the five routes render
 * over real terrain at both sizes, and that the scene reaches 'live'
 * rather than falling back to its plate.
 *
 * The screenshots are the deliverable the owner asked for; they are
 * uploaded on every run, not only on failure. The assertions around them
 * are what make the job a gate rather than a gallery.
 */

const SIZES = [
  { name: 'desktop', viewport: DESKTOP },
  { name: 'mobile', viewport: MOBILE },
];

for (const size of SIZES) {
  test.describe(size.name, () => {
    test.use({ viewport: size.viewport });

    for (const route of ROUTES) {
      test(`${route.path} over the real basemap`, async ({
        page,
      }) => {
        const problems = collectProblems(page, {
          documentStatus: route.status,
        });
        const mapbox = collectMapboxFailures(page);

        const response = await page.goto(route.path, {
          waitUntil: 'load',
        });
        expect(response?.status()).toBe(route.status);

        /*
         * 'live' rather than 'fallback' is the whole token check. A
         * preview whose token cannot fetch the stylesheet degrades
         * correctly to the plate and would still screenshot as a
         * perfectly nice page -- which is exactly the failure a visual
         * suite is famous for missing.
         */
        await waitForScene(page, 'live');
        await expect(
          page.locator(`[data-scene="${route.scene}"]`),
        ).toBeAttached();

        await settle(page);

        await expect(page).toHaveScreenshot(
          `${route.name}-${size.name}.png`,
        );

        expect(mapbox).toEqual([]);
        expect(problems).toEqual([]);
      });
    }
  });
}
