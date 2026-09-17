import type { Map as MapboxMap } from 'mapbox-gl';
import {
  type CameraSpec,
  fogPresets,
  SCENE_EASE,
} from 'content/cameras';
import { cubicBezier } from 'scene/ease';
import { createLayerRegistry } from 'scene/layers/registry';
import type { LayerSet, SceneMap } from 'scene/layers/types';
import {
  getMapboxStyle,
  getMapboxToken,
  loadMapboxGl,
} from 'scene/mapbox/loader';
import type { BasemapConfig } from 'scene/theme';
import type { Palette } from 'styles/tokens/palette';

/*
 * The single Map instance, held for the life of the tab, and every
 * imperative call the scene makes on it.
 *
 * The old history page built a map on mount and called remove() on
 * unmount, because skipping it stranded one WebGL context per visit. The
 * instance is never destroyed now, so that whole lifecycle is gone and its
 * hazard with it: there is exactly one context, ever. Route changes are
 * camera moves.
 *
 *
 * THE STYLE LIFECYCLE, AND WHY IT LIVES HERE
 *
 * `new mapboxgl.Map()` returns before the style exists. Almost everything
 * worth doing to a map goes through Style._checkLoaded(), which throws
 * "Style is not done loading" until the stylesheet has been fetched and
 * parsed: setColorTheme, setConfigProperty (via setImportConfig), setFog,
 * setTerrain, setPaintProperty, addSource, addLayer, removeLayer. So a
 * scene that talks to the map the moment it is constructed takes the whole
 * app down, which is what it did.
 *
 * SceneRoot must not have to know which of those methods carry the
 * precondition -- that is precisely the knowledge this seam exists to
 * hold. So every style-dependent call records what it *wants* and then
 * asks for a flush. Before the style is ready a flush is a no-op and the
 * wants simply sit there; when style.load arrives everything still wanted
 * is applied at once.
 *
 * This is a record of desired state, not a queue of callbacks, and the
 * difference is the point. Four route changes during load leave one
 * camera, one layer set and one config to apply, not four of each -- and
 * a theme change during load is never lost, because the newest LUT
 * overwrites the slot rather than joining a line behind an obsolete one.
 *
 * Readiness is the `style.load` event and nothing else. isStyleLoaded()
 * looks like the right test and is not: Style.loaded() additionally
 * requires every source cache, image and model to be loaded and the
 * colour-theme LUT not to be decoding, so it stays false forever behind a
 * token that cannot fetch tiles, and it flaps back to false after each
 * setColorTheme. _checkLoaded() tests _loaded alone, and `style.load` is
 * the event for exactly that flag.
 *
 * If the stylesheet itself fails -- a bad token 401s it -- `style.load`
 * never fires, so the wants are never applied and the scene stays blank
 * rather than throwing. The status goes to 'failed' and SceneRoot shows
 * the same static plate it shows with no token at all.
 */
let instance: MapboxMap | null = null;
let creating: Promise<MapboxMap | null> | null = null;
let registry = createLayerRegistry();

const ease = cubicBezier(...SCENE_EASE);

/** The DEM the terrain routes drape over. */
const DEM_SOURCE = 'mapbox-dem';
const DEM_SPEC = {
  type: 'raster-dem' as const,
  url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
  tileSize: 512,
  maxzoom: 14,
};

export const getMap = (): MapboxMap | null => instance;

/* ---- the style lifecycle --------------------------------------------- */

export type StyleStatus = 'loading' | 'ready' | 'failed';

let status: StyleStatus = 'loading';
const watchers = new Set<(next: StyleStatus) => void>();

export const getStyleStatus = (): StyleStatus => status;

/** Notifies on every status change, and returns an unsubscribe. */
export const watchStyleStatus = (
  listener: (next: StyleStatus) => void,
): (() => void) => {
  watchers.add(listener);
  return () => {
    watchers.delete(listener);
  };
};

const setStatus = (next: StyleStatus): void => {
  if (next === status) return;
  status = next;
  for (const listener of [...watchers]) listener(next);
};

/*
 * What the scene wants the map to be. Every slot is "the latest value
 * asked for, or nothing asked for", so re-asking overwrites rather than
 * accumulating. `undefined` is "nothing asked for" throughout, which is
 * why terrain -- whose real values include null, meaning off -- is held
 * as `number | null | undefined`.
 */
type Desired = {
  fog: { spec: CameraSpec; palette: Palette } | undefined;
  terrain: number | null | undefined;
  config: Map<string, unknown>;
  lut: string | undefined;
  layers: { sets: LayerSet[]; palette: Palette } | undefined;
};

const emptyDesired = (): Desired => ({
  fog: undefined,
  terrain: undefined,
  config: new Map(),
  lut: undefined,
  layers: undefined,
});

let desired: Desired = emptyDesired();

