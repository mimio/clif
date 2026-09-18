import { describe, expect, it } from 'vitest';
import type { SceneId } from 'content/cameras';
import {
  BASEMAP_LABELS_SET,
  haloColor,
  HALO_WIDTH,
  layerSetsFor,
  type LayerSetOptions,
  MAP_TYPE_SIZE,
  MAP_TYPE_SIZE_QUIET,
} from 'scene/layers/sets';
import { basemapConfig } from 'scene/theme';
import { THEME_IDS, type ThemeId } from 'styles/theme-bootstrap';
import { basemapColor, basemapRamp } from 'styles/tokens/lut';
import {
  contrastRatio,
  makePalette,
  type Palette,
  PALETTE_KEYS,
  PALETTE_TOKENS,
  parseRgb,
  type PaletteColors,
  type Rgb,
} from 'styles/tokens/palette';
import { themeBlock } from 'test/theme-css';

/*
 * MAP TYPE IS MEASURED AGAINST THE MAP, NOT AGAINST THE PAGE.
 *
 * The design's contrast ladder is derived once per theme against
 * --surface-ground: every ink in themes.css is a step that clears 4.5:1
 * on the page. Map type does not sit on the page. It sits on land, water
 * and terrain -- which are not tokens at all, but the OUTPUT of the
 * colour theme in styles/tokens/lut.ts -- so nothing in the token layer
 * had ever measured the background map type is actually drawn on, and
 * the first time anybody did was when the owner reported "a TON of text
 * coming through as just white".
 *
 * This file is that measurement. It answers two questions:
 *
 *   1. Could Standard's own labels ever have been themed? (No, and the
 *      numbers say why: the LUT is a tone compressor, and on a light
 *      theme its whole output span is about 1.4:1 wide.)
 *   2. Does the type the scene draws instead clear a real bar against
 *      every surface the themed basemap can put under it?
 *
 * Both are asked of all eight themes, against the palettes themes.css
 * actually ships rather than against a fixture.
 */

const paletteFor = (id: ThemeId): Palette => {
  const block = themeBlock(
    id === 'yellow' ? ':root' : `[data-theme='${id}']`,
  );
  const colors = Object.fromEntries(
    PALETTE_KEYS.map((key) => [
      key,
      parseRgb(block[PALETTE_TOKENS[key]], [-1, -1, -1]),
    ]),
  ) as unknown as PaletteColors;
  return makePalette(colors);
};

const PALETTES = THEME_IDS.map((id) => [id, paletteFor(id)] as const);

const LIGHT_THEMES: ThemeId[] = ['paper', 'chalk'];

/** WCAG 2 AA for body text. Map type is set at 10-11px, so this is it. */
const AA = 4.5;

/** rgb(r, g, b) back to numbers, so a patch value can be measured. */
const inkOf = (value: unknown): Rgb =>
  parseRgb(String(value), [-1, -1, -1]);

/* ---- 1. what the colour theme does to Standard's own labels ----------- */

/*
 * A coarse sweep of the whole 8-bit cube: 4,913 source colours, which is
 * every combination of seventeen levels per channel. It is deliberately
 * not just the greys. The claim being tested is about ANY colour Mapbox
 * could pick for a label under ANY light preset, and a grey ramp would
 * only have tested the ones with no chroma to carry.
 */
const SWEEP_STEPS = 16;

const sweep = (): Rgb[] => {
  const colors: Rgb[] = [];
  for (let r = 0; r <= SWEEP_STEPS; r += 1) {
    for (let g = 0; g <= SWEEP_STEPS; g += 1) {
      for (let b = 0; b <= SWEEP_STEPS; b += 1) {
        colors.push([
          (r / SWEEP_STEPS) * 255,
          (g / SWEEP_STEPS) * 255,
          (b / SWEEP_STEPS) * 255,
        ]);
      }
    }
  }
  return colors;
};

const SOURCES = sweep();

/** The best a basemap-scope label could possibly do on this theme. */
const bestBasemapLabel = (palette: Palette): number => {
  const land = basemapRamp(palette)[1];
  let best = 1;
  for (const src of SOURCES) {
    best = Math.max(
      best,
      contrastRatio(basemapColor(palette, src), land),
    );
  }
  return best;
};

