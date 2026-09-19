import { describe, expect, it } from 'vitest';
import type { SceneId } from 'content/cameras';
import {
  haloColor,
  HALO_WIDTH,
  layerSetsFor,
  type LayerSetOptions,
  MAP_TYPE_SIZE,
} from 'scene/layers/sets';
import { basemapConfig } from 'scene/theme';
import { THEME_IDS, type ThemeId } from 'styles/theme-bootstrap';
import { basemapSurfaces } from 'styles/tokens/cartography';
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
 * and terrain -- so nothing in the token layer had ever measured the
 * background map type is actually drawn on, and the first time anybody
 * did was when the owner reported "a TON of text coming through as just
 * white".
 *
 * This file is that measurement, and it got easier to make. The surfaces
 * under a label used to be the OUTPUT of a colour LUT -- a continuous
 * tone curve nobody could read back to a feature, sampled at three
 * anchors and hoped to be representative. They are tokens now: Mapbox
 * Standard names each feature class as a config key, so the six colours
 * the basemap can put under a glyph are exactly the six a designer set
 * in themes.css. styles/tokens/cartography.ts's `basemapSurfaces` is
 * that list, and this measures against all of it rather than a sample.
 *
 * Asked of all eight themes, against the palettes themes.css actually
 * ships rather than against a fixture.
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

/* ---- 1. the surfaces, and why Standard is never asked for text -------- */

/*
 * THIS SECTION USED TO BE A SWEEP OF 4,913 SOURCE COLOURS.
 *
 * The claim it proved was that no colour Mapbox could pick for a label
 * would ever be legible, because the import's colour LUT was applied to
 * a symbol layer's TEXT exactly as to a fill -- SymbolBucket.createArrays
 * hands the bucket's lut to the text binder -- and that LUT was a tone
 * compressor whose whole output span was about 1.4:1 on a light theme.
 * Both ends of Standard's range arrived at the same illegible place and
 * no lightPreset moved them.
 *
 * THE LUT IS GONE, SO THE CLAIM IS GONE WITH IT. There is no compressor
 * any more; Standard's colorPlaceLabels and colorRoadLabels would now do
 * exactly what they say. Keeping the sweep would be asserting something
 * that is no longer true about code that no longer exists.
 *
 * What survives is the CONSEQUENCE, which was always the point: the site
 * does not ask Standard for text. That is a design decision now rather
 * than a workaround -- the scene names places in its own mono, at its own
 * sizes, and two typefaces naming the same places would be worse than
 * either alone -- and it is worth pinning precisely because the reason
 * changed underneath it.
 */

describe('Standard is never asked for text', () => {
  it.each(PALETTES)('%s never asks Standard for text', (_id, p) => {
    for (const fog of ['space', 'dusk', 'night'] as const) {
      const config = basemapConfig(fog, p);
      expect(config.showPlaceLabels).toBe(false);
      expect(config.showRoadLabels).toBe(false);
      expect(config.showPointOfInterestLabels).toBe(false);
      expect(config.showTransitLabels).toBe(false);
    }
  });

  /*
   * The control, and the reason the measurements below are not vacuous:
   * the ink the scene draws with clears AA against the brightest ground
   * the basemap can put under it on a light theme, unaided.
   */
  it.each(LIGHT_THEMES)('the scene ink clears AA on %s', (id) => {
    const palette = paletteFor(id);
    expect(
      contrastRatio(inkOf(palette.subInk), palette.land),
    ).toBeGreaterThanOrEqual(AA);
  });
});

/* ---- 2. the ink the scene draws map type in --------------------------- */

/*
 * The six surfaces the basemap can put under a glyph -- water,
 * greenspace, land, buildings, minor roads, major roads -- are the full
 * range of ground a label can land on, and map type is measured against
 * every one of them.
 *
 * Read the shape of it honestly, because it has not changed even though
 * the surfaces have. On a LIGHT theme the ink clears AA against every
 * surface unaided, and the halo does nothing because the ground and the
 * themed land are within about 1.05:1. On a DARK theme the ink clears AA
 * comfortably against water and greenspace, and falls under it against
 * the land and the roads -- the map's ground is far brighter than the
 * page's, which is exactly the gap this file exists to name -- and it is
 * the halo, at 10-11:1 from the ink, that separates a glyph from those.
 *
 * So the bar below is stated in the two parts that are actually true,
 * rather than as one number that would have to be fudged: the ink clears
 * AA somewhere on the map on every theme, and wherever it does not, the
 * halo clears AA against the ink AND stands clear of the surface.
 *
 * THE LADDER IS NOW A DESIGN INPUT RATHER THAN AN OUTPUT, which is worth
 * saying because it changes what to do when this fails. A LUT produced
 * its surfaces from Mapbox's, so a contrast failure could only be fixed
 * by retuning the whole grade; these are six literals in themes.css, so
 * a failure names the surface and the fix is that one token. The tones
 * were picked against this contract in the first place -- see the note
 * on the cartography block in themes.css.
 *
 * A --map-ink token, lifted on dark themes so the ink clears AA against
 * the land unaided, is the obvious next step and is deliberately NOT
 * taken here: it is a ladder that has to be derived for all eight themes
 * against a background the design bundle never considered, which is a
 * design decision rather than a bug fix. yellow's --text-body already
 * measures 5.20:1 against its land, so the step exists if it is wanted.
 */

/*
 * Every word the scene draws, and it is all the site's own data now. The
 * two `basemap-*-labels` entries were the place names redrawn from
 * mapbox-streets-v8; that set is gone, so nothing on the map names
 * anything except the projects and the work-history stops.
 */
const LABEL_LAYERS = [
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
      expect(text.size).toBe(MAP_TYPE_SIZE);
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
      const ramp = basemapSurfaces(palette);
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
    '%s: the ink alone clears AA against part of the map',
    (_id, palette) => {
      const ramp = basemapSurfaces(palette);
      for (const text of drawnText(palette)) {
        const best = Math.max(
          ...ramp.map((ground) => contrastRatio(text.ink, ground)),
        );
        expect(best, text.layer).toBeGreaterThanOrEqual(AA);
      }
    },
  );
});

/* ---- 3. the second source, and the fact that there is not one --------- */

/*
 * THIS SECTION USED TO METER A SECOND VECTOR SOURCE.
 *
 * `basemapLabelsSet` drew the basemap's place names itself, from the same
 * `mapbox://mapbox.mapbox-streets-v8` Standard reads -- a second copy,
 * because Standard's own lives inside the `basemap` fragment and a root
 * layer cannot name it. What this section pinned was the cost: exactly
 * one source, and a minzoom under every layer on it, so the globe routes
 * fetched nothing.
 *
 * The site does not want those names, so the set is gone and so is the
 * source. The claim left is the stronger and simpler one -- the scene
 * adds NO vector source at all, on any route -- and it belongs with the
 * layer sets rather than here.
 */

describe('the scene adds no tile source of its own', () => {
  it.each(SCENES)(
    '%s carries only GeoJSON it built itself',
    (scene) => {
      for (const set of layerSetsFor(
        scene,
        optionsFor(PALETTES[0][1]),
      )) {
        for (const source of set.sources ?? []) {
          expect(
            (source.spec as { type?: string }).type,
            `${scene}/${source.id} is not GeoJSON`,
          ).toBe('geojson');
        }
      }
    },
  );
});
