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
  LayerEntry,
  LayerSet,
  PaintPatch,
  SceneListener,
} from 'scene/layers/types';
import { LABEL_MIN_ZOOM, LOCALITY_MIN_ZOOM } from 'scene/theme';
import type { Palette } from 'styles/tokens/palette';

/*
 * The MID band of the layer stack: our own data drawn on top of the
 * themed basemap.
 *
 *   hello / 404   nothing. See below.
 *   projects      the clustered project sites, with the three Colorado
 *                 anchors collapsed into VAIL VALLEY at world zoom.
 *   about         the six work-history stops, their chronological line and
 *                 the ring on the live one, over the place names.
 *   detail        the place names. Artboard 1d is terrain and the shader
 *                 plane and the map is held, so it carries no data of its
 *                 own -- but it is a CITY at z10, and the names of the
 *                 places on it are now the site's to draw.
 *
 * THAT LAST BAND IS NEW, AND IT IS HERE BECAUSE IT CANNOT BE ANYWHERE
 * ELSE. Standard used to name places itself above z8, in its own font
 * and at a colour this codebase cannot reach; on the two light themes
 * the result was white text on a bright ground. `basemapLabelsSet`
 * below, and scene/theme.ts's basemapConfig, are the two halves of the
 * answer.
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
 * Every colour comes out of `paint(palette)` -- theming tier 3 -- and the
 * same patch list builds each layer's initial paint, so a colour is
 * written once and cannot drift between "what the layer was added with"
 * and "what a repaint sets it to".
 */

export const PROJECT_SITES_SET = 'project-sites';
export const HISTORY_SET = 'history-stops';
export const BASEMAP_LABELS_SET = 'basemap-labels';

export const PLACE_LABELS = 'basemap-place-labels';
export const LOCALITY_LABELS = 'basemap-locality-labels';

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

/** The one size map type is set at, and the one step below it. */
export const MAP_TYPE_SIZE = 11;
export const MAP_TYPE_SIZE_QUIET = 10;

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
 * Measured against what the colour theme actually puts under a label
 * (styles/tokens/lut.ts's basemapColor), this does two different jobs on
 * the two kinds of theme, and it is worth saying which:
 *
 *   dark themes  the ink is light and this is near-black, so the halo
 *                is 10-16:1 from the ink and about 3:1 from the land.
 *                That is what carries a label over a bright road fill,
 *                which is the one basemap surface the ink cannot beat.
 *   light themes the ground and the themed land are within 1.05:1 of
 *                each other, so the halo separates almost nothing -- and
 *                does not need to. A light theme's ink runs 5.1:1
 *                against the DARKEST colour the ramp can produce and
 *                7.1:1 against its land, unaided.
 *
 * It is left at the ground on both rather than lifted on light themes
 * because there is nowhere to lift it to: paper's --map-land is
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

/** Builds a layer with the paint its own patches describe. */
const layer = (
  entry: LayerEntry,
  patches: PaintPatch[],
): LayerEntry => ({ ...entry, paint: paintOf(entry.id, patches) });

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
 * six featured rows -- no point lit, no halo -- while the camera still
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
  /** False below the tablet breakpoint (1g) or in browse-all (1c). */
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

  const patches = paint(options.palette);
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
      layer(
        {
          id: SITE_POINTS,
          type: 'circle',
          source: PROJECT_SITES_SET,
        },
        patches,
      ),
      layer(
        {
          id: SITE_LABELS,
          type: 'symbol',
          source: PROJECT_SITES_SET,
          layout: text(-0.6),
        },
        patches,
      ),
      layer(
        {
          id: SITE_COUNTS,
          type: 'symbol',
          source: SITE_COUNTS,
          layout: text(0.8),
        },
        patches,
      ),
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
  const { labels, selectedStop } = options;
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

  const patches = paint(options.palette);

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
      layer(
        { id: HISTORY_LINE, type: 'line', source: HISTORY_LINE },
        patches,
      ),
      layer(
        {
          id: HISTORY_POINTS,
          type: 'circle',
          source: HISTORY_SET,
        },
        patches,
      ),
      layer(
        { id: HISTORY_RING, type: 'circle', source: HISTORY_SET },
        patches,
      ),
      layer(
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
        patches,
      ),
    ],
    interactions: [],
    paint,
  };
};

