import {
  type Anchor,
  type AnchorId,
  anchors,
  VAIL_VALLEY,
} from 'content/anchors';
import type { SceneId } from 'content/cameras';
import { historyStops } from 'content/history';
import { projectsList } from 'content/projects';
import {
  lineString,
  type Point,
  pointCollection,
} from 'scene/layers/geo';
import type {
  LayerSet,
  PaintPatch,
  SceneListener,
} from 'scene/layers/types';
import type { Palette } from 'styles/tokens/palette';

/*
 * The MID band of the layer stack: our own data drawn on top of the
 * themed basemap.
 *
 *   hello / 404   nothing. See below.
 *   projects      the clustered project sites, with the three Colorado
 *                 anchors collapsed into VAIL VALLEY at world zoom.
 *   about         the six work-history stops, their chronological line and
 *                 the ring on the live one.
 *   detail        nothing. Artboard 1d is terrain and the shader plane
 *                 and the map is held, so it carries no data of its own.
 *
 * EVERY WORD ON THE MAP IS THE SITE'S OWN DATA, and that is now the whole
 * of it. The two routes above z8 used to also redraw the basemap's place
 * names from mapbox-streets-v8, because Standard's own labels are off and
 * could not have been themed if they were on; the site does not want
 * those names at all, so the set and its second vector source are gone.
 * The note above BUILDERS has what went with them, and scene/theme.ts's
 * basemapConfig still keeps all four of Standard's label toggles off.
 *
 * HELLO AND THE 404 USED TO CARRY A MID BAND AND DO NOT ANY MORE.
 * The prototype's layer-stack note sketched one -- "mid: great-circle
 * work path Albany->Portland, yellow 60% 1px + travelling dash" -- and
 * the scene built it out: the arc, a dash walking along it, a dot on each
 * of the eight anchor cities and a glow on Portland. It was an EXAMPLE of
 * what a mid band could hold, not a claim the site makes -- nothing on
 * the site is about a journey from Albany, and the cities that ARE
 * content are drawn by `projectSitesSet` and `historySet`, collapsed and
 * counted and labelled, which is a different picture entirely. The two
 * routes it was mounted on are exactly the two with no data of their
 * own, so they now mount no sets at all and the globe is just the globe.
 * e2e/hermetic/globe-clean.spec.ts reads that back off the real map.
 *
 * Going with it: the travelling dash, which was the only dash layer in
 * the app, so the whole mechanism went too -- the rAF loop's dash branch
 * in scene/mapbox/instance.ts, `dashRuns` in scene/camera.ts, and
 * `greatCircle` in ./geo.ts, which nothing else sampled.
 *
 * Every colour comes out of `paint(palette)` -- theming tier 3 -- and a
 * set's layers declare no paint of their own: `layerSetsFor` at the foot
 * of this file builds each layer's initial paint from the same patch list
 * repaint re-applies. So a colour is written once and cannot drift between
 * "what the layer was added with" and "what a repaint sets it to", and the
 * `-use-theme` that keeps the ROOT style's colour theme off our own
 * colours is derived at that one seam rather than remembered per patch.
 */

export const PROJECT_SITES_SET = 'project-sites';
export const HISTORY_SET = 'history-stops';
export const SITE_POINTS = 'project-site-points';
export const SITE_LABELS = 'project-site-labels';
export const SITE_COUNTS = 'project-site-counts';

export const HISTORY_LINE = 'history-path-line';
export const HISTORY_POINTS = 'history-stop-points';
export const HISTORY_RING = 'history-stop-ring';
export const HISTORY_LABELS = 'history-stop-labels';

/*
 * THE MAP'S TYPE, IN ONE PLACE.
 *
 * Every word on the map is set in this: the site's own mono at 11px,
 * tracked out, uppercase, over a halo of the ground. It used to be the
 * scene's own labels only -- the basemap's place and road names were
 * Standard's, in Standard's font, at a colour no call in this codebase
 * can reach (scene/theme.ts's basemapConfig has the whole of why). Those
 * are off now, and everything below draws through `mapType` instead, so
 * "the map is set in the UI's mono" is one definition rather than a
 * habit that three call sites happen to share.
 */

/** Mapbox-hosted mono, with the catalogue's universal fallback. */
const MONO_FONT = ['Roboto Mono Light', 'Arial Unicode MS Regular'];

