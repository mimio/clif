import { expect, type Page, test } from '@playwright/test';
import {
  haloColor,
  HALO_WIDTH,
  HISTORY_LABELS,
  LOCALITY_LABELS,
  MAP_TYPE_SIZE,
  MAP_TYPE_SIZE_QUIET,
  PLACE_LABELS,
} from 'scene/layers/sets';
import { basemapSurfaces } from 'styles/tokens/cartography';
import {
  contrastRatio,
  makePalette,
  PALETTE_KEYS,
  PALETTE_TOKENS,
  parseRgb,
  type PaletteColors,
  type Rgb,
} from 'styles/tokens/palette';
import {
  installSceneDebug,
  readBasemapConfig,
  THEME_IDS,
  THEME_SETTLE_MS,
  type ThemeId,
  openThemeLens,
  themeOption,
  waitForScene,
} from '../fixtures/app';
import { stubMapboxNetwork } from '../fixtures/mapbox-stub';

/*
 * EVERY WORD ON THE MAP, READ BACK OFF THE REAL LIBRARY.
 *
 * The site shipped with Mapbox Standard drawing its own place and road
 * names above z8. The two routes that sit above z8 both carry the
 * `night` fog, which on the two light themes resolves to Standard's
 * `dusk` preset -- a preset drawn for a dark basemap, so its labels are
 * white. The owner saw exactly that: a ton of text coming through as
 * just white, on a bright ground.
 *
 * Lifting the preset is not the fix, and test/map-text.test.ts has the
 * measurement: the import's colour LUT is applied to a symbol layer's
 * TEXT as surely as to a fill, so Standard's label colour is an INPUT to
 * the terrain ramp. Sweeping 4,913 source colours, the best any
 * basemap-scope label can reach against the themed land on paper or
 * chalk is under 4.5:1. There is nothing to ask Standard for.
 *
 * So Standard draws no text, and the scene draws the names itself, at
 * the root scope where there is no LUT. This asserts that end of it
 * against the real mapbox-gl, over the hermetic stylesheet:
 *
 *   - the config toggles are off, read back off the Standard-shaped
 *     import rather than off what the app believes it sent;
 *   - every symbol layer the scene added is wearing the font, size, ink,
 *     halo and halo width computed from the LIVE token scope, on all
 *     eight themes, driven through the theme lens the way a visitor
 *     drives it;
 *   - no label ink is the ground wearing a different name -- which is
 *     the owner's bug, written as a luminance relationship rather than
 *     as a colour, so it keeps working when a palette moves.
 *
 * What it cannot say is what the labels LOOK like. There is no tileset
 * here (the stub serves a valid, empty one), so nothing is placed and
 * nothing is rasterised. Which names appear, and where, is the review
 * tier's, and only over a real token.
 */

/** Long enough for the scene's own theme debounce plus a repaint. */
const REPAINT_MS = THEME_SETTLE_MS;

/** WCAG 2 AA for body text. Map type is set at 10-11px. */
const AA = 4.5;

type SymbolText = {
  id: string;
  color: string;
  haloColor: string;
  haloWidth: unknown;
  font: unknown;
  size: unknown;
  opacity: unknown;
};

/** The map's own account of every symbol layer the app put on it. */
const readSymbolText = (page: Page): Promise<SymbolText[]> =>
  page.evaluate(() => {
    const scene = window.__SCENE__;
    if (!scene) {
      throw new Error(
        'window.__SCENE__ is not published: installSceneDebug() has to run before the app boots',
      );
    }
    const map = scene.map as unknown as {
      getStyle: () => { layers?: { id: string; type: string }[] };
      getLayer: (id: string) => unknown;
      getPaintProperty: (id: string, key: string) => unknown;
      getLayoutProperty: (id: string, key: string) => unknown;
    };
    return (
      (map.getStyle().layers ?? [])
        .filter((layer) => layer.type === 'symbol')
        // getPaintProperty resolves through Style.getOwnLayer, the ROOT
        // style's layers, so a layer inside the basemap fragment is not
        // readable here -- and that is the same reason the app cannot
        // colour one.
        .filter((layer) => Boolean(map.getLayer(layer.id)))
        .map((layer) => ({
          id: layer.id,
          color: String(map.getPaintProperty(layer.id, 'text-color')),
          haloColor: String(
            map.getPaintProperty(layer.id, 'text-halo-color'),
          ),
          haloWidth: map.getPaintProperty(
            layer.id,
            'text-halo-width',
          ),
          font: map.getLayoutProperty(layer.id, 'text-font'),
          size: map.getLayoutProperty(layer.id, 'text-size'),
          opacity: map.getPaintProperty(layer.id, 'text-opacity'),
        }))
    );
  });

