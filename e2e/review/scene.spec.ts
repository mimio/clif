import { expect, test, type Page } from '@playwright/test';
import {
  BASEMAP_CONFIG_KEYS,
  BASEMAP_IMPORT,
  collectMapboxFailures,
  collectProblems,
  DESKTOP,
  installBasemapOnly,
  installLutProbe,
  installSceneDebug,
  MAP_IDLE_BUDGET_MS,
  openThemeLens,
  readBasemapConfig,
  readBasemapLut,
  readLuts,
  readScene,
  ROUTES,
  samplePixels,
  seedTheme,
  settle,
  showBasemapOnly,
  THEME_IDS,
  THEME_SETTLE_MS,
  THEMEABLE_STYLE,
  themeOption,
  type ThemeId,
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
 *   appliedLut()          the scene handed a LUT to the colour-theme API.
 *   the console watcher   mapbox did not say it could not use the LUT,
 *                         and did not say it could not load the one in
 *                         the stylesheet. Both are warnOnce lines inside
 *                         a promise catch, so they reach nothing else.
 *   the LUT probe         mapbox actually decoded it, and its dimensions
 *                         passed mapbox's own height <= 32 and
 *                         width === height^2 check.
 *   getConfigProperty()   the Standard import knows each key.
 *
 * AND THREE THAT ARE NEW, BECAUSE EVERY ONE OF THE FOUR ABOVE WAS GREEN
 * ON A SITE WHOSE BASEMAP WORE NO THEME AT ALL.
 *
 * The owner loaded the deployed preview and said "it's not styled at all
 * with a theme" while this file was passing. Both were right. The scene
 * was calling `map.setColorTheme(lut)`, which sets the ROOT style's
 * colour theme -- and Mapbox Standard is not a flat style: it is a thin
 * root importing a `basemap` fragment, and every layer the globe is made
 * of is painted with `style.getLut(layer.scope)` from THAT scope. So the
 * LUT was built, sent, decoded, accepted and applied, to the handful of
 * layers this app adds itself, and the globe kept every colour Mapbox
 * shipped it with. Nothing in the list above can tell those two apart,
 * because the difference is not in the payload, it is in which scope
 * received it.
 *
 *   styleUrl()            which style this build is actually running.
 *                         NEXT_PUBLIC_MAPBOX_STYLE is inlined at build
 *                         time and overrides the default, so a value
 *                         left behind on the Vercel project is invisible
 *                         from everywhere except the deployed page. A
 *                         style that is not Standard-shaped cannot be
 *                         themed AT ALL -- the calls return without a
 *                         word -- so this is checked before anything
 *                         downstream of it is believed.
 *   getLut('basemap')     the scope the globe is painted from is holding
 *                         a LUT, and it is the one the scene sent. This
 *                         is the structural fact the whole feature comes
 *                         down to.
 *   the pixels            and, last, that two themes actually paint the
 *                         globe differently. See the final test for what
 *                         that can and cannot honestly claim.
 */

test.use({ viewport: DESKTOP });

/** Style._loadColorTheme decodes a 1024x32 PNG before it assigns it. */
const LUT_DECODE_MS = 15_000;

/**
 * Asserts the scope the globe is painted from is wearing exactly the LUT
 * the scene sent.
 *
 * Polled, not read once: setImportColorTheme hands the base64 to an
 * `Image` and assigns the LUT in its onload, so the call returns before
 * the scope holds anything. A single read here would be a race, and a
 * racy assertion in the one job that gates the build is worse than none.
 *
 * `map.style.getLut` is internal to mapbox-gl, which is why
 * readBasemapLut reports what it found instead of assuming:
 * 'no-style-api' means this read needs rewriting for a newer version and
 * is a failure about the test rather than about the site -- but a loud
 * one, which is the right way for an internal read to break.
 */
const expectBasemapWearing = async (
  page: Page,
  sent: string | null,
  label = '',
): Promise<void> => {
  const where = label === '' ? '' : `${label}: `;
  await expect
    .poll(async () => (await readBasemapLut(page)).fingerprint, {
      message:
        `${where}the "${BASEMAP_IMPORT}" scope is not wearing the LUT ` +
        "the scene sent, so the globe is showing Standard's own " +
        'colours whatever the lens says',
      timeout: LUT_DECODE_MS,
    })
    .toBe(sent);

  const worn = await readBasemapLut(page);
  expect(
    worn.outcome,
    `${where}mapbox-gl no longer answers style.getLut(scope); the ` +
      'reader in e2e/fixtures/app.ts needs updating for this version',
  ).toBe('ok');
};

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

    /*
     * THE STYLE, FIRST, because everything below it is meaningless if
     * this is wrong -- and because it is the one thing here that is not
     * in the repository. NEXT_PUBLIC_MAPBOX_STYLE is a Vercel project
     * setting, inlined into the bundle at build time; a value left over
     * from the old hand-maintained style points this build at something
     * with no `basemap` import, where setImportColorTheme and
     * setConfigProperty both return in silence and the globe wears
     * nothing. The fix for a failure here is not in the code: it is to
     * remove NEXT_PUBLIC_MAPBOX_STYLE from the Vercel project.
     */
    expect(
      scene.styleUrl,
      'this build is not running Mapbox Standard, which is the only ' +
        'style it can theme: remove NEXT_PUBLIC_MAPBOX_STYLE from the ' +
        'Vercel project (it overrides the default at build time)',
    ).toBe(THEMEABLE_STYLE);
    expect(
      scene.colorThemeSupported,
      `the style in use (${scene.styleUrl}) has no "${BASEMAP_IMPORT}" import`,
    ).toBe(true);

    expect(
      scene.lut,
      'the scene never handed a colour-theme LUT to the map',
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
     * AND IT IS ON THE SCOPE THE GLOBE IS PAINTED FROM.
     *
     * Everything above this line was equally true of the build that
     * shipped an entirely unthemed basemap: the LUT was sent, decoded
     * and accepted, and it went to the root style, whose layers are not
     * the globe. mapbox-gl paints each layer with style.getLut(scope),
     * so the only question that settles it is which scope holds a LUT.
     */
    await expectBasemapWearing(page, scene.lut);

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
  /*
   * THIS TEST GETS ITS OWN TIMEOUT, DERIVED RATHER THAN GUESSED.
   *
   * It is the only test in either tier that drives the live basemap eight
   * times in series, and until the locators below were fixed it had never
   * completed a single iteration -- so the review project's 150s has
   * never once been measured against what this test actually does.
   *
   * Each theme can legitimately spend THEME_SETTLE_MS on the painter's
   * debounce and the token crossfade, and then all of settle(): up to
   * MAP_IDLE_BUDGET_MS waiting for the map's own `idle` event, and a 3s
   * tail when it never arrives. That is about 34s per theme and 271s for
   * eight, before the navigation and the first settle. 150s is less than
   * half of what this test's own fixtures are permitted to wait -- not a
   * budget, but a timeout that fires while the code it is timing is still
   * doing exactly what it was told to, and reports the shutdown instead
   * of the cause. That is the failure this file's own note on the review
   * project's timeout describes having already been had once.
   *
   * A healthy run is nowhere near this: setImportColorTheme reloads the
   * visible tiles and the map goes idle in seconds. The ceiling is the one the
   * fixtures already imply, so that a slow preview is reported by the
   * wait that actually timed out.
   */
  const SETTLE_TAIL_MS = 3_000;
  test.setTimeout(
    THEME_IDS.length *
      (THEME_SETTLE_MS + MAP_IDLE_BUDGET_MS + SETTLE_TAIL_MS) +
      90_000,
  );

  const mapbox = collectMapboxFailures(page);

  await page.goto('/', { waitUntil: 'load' });
  await waitForScene(page, 'live');
  await settle(page);

  /*
   * Driven through the lens rather than eight page loads: this is the
   * path a visitor actually takes, it is the one that re-themes a map
   * that is already rendering, and it costs one navigation instead of
   * eight.
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
  const wornByTheme = new Set<string>();
  for (const theme of THEME_IDS) {
    await themeOption(panel, theme).click();
    await expect(page.locator('html')).toHaveAttribute(
      'data-theme',
      theme,
    );
    // The painter debounces by 120ms, the tokens crossfade over 400ms,
    // and setImportColorTheme then reloads every visible tile.
    await page.waitForTimeout(THEME_SETTLE_MS);
    await settle(page);

    const scene = await readScene(page);
    expect(
      scene.errors,
      `${theme}: mapbox reported failures after ${scene.lastAction}`,
    ).toEqual([]);
    expect(scene.lut, `${theme}: no LUT on the map`).not.toBeNull();
    if (scene.lut !== null) seen.add(scene.lut);

    /*
     * And on the basemap's own scope, per theme.
     *
     * "Eight distinct LUTs reached the map" was the assertion this
     * test used to end on, and it passed for weeks against a globe that
     * wore none of them: distinct is not the same as applied, and
     * applied to the root style is not the same as applied to the
     * basemap. This is the same fact per theme.
     */
    await expectBasemapWearing(page, scene.lut, theme);
    const worn = await readBasemapLut(page);
    if (worn.fingerprint !== null) wornByTheme.add(worn.fingerprint);
  }

  // Eight themes, eight different LUTs actually on the map...
  expect(seen.size).toBe(THEME_IDS.length);
  // ...and eight different LUTs on the scope the globe is painted from.
  expect(wornByTheme.size).toBe(THEME_IDS.length);

  const luts = await readLuts(page);
  expect(luts.filter((lut) => lut.failed)).toEqual([]);
  expect(luts.filter((lut) => lut.ok).length).toBeGreaterThanOrEqual(
    THEME_IDS.length,
  );
  expect(mapbox).toEqual([]);
});

