import { expect, test } from '@playwright/test';
import {
  BASEMAP_IMPORT,
  collectProblems,
  DESKTOP,
  installBasemapOnly,
  samplePixels,
  showBasemapOnly,
  openThemeLens,
  readScene,
  installSceneDebug,
  THEME_IDS,
  THEME_SETTLE_MS,
  THEMEABLE_STYLE,
  themeOption,
  themeOptions,
  waitForScene,
} from '../fixtures/app';
import {
  installMapboxGl,
  readStub,
  stubMapboxNetwork,
} from '../fixtures/mapbox-stub';
import { BASEMAP_COLOR_KEYS } from 'styles/tokens/cartography';

/**
 * The cartography half of what the stub recorded.
 *
 * The scene sends its structural knobs and its colours through the same
 * setConfigProperty loop, so they land in one list; filtering by the
 * colour keys is what separates "the route changed its light preset"
 * from "the theme changed the map".
 */
const colorsIn = (config: [string, unknown][]): [string, unknown][] =>
  config.filter(([key]) =>
    (BASEMAP_COLOR_KEYS as readonly string[]).includes(key),
  );

/*
 * The theme round trip, hermetically.
 *
 * Three claims, and only the first is about the DOM:
 *
 *   1. picking a theme sets [data-theme] and survives a reload, which is
 *      localStorage plus the blocking bootstrap in _document;
 *   2. picking a theme reaches the map, once, with a different
 *      cartography -- twelve colour keys sent to the `basemap` fragment
 *      through setConfigProperty, and no colour theme on either scope.
 *      The stub records every door separately, so which call was made is
 *      a fact rather than an assumption;
 *   3. every theme sends a COMPLETE and DISTINCT set of those colours.
 *      Complete because Style.setConfigProperty drops a key its schema
 *      does not carry without a word, so a typo is a feature class left
 *      wearing Mapbox's own colour with nothing anywhere saying so;
 *      distinct because eight themes that sent the same twelve colours
 *      would be a globe that does not retheme.
 *
 * The lens itself is driven through the shared accessor in
 * e2e/fixtures/app.ts, which e2e/review/scene.spec.ts also uses -- see the
 * note there on why the locators are not written out in either spec.
 */

test.beforeEach(async ({ context, page }) => {
  await stubMapboxNetwork(context);
  await installMapboxGl(page);
});

test('the lens offers exactly the eight themes', async ({ page }) => {
  await page.goto('/', { waitUntil: 'load' });
  await waitForScene(page);

  const options = themeOptions(await openThemeLens(page));
  await expect(options).toHaveCount(THEME_IDS.length);
  // THEME_IDS is styles/theme-bootstrap.ts's own list, imported rather than
  // copied, so this asserts the PANEL matches the app -- a theme added to
  // the table and not to the lens fails here.
  await expect(options).toHaveText(
    THEME_IDS.map((id) => new RegExp(`^${id}$`, 'i')),
  );
});

