import { expect, test } from '@playwright/test';
import {
  BASEMAP_IMPORT,
  collectProblems,
  DESKTOP,
  installBasemapOnly,
  samplePixels,
  showBasemapOnly,
  installLutProbe,
  openThemeLens,
  readLuts,
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
  measureRecordedLuts,
  readStub,
  stubMapboxNetwork,
} from '../fixtures/mapbox-stub';

/*
 * The theme round trip, hermetically.
 *
 * Three claims, and only the first is about the DOM:
 *
 *   1. picking a theme sets [data-theme] and survives a reload, which is
 *      localStorage plus the blocking bootstrap in _document;
 *   2. picking a theme reaches the map, once, with a different LUT, AND
 *      it reaches it through setImportColorTheme on the `basemap`
 *      fragment rather than through the root style's setColorTheme --
 *      the stub records the two apart, so which call was made is a fact
 *      rather than an assumption. That distinction is the whole of the
 *      bug this spec now guards: both calls succeed, both decode, and
 *      only one of them re-tints the globe;
 *   3. the LUT buildLut produced is one Mapbox will actually take. That is
 *      a 32-tall, 1024-wide PNG and nothing else: mapbox-gl rejects
 *      height > 32 or width !== height * height, and it rejects it inside a
 *      promise catch that ends in warnOnce -- no error event, so nothing the
 *      app listens to ever hears about it and the basemap simply keeps
 *      Standard's own colours. (scene/mapbox/instance.ts no longer drops
 *      what it DOES hear; it logs at error or warn by severity. The LUT
 *      rejection is not one of those, which is why it needs its own check.)
 *      Tier 2 watches the real library make that check; this makes it here,
 *      for free, with no network at all.
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
  expect(first.colorTheme.length).toBe(1);
  /*
   * THE CALL, and the style it was made against.
   *
   * `map.setColorTheme(lut)` and
   * `map.setImportColorTheme('basemap', lut)` are indistinguishable from
   * everything else this suite can see: both succeed, both decode, both
   * leave appliedLut() reporting a LUT. Only the second re-tints
   * Standard's own layers, which live in the `basemap` import and take
   * their LUT from that scope.
   *
   * And the style URL: NEXT_PUBLIC_MAPBOX_STYLE overrides the default and
   * is inlined at build time, so a stale value is invisible everywhere
   * except here and on the deployed page itself. This is also the
   * behavioural guard on THEMEABLE_STYLE, which e2e/fixtures/app.ts has
   * to restate because scene/mapbox/** is out of reach.
   */
  expect(first.styleUrl).toBe(THEMEABLE_STYLE);
  expect(first.colorThemeImports).toEqual([BASEMAP_IMPORT]);
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
  // Exactly one more: setColorTheme reloads every tile, so a lens click
  // that produced two would be a performance bug as well as a wrong one.
  expect(second.colorTheme.length).toBe(2);
  expect(second.colorTheme[1]).not.toBe(second.colorTheme[0]);
  expect(second.colorThemeImports).toEqual([
    BASEMAP_IMPORT,
    BASEMAP_IMPORT,
  ]);
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
  // A fresh document: one map, one LUT, and it is teal's rather than the
  // default's -- so the bootstrap ran before the scene read the palette,
  // which is the whole point of its being a blocking script.
  expect(afterReload.constructed).toBe(1);
  expect(afterReload.colorTheme).toEqual([second.colorTheme[1]]);

  expect(problems).toEqual([]);
});

test('every theme builds a LUT mapbox-gl will accept', async ({
  page,
}) => {
  await page.goto('/', { waitUntil: 'load' });
  await waitForScene(page);

  const panel = await openThemeLens(page);
  for (const id of THEME_IDS) {
    await themeOption(panel, id).click();
    await page.waitForTimeout(THEME_SETTLE_MS);
  }

  const luts = await measureRecordedLuts(page);
  // yellow is already on the map when the panel opens, so re-picking it
  // costs nothing: the painter refuses to repaint an unchanged key. Eight
  // distinct LUTs for eight themes is the assertion.
  expect(luts.length).toBe(THEME_IDS.length);

  for (const lut of luts) {
    expect(lut.prefixed).toBe(false);
    expect(lut.height).toBeGreaterThan(0);
    expect(lut.height).toBeLessThanOrEqual(32);
    expect(lut.width).toBe(lut.height ** 2);
  }
});

/*
 * The instrument tier 2 leans on, exercised where it can be checked.
 *
 * e2e/fixtures/app.ts patches the src setter on HTMLImageElement so that
 * tier 2 can watch mapbox-gl decode a colour-theme LUT -- which is the
 * only place a real Map's colour theme is observable from outside, since
 * nothing publishes the Map instance. That patch cannot be exercised
 * against the real library here, but it can be exercised against the
 * thing it is looking for: an `Image` whose src is a base64 PNG. If it
 * ever stops seeing one, tier 2 fails for a reason that has nothing to do
 * with the site, so it is worth knowing here instead.
 */
test('the colour-theme probe sees a LUT assignment', async ({
  page,
}) => {
  await installLutProbe(page);
  await page.goto('/', { waitUntil: 'load' });
  await waitForScene(page);

  // The LUT the scene actually sent, replayed through an Image exactly as
  // Style._loadColorTheme() would.
  await page.evaluate(async () => {
    const lut = window.__ONEGLOBE_STUB__?.colorTheme[0] ?? '';
    await new Promise<void>((resolve) => {
      const image = new Image();
      image.onload = () => resolve();
      image.onerror = () => resolve();
      image.src = `data:image/png;base64,${lut}`;
    });
  });

  const seen = await readLuts(page);
  expect(seen.length).toBe(1);
  expect(seen[0].failed).toBe(false);
  expect(seen[0].ok).toBe(true);
  expect(seen[0].height).toBe(32);
  expect(seen[0].width).toBe(1024);
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
  expect(stub.colorThemeDiscarded.length).toBeGreaterThan(0);
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