/**
 * The LUT currently on the map.
 *
 * The dedupe has to live here rather than in the theme painter's closure.
 * setColorTheme reloads every tile, the painter is rebuilt whenever
 * SceneRoot's effect re-runs, and a rebuilt painter has no memory of what
 * it painted -- so this is the only place that knows what the map is
 * actually wearing.
 */
let appliedLut: string | null = null;

/** True while a terrain want is parked waiting for the DEM to resolve. */
let waitingForDem = false;

const asSceneMap = (map: MapboxMap): SceneMap =>
  map as unknown as SceneMap;

/** Applies everything still wanted. A no-op until the style is ready. */
const flush = (): void => {
  const map = instance;
  if (!map || status !== 'ready') return;

  // Config first: the light preset decides how the fog reads.
  if (desired.config.size > 0) {
    for (const [key, value] of desired.config) {
      map.setConfigProperty('basemap', key, value);
    }
    desired.config.clear();
  }

  if (desired.lut !== undefined) {
    const lut = desired.lut;
    desired.lut = undefined;
    if (lut !== appliedLut) {
      appliedLut = lut;
      map.setColorTheme({ data: lut });
    }
  }

  if (desired.fog !== undefined) {
    const { spec, palette } = desired.fog;
    desired.fog = undefined;
    const fog = fogPresets[spec.fog];
    map.setFog({
      range: fog.range,
      color: fog.color,
      'high-color': fog.highColor,
      'horizon-blend': 0.04,
      'space-color': shade(palette, 0.9),
      // Stars would be noise over a bright ground.
      'star-intensity': palette.light ? 0 : 0.15,
    });
  }

  if (desired.terrain !== undefined) {
    const exaggeration = desired.terrain;
    if (exaggeration === null) {
      desired.terrain = undefined;
      map.setTerrain(null);
    } else {
      if (!map.getSource(DEM_SOURCE)) {
        map.addSource(DEM_SOURCE, DEM_SPEC);
      }
      /*
       * Terrain waits for its own source.
       *
       * Adding a raster-dem source and draping on it in the same tick
       * works on a fresh style, because the source resolves before the
       * first frame that uses it. It does not work once the map has been
       * rendering for a while: mapbox's Terrain.update reaches into the
       * DEM's tile cache on the very next frame and throws "Cannot read
       * properties of undefined" when the TileJSON has not come back
       * yet. That is a navigation from hello into about -- the one path
       * where terrain is switched on late -- and it took the whole tree
       * down every time.
       *
       * So the want stays on the record, and the sourcedata handler
       * flushes again when the DEM is ready. If the route leaves the
       * terrain view while we are waiting, the want is simply overwritten
       * with null and the wait resolves into a no-op.
       */
      if (map.isSourceLoaded(DEM_SOURCE)) {
        desired.terrain = undefined;
        map.setTerrain({ source: DEM_SOURCE, exaggeration });
      } else if (!waitingForDem) {
        waitingForDem = true;
        const onData = (event: { sourceId?: string }): void => {
          if (event.sourceId !== DEM_SOURCE) return;
          if (!map.isSourceLoaded(DEM_SOURCE)) return;
          map.off('sourcedata', onData);
          waitingForDem = false;
          flush();
        };
        map.on('sourcedata', onData);
      }
    }
  }

  if (desired.layers !== undefined) {
    const { sets, palette } = desired.layers;
    desired.layers = undefined;
    registry.sync(asSceneMap(map), sets);
    registry.repaint(asSceneMap(map), sets, palette);
  }
};

const create = async (
  container: HTMLElement,
): Promise<MapboxMap | null> => {
  const mapboxgl = await loadMapboxGl();
  if (!mapboxgl) return null;

  const map = new mapboxgl.Map({
    container,
    accessToken: getMapboxToken(),
    style: getMapboxStyle(),
    // Set at construction: changing projection later restyles the whole
    // map, and the globe is never not the projection.
    projection: { name: 'globe' },
    attributionControl: false,
    // A globe needs to zoom out past the old style's minZoom: 7.
    minZoom: 0,
  });
  instance = map;

  map.once('style.load', () => {
    setStatus('ready');
    flush();
  });

  /*
   * Only a failure BEFORE style.load is fatal to the scene: after it,
   * error events are individual tiles, sprites and fonts, which a map is
   * expected to survive and which a token without tile scope produces by
   * the hundred. Swallowing those is the difference between degrading and
   * crashing.
   */
  map.on('error', () => {
    if (status === 'loading') setStatus('failed');
  });

  return map;
};

/**
 * Creates the map on first call, and hands back the same one after that.
 *
 * React 19 double-invokes effects under StrictMode, so this is called at
 * least twice on the first mount with the same container. The second call
 * lands while `create` is still in flight and gets the same promise --
 * which is why the in-flight promise is memoised and not only the
 * resolved instance. Two maps in one container would be two WebGL
 * contexts and two sets of tiles.
 */
export const ensureMap = async (
  container: HTMLElement | null,
): Promise<MapboxMap | null> => {
  if (!container) return null;
  if (instance) return instance;
  if (!creating) creating = create(container);
  return creating;
};

