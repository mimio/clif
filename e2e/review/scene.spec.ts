import { expect, test, type Page } from '@playwright/test';
import {
  BASEMAP_CONFIG_KEYS,
  BASEMAP_IMPORT,
  collectMapboxFailures,
  collectProblems,
  describeProfile,
  DESKTOP,
  installBasemapOnly,
  installSceneDebug,
  MAP_IDLE_BUDGET_MS,
  measureGlobe,
  notice,
  openThemeLens,
  readBasemapConfig,
  readScene,
  type RingStat,
  ROUTES,
  samplePixels,
  sampleRadial,
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
import { BASEMAP_COLOR_KEYS } from 'styles/tokens/cartography';
import { parseRgb } from 'styles/tokens/palette';

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
 * THE ONE THING HERE THAT CANNOT BE VERIFIED ANYWHERE ELSE, because it
 * needs a real Mapbox account: whether the nineteen setConfigProperty
 * keys the scene sends are keys Standard actually has.
 *
 * It fails silently, completely. Style.setConfigProperty opens
 *
 *   const fragmentStyle = this.getFragmentStyle(importId);
 *   if (!fragmentStyle) return;
 *   ...
 *   if (!schema || !schema[key]) return;
 *
 * so a wrong fragment or a wrong key is a no-op with no trace of any
 * kind -- no throw, no warning, no error event -- and the site comes up
 * looking perfectly reasonable and wearing the wrong thing. TWELVE of
 * those nineteen keys are the cartography now, so what used to be one
 * cube quietly not applied is twelve feature classes quietly keeping
 * Mapbox's own colours.
 *
 * So it is checked from more than one side:
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
 *   getConfigProperty()   the Standard import knows each key, AND is
 *                         holding the colour the scene sent for it. The
 *                         second half is the structural fact the whole
 *                         feature comes down to.
 *   the console watcher   mapbox did not say it could not load the
 *                         stylesheet. That is a warnOnce line inside a
 *                         promise catch, so it reaches nothing else.
 *   the pixels            and, last, that two themes actually paint the
 *                         globe differently. See the final test for what
 *                         that can and cannot honestly claim.
 *
 * THIS FILE USED TO GATE A COLOUR LUT, and the story is worth keeping
 * because the failure mode has not changed, only the mechanism. The
 * owner loaded the deployed preview and said "it's not styled at all
 * with a theme" while every check here was green: the scene was calling
 * `map.setColorTheme(lut)`, which sets the ROOT style's colour theme,
 * and Mapbox Standard is a thin root importing a `basemap` fragment
 * whose layers are painted from THAT scope. The LUT was built, sent,
 * decoded, accepted and applied -- to the handful of layers this app
 * adds itself. Nothing then in this file could tell the two calls apart,
 * because the difference was not in the payload but in which scope
 * received it. The cartography is addressed to the same fragment and can
 * miss it the same way, which is why the read-back below is not
 * optional.
 */

test.use({ viewport: DESKTOP });

/**
 * The cartography the basemap import is actually holding, per key.
 *
 * getConfigProperty resolves the fragment and then its schema -- the
 * exact path the setter takes -- so a null here is precisely the silent
 * drop this file exists to catch, and a value that is not ours is a
 * colour Standard kept.
 */
const expectBasemapWearing = async (
  page: Page,
  label = '',
): Promise<Record<string, unknown>> => {
  const where = label === '' ? '' : `${label}: `;
  const config = await readBasemapConfig(page, [
    ...BASEMAP_COLOR_KEYS,
  ]);
  for (const key of BASEMAP_COLOR_KEYS) {
    expect(
      config[key],
      `${where}the "${BASEMAP_IMPORT}" import is not holding a colour ` +
        `for "${key}", so that feature class is showing Standard's own ` +
        'colour whatever the lens says',
    ).not.toBeNull();
    expect(
      String(config[key]),
      `${where}${key} is not a colour`,
    ).toMatch(/\d/);
  }
  return config;
};

test.beforeEach(async ({ page }) => {
  await installSceneDebug(page);
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

    /*
     * AND THE BASEMAP IS HOLDING THE CARTOGRAPHY.
     *
     * This is the fact the whole feature comes down to. The build that
     * shipped an entirely unthemed globe passed every check above it:
     * the theming was built, sent and accepted, and it went somewhere
     * that was not the scope the globe is painted from. The only
     * question that settles it is what that scope actually holds.
     */
    await expectBasemapWearing(page);

    /*
     * Every config key the route sent is a key the Standard import has --
     * the structural knobs and the twelve colours alike. The bogus key is
     * not padding: without it this assertion would pass just as happily
     * against a getConfigProperty that answered everything, and the whole
     * point is that it discriminates.
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
  // cartography the map saw was chalk's.
  const scene = await readScene(page);
  expect(scene.errors).toEqual([]);
  await expectBasemapWearing(page, 'chalk');
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
   * A healthy run is now nowhere near this, and got faster when the
   * colour LUT was retired: setImportColorTheme reloaded every visible
   * tile by design, and setConfigProperty reloads none, so the map goes
   * idle in a fraction of what it used to. The ceiling is the one the
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

  const wornByTheme = new Set<string>();
  for (const theme of THEME_IDS) {
    await themeOption(panel, theme).click();
    await expect(page.locator('html')).toHaveAttribute(
      'data-theme',
      theme,
    );
    // The painter debounces by 120ms and the tokens crossfade over
    // 400ms. Nothing reloads a tile any more.
    await page.waitForTimeout(THEME_SETTLE_MS);
    await settle(page);

    const scene = await readScene(page);
    expect(
      scene.errors,
      `${theme}: mapbox reported failures after ${scene.lastAction}`,
    ).toEqual([]);
    /*
     * What the basemap's own scope is holding, per theme.
     *
     * "Eight distinct payloads reached the map" was the assertion this
     * test used to end on, and it passed for weeks against a globe that
     * wore none of them: distinct is not the same as applied, and
     * applied to the root style is not the same as applied to the
     * basemap. So the set below is built from what the FRAGMENT answers,
     * not from what the scene says it sent.
     */
    const worn = await expectBasemapWearing(page, theme);
    wornByTheme.add(JSON.stringify(worn));
  }

  // Eight themes, eight different cartographies on the scope the globe
  // is painted from.
  expect(
    wornByTheme.size,
    'two themes left the basemap holding the same colours',
  ).toBe(THEME_IDS.length);
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
 *   that would pass on any two frames. /projects has spinDegPerSecond: null in
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

/*
 * HOW MUCH LIGHT COMES OUT FROM BEHIND THE GLOBE, OVER THE REAL BASEMAP.
 *
 * The design is specific and checkable here in a way it is about almost
 * nothing else: the prototype's `paintSphere()` paints flat P.space past
 * 1.34 globe radii, so a pixel further out than that must BE the ground
 * token.
 *
 *
 * WHAT THE FIRST VERSION OF THIS TEST GOT WRONG, because it matters more
 * than what it got right.
 *
 * It located its sample from the artboard's ratios -- centre at 0.66 of
 * the viewport width, radius 0.44 of its height -- and sampled one 24x24
 * box "1.45 radii out" from those numbers. Against the first real
 * preview it reported the far field sixteen levels of red above the
 * ground and failed, twice, which was the right outcome from the wrong
 * instrument: sixteen levels is not what any atmosphere leaves at 1.45r,
 * and it is about what the globe's own limb region reads. A sample that
 * is not where it thinks it is cannot tell an over-bright atmosphere from
 * a mislocated box, and this one could not say which it had found.
 *
 * So it now MEASURES the sphere -- `measureGlobe` bisects on mapbox's own
 * inverse, the method e2e/hermetic/globe-frame.spec.ts argues for at
 * length -- and works outward from that. It samples a RING at each
 * radius and takes the median, because the glow is isotropic about the
 * centre and anything that is not isotropic is not the glow. And it
 * reports the whole profile, the measured framing and the fog both
 * styles carry as `::notice::` lines, because check-run annotations are
 * the only channel out of this job that anyone can read.
 *
 *
 * WHAT WAS RULED OUT BEFORE CHANGING ANYTHING, measured against the real
 * mapbox-gl over a stubbed style at this frame:
 *
 *   STARS. `star-intensity` is 0.15 on a dark theme and mapbox draws
 *   sixteen thousand white stars in the space region, positioned by the
 *   camera's centre -- so a fixed screen point genuinely sees a different
 *   sky in a tier that spins the globe and one that does not. But the
 *   worst 24x24 box on a ring at 1.45r reads 22.4 with them on and 22.1
 *   with them off, against a ground of 22. They cannot make sixteen
 *   levels. The median is taken anyway.
 *
 *   STANDARD'S OWN FOG COMPOSITING WITH OURS. Re-run with a fragment
 *   that declares its own fog -- wide horizon-blend, its own high-color
 *   and star-intensity -- the rendered profile is identical to the
 *   fragment carrying none. The root's fog wins outright; it does not
 *   add. `map.getFog()` and the fragment's own fog are both reported
 *   below so that this stops being an inference about `forEachFragment
 *   Style` being post-order and becomes a reading off the real Standard.
 *
 * THE CAMERA IS HELLO'S, and the review project runs under reducedMotion,
 * so the globe is still.
 */
test('no glow survives past the design reach, over the real basemap', async ({
  page,
}) => {
  test.setTimeout(MAP_IDLE_BUDGET_MS + 90_000);

  const mapbox = collectMapboxFailures(page);

  await installSceneDebug(page);
  await page.setViewportSize(DESKTOP);
  await page.goto('/', { waitUntil: 'load' });
  await waitForScene(page, 'live');
  await settle(page);
  await installBasemapOnly(page);
  await showBasemapOnly(page, true);

  const ground = await page.evaluate(() =>
    getComputedStyle(document.documentElement)
      .getPropertyValue('--surface-ground')
      .trim(),
  );
  // The tokens are authored as hex, so this is the app's own parser
  // rather than a regex that would read `#161616` as the number 161616.
  const [red, green, blue] = parseRgb(ground, [-1, -1, -1]);
  expect(red).toBeGreaterThanOrEqual(0);

  /* ---- what the page is actually showing --------------------------- */

  /*
   * The raw camera first, unconditionally. measureGlobe waits for the
   * flight to land and throws if it never does, and on a network-backed
   * preview that is a real possibility -- so what the camera was doing at
   * the time is worth having even when the measurement itself fails.
   */
  notice(
    'atmosphere: camera',
    await page.evaluate(() => {
      const scene = window.__SCENE__;
      if (!scene) return 'no scene handle';
      const map = scene.map as unknown as {
        getCenter: () => { lng: number; lat: number };
        getZoom: () => number;
        getPadding: () => Record<string, number>;
        isEasing: () => boolean;
      };
      return (
        `centre ${JSON.stringify(map.getCenter())} zoom ${map.getZoom()} ` +
        `padding ${JSON.stringify(map.getPadding())} ` +
        `easing ${map.isEasing()} passes ${scene.passes()} ` +
        `viewport ${window.innerWidth}x${window.innerHeight} ` +
        `layout ${document.documentElement.clientWidth}x${document.documentElement.clientHeight} ` +
        `dpr ${window.devicePixelRatio}`
      );
    }),
  );

  const framing = await measureGlobe(page);

  /*
   * The artboard's ratios, which the first version of this test ASSUMED.
   * They are reported beside the measurement rather than used, so a
   * future divergence is visible in an annotation instead of silently
   * moving every sample.
   */
  const assumed = {
    x: DESKTOP.width * 0.66,
    y: DESKTOP.height * 0.5,
    radius: DESKTOP.height * 0.44,
  };
  notice(
    'atmosphere: framing',
    `measured centre (${framing.centre.x.toFixed(1)}, ` +
      `${framing.centre.y.toFixed(1)}) radius ${framing.radius.toFixed(1)} ` +
      `rays [${framing.radii.map((r) => r.toFixed(1)).join(', ')}] ` +
      `zoom ${framing.zoom.toFixed(4)} ` +
      `box ${framing.box.width}x${framing.box.height} ` +
      `canvas ${framing.canvas.width}x${framing.canvas.height} | ` +
      `assumed centre (${assumed.x}, ${assumed.y}) radius ${assumed.radius}`,
  );

  const fogs = await page.evaluate(() => {
    const scene = window.__SCENE__;
    if (!scene) throw new Error('window.__SCENE__ is not published');
    const map = scene.map as unknown as {
      getFog: () => unknown;
      getStyle: () => {
        fog?: unknown;
        imports?: { id: string; data?: { fog?: unknown } }[];
      };
    };
    const style = map.getStyle();
    return {
      applied: map.getFog(),
      root: style.fog ?? null,
      fragments: (style.imports ?? []).map((one) => ({
        id: one.id,
        fog: one.data?.fog ?? null,
      })),
    };
  });
  notice(
    'atmosphere: fog',
    `applied ${JSON.stringify(fogs.applied)} | root ${JSON.stringify(
      fogs.root,
    )} | fragments ${JSON.stringify(fogs.fragments)}`,
  );

  /*
   * WHICH SCOPES CARRY A COLOUR THEME, which is the whole of the bug the
   * first run of this assertion found.
   *
   * `drawAtmosphereGlow` resolves each fog colour through
   * `style.getLut(fog.scope)` unless its `-use-theme` is `none`, and
   * `fog.scope` is the ROOT's. Mapbox Standard's root carries a
   * `color-theme`; the stub tier 1 runs against did not, which is exactly
   * why tier 1 could not see this. Reported rather than inferred so the
   * next reader does not have to take the reproduction's word for it.
   */
  notice(
    'atmosphere: colour theme scopes',
    await page.evaluate(() => {
      const scene = window.__SCENE__;
      if (!scene) return 'no scene handle';
      const map = scene.map as unknown as {
        style: { getLut: (scope: string) => unknown };
        getStyle: () => {
          'color-theme'?: unknown;
          imports?: { id: string; data?: Record<string, unknown> }[];
        };
      };
      const style = map.getStyle();
      const fragments = (style.imports ?? []).map(
        (one) =>
          `${one.id}:${one.data?.['color-theme'] ? 'has' : 'none'}`,
      );
      return (
        `getLut('') ${map.style.getLut('') ? 'SET' : 'null'} ` +
        `getLut('basemap') ${map.style.getLut('basemap') ? 'SET' : 'null'} | ` +
        `root stylesheet color-theme ${
          style['color-theme'] ? 'present' : 'absent'
        } | fragment color-themes ${fragments.join(', ')}`
      );
    }),
  );

  /* ---- the profile -------------------------------------------------- */

  const rings = await sampleRadial(
    page,
    framing,
    [1.02, 1.08, 1.2, 1.34, 1.45, 1.6],
  );

  /*
   * TWO CONTROLS, run before anything is asserted so that a red gate
   * still carries them.
   *
   * THE CORNER. With the foreground hidden the top-left corner is pure
   * space: no globe, no rim, nothing. If it reads the ground, the page is
   * hidden and the measurement is of the map. If it reads hot, something
   * is painting over the whole viewport -- a foreground that did not
   * hide, a scrim -- and every other number in this test is about that
   * instead of about the atmosphere.
   *
   * THE FOG TURNED OFF. Then the rim is re-measured with `color` and
   * `high-color` fully transparent. Whatever is left at 1.45r is
   * something OTHER than the fog the scene sends, which is the one
   * question tier 1 cannot answer and the reason this test exists. The
   * scene's own fog is put back immediately afterwards.
   *
   * Both are wrapped: a probe that cannot run is a finding, not a
   * failure, and the assertions below are what this file is allowed to
   * fail on.
   */
  const corner = await samplePixels(page, {
    x: 8,
    y: 8,
    width: 24,
    height: 24,
  });
  notice(
    'atmosphere: corner control',
    `top-left 24x24 rgb(${corner.red.toFixed(1)}, ` +
      `${corner.green.toFixed(1)}, ${corner.blue.toFixed(1)}) ` +
      `against a ground of rgb(${red}, ${green}, ${blue})`,
  );

  try {
    const restore = await page.evaluate(() => {
      const scene = window.__SCENE__;
      if (!scene) throw new Error('no scene handle');
      const map = scene.map as unknown as {
        getFog: () => Record<string, unknown>;
        setFog: (fog: Record<string, unknown>) => void;
      };
      const current = map.getFog();
      map.setFog({
        ...current,
        color: 'rgba(0, 0, 0, 0)',
        'high-color': 'rgba(0, 0, 0, 0)',
        'star-intensity': 0,
      });
      return current;
    });
    await page.waitForTimeout(600);
    const bare = await sampleRadial(page, framing, [1.02, 1.45]);
    notice(
      'atmosphere: with our rim removed',
      `ground ${ground} — ${describeProfile(bare)}`,
    );
    await page.evaluate((fog) => {
      const scene = window.__SCENE__;
      if (!scene) return;
      (
        scene.map as unknown as {
          setFog: (next: Record<string, unknown>) => void;
        }
      ).setFog(fog);
    }, restore);
    await page.waitForTimeout(300);
  } catch (error) {
    notice('atmosphere: rim-removal probe failed', String(error));
  }

  await showBasemapOnly(page, false);

  notice(
    'atmosphere: profile',
    `ground ${ground} — ${describeProfile(rings)}`,
  );
  test.info().annotations.push({
    type: 'atmosphere',
    description: `ground ${ground} — ${describeProfile(rings)}`,
  });

  const ringAt = (dd: number): RingStat => {
    const found = rings.find((one) => one.dd === dd);
    if (!found) throw new Error(`no ring measured at ${dd}`);
    return found;
  };

  const far = ringAt(1.45);
  const rim = ringAt(1.02);
  expect(
    far.boxes,
    'no box on the 1.45r ring was wholly on screen: the globe is larger than the viewport can show past the design reach',
  ).toBeGreaterThan(3);

  /*
   * Three levels, and the number has not moved since this assertion was
   * written -- what moved is WHERE it is applied. Over a real basemap the
   * frame carries the tile fade and Standard's own exposure, and the
   * ground token is itself rounded to 8 bits on its way through the fog.
   * Measured against the real mapbox-gl at this frame, the design's fog
   * leaves 0.3 of a level here and the constant blend that preceded it
   * left two to three, so three is the smallest threshold that separates
   * them without being noise-bound.
   */
  const SLACK = 3;
  expect(
    Math.abs(far.red - red),
    `the atmosphere is still lit 1.45 radii out: red ${far.red.toFixed(1)} ` +
      `against a ground of ${red}. Profile: ${describeProfile(rings)}`,
  ).toBeLessThanOrEqual(SLACK);
  expect(Math.abs(far.green - green)).toBeLessThanOrEqual(SLACK);
  expect(Math.abs(far.blue - blue)).toBeLessThanOrEqual(SLACK);

  /*
   * And the rim is still drawn -- a fog that had simply been turned off
   * would pass everything above. At 1.02r the design puts about fifty
   * levels of red over the ground on the default theme; the constant
   * blend put about four. Twenty separates them with room to spare.
   */
  expect(
    rim.red,
    `the rim at 1.02r is not drawn: red ${rim.red.toFixed(1)} against a ` +
      `far field of ${far.red.toFixed(1)}`,
  ).toBeGreaterThan(far.red + 20);

  expect(mapbox).toEqual([]);
});