/* ---- and, finally, the pixels ---------------------------------------- */

/*
 * THE ASSERTION THAT WOULD HAVE CAUGHT THIS WITHOUT KNOWING WHY.
 *
 * Every other check in this file is structural: it knows what the right
 * call is and asserts that it was made. That is worth more than a
 * picture, because it says what is wrong as well as that something is.
 * But it is also exactly the kind of check that was green while the
 * owner was looking at an unthemed globe, because it asserted the
 * mechanism the author believed in. So this one asserts the outcome
 * instead, from the compositor's side, knowing nothing about imports or
 * scopes: change the theme, and the globe's colour changes.
 *
 * WHAT MAKES IT HONEST RATHER THAN FLAKY, point by point, because a
 * naive version of this test passes whether or not the basemap is themed
 * and is worse than no test at all.
 *
 *   THE ROUTE IS /projects, NOT /. The hello camera spins, and a globe
 *   at a different rotation differs from itself in every pixel -- a test
 *   that would pass on any two frames. /projects has spin: null in
 *   content/cameras.ts, a fixed camera at zoom 2.6 over the continental
 *   US, and no terrain. (The review project also runs under
 *   reducedMotion: 'reduce', which turns the spin off anyway. Belt and
 *   braces, and the route choice is the one that does not depend on a
 *   config setting staying put.)
 *
 *   THE FOREGROUND IS HIDDEN. The type, the scrims and the chrome are
 *   all themed, and they are painted OVER the map -- so a whole-viewport
 *   comparison registers a theme change even when the basemap ignores
 *   it. The app is three siblings in z order, so hiding the scene's two
 *   siblings leaves the globe and nothing else.
 *
 *   THE SAMPLE IS THE MIDDLE OF THE FRAME. The fog is the other themed
 *   thing the scene paints, and `space-color` -- the only part of it
 *   derived from the palette -- is what shows OUTSIDE the globe's limb.
 *   A centred crop at this camera is basemap: land, water and coast.
 *
 *   THE TWO THEMES ARE BOTH DARK. teal and rust are both `color-scheme:
 *   dark`, so they take the same lightPreset and the same basemap
 *   `theme` config (scene/theme.ts), the same fog preset, and grounds
 *   that differ by a few units of near-black. Everything that is not the
 *   LUT is held still; what is left between them is --map-land and
 *   --map-deep.
 *
 *   THE METRIC IS RED MINUS BLUE, not brightness and not a pixel diff.
 *   It is a difference between two channels OF THE SAME PIXEL, so the
 *   sun angle, the tile fade-in and the exposure -- which move all three
 *   channels together -- largely cancel out of it, while a basemap
 *   re-tinted from a warm token toward a cool one does not. teal's
 *   --map-land is rgb(63, 79, 87) and rust's is rgb(86, 78, 62): one
 *   reads blue, the other reads amber, and the sign of the metric flips
 *   between them.
 *
 * WHAT IT CANNOT CLAIM. It does not say the globe is the RIGHT colour,
 * only that it is a different one. Nothing in CI can say the first
 * without a committed baseline over a network-backed basemap, and
 * e2e/review/capture.spec.ts is where that argument is had. It also
 * cannot be a screenshot comparison: toHaveScreenshot captures until two
 * consecutive frames are identical, and a live WebGL canvas never
 * delivers that -- see playwright.config.ts.
 */