/* ---- camera ---------------------------------------------------------- */

/*
 * The camera is the one part of the scene with no style precondition:
 * easeTo only touches the transform. It is applied immediately and on
 * purpose -- deferring it would leave the map at its constructed default
 * of [0, 0] zoom 0 until the stylesheet arrived, and then swing visibly
 * to the route's camera as the first tiles painted.
 */
export const applyCamera = (
  spec: CameraSpec,
  durationMs: number,
): void => {
  if (!instance) return;
  instance.easeTo({
    center: spec.center,
    zoom: spec.zoom,
    pitch: spec.pitch,
    bearing: spec.bearing,
    duration: durationMs,
    easing: ease,
  });
};

const shade = (palette: Palette, k: number): string =>
  `rgb(${palette.sh(palette.space[0], 0, k)}, ${palette.sh(
    palette.space[1],
    1,
    k,
  )}, ${palette.sh(palette.space[2], 2, k)})`;

export const applyFog = (
  spec: CameraSpec,
  palette: Palette,
): void => {
  desired.fog = { spec, palette };
  flush();
};

export const applyTerrain = (exaggeration: number | null): void => {
  desired.terrain = exaggeration;
  flush();
};

/*
 * The detail route holds the map. Every gesture goes off, not just drag:
 * a scroll-zoom on a held map is the same bug as a drag on one. Handlers
 * are not style-dependent either.
 */
const HANDLERS = [
  'dragPan',
  'dragRotate',
  'scrollZoom',
  'boxZoom',
  'keyboard',
  'doubleClickZoom',
  'touchZoomRotate',
  'touchPitch',
] as const;

export const applyInteractivity = (interactive: boolean): void => {
  if (!instance) return;
  for (const name of HANDLERS) {
    const handler = instance[name];
    if (!handler) continue;
    if (interactive) handler.enable();
    else handler.disable();
  }
};

/* ---- theming --------------------------------------------------------- */

/**
 * Tier 1: the colour LUT. Reloads every tile by design, so it is skipped
 * when the map already wears this LUT -- see `appliedLut`.
 */
export const applyColorTheme = (lut: string): void => {
  desired.lut = lut;
  flush();
};

/** Tier 2: the Standard import's own knobs. No tile reload. */
export const applyBasemapConfig = (
  changes: [keyof BasemapConfig, unknown][],
): void => {
  // Merged, never replaced: `changes` is a diff against the last config
  // SceneRoot computed, so a diff that arrives while an earlier one is
  // still waiting carries only what changed since it. Dropping the
  // earlier one would lose those keys for good.
  for (const [key, value] of changes) desired.config.set(key, value);
  flush();
};

/* ---- layers ---------------------------------------------------------- */

/**
 * Tier 3 lives here too: `sync` mounts what the route wants and unmounts
 * what it does not, `repaint` pushes the palette into whatever is
 * mounted.
 */
export const syncLayers = (
  sets: LayerSet[],
  palette: Palette,
): void => {
  desired.layers = { sets, palette };
  flush();
};

/* ---- the animation loop ---------------------------------------------- */

let frame = 0;
let spin: number | null = null;
let dash = false;
let dashLayers: string[] = [];

const tick = (): void => {
  frame = 0;
  if (!instance) return;
  if (spin !== null) {
    instance.setBearing(instance.getBearing() + spin);
  }
  // The dash is a paint property, so it waits for the style like every
  // other paint property does.
  if (dash && status === 'ready') {
    // A three-step dash walked one step at a time reads as travel without
    // writing a paint property every frame on every layer.
    const step = Math.floor(Date.now() / 90) % 3;
    for (const id of dashLayers) {
      if (!instance.getLayer(id)) continue;
      instance.setPaintProperty(id, 'line-dasharray', [
        0,
        4 - step,
        3 + step,
      ]);
    }
  }
  if (spin !== null || dash) frame = requestAnimationFrame(tick);
};

/**
 * One loop for the whole scene, started and stopped by what the route
 * asks for. Reduced motion resolves both dials to off in
 * scene/camera.ts, so under it this never starts.
 */
export const setAnimation = (
  spinRate: number | null,
  dashRunning: boolean,
  layers: string[],
): void => {
  spin = spinRate;
  dash = dashRunning;
  dashLayers = layers;
  if (frame !== 0) return;
  if (spin === null && !dash) return;
  frame = requestAnimationFrame(tick);
};

/** Test-only: forgets the instance so a fresh one can be built. */
export const resetMapForTests = (): void => {
  if (frame !== 0) cancelAnimationFrame(frame);
  frame = 0;
  spin = null;
  dash = false;
  dashLayers = [];
  instance = null;
  creating = null;
  registry = createLayerRegistry();
  status = 'loading';
  watchers.clear();
  desired = emptyDesired();
  appliedLut = null;
  waitingForDem = false;
};
