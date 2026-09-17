import { expect, test, type Page } from '@playwright/test';
import {
  collectProblems,
  installLutProbe,
  readLuts,
  THEME_IDS,
  THEME_SETTLE_MS,
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
 *   2. picking a theme reaches the map, once, with a different LUT -- the
 *      stub records every setColorTheme, so this is a fact rather than a
 *      colour sampled off a crossfade;
 *   3. the LUT buildLut produced is one Mapbox will actually take. That is
 *      a 32-tall, 1024-wide PNG and nothing else: mapbox-gl rejects
 *      height > 32 or width !== height * height, and a rejected LUT leaves
 *      the basemap wearing Standard's own colours with no error the app
 *      ever sees, because SceneRoot's error listener swallows everything
 *      after style.load. Tier 2 watches the real library make that check;
 *      this makes it here, for free, with no network at all.
 */

test.beforeEach(async ({ context, page }) => {
  await stubMapboxNetwork(context);
  await installMapboxGl(page);
});

// The panel is a named group of toggles, not a listbox: the roles it used
// to carry promised an arrow-key model it never had, and the eight rows
// have always been ordinary buttons.
const openPanel = async (page: Page) => {
  await page.getByRole('button', { name: 'Theme' }).click();
  return page.getByRole('group', { name: 'theme' });
};

test('the lens offers exactly the eight themes', async ({ page }) => {
  await page.goto('/', { waitUntil: 'load' });
  await waitForScene(page);

  const options = (await openPanel(page)).getByRole('button');
  await expect(options).toHaveCount(THEME_IDS.length);
  // e2e/fixtures/app.ts keeps its own copy of the ids; this is what stops
  // that copy drifting from styles/theme-bootstrap.ts.
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
  await expect(page.locator('html')).toHaveAttribute(
    'data-theme',
    'yellow',
  );

  const panel = await openPanel(page);
  await panel
    .getByRole('button', { name: 'teal', exact: true })
    .click();
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

  const panel = await openPanel(page);
  for (const id of THEME_IDS) {
    await panel
      .getByRole('button', { name: id, exact: true })
      .click();
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