describe("Standard's own labels, after the colour theme", () => {
  /*
   * THE TEST THAT WOULD HAVE CAUGHT IT.
   *
   * Written as a contrast measurement rather than as "the dusk preset
   * draws white text", because the colour is not the bug. The bug is
   * that a label inside the `basemap` fragment is painted through
   * style.getLut('basemap') -- SymbolBucket hands the bucket's lut to
   * the TEXT binder exactly as to a fill -- and the ramp that lut
   * encodes maps every source luma above its floor onto
   * deep -> land -> highlight. On a light theme those three anchors are
   * within about 1.4:1 of each other, so both ends of Standard's range
   * arrive at the same illegible place and no lightPreset moves them.
   *
   * This asserts the strongest form of that: over 4,913 source colours,
   * covering anything Mapbox could possibly choose, the BEST achievable
   * contrast against the themed land is still under AA.
   */
  it.each(LIGHT_THEMES)(
    'cannot reach AA on %s, whatever colour Mapbox picks',
    (id) => {
      const best = bestBasemapLabel(paletteFor(id));
      expect(
        best,
        `a basemap-scope label can reach ${best.toFixed(2)}:1 on ${id}`,
      ).toBeLessThan(AA);
    },
  );

  /*
   * And the consequence, which is the line of code the measurement
   * justifies: Standard is never asked for text. Not at a zoom, not on a
   * theme, not for one category of label and not another.
   */
  it.each(PALETTES)('%s never asks Standard for text', (_id, p) => {
    for (const fog of ['space', 'dusk', 'night'] as const) {
      const config = basemapConfig(fog, p.light);
      expect(config.showPlaceLabels).toBe(false);
      expect(config.showRoadLabels).toBe(false);
      expect(config.showPointOfInterestLabels).toBe(false);
      expect(config.showTransitLabels).toBe(false);
    }
  });

  /*
   * The control, and the reason the sweep above is not vacuous. Our own
   * labels are drawn at the ROOT scope, which carries no colour theme --
   * e2e/hermetic/basemap-theme.spec.ts reads that back off the real
   * library -- so the same ink that cannot work inside the fragment
   * works comfortably outside it. If this ever failed alongside the
   * sweep, the problem would be the palette, not the scope.
   */
  it.each(LIGHT_THEMES)(
    'while the same ink, drawn at the root scope, clears AA on %s',
    (id) => {
      const palette = paletteFor(id);
      const land = basemapRamp(palette)[1];
      expect(
        contrastRatio(inkOf(palette.subInk), land),
      ).toBeGreaterThanOrEqual(AA);
    },
  );
});

/* ---- 2. the ink the scene draws map type in --------------------------- */

/*
 * The themed basemap's three ramp anchors are the full range of ground a
 * label can land on: the deepest water at the bottom, the land beige in
 * the middle, the brightest road fill at the top. Map type is measured
 * against all three.
 *
 * WHAT THE NUMBERS ARE, on the shipped palettes (--text-secondary, which
 * is what both label layers resolve to today because themes.css collapses
 * the secondary and muted steps onto one value):
 *
 *   theme   floor   land   top    halo/ink  halo/land
 *   yellow   8.86   3.45   1.45     10.58     3.07
 *   lime     9.47   3.57   1.37     11.37     3.19
 *   rust     9.23   3.78   1.03     11.16     2.95
 *   teal     8.95   3.56   1.35     10.71     3.01
 *   pink     8.75   3.66   1.12     10.43     2.85
 *   cream    9.36   3.58   1.32     11.37     3.18
 *   paper    5.10   6.96   5.76      6.71     1.04
 *   chalk    5.14   7.10   6.16      7.17     1.01
 *
 * Read that honestly: on a LIGHT theme the ink clears AA against every
 * anchor unaided, and the halo does nothing because the ground and the
 * themed land are within 1.05:1. On a DARK theme the ink clears AA
 * against the bottom of the ramp and falls to about 3.5:1 against the
 * land -- the map's ground is far brighter than the page's, which is
 * exactly the gap this file exists to name -- and it is the halo, at
 * 10-11:1 from the ink, that separates a glyph from the land and from
 * the bright road fills at the top of the ramp.
 *
 * So the bar below is stated in the two parts that are actually true,
 * rather than as one number that would have to be fudged: the ink clears
 * AA somewhere on the ramp on every theme, and wherever it does not, the
 * halo clears AA against the ink AND stands clear of the land.
 *
 * A --map-ink token, lifted on dark themes so the ink clears AA against
 * the land unaided, is the obvious next step and is deliberately NOT
 * taken here: it is a ladder that has to be derived for all eight themes
 * against a background the design bundle never considered, which is a
 * design decision rather than a bug fix. yellow's --text-body already
 * measures 5.20:1 against its land, so the step exists if it is wanted.
 */