/** Both dark, and the furthest apart on the warm/cool axis of the eight. */
const COOL_THEME: ThemeId = 'teal';
const WARM_THEME: ThemeId = 'rust';

/**
 * How far apart the two must read, in mean (red - blue) over the crop.
 *
 * DERIVED, not picked. Running buildLut for each theme and pushing
 * Mapbox Standard's own basemap fills through the resulting cube gives,
 * for the four colours most of a globe at this zoom is made of:
 *
 *                     land    water   greenspace  built
 *   teal  (R-B)        -21      -29       -17       -16
 *   rust  (R-B)        +26       +7       +22       +24
 *   separation          47       36        39        40
 *
 * So a fully themed basemap separates by roughly 36 to 47, and an
 * unthemed one by 0 -- both themes would be showing Standard's own
 * colours, which are the same colours. 12 sits at about a quarter of the
 * smallest of those, which tolerates three quarters of the crop being
 * something other than basemap before this could produce a false red,
 * and is nowhere near small enough for tile noise to produce a false
 * green. The measured value is annotated on every run, so the first few
 * runs turn this from a derivation into a measurement.
 */
const MIN_OPPONENCY_SHIFT = 12;

/** A centred third of the 1440x900 frame: globe, at this camera. */
const CROP = {
  x: DESKTOP.width / 2 - 240,
  y: DESKTOP.height / 2 - 150,
  width: 480,
  height: 300,
};