/* ---- the basemap's own place names ------------------------------------
 *
 * THE SITE NAMES THE WORLD, BECAUSE MAPBOX CANNOT BE ASKED TO.
 *
 * Mapbox Standard's place and road labels are off (scene/theme.ts's
 * basemapConfig says why, and the short version is that tier 1's colour
 * LUT reaches a symbol layer's text as surely as it reaches a fill, so
 * Standard's label colour is an input to the terrain ramp rather than a
 * colour the site can choose -- and setPaintProperty cannot address a
 * layer inside the `basemap` fragment at all). This is what replaces
 * them: the same names, from the same tileset Standard reads, drawn at
 * the ROOT scope where there is no LUT and `palette.subInk` arrives as
 * itself.
 *
 * WHAT IT COSTS, PLAINLY. A second vector source. Standard's own copy of
 * mapbox-streets-v8 lives inside the fragment and Style.getOwnSource
 * only sees the root's, so a root layer cannot name it: addLayer
 * resolves a layer's source as makeFQID(source, layer.scope), and an
 * added layer's scope is always the root's. The tiles are therefore
 * fetched twice while the map is above LABEL_MIN_ZOOM. They are not
 * fetched at all below it -- Style._updateSources clears `used` on every
 * source whose layers are all hidden by their zoom range, so the globe
 * routes pay nothing -- and the two routes that do pay are the two that
 * used to be showing Standard's labels anyway.
 *
 * (The dodge of naming the fragment's source by its fully-qualified id
 * was checked and rejected. Style.getLayerSourceCache does look the
 * merged caches up by FQID, and the separator is just a character, so
 * `mapbox.mapbox-streets-v8\u001Fbasemap` would probably resolve -- but
 * `getOwnLayerSourceCache`, which addLayer and the change tracker use,
 * would not, the separator is private, and the id of the source inside
 * Standard is not something this repo can see without a token. A
 * mechanism that cannot be tested and fails silently is the exact shape
 * of the bug this whole file's history is about.)
 *
 * NO ROADS. Standard's road labels are off and nothing redraws them.
 * They were the bulk of the text the owner objected to; at the two zooms
 * that show any label at all the tileset carries little more than
 * motorway names; and a line-placed label on a 60-degree pitch is the
 * least legible thing on the map. The mechanism is here if they are ever
 * wanted -- one more layer on the source that is already loaded.
 */

/** Standard reads this tileset; so, separately, do we. */
const STREETS_SOURCE = 'mapbox://mapbox.mapbox-streets-v8';

/** The tileset's layer of named populated places. */
const PLACE_LAYER = 'place_label';

/**
 * The English name where the tile carries one, the local name where it
 * does not. The site is written in English and its own labels are, so a
 * map that switches script halfway across a border is not the same map.
 */
const PLACE_NAME = ['coalesce', ['get', 'name_en'], ['get', 'name']];

const placeLayer = (
  id: string,
  placeClass: string,
  minzoom: number,
  size: number,
  patches: PaintPatch[],
): LayerEntry =>
  layer(
    {
      id,
      type: 'symbol',
      source: BASEMAP_LABELS_SET,
      'source-layer': PLACE_LAYER,
      minzoom,
      filter: ['==', ['get', 'class'], placeClass],
      layout: {
        ...mapType(size),
        'text-field': PLACE_NAME,
        // The scene's own labels are uppercased in JS because they come
        // from content; these come from a tile, so the same treatment
        // has to be a layout property.
        'text-transform': 'uppercase',
        'text-max-width': 7,
        // Tracked-out caps need room around them or the collision box
        // hugs the glyphs and two names touch.
        'text-padding': 4,
        /*
         * Density is left to mapbox's collision detection rather than to
         * a symbolrank cut-off. Nothing in this repo can see a basemap,
         * so a hand-tuned rank per zoom would be a number chosen blind;
         * the sort key gives collision the ranking it needs and lets the
         * bigger place win, which is the same answer without the guess.
         */
        'symbol-sort-key': ['get', 'symbolrank'],
        // Both routes that show these are terrain routes. Without this a
        // label sits at sea level and a ridge draws over it.
        'symbol-z-elevate': true,
      },
    },
    patches,
  );

const basemapLabelsSet = (options: LayerSetOptions): LayerSet => {
  const { labels } = options;

  const paint = (palette: Palette): PaintPatch[] =>
    [
      [PLACE_LABELS, palette.subInk],
      [LOCALITY_LABELS, palette.mutedInk],
    ].flatMap(([id, ink]) => [
      { layer: id, property: 'text-color', value: ink },
      {
        layer: id,
        property: 'text-halo-color',
        value: haloColor(palette),
      },
      {
        layer: id,
        property: 'text-halo-width',
        value: HALO_WIDTH,
      },
      {
        layer: id,
        property: 'text-opacity',
        value: labels ? 1 : 0,
      },
    ]);

  const patches = paint(options.palette);

  return {
    id: BASEMAP_LABELS_SET,
    sources: [
      {
        id: BASEMAP_LABELS_SET,
        spec: { type: 'vector', url: STREETS_SOURCE },
      },
    ],
    layers: [
      placeLayer(
        PLACE_LABELS,
        'settlement',
        LABEL_MIN_ZOOM,
        MAP_TYPE_SIZE,
        patches,
      ),
      placeLayer(
        LOCALITY_LABELS,
        'settlement_subdivision',
        LOCALITY_MIN_ZOOM,
        MAP_TYPE_SIZE_QUIET,
        patches,
      ),
    ],
    interactions: [],
    paint,
  };
};

/*
 * `basemapLabelsSet` goes FIRST on a route that has both, which puts its
 * layers UNDER the route's own. That is not only draw order: mapbox
 * places symbols from the top of the stack down (PauseablePlacement
 * walks _mergedOrder backwards), so the layer on top wins a collision.
 * The site's own names for a place have to beat the tileset's.
 */
const BUILDERS: Record<
  SceneId,
  ((options: LayerSetOptions) => LayerSet)[]
> = {
  hello: [],
  notFound: [],
  projects: [projectSitesSet],
  about: [basemapLabelsSet, historySet],
  projectDetail: [basemapLabelsSet],
};

/** The sets a route wants mounted, in draw order. */
export const layerSetsFor = (
  sceneId: SceneId,
  options: LayerSetOptions,
): LayerSet[] => BUILDERS[sceneId].map((build) => build(options));