/**
 * The live token scope, read off the document and rebuilt through the
 * app's own `makePalette` -- so the expectation is the app's arithmetic
 * over the browser's computed values, not a second copy of either.
 */
const readLivePalette = async (page: Page) => {
  const values = await page.evaluate((tokens) => {
    const style = getComputedStyle(document.documentElement);
    return Object.fromEntries(
      Object.entries(tokens).map(([key, name]) => [
        key,
        style.getPropertyValue(name),
      ]),
    );
  }, PALETTE_TOKENS);
  const colors = Object.fromEntries(
    PALETTE_KEYS.map((key) => [
      key,
      parseRgb(values[key], [-1, -1, -1]),
    ]),
  ) as unknown as PaletteColors;
  return makePalette(colors);
};

const rgbOf = (value: string): Rgb => parseRgb(value, [-1, -1, -1]);

/** The layers each route is expected to be naming the world with. */
const EXPECTED: Record<string, string[]> = {
  '/about': [PLACE_LABELS, LOCALITY_LABELS, HISTORY_LABELS],
  '/projects/gopro': [PLACE_LABELS, LOCALITY_LABELS],
};

const settleScene = async (page: Page): Promise<void> => {
  await waitForScene(page, 'live');
  await expect
    .poll(
      () =>
        page.evaluate(
          () =>
            window.__SCENE__?.styleStatus() === 'ready' &&
            (window.__SCENE__?.passes() ?? 0) > 0,
        ),
      { timeout: 30_000 },
    )
    .toBe(true);
};

/**
 * Everything that has to be true of the map's type on one theme.
 *
 * Both halves matter and they fail differently: the first says the paint
 * came from the token, the second says the token is usable where it has
 * been put. A palette edit that kept the wiring and broke the legibility
 * would pass the first and fail the second, which is the shape of the
 * bug this file is about.
 */
const assertMapType = async (
  page: Page,
  route: string,
  theme: string,
): Promise<void> => {
  const palette = await readLivePalette(page);
  const drawn = await readSymbolText(page);
  const where = `${route} on ${theme}`;

  expect(
    drawn.map((one) => one.id).sort(),
    `${where}: the map is not carrying the type the route declares`,
  ).toEqual([...EXPECTED[route]].sort());

  const inks = [palette.subInk, palette.mutedInk];
  const halo = haloColor(palette);
  const ramp = basemapSurfaces(palette);

  for (const text of drawn) {
    const at = `${where}: ${text.id}`;
    expect(text.font, at).toEqual([
      'Roboto Mono Light',
      'Arial Unicode MS Regular',
    ]);
    expect([MAP_TYPE_SIZE, MAP_TYPE_SIZE_QUIET], at).toContain(
      text.size,
    );

    /*
     * The owner's bug, and it is asserted BEFORE the wiring below on
     * purpose: whatever else is wrong, the first thing this file should
     * say is whether the text can be read. Not "the colour is not
     * #ffffff" -- a palette can change, and white is only how it looked
     * on the two light themes -- but "the ink is far enough from the
     * ground to BE ink". A near-white ink measures 1.16:1 here on paper
     * and 1.07:1 on chalk; a near-black one on yellow fails the same
     * way, from the other side.
     */
    expect(
      contrastRatio(rgbOf(text.color), palette.space),
      `${at} is the ground wearing a different name`,
    ).toBeGreaterThanOrEqual(AA);

    // And it stands off the themed basemap somewhere on its range,
    // rather than only off the page it is not drawn on.
    expect(
      Math.max(
        ...ramp.map((ground) =>
          contrastRatio(rgbOf(text.color), ground),
        ),
      ),
      `${at} against the themed basemap`,
    ).toBeGreaterThanOrEqual(AA);

    // Then the wiring: legible is necessary, from the token is the point.
    expect(inks.map(rgbOf), at).toContainEqual(rgbOf(text.color));
    expect(rgbOf(text.haloColor), at).toEqual(rgbOf(halo));
    expect(text.haloWidth, at).toBe(HALO_WIDTH);
    expect(text.opacity, at).toBe(1);
  }
};

