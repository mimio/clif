import { expect, test } from '@playwright/test';
import {
  collectMapboxFailures,
  collectProblems,
  DESKTOP,
  installLutProbe,
  readLuts,
  seedTheme,
  settle,
  THEME_IDS,
  THEME_SETTLE_MS,
  waitForScene,
} from '../fixtures/app';

/*
 * THE ONE GENUINELY UNVERIFIED THING IN THIS PROJECT.
 *
 * Nobody has yet seen Mapbox Standard wearing one of these themes. Every
 * lane so far has checked its work against a stub or a fallback plate, so
 * whether Standard accepts a runtime colour-theme LUT at all -- and what
 * eight of them look like over real terrain -- is settled here or nowhere.
 *
 * Each theme is seeded into localStorage BEFORE the document loads, so the
 * blocking bootstrap in _document applies it before first paint and the
 * 400ms token crossfade never happens. SceneRoot's first paint then sends
 * that theme's LUT to a live map, which is the same setColorTheme call a
 * lens click makes -- it is the real path, minus the transition that would
 * otherwise leave a screenshot reading a blend of two themes. The last
 * test in the file drives the lens itself, for the path the seeding skips.
 *
 * THE PROGRAMMATIC ASSERTION, AND WHY IT IS SHAPED LIKE THIS
 * A screenshot cannot tell "the LUT applied" from "the LUT was rejected
 * and Standard's own colours happen to look like this at 8% tolerance", so
 * the visual check is backed by a real one. mapbox-gl applies a colour
 * theme in exactly one way: Style._loadColorTheme() assigns the base64 to
 * a `new Image()` and, on load, refuses it unless height <= 32 and
 * width === height * height. e2e/fixtures/app.ts patches the src setter on
 * HTMLImageElement to watch that happen. An entry with ok === true is the
 * condition under which the style's LUT is set; failed === true is the
 * decode failing outright.
 *
 * It is a patch rather than a read of map.style because the app exposes no
 * handle on its Map -- see the note in the lane report; if scene/ ever
 * publishes one, this should read _styleColorTheme directly instead.
 */

test.use({ viewport: DESKTOP });

for (const theme of THEME_IDS) {
  test(`the globe wears ${theme}`, async ({ page }) => {
    await seedTheme(page, theme);
    await installLutProbe(page);
    const problems = collectProblems(page);
    const mapbox = collectMapboxFailures(page);

    await page.goto('/', { waitUntil: 'load' });
    await expect(page.locator('html')).toHaveAttribute(
      'data-theme',
      theme,
    );
    await waitForScene(page, 'live');
    await settle(page);

    /*
     * The capture comes first, and on purpose: every assertion below can
     * fail, and a failed assertion ends the test. Taking the picture
     * before them means the run that reports "the LUT was never accepted"
     * also hands over the image of what the globe looked like while it
     * was not accepted, which is the thing anyone reading the failure
     * will want. A screenshot mismatch writes its own -actual and -diff.
     */
    await expect(page).toHaveScreenshot(`globe-${theme}.png`);

    // The LUT reached the library, decoded, and is the shape Standard
    // will take. Anything else and the basemap is not wearing the theme,
    // whatever the picture shows.
    const luts = await readLuts(page);
    const applied = luts.filter((lut) => lut.ok);
    expect(
      applied.length,
      `no colour-theme LUT was accepted; saw ${JSON.stringify(luts)}`,
    ).toBeGreaterThan(0);
    expect(luts.filter((lut) => lut.failed)).toEqual([]);

    expect(mapbox).toEqual([]);
    expect(problems).toEqual([]);
  });
}

test('switching the theme at runtime repaints the live basemap', async ({
  page,
}) => {
  await installLutProbe(page);
  const problems = collectProblems(page);
  const mapbox = collectMapboxFailures(page);

  await page.goto('/', { waitUntil: 'load' });
  await waitForScene(page, 'live');
  await settle(page);

  const before = (await readLuts(page)).filter((lut) => lut.ok);
  expect(before.length).toBeGreaterThan(0);

  await page.getByRole('button', { name: 'Theme' }).click();
  await page
    .getByRole('listbox')
    .getByRole('option', { name: 'chalk', exact: true })
    .click();
  await expect(page.locator('html')).toHaveAttribute(
    'data-theme',
    'chalk',
  );
  // The painter debounces, the tokens crossfade, and setColorTheme then
  // reloads every visible tile.
  await page.waitForTimeout(THEME_SETTLE_MS);
  await settle(page);

  await expect(page).toHaveScreenshot('globe-runtime-switch.png');

  const after = (await readLuts(page)).filter((lut) => lut.ok);
  expect(after.length).toBeGreaterThan(before.length);
  // A different LUT, not the same one sent twice: setColorTheme is
  // expensive enough that re-sending an unchanged theme would be a bug.
  expect(after[after.length - 1].hash).not.toBe(before[0].hash);

  expect(mapbox).toEqual([]);
  expect(problems).toEqual([]);
});
