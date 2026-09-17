import { expect, test } from '@playwright/test';
import {
  BASEMAP_CONFIG_KEYS,
  collectMapboxFailures,
  collectProblems,
  DESKTOP,
  installLutProbe,
  installSceneDebug,
  openThemeLens,
  readBasemapConfig,
  readLuts,
  readScene,
  ROUTES,
  seedTheme,
  settle,
  THEME_IDS,
  THEME_SETTLE_MS,
  themeOption,
  waitForScene,
} from '../fixtures/app';

/*
 * TIER 2, THE HARD GATE. This file is allowed to fail the build.
 *
 * It runs against the Vercel preview a deployment_status event has just
 * announced, with the owner's real Mapbox token, and nothing stubbed. It
 * takes no screenshots at all -- the pictures live in ./capture.spec.ts,
 * which cannot fail -- because the two jobs want opposite things. A
 * screenshot of a live basemap can never be made reliably green, and an
 * assertion that cannot be made green teaches its reader to ignore it.
 * These can be green, and if they are not, something is actually wrong.
 *
 * TWO THINGS HERE HAVE NEVER BEEN VERIFIED ANYWHERE, by anyone, at any
 * point in this project, because both need a real Mapbox account:
 *
 *   1. whether Mapbox Standard accepts the runtime colour-theme LUT;
 *   2. whether the seven setConfigProperty keys are keys Standard has.
 *
 * Both fail silently. A refused LUT is one `warnOnce` inside a promise
 * catch -- no error event, so neither the app nor window.__SCENE__.errors()
 * ever hears about it. An unknown config key is not even that:
 * Style.setConfigProperty opens `if (!schema || !schema[key]) return`, so
 * it is a no-op with no trace of any kind. In both cases the site comes
 * up looking perfectly reasonable and wearing the wrong thing.
 *
 * So each is checked from more than one side:
 *
 *   appliedLut()          the scene handed a LUT to setColorTheme.
 *   the console watcher   mapbox did not say it could not use it, and did
 *                         not say the style overrides colour themes --
 *                         the case where everything succeeds and nothing
 *                         happens.
 *   the LUT probe         mapbox actually decoded it, and its dimensions
 *                         passed mapbox's own height <= 32 and
 *                         width === height^2 check. This is the only
 *                         positive evidence of the three, which is why
 *                         the probe is kept alongside the handle rather
 *                         than retired: the handle reports what the scene
 *                         SENT, and only the probe reports what mapbox
 *                         DID with it.
 *   getConfigProperty()   the Standard import knows each key.
 */

test.use({ viewport: DESKTOP });

test.beforeEach(async ({ page }) => {
  await installSceneDebug(page);
  await installLutProbe(page);
});

for (const route of ROUTES) {
  test(`${route.path} runs clean over the real basemap`, async ({
    page,
  }) => {
    const problems = collectProblems(page, {
      document: route,
    });
    const mapbox = collectMapboxFailures(page);

    const response = await page.goto(route.path, {
      waitUntil: 'load',
    });
    expect(response?.status()).toBe(route.status);

    /*
     * 'live' rather than 'fallback' is the whole token check. A preview
     * whose token cannot fetch the stylesheet degrades correctly to the
     * plate and would still photograph as a perfectly nice page -- which
     * is exactly the failure a visual suite is famous for missing.
     */
    await waitForScene(page, 'live');
    await expect(
      page.locator(`[data-scene="${route.scene}"]`),
    ).toBeAttached();

    const idle = await settle(page);
    test.info().annotations.push({
      type: 'map',
      description: idle
        ? 'the map reported idle'
        : 'the map never reported idle within the wait',
    });

    const scene = await readScene(page);
    expect(
      scene.errors,
      `mapbox reported failures; last action was ${scene.lastAction}`,
    ).toEqual([]);
    expect(scene.styleStatus).toBe('ready');
    expect(
      scene.lut,
      'the scene never handed a colour-theme LUT to setColorTheme',
    ).not.toBeNull();

    // What mapbox did with it, which is the half the handle cannot see.
    const luts = await readLuts(page);
    expect(luts.filter((lut) => lut.failed)).toEqual([]);
    expect(
      luts.filter((lut) => lut.ok).length,
      `no colour-theme LUT was decoded and accepted; saw ${JSON.stringify(
        luts,
      )}`,
    ).toBeGreaterThan(0);

    /*
     * AND IT IS THE SCENE'S LUT, not merely some accepted image.
     *
     * The line above says an image mapbox decoded passed mapbox's own
     * height <= 32 / width === height^2 check. It does not say WHICH
     * image: a 1x1 PNG from anywhere on the page satisfies `ok` just as
     * well, and nothing tied the probe's record back to what the scene
     * sent. The tie is free, because the two fingerprints are byte
     * identical by construction -- readScene() hashes appliedLut() as
     * `${length}:${fnv}` and the probe hashes value.slice(PREFIX.length)
     * with the same FNV-1a constants over the same payload.
     */
    expect(
      luts.some(
        (lut) => `${lut.bytes}:${lut.hash}` === scene.lut && lut.ok,
      ),
      `mapbox accepted a LUT, but not the one the scene sent (${
        scene.lut
      }); saw ${JSON.stringify(
        luts.map((lut) => `${lut.bytes}:${lut.hash} ok=${lut.ok}`),
      )}`,
    ).toBe(true);

    /*
     * Every config key the route sent is a key the Standard import has.
     * The bogus key is not padding: without it this assertion would pass
     * just as happily against a getConfigProperty that answered
     * everything, and the whole point is that it discriminates.
     */
    const config = await readBasemapConfig(page, [
      ...BASEMAP_CONFIG_KEYS,
      'notARealStandardConfigKey',
    ]);
    expect(config.notARealStandardConfigKey).toBeNull();
    for (const key of BASEMAP_CONFIG_KEYS) {
      expect(
        config[key],
        `Standard does not know the config key "${key}"`,
      ).not.toBeNull();
    }

    expect(mapbox).toEqual([]);
    expect(problems).toEqual([]);
  });
}

