/*
 * THE BASEMAP'S OWN COLOURS.
 *
 * WHAT THIS REPLACED, AND WHY IT HAD TO BE REPLACED
 *
 * The site used to theme Mapbox Standard with one global colour LUT --
 * a 3D lookup cube handed to setImportColorTheme('basemap', ...), which
 * re-tinted every basemap pixel through a deep -> land -> highlight tone
 * ramp with a fraction of the source's own chroma carried through.
 *
 * A grade can tint cartography. It cannot re-author it, and the reason
 * is structural rather than a matter of tuning: a LUT sees a PIXEL
 * VALUE, not a feature. It has no way to know that one beige is a park
 * and another is a car park, so it cannot say "a forest is this blue and
 * a lake is that blue" -- it can only move every colour together. The
 * chroma carry-through was what kept water blue and parks green inside
 * the theme's terrain, and it was also exactly why a blue theme drew its
 * forests as a blue-tinted GREEN instead of as a blue.
 *
 * WHAT STANDARD ACTUALLY OFFERS, MEASURED RATHER THAN ASSUMED
 *
 * Standard's config schema names each feature class as its own colour
 * key. That is not in mapbox-gl and not in this repository -- it is in
 * the style the API serves -- so it was read off the real style by
 * e2e/review/cartography.spec.ts, which is the one tier that loads
 * Standard with a real token. From that record, `getSchema('basemap')`:
 * 46 keys, of which 16 are colours, and `map.getStyle().imports[]`
 * walked for ["config", <key>] references gives what each one reaches:
 *
 *   colorGreenspace   9 layers   landcover, national-park, landuse, trees
 *                                ("forests, parks, and woods", per Mapbox)
 *   colorWater       10 layers   water, waterway, water-depth, ferries
 *   colorLand         8 layers   land, landcover, structures
 *   colorRoads       27 layers   the minor road network
 *   colorMotorways   20 layers   motorways and their bridges/tunnels
 *   colorTrunks      20 layers   trunk roads, ditto
 *   colorBuildings    4 layers   2D and 3D building fills
 *   colorAdminBoundaries 5       the boundary lines
 *   colorCommercial/Education/Industrial/Medical
 *                                the landuse sub-classes (and aeroway)
 *
 * THE ONE THING THE RECORD SAYS THAT DECIDED THE SHAPE OF THIS
 *
 * `useTheme` came back EMPTY. Standard marks no paint property
 * `-use-theme: "none"`, and mapbox-gl's `shouldIgnoreLut` only spares a
 * property that carries it -- so a config colour is NOT exempt from the
 * import's colour theme. Set colorGreenspace to a blue and a LUT still
 * grades it afterwards.
 *
 * So the two mechanisms do not compose into "exact colours plus a gentle
 * wash"; one of them has to be primary. The config keys are, and the LUT
 * is gone rather than turned down, because an identity cube is not free:
 * mapbox-gl reloads every visible tile when an import's colour theme
 * changes, BY DESIGN, and that reload was the whole cost of a theme
 * switch. setConfigProperty reloads nothing. The theme lens got cheaper
 * by deleting the expensive tier, not by debouncing it harder.
 *
 * WHAT IS LEFT UNTHEMED, SAID PLAINLY
 *
 * The colour keys do not reach every layer. At world zoom -- the globe,
 * which is the camera on three of the five routes -- the record says the
 * layers in range are land, landcover, water, water-depth, hillshade,
 * the four admin boundaries and the labels. The labels are off
 * (scene/theme.ts says why the site draws its own), and everything else
 * is named by a key above EXCEPT `hillshade`.
 *
 * Hillshade has no colour key. It is reached by the `theme` config, which
 * the record shows touching 100 layers, so it moves with `faded` /
 * `default` / `monochrome` and with the light preset -- but it is not a
 * colour this file can set, and it is the one surface on the globe still
 * wearing Mapbox's relief rather than the theme's. That is a known gap,
 * not an oversight, and e2e/review/cartography.spec.ts photographs it.
 */
import type {
  Palette,
  PaletteColors,
  Rgb,
} from 'styles/tokens/palette';

/**
 * Standard's colour keys, each one pointed at the palette token that
 * paints it.
 *
 * Written as key -> token rather than as a function per key so that the
 * mapping is data: test/scene-theme.test.ts walks it to assert every key
 * is painted from the token that owns it, and
 * e2e/hermetic/basemap-cartography.spec.ts walks the same table to know
 * which token to compare each key's read-back against. A test that
 * listed the pairs again would agree with a typo.
 *
 * TWO KEYS SHARE A TOKEN ON PURPOSE. Motorways and trunks are one
 * decision in this design -- the major road network reads as one weight
 * -- and the four landuse sub-classes are built ground, which is what
 * `building` is. Splitting either would mean tokens no theme has an
 * opinion about.
 *
 * THE LABEL COLOUR KEYS ARE DELIBERATELY ABSENT. Standard has
 * colorPlaceLabels, colorRoadLabels and colorPointOfInterestLabels, and
 * with the LUT gone they would now work -- that constraint was the LUT's,
 * not Standard's. They stay unset because the site turns Standard's text
 * off entirely and names places itself, in its own mono, from its own
 * layers at the root scope. See scene/layers/sets.ts.
 */
export const BASEMAP_COLORS = {
  colorLand: 'land',
  colorWater: 'water',
  colorGreenspace: 'green',
  colorBuildings: 'building',
  colorRoads: 'road',
  colorMotorways: 'roadMajor',
  colorTrunks: 'roadMajor',
  colorAdminBoundaries: 'boundary',
  colorCommercial: 'building',
  colorEducation: 'building',
  colorIndustrial: 'building',
  colorMedical: 'building',
} as const satisfies Record<string, keyof PaletteColors>;

export type BasemapColorKey = keyof typeof BASEMAP_COLORS;

export const BASEMAP_COLOR_KEYS = Object.keys(
  BASEMAP_COLORS,
) as BasemapColorKey[];

const rgb = (c: Rgb): string => `rgb(${c[0]}, ${c[1]}, ${c[2]})`;

/**
 * The colour every one of Standard's keys is set to, for this palette.
 *
 * Plain `rgb()` strings, because that is what setConfigProperty takes and
 * what the schema types as `color`. Nothing is shaded on the way out:
 * `sh()` exists to keep a tone ramp off the floor and there is no ramp
 * any more -- these ARE the colours, straight off the tokens a designer
 * set, which is the whole point of the change.
 */
export const basemapColors = (
  palette: Palette,
): Record<BasemapColorKey, string> =>
  Object.fromEntries(
    BASEMAP_COLOR_KEYS.map((key) => [
      key,
      rgb(palette[BASEMAP_COLORS[key]]),
    ]),
  ) as Record<BasemapColorKey, string>;

/**
 * Every surface the basemap can put UNDER a label, as colours.
 *
 * This is what `basemapRamp` used to be, and it is a better answer than
 * the ramp was. The ramp had to be three samples of a continuous tone
 * curve because the LUT's output was continuous and nothing knew which
 * fills a label would actually land on; these are the fills, exactly,
 * because the site chose them. test/map-text.test.ts measures map type
 * against all six.
 *
 * Boundaries are not here: a boundary is a hairline, not a ground.
 */
export const basemapSurfaces = (palette: Palette): Rgb[] => [
  palette.water,
  palette.green,
  palette.land,
  palette.building,
  palette.road,
  palette.roadMajor,
];