/** The one size map type is set at. */
export const MAP_TYPE_SIZE = 11;

/** Wide enough to read as a caption rather than as a word. */
const TRACKING = 0.14;

/** One pixel of ground around a glyph is what terrain needs. */
export const HALO_WIDTH = 1;

/** The shared layout half of a map label. */
const mapType = (
  size: number = MAP_TYPE_SIZE,
): Record<string, unknown> => ({
  'text-font': MONO_FONT,
  'text-size': size,
  'text-letter-spacing': TRACKING,
});

/** Every colour on the scene passes through sh() before it is drawn. */
const shaded = (
  palette: Palette,
  rgb: readonly number[],
  k: number,
) =>
  `rgb(${palette.sh(rgb[0], 0, k)}, ${palette.sh(
    rgb[1],
    1,
    k,
  )}, ${palette.sh(rgb[2], 2, k)})`;

/*
 * THE HALO BEHIND MAP TYPE: THE GROUND, PUSHED BACK A LITTLE.
 *
 * Measured against the six surfaces the basemap can actually put under a
 * label (styles/tokens/cartography.ts's basemapSurfaces), this does two
 * different jobs on the two kinds of theme, and it is worth saying which.
 * Numbers are the shipped palettes, ink = --text-secondary:
 *
 *   dark themes  the ink is light and this is near-black. The ink alone
 *                carries water (6.7-7.3:1), greenspace (5.5-5.6) and
 *                land (4.7-4.8) -- all over AA -- and loses the built
 *                surfaces: buildings 3.3, roads 2.1, motorways 1.35.
 *                There the halo is what the eye reads, at 10.4-11.4:1
 *                from the ink and 3.2 / 5.1 / 7.9 from those three.
 *   light themes the ink is dark and the halo is the near-white ground,
 *                so they swap roles. The ink carries land, buildings,
 *                roads and greenspace unaided (5.3-7.3:1) and loses the
 *                two strongest tones: water at 3.6 and motorways at 4.2.
 *                The halo carries those, at 6.7-7.2:1 from the ink and
 *                1.9 / 1.6 from them.
 *
 * THE TIGHT ONE IS A LIGHT THEME'S MOTORWAY, at halo 1.60:1 on paper and
 * 1.69 on chalk against a bar of 1.5. It is the number to watch if
 * --map-road-major is ever darkened on a light theme; test/map-text.test.ts
 * is what will say so.
 *
 * The halo is left at the ground on both rather than lifted on light
 * themes because there is nowhere to lift it to: paper's --map-land is
 * rgb(246, 241, 233), so a brighter halo is barely a halo. sh() is also
 * a no-op at k >= 1 on a light theme, by design.
 */
export const haloColor = (palette: Palette): string =>
  shaded(palette, palette.space, 0.72);

const paintOf = (
  id: string,
  patches: PaintPatch[],
): Record<string, unknown> =>
  Object.fromEntries(
    patches
      .filter((patch) => patch.layer === id)
      .map((patch) => [patch.property, patch.value]),
  );

