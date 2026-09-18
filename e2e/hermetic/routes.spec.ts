import { expect, test } from '@playwright/test';
import {
  BASEMAP_CONFIG_KEYS,
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
      document: route,
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
  expect(record.config.length).toBeGreaterThan(0);
  expect(record.fog).toBeGreaterThan(0);

  /*
   * THE DRIFT GUARD ON BASEMAP_CONFIG_KEYS, and it belongs here rather
   * than in tier 2.
   *
   * e2e/fixtures/app.ts hand-copies the seven keys of BasemapConfig
   * (scene/theme.ts) so that tier 2 can read each one back off the real
   * Standard import. Nothing checked that copy. Everywhere else the same
   * shape is drift-proof by construction -- scene/theme.ts's
   * configChanges() sends Object.keys(next), and test/scene-theme.test.ts
   * counts Object.keys(config).length -- so an eighth field added to
   * BasemapConfig would reach the map, be counted by the unit suite, and
   * be the ONE thing tier 2 never asked Standard about. An unknown key is
   * a silent no-op in mapbox (Style.setConfigProperty opens
   * `if (!schema || !schema[key]) return`), so a key that Standard does
   * not have is exactly the failure BASEMAP_CONFIG_KEYS exists to catch,
   * and a key missing from the list is never even tried.
   *
   * The stub records every [key, value] the scene sent, so the check is
   * free: what the app sends must be exactly what tier 2 reads back.
   */
  const sent = [...new Set(record.config.map(([key]) => key))].sort();
  expect(sent).toEqual([...BASEMAP_CONFIG_KEYS].sort());

  expect(problems).toEqual([]);
});

/*
 * THE RAIL KEEPS THE SECTION IT IS IN.
 *
 * A project page used to show no active notch at all: ChromeRoot looked
 * the pathname up exactly, `/projects/[projectId]` was not in the table,
 * and the rail was handed a frozen mid-travel indicator instead -- which
 * is the state that deliberately has no active tab. The notch is the
 * rendered thing the visitor was missing, so the notch is what is
 * asserted here, rather than what the lookup returns.
 */
test('a project page keeps the projects notch active', async ({
  page,
}) => {
  const notch = (route: string) =>
    page
      .getByRole('navigation', { name: 'Sections' })
      .locator(`[data-route="${route}"]`);

  await page.goto('/projects/haikumi', { waitUntil: 'load' });
  await waitForScene(page);

  await expect(notch('projects')).toHaveAttribute(
    'aria-current',
    'true',
  );
  await expect(notch('hello')).toHaveAttribute(
    'aria-current',
    'false',
  );
  await expect(notch('about')).toHaveAttribute(
    'aria-current',
    'false',
  );

  // The section page itself is unchanged, and so is a sibling section.
  await page.goto('/projects', { waitUntil: 'load' });
  await waitForScene(page);
  await expect(notch('projects')).toHaveAttribute(
    'aria-current',
    'true',
  );

  await page.goto('/about', { waitUntil: 'load' });
  await waitForScene(page);
  await expect(notch('about')).toHaveAttribute(
    'aria-current',
    'true',
  );
  await expect(notch('projects')).toHaveAttribute(
    'aria-current',
    'false',
  );
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
