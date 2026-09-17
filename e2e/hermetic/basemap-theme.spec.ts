import { expect, test } from '@playwright/test';
import {
  BASEMAP_IMPORT,
  installSceneDebug,
  openThemeLens,
  readBasemapLut,
  readScene,
  THEME_SETTLE_MS,
  THEMEABLE_STYLE,
  themeOption,
  waitForScene,
} from '../fixtures/app';
import { stubMapboxNetwork } from '../fixtures/mapbox-stub';

/*
 * THE BUG THE OWNER SAW, PINNED AGAINST THE REAL LIBRARY, WITH NO NETWORK.
 *
 * The site shipped a globe wearing none of its eight themes while every
 * check in the project was green. The theme lens worked, the LUT was
 * built, handed to mapbox, decoded and accepted, and no error was
 * reported from anywhere. All of that was true. What was also true is
 * that the LUT was handed to `map.setColorTheme()`, which sets the ROOT
 * style's colour theme -- and Mapbox Standard is not a flat style. It is
 * a thin root importing a `basemap` fragment, and mapbox-gl paints each
 * layer with `style.getLut(layer.scope)`. The root's LUT therefore
 * reached the handful of layers this app adds itself and nothing else.
 *
 * No seam this project had could tell the two calls apart, because they
 * differ in neither payload nor outcome-as-reported: they differ in which
 * SCOPE ends up holding the LUT. So that is what this asserts, and it
 * asserts it against the real mapbox-gl rather than a stub -- a stub
 * cannot have this bug, which is exactly why a stub never found it.
 *
 * It is hermetic all the same. e2e/fixtures/mapbox-stub.ts answers
 * api.mapbox.com with a Standard-SHAPED stylesheet: a root whose whole
 * content is one inline `basemap` import, carrying Standard's seven
 * config keys in its schema and its own background layer. Everything
 * below is the real Style, the real import resolution and the real
 * Style._loadColorTheme, over a document that never leaves the machine.
 *
 * What it cannot say is what the globe LOOKS like. Real tiles need a real
 * token, so the pixels are e2e/review/scene.spec.ts's, and only its.
 */

/** Long enough for Style._loadColorTheme to decode a 1024x32 PNG. */
const LUT_DECODE_MS = 10_000;

test.beforeEach(async ({ context, page }) => {
  await stubMapboxNetwork(context);
  await installSceneDebug(page);
});

test('the colour theme lands on the basemap scope, not the root', async ({
  page,
}) => {
  await page.goto('/', { waitUntil: 'load' });
  await waitForScene(page, 'live');

  const scene = await readScene(page);
  expect(scene.styleUrl).toBe(THEMEABLE_STYLE);
  expect(
    scene.colorThemeSupported,
    'the stubbed stylesheet no longer carries the basemap import',
  ).toBe(true);
  expect(scene.lut).not.toBeNull();

  /*
   * The whole assertion, in one line: the scope the globe's layers are
   * painted from is holding the LUT the scene sent.
   *
   * Polled rather than read once, because Style._loadColorTheme decodes
   * the PNG through an Image and assigns the LUT in its onload -- the
   * call returns long before the scope has anything in it.
   */
  await expect
    .poll(async () => (await readBasemapLut(page)).fingerprint, {
      message: `the "${BASEMAP_IMPORT}" scope never received a LUT`,
      timeout: LUT_DECODE_MS,
    })
    .toBe(scene.lut);

  // And the root's scope has none, because nothing sent it one.
  const worn = await readBasemapLut(page);
  expect(worn.outcome).toBe('ok');
  expect(
    worn.root,
    'the root style is carrying a colour theme, which tints the layers ' +
      'this app adds and not the basemap',
  ).toBeNull();
});

/*
 * THE CONTROL, and the reason this file exists rather than a comment.
 *
 * Everything above would also pass if `setImportColorTheme` and
 * `setColorTheme` did the same thing -- which is precisely what the code
 * that shipped assumed. So this makes the root call, from outside the
 * app, with the very LUT the scene sent, and shows what it does: it
 * succeeds, it decodes, it fills the ROOT's scope, and the basemap's
 * scope does not move. That is the shipped bug, reproduced on demand.
 */
test('map.setColorTheme fills the root scope and leaves the basemap alone', async ({
  page,
}) => {
  await page.goto('/', { waitUntil: 'load' });
  await waitForScene(page, 'live');

  await expect
    .poll(async () => (await readBasemapLut(page)).outcome, {
      timeout: LUT_DECODE_MS,
    })
    .toBe('ok');
  const before = await readBasemapLut(page);
  expect(before.root).toBeNull();

  // The call the app used to make, with the app's own LUT.
  await page.evaluate(() => {
    const scene = window.__SCENE__;
    if (!scene) throw new Error('window.__SCENE__ is not published');
    const lut = scene.appliedLut();
    if (lut === null) throw new Error('the scene has sent no LUT');
    (
      scene.map as unknown as {
        setColorTheme: (theme: { data: string }) => unknown;
      }
    ).setColorTheme({ data: lut });
  });

  // It is accepted and applied -- to the root.
  await expect
    .poll(async () => (await readBasemapLut(page)).root, {
      message:
        'setColorTheme was refused outright, which is not the failure ' +
        'this test is about; re-read Style._loadColorTheme',
      timeout: LUT_DECODE_MS,
    })
    .toBe(before.fingerprint);

  // And the basemap's scope is exactly where it was: same LUT, and the
  // one the scene put there, not the one just sent to the root.
  const after = await readBasemapLut(page);
  expect(after.fingerprint).toBe(before.fingerprint);
  expect(after.outcome).toBe('ok');
});

test('each theme re-tints the basemap scope, not just the request', async ({
  page,
}) => {
  await page.goto('/', { waitUntil: 'load' });
  await waitForScene(page, 'live');
  await expect
    .poll(async () => (await readBasemapLut(page)).outcome, {
      timeout: LUT_DECODE_MS,
    })
    .toBe('ok');

  const first = await readBasemapLut(page);

  const panel = await openThemeLens(page);
  await themeOption(panel, 'teal').click();
  await expect(page.locator('html')).toHaveAttribute(
    'data-theme',
    'teal',
  );
  await page.waitForTimeout(THEME_SETTLE_MS);

  // A different LUT, on the scope that paints the globe -- which is the
  // fact "eight distinct LUTs reached mapbox" never established.
  await expect
    .poll(async () => (await readBasemapLut(page)).fingerprint, {
      message:
        'the basemap scope is still wearing the previous theme',
      timeout: LUT_DECODE_MS,
    })
    .not.toBe(first.fingerprint);

  const scene = await readScene(page);
  const worn = await readBasemapLut(page);
  expect(worn.fingerprint).toBe(scene.lut);
});
