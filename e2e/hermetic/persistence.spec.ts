import {
  expect,
  test,
  type JSHandle,
  type Page,
} from '@playwright/test';
import { collectProblems, waitForScene } from '../fixtures/app';
import {
  installMapboxGl,
  readStub,
  stubMapboxNetwork,
} from '../fixtures/mapbox-stub';

/*
 * The premise of the whole rewrite: a route change is a camera move, not a
 * rebuild. Both tests below are written as OBJECT IDENTITY across a
 * client-side navigation, because everything weaker passes for the wrong
 * reason -- "a canvas exists on /about" is equally true of an app that
 * tears the map down and builds a second one, which is precisely the bug
 * the persistent map replaced.
 *
 * JSHandles are the instrument. A client-side navigation keeps the page's
 * execution context, so a handle taken before it still points at the same
 * object after it, and comparing two handles with === inside the page is a
 * real identity test rather than a comparison of serialised shapes. (A
 * full reload would invalidate them, which is why neither test reloads.)
 */
const same = (
  page: Page,
  a: JSHandle,
  b: JSHandle,
): Promise<boolean> =>
  page.evaluate(([first, second]) => first === second, [
    a,
    b,
  ] as const);

test.beforeEach(async ({ context, page }) => {
  await stubMapboxNetwork(context);
  await installMapboxGl(page);
});

test('the map and its canvas survive a route change', async ({
  page,
}) => {
  const problems = collectProblems(page);

  await page.goto('/', { waitUntil: 'load' });
  await waitForScene(page);

  const mapBefore = await page.evaluateHandle(
    () => window.__ONEGLOBE_STUB__?.map,
  );
  const canvasBefore = await page.evaluateHandle(() =>
    document.querySelector('[data-testid="scene-root"] canvas'),
  );
  expect(await canvasBefore.evaluate((node) => node !== null)).toBe(
    true,
  );

  // The rail, not a link: it is the chrome's own navigation, mounted once
  // by _app, so it is the closest thing to a visitor moving between
  // routes without reloading the document.
  const rail = page.getByRole('navigation', { name: 'Sections' });
  await rail.locator('button[data-route="projects"]').click();
  await expect(page).toHaveURL(/\/projects$/);
  await expect(
    page.locator('[data-scene="projects"]'),
  ).toBeAttached();

  await rail.locator('button[data-route="about"]').click();
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.locator('[data-scene="about"]')).toBeAttached();

  const mapAfter = await page.evaluateHandle(
    () => window.__ONEGLOBE_STUB__?.map,
  );
  const canvasAfter = await page.evaluateHandle(() =>
    document.querySelector('[data-testid="scene-root"] canvas'),
  );

  expect(await same(page, mapBefore, mapAfter)).toBe(true);
  expect(await same(page, canvasBefore, canvasAfter)).toBe(true);

  // Identity is not enough on its own: a detached canvas is the same
  // object and shows nothing. It has to still be in the document, and
  // still inside the scene's own container.
  expect(
    await canvasAfter.evaluate(
      (node) =>
        node instanceof HTMLCanvasElement &&
        node.isConnected &&
        node.closest('[data-testid="scene-root"]') !== null,
    ),
  ).toBe(true);

  const record = await readStub(page);
  expect(record.constructed).toBe(1);
  // Two navigations, and the camera was asked to move for each: the map
  // was driven rather than rebuilt, which is the other half of the claim.
  expect(record.easeTo.length).toBeGreaterThanOrEqual(3);

  /*
   * And terrain came on, late, without taking the tree with it.
   *
   * /about is the route that switches terrain on after the map has been
   * rendering for a while, which is the navigation that used to die
   * inside mapbox's own Terrain.update. The fix parks the terrain want
   * until the DEM source reports loaded, so what is asserted here is that
   * the want resolved rather than parking forever -- the stub resolves a
   * source on a macrotask, so isSourceLoaded() is false for the rest of
   * the tick that added it, exactly as the real library's is.
   *
   * e2e/hermetic/scene-box.spec.ts drives the same navigation against the
   * REAL library and asserts the page survives it. This is the other half:
   * that the terrain the route asked for actually arrived.
   */
  await expect
    .poll(async () => (await readStub(page)).terrain)
    .toContain(1.4);
  expect((await readStub(page)).loadedSources).toContain(
    'mapbox-dem',
  );

  expect(problems).toEqual([]);
});

test('the screenshot plane survives one detail route to the next', async ({
  page,
}) => {
  const problems = collectProblems(page);

  await page.goto('/projects/haikumi', { waitUntil: 'load' });
  await waitForScene(page);

  const plane = page.locator('figure[data-src]');
  await expect(plane).toBeVisible();
  const srcBefore = (await plane.getAttribute('data-src')) ?? '';

  const figureBefore = await plane.elementHandle();
  // The shader's canvas is appended imperatively by GlitchImage, so it is
  // what actually dies on a remount -- React would not even be asked to
  // recreate it.
  const canvasBefore = await page.evaluateHandle(() =>
    document.querySelector('figure[data-src] canvas'),
  );
  expect(await canvasBefore.evaluate((node) => node !== null)).toBe(
    true,
  );

  /*
   * The pager is the in-page route to the next project, which is the
   * transition the plane exists for. "ascend to map" points at /projects
   * with no trailing slash, so it is not in this set.
   */
  await page.locator('a[href^="/projects/"]').last().click();
  await expect(page).not.toHaveURL(/haikumi$/);
  await expect(plane).not.toHaveAttribute('data-src', srcBefore);

  const figureAfter = await plane.elementHandle();
  const canvasAfter = await page.evaluateHandle(() =>
    document.querySelector('figure[data-src] canvas'),
  );

  expect(figureBefore).not.toBeNull();
  expect(figureAfter).not.toBeNull();
  expect(
    await same(
      page,
      figureBefore as JSHandle,
      figureAfter as JSHandle,
    ),
  ).toBe(true);
  expect(await same(page, canvasBefore, canvasAfter)).toBe(true);
  expect(
    await canvasAfter.evaluate(
      (node) => node instanceof HTMLCanvasElement && node.isConnected,
    ),
  ).toBe(true);

  // And the map underneath was not rebuilt either.
  expect((await readStub(page)).constructed).toBe(1);
  expect(problems).toEqual([]);
});
