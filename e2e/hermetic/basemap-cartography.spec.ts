import { expect, test } from '@playwright/test';
import {
  BASEMAP_COLOR_KEYS,
  BASEMAP_COLORS,
} from 'styles/tokens/cartography';
import {
  installSceneDebug,
  readBasemapConfig,
  readScene,
  THEME_SETTLE_MS,
  THEMEABLE_STYLE,
  THEME_IDS,
  type ThemeId,
  openThemeLens,
  themeOption,
  waitForScene,
} from '../fixtures/app';
import { stubMapboxNetwork } from '../fixtures/mapbox-stub';

/*
 * THE CARTOGRAPHY REACHES THE BASEMAP, PINNED AGAINST THE REAL LIBRARY.
 *
 * This file replaced basemap-theme.spec.ts, which pinned the same claim
 * about the mechanism that came before: a colour LUT, and the difference
 * between `map.setColorTheme()` (the root style, which reached the
 * handful of layers this app adds and nothing else) and
 * `map.setImportColorTheme('basemap', ...)` (the fragment the globe is
 * actually made of). The site shipped a globe wearing none of its eight
 * themes while every check was green, because no seam could tell those
 * two calls apart.
 *
 * The LUT is gone -- styles/tokens/cartography.ts has the measurement
 * that retired it -- and the new mechanism has the SAME failure mode, in
 * a worse degree. `Style.setConfigProperty` opens
 *
 *   const fragmentStyle = this.getFragmentStyle(importId);
 *   if (!fragmentStyle) return;
 *   ...
 *   if (!schema || !schema[key]) return;
 *
 * so a colour sent to the wrong fragment, or under a key Standard does
 * not have, is dropped with no error, no warning and no event. There are
 * twelve of them now rather than one cube, and the globe would keep
 * Mapbox's own colours under every theme with nothing anywhere saying so.
 *
 * So this reads the colours back off the Standard import through
 * getConfigProperty -- the same schema resolution the setter goes
 * through -- against the real mapbox-gl rather than a stub. A stub cannot
 * have this bug, which is exactly why a stub never found the last one.
 *
 * It is hermetic all the same. e2e/fixtures/mapbox-stub.ts answers
 * api.mapbox.com with a Standard-SHAPED stylesheet: a root whose whole
 * content is one inline `basemap` import carrying Standard's real config
 * schema. Everything below is the real Style and the real import
 * resolution, over a document that never leaves the machine.
 *
 * What it cannot say is what the globe LOOKS like. Real tiles need a real
 * token, so the pixels are e2e/review/cartography.spec.ts's, and only its.
 */

/** The map token behind each colour key, as a CSS custom property. */
const TOKEN_OF: Record<string, string> = Object.fromEntries(
  BASEMAP_COLOR_KEYS.map((key) => [
    key,
    `--map-${BASEMAP_COLORS[key]
      .replace(/([A-Z])/g, '-$1')
      .toLowerCase()}`,
  ]),
);

/** The live value of a custom property, as `rgb(r, g, b)`. */
const readToken = (
  page: import('@playwright/test').Page,
  token: string,
) =>
  page.evaluate((name) => {
    const probe = document.createElement('div');
    probe.style.color = getComputedStyle(
      document.documentElement,
    ).getPropertyValue(name);
    document.body.append(probe);
    const resolved = getComputedStyle(probe).color;
    probe.remove();
    return resolved;
  }, token);

test.beforeEach(async ({ context, page }) => {
  await stubMapboxNetwork(context);
  await installSceneDebug(page);
});

test('every colour key lands on the Standard import', async ({
  page,
}) => {
  await page.goto('/', { waitUntil: 'load' });
  await waitForScene(page, 'live');

  const scene = await readScene(page);
  expect(scene.styleUrl).toBe(THEMEABLE_STYLE);
  expect(scene.colorThemeSupported).toBe(true);

  const config = await readBasemapConfig(page, [
    ...BASEMAP_COLOR_KEYS,
  ]);

  for (const key of BASEMAP_COLOR_KEYS) {
    /*
     * Not null, which is what a key Standard does not have answers, and
     * what every one of these would answer if the fragment id were
     * wrong. This is the assertion the whole change rests on.
     */
    expect(
      config[key],
      `Standard dropped "${key}": either the key is not in its schema ` +
        'or it was addressed to the wrong fragment, and both are silent',
    ).not.toBeNull();

    // And it is OUR colour, not Standard's default for that class.
    const token = await readToken(page, TOKEN_OF[key]);
    expect(
      String(config[key]).replace(/\s+/g, ''),
      `${key} is not ${TOKEN_OF[key]}`,
    ).toBe(token.replace(/\s+/g, ''));
  }
});

/*
 * Eight themes must produce eight different basemaps. If two collided
 * the globe would simply not retheme between them, and nothing else in
 * the app would say so -- the config calls would all succeed, carrying
 * the same colours.
 */
test('each theme re-colours the basemap, not just the request', async ({
  page,
}) => {
  await page.goto('/', { waitUntil: 'load' });
  await waitForScene(page, 'live');

  /*
   * Opened once, outside the loop: picking a theme leaves the lens open,
   * and re-opening it would toggle it shut. e2e/review/scene.spec.ts
   * drives the same eight themes through the same accessors the same way.
   */
  const panel = await openThemeLens(page);

  const seen = new Map<ThemeId, string>();
  for (const id of THEME_IDS) {
    await themeOption(panel, id).click();
    await page.waitForTimeout(THEME_SETTLE_MS);

    const config = await readBasemapConfig(page, [
      ...BASEMAP_COLOR_KEYS,
    ]);
    for (const key of BASEMAP_COLOR_KEYS) {
      expect(
        config[key],
        `${id}: ${key} went missing`,
      ).not.toBeNull();
    }
    seen.set(id, JSON.stringify(config));
  }

  expect(
    new Set(seen.values()).size,
    'two themes put the same cartography on the basemap',
  ).toBe(THEME_IDS.length);
});