/* ---- the colour theme must not touch OUR colours ----------------------
 *
 * THE SAME BUG THE FOG HAD, ON EVERY LAYER IN THIS FILE.
 *
 * mapbox-gl re-tints a layer's colour paint properties through
 * `style.getLut(layer.scope)`. Our layers are added to the ROOT style, so
 * their scope is the root's, and `Style._reloadColorTheme` sets
 * `layer.lut = this._styleColorTheme.lut` for every layer it owns --
 * which is every layer this file declares. The root's colour theme is
 * whatever the ROOT STYLESHEET carries: the site's own theming has never
 * set one, and does not set any colour theme at all now that the
 * cartography is config (styles/tokens/cartography.ts).
 *
 * The hermetic stub's root style carried no `color-theme`, so `getLut('')`
 * was null there and every colour below arrived as itself. This was
 * written believing MAPBOX STANDARD'S ROOT CARRIES ONE, reasoned from the
 * fog's behaviour on the first real preview and reproduced offline by
 * putting a root `color-theme` on the stub -- and that is the premise the
 * review tier has since measured, and contradicted: the CARTO `reach`
 * record reads `root: {declared: false, lut: false, fragmentLut: true}`.
 * Standard's root carries no colour theme.
 *
 * SO THE SENTINELS ARE GUARDING A CASE PRODUCTION DOES NOT PRESENT, and
 * they stay anyway. They are free -- one derived key per colour patch, at
 * addLayer -- they are correct either way, and the thing they guard
 * against is one stylesheet change away at any time. What that means for
 * a reader is only this: a failure of the guard in
 * e2e/hermetic/layer-lut.spec.ts, which runs against
 * `stubMapboxNetwork(context, { rootColorTheme: true })`, is a statement
 * about the stub rather than about the deployed site. The measured
 * numbers below were taken on that stub and are still exactly what a root
 * colour theme would do.
 *
 * MEASURED on that stub, against the real library, at the yellow theme --
 * the drawn pixel of our own layers, without the sentinel and with it:
 *
 *   project-site-points   circle-color         rgb( 69, 56, 13) -> rgb(170, 152, 31)
 *   history-stop-points   circle-color         rgb( 63, 51, 13) -> rgb(166, 148, 31)
 *   history-stop-ring     circle-stroke-color  rgb( 60, 49, 15) -> rgb(148, 133, 31)
 *   history-path-line     line-color           rgb( 48, 31, 17) -> rgb(141,  83, 36)
 *
 * and, computed through the same cube because a hermetic run has no glyphs
 * to photograph, the type: `palette.subInk` rgb(193, 193, 193) comes back
 * rgb(56, 48, 41), and on `paper` the labels INVERT -- an ink of
 * rgb(84, 79, 70) comes back rgb(223, 202, 174) on a ground of
 * rgb(237, 233, 225).
 *
 * The fix is the fog's, for the fog's reason: THE LUT EXISTS TO MAP
 * MAPBOX'S COLOURS INTO THIS PALETTE, AND EVERY COLOUR BELOW IS ALREADY IN
 * IT -- each one is read straight off the theme's own tokens through
 * `palette`. Sending them through the cube applies the palette twice.
 * `<property>-use-theme: 'none'` is mapbox's own opt-out, and
 * `shouldIgnoreLut` takes exactly the string `none`.
 *
 * A RULE, NOT A LIST OF KEYS. The obvious repair is to write the sentinel
 * beside each of the colour patches below, and it is the wrong one: the
 * next one is a layer nobody has added yet, and this branch has been
 * bitten more than once by a hand-kept list a later lane did not know to
 * widen. So the sentinel is DERIVED from the patch, at the one seam every
 * set leaves this module through.
 *
 * WHAT IS RECOGNISED, and why it is the VALUE rather than the property
 * name. Mapbox's own naming very nearly works -- 27 of the 30 colour-typed
 * paint properties in the 3.30 spec end in `-color` -- but `line-gradient`,
 * `line-border-gradient` and `sky-gradient` are colours that do not, and
 * `fill-extrusion-vertical-gradient` is a BOOLEAN that does, so a name
 * test is either three properties short or one property wrong. A value
 * test is neither: a CSS colour is only ever a legal value for a
 * colour-typed property, and every colour-typed property in the spec has a
 * `-use-theme` sibling -- all 30 checked against mapbox-gl 3.30's own
 * property tables -- so a sentinel derived this way always names a real
 * property. `circle-radius`, `text-opacity` and the `['case', ['==',
 * ['get', 'anchor'], 'portland'], ...]` selectors are numbers and ids, and
 * none of them is a colour.
 */

/**
 * A CSS colour as anything in this file can produce one: `rgb()`/`rgba()`
 * out of `palette`, or a hex token read straight off the stylesheet.
 */
