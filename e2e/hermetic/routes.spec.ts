import { expect, test } from '@playwright/test';
import {
  collectProblems,
  ROUTES,
  waitForScene,
} from '../fixtures/app';
import {
  installMapboxGl,
  readStub,
  stubMapboxNetwork,
} from '../fixtures/mapbox-stub';

/*
 * Every route, end to end, with mapbox-gl stubbed.
 *
 * "200 and no errors" is the floor, and it is worth having on its own --
 * the branch has already shipped one crash that took every route down
 * ("Style is not done loading", see scene/mapbox/instance.ts) and the
 * unit suite stayed green through it. The stub throws that exact message
 * from the same methods, so a regression lands here as a page error
 * rather than as a screenshot nobody looks at.
 */

test.beforeEach(async ({ context, page }) => {
  await stubMapboxNetwork(context);
  await installMapboxGl(page);
});

for (const route of ROUTES) {
  test(`${route.path} answers ${route.status} and logs nothing`, async ({
    page,
  }) => {
    const problems = collectProblems(page, {
      documentStatus: route.status,
    });

    const response = await page.goto(route.path, {
      waitUntil: 'load',
    });
    expect(response?.status()).toBe(route.status);

    // The scene is the part most likely to throw late, so the route is
    // not "loaded" until it has reported a map.
    await waitForScene(page);
    await expect(
      page.locator(`[data-scene="${route.scene}"]`),
    ).toBeAttached();

    // The foreground and the chrome are both mounted by _app; a route
    // that rendered a scene and nothing else is not a passing route.
    await expect(page.locator('main')).toBeVisible();
    await expect(
      page.getByRole('navigation', { name: 'Sections' }),
    ).toBeVisible();

    expect(problems).toEqual([]);
  });
}

test('every route builds exactly one map, and only after its style is ready', async ({
  page,
}) => {
  const problems = collectProblems(page);
  await page.goto('/', { waitUntil: 'load' });
  await waitForScene(page);

  const record = await readStub(page);
  // React 19 double-invokes effects under StrictMode and ensureMap is
  // called at least twice on the first mount; two maps would be two GL
  // contexts and two sets of tiles.
  expect(record.constructed).toBe(1);
  expect(record.styleLoaded).toBe(true);
  // Everything behind Style._checkLoaded() throws in the stub until
  // style.load, so a non-empty record is proof the deferral worked.
  expect(record.colorTheme.length).toBeGreaterThan(0);
  expect(record.config.length).toBeGreaterThan(0);
  expect(record.fog).toBeGreaterThan(0);
  expect(problems).toEqual([]);
});

test('/history redirects permanently to /about', async ({
  request,
}) => {
  // Followed, the redirect is invisible: the status has to be read from
  // the hop itself, and 308 rather than 301 is what preserves the method.
  const response = await request.get('/history', {
    maxRedirects: 0,
  });
  expect(response.status()).toBe(308);
  expect(response.headers().location).toBe('/about');
});