test('the bootstrap theme reaches the map before first paint', async ({
  page,
}) => {
  await seedTheme(page, 'chalk');
  const mapbox = collectMapboxFailures(page);

  await page.goto('/', { waitUntil: 'load' });
  await expect(page.locator('html')).toHaveAttribute(
    'data-theme',
    'chalk',
  );
  await waitForScene(page, 'live');
  await settle(page);

  // No crossfade happened at all: the blocking script in _document set
  // the attribute before the scene ever read the palette, so the first
  // LUT the map saw was chalk's.
  const scene = await readScene(page);
  expect(scene.lut).not.toBeNull();
  expect(scene.errors).toEqual([]);
  expect(mapbox).toEqual([]);
});

test('all eight themes repaint the live basemap', async ({
  page,
}) => {
  const mapbox = collectMapboxFailures(page);

  await page.goto('/', { waitUntil: 'load' });
  await waitForScene(page, 'live');
  await settle(page);

  /*
   * Driven through the lens rather than eight page loads: this is the
   * path a visitor actually takes, it is the one that calls
   * setColorTheme on a map that is already rendering, and it costs one
   * navigation instead of eight.
   *
   * openThemeLens and themeOption are e2e/fixtures/app.ts's, and are the
   * SAME accessors e2e/hermetic/theme.spec.ts drives on every PR. This
   * spec used to spell out page.getByRole('listbox') / 'option' itself,
   * and went on doing it for weeks after ThemeEye dropped those roles --
   * the review tier only runs on a deployment_status event, so nothing
   * that runs on a PR could see it. Writing the locators out here again
   * would rebuild exactly that trap.
   */
  const panel = await openThemeLens(page);

  const seen = new Set<string>();
  for (const theme of THEME_IDS) {
    await themeOption(panel, theme).click();
    await expect(page.locator('html')).toHaveAttribute(
      'data-theme',
      theme,
    );
    // The painter debounces by 120ms, the tokens crossfade over 400ms,
    // and setColorTheme then reloads every visible tile.
    await page.waitForTimeout(THEME_SETTLE_MS);
    await settle(page);

    const scene = await readScene(page);
    expect(
      scene.errors,
      `${theme}: mapbox reported failures after ${scene.lastAction}`,
    ).toEqual([]);
    expect(scene.lut, `${theme}: no LUT on the map`).not.toBeNull();
    if (scene.lut !== null) seen.add(scene.lut);
  }

  // Eight themes, eight different LUTs actually on the map.
  expect(seen.size).toBe(THEME_IDS.length);

  const luts = await readLuts(page);
  expect(luts.filter((lut) => lut.failed)).toEqual([]);
  expect(luts.filter((lut) => lut.ok).length).toBeGreaterThanOrEqual(
    THEME_IDS.length,
  );
  expect(mapbox).toEqual([]);
});