test('a picked theme reaches the map and survives a reload', async ({
  page,
}) => {
  const problems = collectProblems(page);

  await page.goto('/', { waitUntil: 'load' });
  await waitForScene(page);

  const first = await readStub(page);
  expect(colorsIn(first.config)).toHaveLength(
    BASEMAP_COLOR_KEYS.length,
  );
  /*
   * THE CALL, and the style it was made against.
   *
   * The cartography goes to the `basemap` fragment and nowhere else.
   * Neither colour-theme door may be opened: the root one was always
   * wrong (it re-tints the layers the SCENE adds and leaves the globe
   * exactly as Mapbox shipped it), and the import one would now re-grade
   * the very colours the config keys just set -- Standard marks no paint
   * property `-use-theme: "none"`, so a LUT and the colour keys cannot
   * both be primary.
   *
   * And the style URL: NEXT_PUBLIC_MAPBOX_STYLE overrides the default and
   * is inlined at build time, so a stale value is invisible everywhere
   * except here and on the deployed page itself. This is also the
   * behavioural guard on THEMEABLE_STYLE, which e2e/fixtures/app.ts has
   * to restate because scene/mapbox/** is out of reach.
   */
  expect(first.styleUrl).toBe(THEMEABLE_STYLE);
  expect(first.colorTheme).toEqual([]);
  expect(first.rootColorTheme).toEqual([]);
  expect(first.colorThemeDiscarded).toEqual([]);
  await expect(page.locator('html')).toHaveAttribute(
    'data-theme',
    'yellow',
  );

  const panel = await openThemeLens(page);
  await themeOption(panel, 'teal').click();
  await expect(page.locator('html')).toHaveAttribute(
    'data-theme',
    'teal',
  );

  // The painter debounces by 120ms and the tokens crossfade over 400ms;
  // reading before both have run reads a blend of two themes.
  await page.waitForTimeout(THEME_SETTLE_MS);

  const second = await readStub(page);
  // Exactly one more cartography, and a different one: a lens click that
  // produced two would be re-sending every colour for nothing.
  const sent = colorsIn(second.config);
  expect(sent).toHaveLength(BASEMAP_COLOR_KEYS.length * 2);
  const teal = sent.slice(BASEMAP_COLOR_KEYS.length);
  expect(teal.map(([, value]) => value)).not.toEqual(
    sent.slice(0, BASEMAP_COLOR_KEYS.length).map(([, v]) => v),
  );
  expect(second.colorTheme).toEqual([]);
  expect(second.rootColorTheme).toEqual([]);
  // The camera holds through a theme change -- it is the one scene change
  // with no camera move.
  expect(second.easeTo.length).toBe(first.easeTo.length);

  await page.reload({ waitUntil: 'load' });
  await expect(page.locator('html')).toHaveAttribute(
    'data-theme',
    'teal',
  );
  await waitForScene(page);

  const afterReload = await readStub(page);
  /*
   * A fresh document: one map, one cartography, and it is teal's rather
   * than the default's -- so the bootstrap ran before the scene read the
   * palette, which is the whole point of its being a blocking script.
   */
  expect(afterReload.constructed).toBe(1);
  expect(colorsIn(afterReload.config)).toEqual(teal);

  expect(problems).toEqual([]);
});

test('every theme sends a complete, distinct cartography', async ({
  page,
}) => {
  await page.goto('/', { waitUntil: 'load' });
  await waitForScene(page);

  const panel = await openThemeLens(page);
  for (const id of THEME_IDS) {
    await themeOption(panel, id).click();
    await page.waitForTimeout(THEME_SETTLE_MS);
  }

  const sent = colorsIn((await readStub(page)).config);
  /*
   * yellow is already on the map when the panel opens, so re-picking it
   * costs nothing: the painter refuses to repaint an unchanged key. Eight
   * themes, each sending all twelve colours once, is the assertion.
   */
  expect(sent).toHaveLength(
    THEME_IDS.length * BASEMAP_COLOR_KEYS.length,
  );

  const perTheme = new Set<string>();
  for (
    let at = 0;
    at < sent.length;
    at += BASEMAP_COLOR_KEYS.length
  ) {
    const batch = sent.slice(at, at + BASEMAP_COLOR_KEYS.length);
    // Complete: every key, every time, and each one a real colour.
    expect(batch.map(([key]) => key).sort()).toEqual(
      [...BASEMAP_COLOR_KEYS].sort(),
    );
    for (const [key, value] of batch) {
      expect(String(value), key).toMatch(/^rgb\(\d+, \d+, \d+\)$/);
    }
    perTheme.add(JSON.stringify(batch));
  }
  // Distinct: eight themes, eight different basemaps.
  expect(perTheme.size).toBe(THEME_IDS.length);
});