const LABEL_LAYERS = [
  'basemap-place-labels',
  'basemap-locality-labels',
  'project-site-labels',
  'project-site-counts',
  'history-stop-labels',
] as const;

const SCENES: SceneId[] = [
  'hello',
  'notFound',
  'projects',
  'about',
  'projectDetail',
];

const optionsFor = (
  palette: Palette,
  overrides: Partial<LayerSetOptions> = {},
): LayerSetOptions => ({
  palette,
  hover: null,
  labels: true,
  selectedStop: null,
  onHoverAnchor: () => {},
  onSelectAnchor: () => {},
  onSelectStop: () => {},
  ...overrides,
});

type Drawn = {
  scene: SceneId;
  layer: string;
  font: unknown;
  size: unknown;
  ink: Rgb;
  halo: Rgb;
  haloWidth: unknown;
};

/** Every symbol layer the scene can mount, with the paint it wears. */
const drawnText = (palette: Palette): Drawn[] => {
  const out: Drawn[] = [];
  for (const scene of SCENES) {
    for (const set of layerSetsFor(scene, optionsFor(palette))) {
      const patches = set.paint(palette);
      const valueOf = (layer: string, property: string) =>
        patches.find(
          (patch) =>
            patch.layer === layer && patch.property === property,
        )?.value;
      for (const entry of set.layers) {
        if (entry.type !== 'symbol') continue;
        const layout = entry.layout as Record<string, unknown>;
        out.push({
          scene,
          layer: entry.id,
          font: layout['text-font'],
          size: layout['text-size'],
          ink: inkOf(valueOf(entry.id, 'text-color')),
          halo: inkOf(valueOf(entry.id, 'text-halo-color')),
          haloWidth: valueOf(entry.id, 'text-halo-width'),
        });
      }
    }
  }
  return out;
};

