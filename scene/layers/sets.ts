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
  greatCircle,
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
import type { Palette } from 'styles/tokens/palette';

/*
 * The MID band of the layer stack: our own data drawn on top of the
 * themed basemap.
 *
 *   hello / 404   the great-circle work path, Albany -> Portland, with the
 *                 travelling dash and the eight city points.
 *   projects      the clustered project sites, with the three Colorado
 *                 anchors collapsed into VAIL VALLEY at world zoom.
 *   about         the six work-history stops, their chronological line and
 *                 the ring on the live one.
 *   detail        nothing. Artboard 1d is terrain and the shader plane;
 *                 the map is held and carries no data of its own.
 *
 * Every colour comes out of `paint(palette)` -- theming tier 3 -- and the
 * same patch list builds each layer's initial paint, so a colour is
 * written once and cannot drift between "what the layer was added with"
 * and "what a repaint sets it to".
 */

export const WORK_PATH_SET = 'work-path';
export const PROJECT_SITES_SET = 'project-sites';
export const HISTORY_SET = 'history-stops';

export const WORK_PATH_LINE = 'work-path-line';
export const WORK_PATH_DASH = 'work-path-dash';
export const WORK_CITY_POINTS = 'work-city-points';
export const WORK_HOME_POINT = 'work-home-point';

export const SITE_POINTS = 'project-site-points';
export const SITE_LABELS = 'project-site-labels';
export const SITE_COUNTS = 'project-site-counts';

export const HISTORY_LINE = 'history-path-line';
export const HISTORY_POINTS = 'history-stop-points';
export const HISTORY_RING = 'history-stop-ring';
export const HISTORY_LABELS = 'history-stop-labels';

/** Mapbox-hosted mono, with the catalogue's universal fallback. */
const MONO_FONT = ['Roboto Mono Light', 'Arial Unicode MS Regular'];

/** Artboard 1a: the work path runs from the first job back east. */
export const ALBANY: Point = [-73.75, 42.65];

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

/** The halo behind map type: the ground, pushed back a little. */
const haloColor = (palette: Palette): string =>
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
  /** False on terrain routes and under reduced motion. */
  dash: boolean;
  /** Called with the anchor under the pointer, or null on leave. */
  onHoverAnchor: (anchor: AnchorId | null) => void;
  /** Called when a site point is clicked. */
  onSelectAnchor: (anchor: AnchorId) => void;
};

const workPathSet = (options: LayerSetOptions): LayerSet => {
  const { dash } = options;
  const paint = (palette: Palette): PaintPatch[] => [
    {
      layer: WORK_PATH_LINE,
      property: 'line-color',
      value: palette.a(0.6),
    },
    { layer: WORK_PATH_LINE, property: 'line-width', value: 1 },
    {
      layer: WORK_PATH_DASH,
      property: 'line-color',
      value: palette.b(1),
    },
    { layer: WORK_PATH_DASH, property: 'line-width', value: 1.5 },
    {
      layer: WORK_PATH_DASH,
      property: 'line-opacity',
      value: dash ? 1 : 0,
    },
    {
      layer: WORK_PATH_DASH,
      property: 'line-dasharray',
      value: [0, 4, 3],
    },
    {
      layer: WORK_CITY_POINTS,
      property: 'circle-color',
      value: palette.a(0.6),
    },
    { layer: WORK_CITY_POINTS, property: 'circle-radius', value: 2 },
    {
      layer: WORK_HOME_POINT,
      property: 'circle-color',
      value: palette.a(1),
    },
    { layer: WORK_HOME_POINT, property: 'circle-radius', value: 3.2 },
    {
      layer: WORK_HOME_POINT,
      property: 'circle-stroke-color',
      value: palette.a(0.35),
    },
    {
      layer: WORK_HOME_POINT,
      property: 'circle-stroke-width',
      value: 9,
    },
  ];

  const patches = paint(options.palette);
  const path = greatCircle(ALBANY, anchors.portland.center);

  return {
    id: WORK_PATH_SET,
    sources: [
      {
        id: WORK_PATH_SET,
        spec: { type: 'geojson', data: lineString(path) },
      },
      {
        id: WORK_CITY_POINTS,
        spec: {
          type: 'geojson',
          data: pointCollection(
            Object.values(anchors).map((anchor) => ({
              center: [...anchor.center] as Point,
              properties: { anchor: anchor.id, name: anchor.name },
            })),
          ),
        },
      },
    ],
    layers: [
      layer(
        { id: WORK_PATH_LINE, type: 'line', source: WORK_PATH_SET },
        patches,
      ),
      layer(
        { id: WORK_PATH_DASH, type: 'line', source: WORK_PATH_SET },
        patches,
      ),
      layer(
        {
          id: WORK_CITY_POINTS,
          type: 'circle',
          source: WORK_CITY_POINTS,
        },
        patches,
      ),
      layer(
        {
          id: WORK_HOME_POINT,
          type: 'circle',
          source: WORK_CITY_POINTS,
          filter: ['==', ['get', 'anchor'], 'portland'],
        },
        patches,
      ),
    ],
    interactions: [],
    paint,
  };
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
    { layer: SITE_LABELS, property: 'text-halo-width', value: 1 },
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
    { layer: SITE_COUNTS, property: 'text-halo-width', value: 1 },
  ];

  const patches = paint(options.palette);
  const text = (offsetY: number) => ({
    'text-field': ['get', 'label'],
    'text-font': MONO_FONT,
    'text-size': 11,
    'text-anchor': 'left',
    'text-offset': [1.1, offsetY],
    'text-letter-spacing': 0.14,
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
      value: 1,
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
            'text-field': ['get', 'company'],
            'text-font': MONO_FONT,
            'text-size': 11,
            'text-anchor': 'left',
            'text-offset': [1.5, 0.3],
            'text-letter-spacing': 0.14,
          },
        },
        patches,
      ),
    ],
    interactions: [],
    paint,
  };
};

const BUILDERS: Record<
  SceneId,
  ((options: LayerSetOptions) => LayerSet)[]
> = {
  hello: [workPathSet],
  notFound: [workPathSet],
  projects: [projectSitesSet],
  about: [historySet],
  projectDetail: [],
};

/** The sets a route wants mounted, in draw order. */
export const layerSetsFor = (
  sceneId: SceneId,
  options: LayerSetOptions,
): LayerSet[] => BUILDERS[sceneId].map((build) => build(options));