/*
 * THE CONFIGURATION MISTAKE THAT REACHED THE OWNER.
 *
 * Every tier of the theming is addressed to one import id, and mapbox-gl
 * answers a call for an import that is not there by returning --
 * Style.setImportColorTheme and Style.setConfigProperty both open
 * `const fragmentStyle = this.getFragmentStyle(id); if (!fragmentStyle)
 * return;`. So pointing NEXT_PUBLIC_MAPBOX_STYLE at anything that is not
 * Mapbox Standard produced a site where the theme lens worked, the LUT
 * was built, sent, decoded and accepted, window.__SCENE__.errors() was
 * empty -- and the globe wore none of the eight themes.
 *
 * It has to be loud and it has to be survivable, in that order.
 */
test('a style with no basemap import fails loudly and keeps the scene up', async ({
  page,
}) => {
  await installSceneDebug(page);
  // A second install, deliberately: installMapboxGl replaces
  // window.__MAPBOX_STUB__ and window.__ONEGLOBE_STUB__ wholesale, and
  // init scripts run in order, so this one wins over the beforeEach's.
  await installMapboxGl(page, { basemap: false });

  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });

  await page.goto('/', { waitUntil: 'load' });
  await waitForScene(page);

  const scene = await readScene(page);
  expect(scene.colorThemeSupported).toBe(false);
  expect(scene.styleStatus).toBe('ready');
  // The scene's own record, which is what tier 2 asserts on.
  expect(scene.errors.join('\n')).toContain(
    `has no "${BASEMAP_IMPORT}" import`,
  );
  // And the console, which is what a developer sees.
  expect(
    errors.join('\n'),
    'nothing on the console named the style or the consequence',
  ).toContain('NEXT_PUBLIC_MAPBOX_STYLE');

  // Nothing reached the basemap, and nothing crashed.
  const stub = await readStub(page);
  expect(stub.colorTheme).toEqual([]);
  /*
   * And every colour went nowhere. That is the shape of the failure: not
   * one cube quietly refused, but twelve feature classes left wearing
   * Mapbox's own, each dropped by a call that returned normally.
   */
  expect(stub.config).toEqual([]);
  expect(stub.configDiscarded.length).toBeGreaterThan(0);
  expect(stub.configDiscarded.map(([key]) => key)).toContain(
    'colorWater',
  );
  await expect(
    page.locator('[data-testid="scene-root"]'),
  ).toHaveAttribute('data-scene-state', 'live');
});

/*
 * THE OTHER INSTRUMENT TIER 2 LEANS ON, exercised where it can be checked.
 *
 * e2e/review/scene.spec.ts ends by photographing the globe under two
 * themes and requiring the pixels to differ, and that argument only holds
 * if the foreground really is out of the frame: the type, the scrims and
 * the chrome are all themed too, and a whole-viewport comparison would
 * register a theme change whether or not the basemap did. The hiding is
 * therefore load-bearing, and it is an ordinary DOM fact -- so it is
 * checked here, on every PR, rather than only in a job that runs on a
 * deployment.
 *
 * What cannot be checked here is the picture itself: the stub paints
 * nothing, so the only honest claim about the sample is that it decoded
 * and covered the crop.
 */
test('the basemap-only switch hides the foreground and the sample decodes', async ({
  page,
}) => {
  await page.goto('/', { waitUntil: 'load' });
  await waitForScene(page);
  await installBasemapOnly(page);

  const lens = page.getByRole('button', { name: 'Theme' });
  await expect(lens).toBeVisible();

  await showBasemapOnly(page, true);
  await expect(
    lens,
    'the chrome is still in front of the globe, so a pixel sample of ' +
      'the map would be measuring the theme twice',
  ).toBeHidden();
  await expect(
    page.locator('[data-testid="scene-root"]'),
  ).toBeVisible();

  const stats = await samplePixels(page, {
    x: DESKTOP.width / 2 - 40,
    y: DESKTOP.height / 2 - 40,
    width: 80,
    height: 80,
  });
  expect(stats.pixels).toBeGreaterThan(0);
  for (const channel of [stats.red, stats.green, stats.blue]) {
    expect(channel).toBeGreaterThanOrEqual(0);
    expect(channel).toBeLessThanOrEqual(255);
  }

  await showBasemapOnly(page, false);
  await expect(lens).toBeVisible();
});