describe('every word the scene puts on the map', () => {
  it('is drawn by the scene and by nothing else', () => {
    const drawn = drawnText(PALETTES[0][1]);
    expect(new Set(drawn.map((one) => one.layer))).toEqual(
      new Set(LABEL_LAYERS),
    );
  });

  it.each(PALETTES)('%s: is set in the UI mono', (_id, palette) => {
    for (const text of drawnText(palette)) {
      expect(text.font, text.layer).toEqual([
        'Roboto Mono Light',
        'Arial Unicode MS Regular',
      ]);
      expect([MAP_TYPE_SIZE, MAP_TYPE_SIZE_QUIET]).toContain(
        text.size,
      );
    }
  });

  it.each(PALETTES)(
    '%s: is inked and haloed from the palette, never from a literal',
    (_id, palette) => {
      const inks = [palette.subInk, palette.mutedInk].map(inkOf);
      const halo = inkOf(haloColor(palette));
      for (const text of drawnText(palette)) {
        expect(inks, text.layer).toContainEqual(text.ink);
        expect(text.halo, text.layer).toEqual(halo);
        expect(text.haloWidth, text.layer).toBe(HALO_WIDTH);
      }
    },
  );

  /*
   * THE OWNER'S BUG, AS A PROPERTY RATHER THAN AS A COLOUR.
   *
   * "White labels on a light theme" is what was seen; what was wrong is
   * that the ink had drifted to the ground's own side of the scale. So
   * this asks the question that stays true when a palette changes: is
   * the ink far enough from the ground to be ink at all? A near-white
   * ink on paper measures about 1.1:1 here and fails, and so would a
   * near-black one on yellow.
   */
  it.each(PALETTES)(
    '%s: is never the ground wearing a different name',
    (_id, palette) => {
      for (const text of drawnText(palette)) {
        expect(
          contrastRatio(text.ink, palette.space),
          `${text.layer} is the ground`,
        ).toBeGreaterThanOrEqual(AA);
      }
    },
  );

  it.each(PALETTES)(
    '%s: clears AA against the basemap, by ink or by halo',
    (_id, palette) => {
      const ramp = basemapRamp(palette);
      for (const text of drawnText(palette)) {
        for (const ground of ramp) {
          const byInk = contrastRatio(text.ink, ground);
          if (byInk >= AA) continue;
          // Where the ink alone cannot, the halo is what the eye reads
          // next to the glyph -- so it has to clear AA against the ink
          // and stand clear of the ground it is sitting on.
          expect(
            contrastRatio(text.ink, text.halo),
            `${text.layer} on ${ground.join()}`,
          ).toBeGreaterThanOrEqual(AA);
          expect(
            contrastRatio(text.halo, ground),
            `${text.layer} halo on ${ground.join()}`,
          ).toBeGreaterThan(1.5);
        }
      }
    },
  );

  /*
   * And the ink does clear AA unaided somewhere on the ramp on every
   * theme, which is what stops the rule above from being satisfied by a
   * halo carrying type that is invisible everywhere.
   */
  it.each(PALETTES)(
    '%s: the ink alone clears AA against part of the ramp',
    (_id, palette) => {
      const ramp = basemapRamp(palette);
      for (const text of drawnText(palette)) {
        const best = Math.max(
          ...ramp.map((ground) => contrastRatio(text.ink, ground)),
        );
        expect(best, text.layer).toBeGreaterThanOrEqual(AA);
      }
    },
  );
});

/* ---- 3. the second source, and what it is allowed to cost ------------- */

describe('the place-name source', () => {
  const setFor = (scene: SceneId) =>
    layerSetsFor(scene, optionsFor(PALETTES[0][1])).find(
      (one) => one.id === BASEMAP_LABELS_SET,
    );

  it('is mounted only where a route can actually show a label', () => {
    expect(setFor('hello')).toBeUndefined();
    expect(setFor('notFound')).toBeUndefined();
    expect(setFor('projects')).toBeUndefined();
    expect(setFor('about')).toBeDefined();
    expect(setFor('projectDetail')).toBeDefined();
  });

  /*
   * One source, and the tileset Standard itself reads. The duplicate is
   * unavoidable -- an added layer resolves its source in the ROOT scope,
   * and Standard's copy lives inside the `basemap` fragment -- so what
   * is worth pinning is that there is exactly one of them and that every
   * layer on it carries a minzoom, which is what keeps the tiles
   * unrequested above the globe.
   */
  it('is one vector source, with a floor under every layer', () => {
    const set = setFor('about');
    expect(set?.sources).toEqual([
      {
        id: BASEMAP_LABELS_SET,
        spec: {
          type: 'vector',
          url: 'mapbox://mapbox.mapbox-streets-v8',
        },
      },
    ]);
    for (const entry of set?.layers ?? []) {
      expect(entry.source, entry.id).toBe(BASEMAP_LABELS_SET);
      expect(entry['source-layer'], entry.id).toBe('place_label');
      expect(
        typeof entry.minzoom === 'number' && entry.minzoom >= 8,
        entry.id,
      ).toBe(true);
    }
  });

  it('hides its type with the rest of the map type', () => {
    const hidden = layerSetsFor(
      'about',
      optionsFor(PALETTES[0][1], { labels: false }),
    ).find((one) => one.id === BASEMAP_LABELS_SET);
    const opacities = hidden
      ?.paint(PALETTES[0][1])
      .filter((patch) => patch.property === 'text-opacity')
      .map((patch) => patch.value);
    expect(opacities).toEqual([0, 0]);
  });
});