const settleTheme = async (page: Page): Promise<void> => {
  // The painter debounces 120ms and the tokens crossfade over 400ms;
  // then setImportColorTheme clears the basemap's tiles and they all
  // come back. settle() is called twice on purpose: the first returns at
  // once if the map still reports itself loaded -- the reload has not
  // started yet -- and its tail is what lets it start.
  await page.waitForTimeout(THEME_SETTLE_MS);
  await settle(page);
  await settle(page);
};

test('the basemap itself paints differently under two themes', async ({
  page,
}) => {
  test.setTimeout(
    2 * (THEME_SETTLE_MS + 2 * (MAP_IDLE_BUDGET_MS + 3_000)) + 90_000,
  );

  const mapbox = collectMapboxFailures(page);

  await page.goto('/projects', { waitUntil: 'load' });
  await waitForScene(page, 'live');
  await settle(page);
  await installBasemapOnly(page);

  const panel = await openThemeLens(page);
  const measure = async (theme: ThemeId): Promise<number> => {
    await themeOption(panel, theme).click();
    await expect(page.locator('html')).toHaveAttribute(
      'data-theme',
      theme,
    );
    await settleTheme(page);

    // The lens lives in the chrome, so it has to be visible to click and
    // hidden to photograph.
    await showBasemapOnly(page, true);
    const stats = await samplePixels(page, CROP);
    await showBasemapOnly(page, false);

    expect(stats.pixels).toBeGreaterThan(0);
    test.info().annotations.push({
      type: `basemap:${theme}`,
      description: `mean rgb(${stats.red.toFixed(1)}, ${stats.green.toFixed(
        1,
      )}, ${stats.blue.toFixed(1)}) — R-B ${stats.opponency.toFixed(2)}`,
    });
    return stats.opponency;
  };

  const cool = await measure(COOL_THEME);
  const warm = await measure(WARM_THEME);

  test.info().annotations.push({
    type: 'basemap:separation',
    description: `${WARM_THEME} - ${COOL_THEME} = ${(warm - cool).toFixed(2)} (needs > ${MIN_OPPONENCY_SHIFT})`,
  });

  /*
   * Signed, not absolute. rust's land token is warmer than teal's in
   * every channel pair, so the direction is fixed by the tokens
   * themselves -- an unsigned check would also pass on a basemap that
   * moved the right distance the wrong way, which is not a thing a
   * working LUT can do.
   */
  expect(
    warm - cool,
    `the globe painted the same under ${COOL_THEME} and ${WARM_THEME}: ` +
      `R-B was ${cool.toFixed(2)} and ${warm.toFixed(2)}. The colour ` +
      'theme is reaching mapbox and not reaching the basemap.',
  ).toBeGreaterThan(MIN_OPPONENCY_SHIFT);

  expect(mapbox).toEqual([]);
});