test.describe('the map names places in the site voice', () => {
  test.beforeEach(async ({ context, page }) => {
    await stubMapboxNetwork(context);
    await installSceneDebug(page);
  });

  test('Standard is never asked to draw text', async ({ page }) => {
    await page.goto('/about', { waitUntil: 'load' });
    await settleScene(page);

    /*
     * Read back off the import's own schema rather than off the calls
     * the app made. An unknown key is a silent no-op in
     * Style.setConfigProperty, so "we sent false" and "Standard is
     * showing nothing" are two different facts.
     */
    const config = await readBasemapConfig(page, [
      'showPlaceLabels',
      'showRoadLabels',
      'showPointOfInterestLabels',
      'showTransitLabels',
    ]);
    expect(config).toEqual({
      showPlaceLabels: false,
      showRoadLabels: false,
      showPointOfInterestLabels: false,
      showTransitLabels: false,
    });
  });

  test('every label wears the live tokens, on all eight themes', async ({
    page,
  }) => {
    test.setTimeout(180_000);
    await page.goto('/about', { waitUntil: 'load' });
    await settleScene(page);

    // The theme the page booted on, before the lens is touched at all.
    await assertMapType(page, '/about', 'the default theme');

    const panel = await openThemeLens(page);
    for (const id of THEME_IDS as readonly ThemeId[]) {
      await themeOption(panel, id).click();
      await expect(page.locator('html')).toHaveAttribute(
        'data-theme',
        id,
      );
      // The scene coalesces theme changes; tier 3 repaints after it.
      await page.waitForTimeout(REPAINT_MS);
      await assertMapType(page, '/about', id);
    }
  });

  /*
   * WHAT THE SECOND SOURCE COSTS, AS A NUMBER.
   *
   * Drawing the names ourselves means a second copy of
   * mapbox-streets-v8: Standard's lives inside the `basemap` fragment
   * and a root layer cannot name it. Mapbox tiles are billed, so the
   * claim that this is cheap has to be measured rather than asserted.
   *
   * MEASURED at 1440x900, over the first eight seconds of each route:
   *
   *   /                 0 TileJSON, 0 tiles
   *   /about            1 TileJSON, 24 tiles
   *   /projects/gopro   1 TileJSON, 25 tiles
   *
   * The zero is the important one and it is the whole reason
   * LABEL_MIN_ZOOM moved onto the layers' `minzoom`: mapbox clears a
   * source's `used` flag when every layer reading it is outside its zoom
   * range, so the spinning globe on `/` and on the 404 -- the two routes
   * that run for the life of the tab -- never asks for a single one of
   * these. The cost falls entirely on the two routes that were already
   * showing labels, and it is a duplicate of a tile set Standard has
   * fetched for the same viewport anyway.
   *
   * The ceilings below are ceilings, not targets. What would fail this
   * is the source being requested on a globe route at all, or the label
   * layers losing their zoom floor.
   */
  test('the second source is not paid for above the globe', async ({
    context,
    page,
  }) => {
    test.setTimeout(120_000);
    const asked: string[] = [];
    // Registered after the stub, so it is matched first; fallback()
    // hands the request on to the stub that answers it.
    await context.route(/mapbox-streets-v8/, (route) => {
      asked.push(route.request().url());
      return route.fallback();
    });
    await page.setViewportSize({ width: 1440, height: 900 });

    await page.goto('/', { waitUntil: 'load' });
    await settleScene(page);
    await page.waitForTimeout(4_000);
    expect(
      asked,
      'the globe is paying for a tileset it draws nothing from',
    ).toEqual([]);

    await page.goto('/about', { waitUntil: 'load' });
    await settleScene(page);
    await page.waitForTimeout(6_000);
    const tiles = asked.filter((url) => url.includes('.mvt'));
    expect(asked.length - tiles.length).toBe(1);
    expect(tiles.length).toBeGreaterThan(0);
    expect(tiles.length).toBeLessThan(64);
  });

  /*
   * The held detail route is the one that had no map type of its own at
   * all -- 1d is terrain and the shader plane -- so every word on it was
   * Standard's, and every word on it was one of the white ones. It is
   * also the route that proves the set is mounted by the scene's own
   * diff rather than by /about happening to want it.
   */
  test('a project page is named too, in the same voice', async ({
    page,
  }) => {
    await page.goto('/projects/gopro', { waitUntil: 'load' });
    await settleScene(page);
    await assertMapType(page, '/projects/gopro', 'the default theme');
  });
});