const COLOR_VALUE = /^(#[0-9a-f]{3,8}|rgba?\(|hsla?\()/i;

/**
 * Whether a paint value paints a colour -- directly, or anywhere inside an
 * expression, because a colour this file sets is as often a `['case', ...]`
 * over two palette tokens as it is one string.
 */
export const paintsAColor = (value: unknown): boolean =>
  typeof value === 'string'
    ? COLOR_VALUE.test(value.trim())
    : Array.isArray(value) && value.some(paintsAColor);

/** mapbox's opt-out, as `shouldIgnoreLut` tests for it. */
const NO_THEME = 'none';

/**
 * The patch list a set is actually mounted and repainted with: every
 * colour patch followed by the `-use-theme` that keeps the root style's
 * colour theme off it.
 *
 * Exported for test/scene-layers.test.ts, which walks every set, state and
 * palette and asserts that nothing colour-shaped reaches mapbox without its
 * sentinel -- so a layer added later is covered by the rule and by the
 * guard, rather than by anyone remembering either.
 */
export const keepOurColors = (patches: PaintPatch[]): PaintPatch[] =>
  patches.flatMap((patch) =>
    paintsAColor(patch.value)
      ? [
          patch,
          {
            layer: patch.layer,
            property: `${patch.property}-use-theme`,
            value: NO_THEME,
          },
        ]
      : [patch],
  );

export type SceneEvent = {
  features?: { properties?: Record<string, unknown> }[];
};

/** content/anchors has no guard, and tile properties are not typed. */
const isAnchorId = (value: unknown): value is AnchorId =>
  typeof value === 'string' && value in anchors;

/**
 * The anchor a map event landed on, or null. Mapbox hands back whatever
 * the tile carried, so the id is validated rather than trusted.
 */
export const anchorFromEvent = (event: unknown): AnchorId | null => {
  const feature = (event as SceneEvent)?.features?.[0];
  const id = feature?.properties?.anchor;
  return isAnchorId(id) ? id : null;
};

/**
 * The history stop a map event landed on, or null.
 *
 * Validated the same way and for the same reason as the anchor above:
 * these come back off a tile as whatever was put in the source, and a
 * stop id that arrived as the string `"4"` would select nothing and say
 * nothing about why.
 */
export const stopFromEvent = (event: unknown): number | null => {
  const feature = (event as SceneEvent)?.features?.[0];
  const id = feature?.properties?.id;
  return typeof id === 'number' && Number.isFinite(id) ? id : null;
};

/* ---- the project sites ----------------------------------------------- */

/** The three Colorado anchors read as one point at world zoom (6.7). */
const COLLAPSED: Partial<Record<AnchorId, Anchor>> = {
  vail: VAIL_VALLEY,
  beaverCreek: VAIL_VALLEY,
  wolcott: VAIL_VALLEY,
};

/**
 * The id of the map feature an anchor is drawn as.
 *
 * Collapsing means a project's anchor and the point that represents it
 * are not always the same thing: gopro is in `vail` and 970's winter map
 * is in `wolcott`, but both are drawn as the one VAIL VALLEY point,
 * whose id is `beaverCreek`. Comparing a hovered project's own anchor
 * against `['get', 'anchor']` therefore matched nothing for two of the
 * table's rows -- no point lit, no halo -- while the camera still
 * nudged toward the city, so the globe drifted with nothing lit.
 *
 * Anything that has to line a project up with its point goes through
 * here. The reverse direction never needed it: a click reads the id off
 * the tile, which is already a site id.
 */
export const siteIdFor = (anchor: AnchorId): AnchorId =>
  (COLLAPSED[anchor] ?? anchors[anchor]).id;

export type Site = {
  anchor: AnchorId;
  name: string;
  center: Point;
  count: number;
};

/**
 * Project counts per site, derived from content rather than transcribed:
 * the design's table (Portland 6, San Francisco 3, Vail Valley 3,
 * Cambridge 1, New York 1) is what this produces, and a test asserts it
 * still does.
 */
export const projectSites = (): Site[] => {
  const byAnchor = new Map<AnchorId, Site>();
  for (const project of projectsList) {
    const site = COLLAPSED[project.anchor] ?? anchors[project.anchor];
    const existing = byAnchor.get(site.id);
    if (existing) {
      existing.count += 1;
    } else {
      byAnchor.set(site.id, {
        anchor: site.id,
        name: site.name,
        center: [...site.center] as Point,
        count: 1,
      });
    }
  }
  return [...byAnchor.values()];
};

const countLabel = (count: number): string =>
  count === 1 ? '1 project' : `${count} projects`;

/* ---- the sets -------------------------------------------------------- */

export type LayerSetOptions = {
  palette: Palette;
  /** The anchor a hovered project row is lighting, if any. */
  hover: AnchorId | null;
  /** False below the tablet breakpoint (1g), and on /projects (1c). */
  labels: boolean;
  /**
   * The history stop drawn live, by id. Artboard 1e's yellow budget
   * allows one live element per view, and on /about it is the SELECTED
   * stop -- what the sheet and the scrubber are showing -- not the
   * current job.
   */
  selectedStop: number | null;
  /** Called with the anchor under the pointer, or null on leave. */
  onHoverAnchor: (anchor: AnchorId | null) => void;
  /** Called when a site point is clicked. */
  onSelectAnchor: (anchor: AnchorId) => void;
  /**
   * Called when a work-history stop is clicked, with its id.
   *
   * On /about this is the whole of the route's input: the simplified 1e
   * draws no scrubber and no pager, so the map IS the control and this is
   * the wire it runs on. It asks rather than sets -- the selected stop is
   * a URL -- which is scene/MapProvider's `requestStop`.
   */
  onSelectStop: (id: number) => void;
};

const projectSitesSet = (options: LayerSetOptions): LayerSet => {
  const { hover, labels, onHoverAnchor, onSelectAnchor } = options;
  // The site the hovered project is drawn as, which is not always the
  // anchor it declares.
  const lit = hover === null ? '' : siteIdFor(hover);

  const paint = (palette: Palette): PaintPatch[] => [
    {
      layer: SITE_POINTS,
      property: 'circle-radius',
      value: ['min', 7, ['+', 2.6, ['*', ['get', 'count'], 0.7]]],
    },
    {
      layer: SITE_POINTS,
      property: 'circle-color',
      value: [
        'case',
        ['==', ['get', 'anchor'], lit],
        palette.a(1),
        palette.a(0.6),
      ],
    },
    {
      layer: SITE_POINTS,
      property: 'circle-stroke-color',
      value: palette.a(0.35),
    },
    {
      layer: SITE_POINTS,
      property: 'circle-stroke-width',
      value: ['case', ['==', ['get', 'anchor'], lit], 8, 0],
    },
    {
      layer: SITE_LABELS,
      property: 'text-color',
      value: palette.subInk,
    },
    {
      layer: SITE_LABELS,
      property: 'text-opacity',
      value: labels ? 1 : 0,
    },
    {
      layer: SITE_LABELS,
      property: 'text-halo-color',
      value: haloColor(palette),
    },
    {
      layer: SITE_LABELS,
      property: 'text-halo-width',
      value: HALO_WIDTH,
    },
    {
      layer: SITE_COUNTS,
      property: 'text-color',
      value: palette.mutedInk,
    },
    {
      layer: SITE_COUNTS,
      property: 'text-opacity',
      value: labels ? 1 : 0,
    },
    {
      layer: SITE_COUNTS,
      property: 'text-halo-color',
      value: haloColor(palette),
    },
    {
      layer: SITE_COUNTS,
      property: 'text-halo-width',
      value: HALO_WIDTH,
    },
  ];

  const text = (offsetY: number) => ({
    ...mapType(),
    'text-field': ['get', 'label'],
    'text-anchor': 'left',
    'text-offset': [1.1, offsetY],
  });

  return {
    id: PROJECT_SITES_SET,
    sources: [
      {
        id: PROJECT_SITES_SET,
        spec: {
          type: 'geojson',
          data: pointCollection(
            projectSites().map((site) => ({
              center: site.center,
              properties: {
                anchor: site.anchor,
                count: site.count,
                label: site.name.toUpperCase(),
              },
            })),
          ),
        },
      },
      {
        id: SITE_COUNTS,
        spec: {
          type: 'geojson',
          data: pointCollection(
            projectSites().map((site) => ({
              center: site.center,
              properties: {
                anchor: site.anchor,
                label: countLabel(site.count),
              },
            })),
          ),
        },
      },
    ],
    layers: [
      {
        id: SITE_POINTS,
        type: 'circle',
        source: PROJECT_SITES_SET,
      },
      {
        id: SITE_LABELS,
        type: 'symbol',
        source: PROJECT_SITES_SET,
        layout: text(-0.6),
      },
      {
        id: SITE_COUNTS,
        type: 'symbol',
        source: SITE_COUNTS,
        layout: text(0.8),
      },
    ],
    interactions: [
      {
        type: 'mousemove',
        layer: SITE_POINTS,
        handler: ((event: unknown) => {
          onHoverAnchor(anchorFromEvent(event));
        }) as SceneListener,
      },
      {
        type: 'mouseleave',
        layer: SITE_POINTS,
        handler: (() => {
          onHoverAnchor(null);
        }) as SceneListener,
      },
      {
        type: 'click',
        layer: SITE_POINTS,
        handler: ((event: unknown) => {
          const anchor = anchorFromEvent(event);
          if (anchor) onSelectAnchor(anchor);
        }) as SceneListener,
      },
    ],
    paint,
  };
};

const historySet = (options: LayerSetOptions): LayerSet => {
  const { labels, selectedStop, onSelectStop } = options;
  /*
   * A stop id is never -1, so a null selection matches nothing and the
   * route simply has no live element until it names one.
   *
   * This is a PAINT expression and not a layer `filter`, which is the
   * whole bug it replaces. A filter is read once, at addLayer time inside
   * mount(), and sync() skips a set whose id is already mounted -- so the
   * ring stayed on whichever stop happened to be selected when the route
   * was first entered, while the point beside it moved correctly because
   * colour and radius are paint patches and repaint re-applies them.
   *
   * Hiding a feature by collapsing its radius and stroke to zero costs
   * nothing and keeps one rule for the whole layer model: structure is
   * declared once in `layers`, and everything that varies with route
   * state is a paint patch. The alternative -- re-applying filters from
   * the registry -- makes the static half dynamic too, and leaves two
   * mechanisms to remember instead of one.
   */
  const live = ['==', ['get', 'id'], selectedStop ?? -1];

  const paint = (palette: Palette): PaintPatch[] => [
    {
      layer: HISTORY_LINE,
      property: 'line-color',
      value: palette.b(0.6),
    },
    { layer: HISTORY_LINE, property: 'line-width', value: 1 },
    {
      layer: HISTORY_POINTS,
      property: 'circle-radius',
      value: ['case', live, 4.5, 3],
    },
    {
      layer: HISTORY_POINTS,
      property: 'circle-color',
      value: ['case', live, palette.a(1), palette.a(0.6)],
    },
    {
      layer: HISTORY_RING,
      property: 'circle-radius',
      value: ['case', live, 11, 0],
    },
    { layer: HISTORY_RING, property: 'circle-opacity', value: 0 },
    {
      layer: HISTORY_RING,
      property: 'circle-stroke-color',
      value: palette.a(0.6),
    },
    {
      layer: HISTORY_RING,
      property: 'circle-stroke-width',
      value: ['case', live, 1, 0],
    },
    {
      layer: HISTORY_LABELS,
      property: 'text-color',
      value: palette.subInk,
    },
    {
      layer: HISTORY_LABELS,
      property: 'text-opacity',
      value: labels ? 1 : 0,
    },
    {
      layer: HISTORY_LABELS,
      property: 'text-halo-color',
      value: haloColor(palette),
    },
    {
      layer: HISTORY_LABELS,
      property: 'text-halo-width',
      value: HALO_WIDTH,
    },
  ];

  return {
    id: HISTORY_SET,
    sources: [
      {
        id: HISTORY_LINE,
        spec: {
          type: 'geojson',
          data: lineString(
            historyStops.map(
              (stop) => [...stop.coordinates] as Point,
            ),
          ),
        },
      },
      {
        id: HISTORY_SET,
        spec: {
          type: 'geojson',
          data: pointCollection(
            historyStops.map((stop) => ({
              center: [...stop.coordinates] as Point,
              properties: {
                id: stop.id,
                company: stop.company.toUpperCase(),
              },
            })),
          ),
        },
      },
    ],
    layers: [
      { id: HISTORY_LINE, type: 'line', source: HISTORY_LINE },
      {
        id: HISTORY_POINTS,
        type: 'circle',
        source: HISTORY_SET,
      },
      { id: HISTORY_RING, type: 'circle', source: HISTORY_SET },
      {
        id: HISTORY_LABELS,
        type: 'symbol',
        source: HISTORY_SET,
        layout: {
          ...mapType(),
          'text-field': ['get', 'company'],
          'text-anchor': 'left',
          'text-offset': [1.5, 0.3],
        },
      },
    ],
    /*
     * THE MAP IS THE ROUTE'S CONTROL, which it was not before: the
     * scrubber and the pager used to carry the selection and this set
     * listened for nothing. The simplified 1e has neither, so a click on
     * a stop is the only pointing device the route has left.
     *
     * Both the point and its label are bound. A 3px circle is a small
     * target and the company name beside it reads as part of the same
     * thing, so a click that lands on the words selects the stop rather
     * than falling through to the map and panning it.
     *
     * The ring, deliberately, is not: it is drawn only on the stop that
     * is ALREADY selected, so binding it would add a target that can only
     * ever re-select what is live -- and it is 11px, so it would sit over
     * its own point and swallow the one click that matters.
     */
    interactions: [
      {
        type: 'click',
        layer: HISTORY_POINTS,
        handler: ((event: unknown) => {
          const id = stopFromEvent(event);
          if (id !== null) onSelectStop(id);
        }) as SceneListener,
      },
      {
        type: 'click',
        layer: HISTORY_LABELS,
        handler: ((event: unknown) => {
          const id = stopFromEvent(event);
          if (id !== null) onSelectStop(id);
        }) as SceneListener,
      },
    ],
    paint,
  };
};

/*
 * THE SITE USED TO NAME THE WORLD HERE, AND DOES NOT ANY MORE.
 *
 * `basemapLabelsSet` drew the same place names Standard draws, from the
 * same tileset, at the ROOT scope -- because Standard's own labels are
 * off and, at the time, could not have been themed if they were on. Two
 * symbol layers on a second `mapbox://mapbox.mapbox-streets-v8` source:
 * settlements from z8 and their subdivisions from z10.
 *
 * They are gone because the site does not want them, not because they
 * stopped working. What is left on the map is the site's OWN data --
 * project sites, work-history stops -- which still carries its names.
 *
 * WHAT WENT WITH THEM. The second vector source, which was the only
 * thing on the page fetching mapbox-streets-v8 tiles a second time; the
 * `symbol-z-elevate` and collision tuning that existed to keep a
 * tile-placed name off a ridge; and MAP_TYPE_SIZE_QUIET, which was the
 * one step down that only the subdivision names used. A project detail
 * mounts no layer sets at all now, like the two globe routes.
 *
 * Standard's own label toggles stay off, all four of them, at every zoom
 * -- scene/theme.ts's basemapConfig. Removing the redraw is not a reason
 * to turn the originals back on; it is the same decision, made once more.
 */

const BUILDERS: Record<
  SceneId,
  ((options: LayerSetOptions) => LayerSet)[]
> = {
  hello: [],
  notFound: [],
  projects: [projectSitesSet],
  about: [historySet],
  projectDetail: [],
};

/*
 * THE ONE SEAM EVERY SET LEAVES THIS MODULE THROUGH.
 *
 * A builder above declares two things and never the same thing twice: the
 * STRUCTURE of its layers, and a `paint` function from the palette. This
 * is where the two are joined, and it is the only place they are joined --
 * the initial paint mount() hands to addLayer, and the patch list
 * repaint() hands to setPaintProperty, are the same sealed array, so a
 * colour cannot reach the map by one route wearing its `-use-theme` and by
 * the other without it.
 *
 * That single join is the whole reason `keepOurColors` is applied here
 * rather than beside each patch. The rule is written once; a set added to
 * BUILDERS, a layer added to a set, or a colour added to a `paint`
 * function is covered by it without anyone being told it exists.
 *
 * (`paint` is re-sealed rather than sealed once because the registry calls
 * it again on every theme, hover and selection change, with a palette this
 * function has never seen.)
 */
const withOwnColors = (set: LayerSet, palette: Palette): LayerSet => {
  const paint = (live: Palette): PaintPatch[] =>
    keepOurColors(set.paint(live));
  const patches = paint(palette);
  return {
    ...set,
    paint,
    layers: set.layers.map((entry) => ({
      ...entry,
      paint: paintOf(entry.id, patches),
    })),
  };
};

/** The sets a route wants mounted, in draw order. */
export const layerSetsFor = (
  sceneId: SceneId,
  options: LayerSetOptions,
): LayerSet[] =>
  BUILDERS[sceneId].map((build) =>
    withOwnColors(build(options), options.palette),
  );
