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
 * This is the only file in scene/ excluded from coverage, so it holds as
 * little decision-making as it can: what to do is worked out in
 * scene/camera.ts, scene/theme.ts and scene/layers/**, and this file does
 * it. Everything here is still exercised by the injected-stub tests.
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

const create = async (
  container: HTMLElement,
): Promise<MapboxMap | null> => {
  const mapboxgl = await loadMapboxGl();
  if (!mapboxgl) return null;

  instance = new mapboxgl.Map({
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
  return instance;
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

/** Runs `run` once the style can take sources and layers. */
export const whenStyleReady = (
  map: MapboxMap,
  run: () => void,
): void => {
  if (map.isStyleLoaded()) {
    run();
    return;
  }
  map.once('style.load', run);
};

/* ---- camera ---------------------------------------------------------- */

/** Eases the live map toward a camera. A no-op before the map exists. */
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
  if (!instance) return;
  const fog = fogPresets[spec.fog];
  instance.setFog({
    range: fog.range,
    color: fog.color,
    'high-color': fog.highColor,
    'horizon-blend': 0.04,
    'space-color': shade(palette, 0.9),
    // Stars would be noise over a bright ground.
    'star-intensity': palette.light ? 0 : 0.15,
  });
};

export const applyTerrain = (exaggeration: number | null): void => {
  if (!instance) return;
  if (exaggeration === null) {
    instance.setTerrain(null);
    return;
  }
  if (!instance.getSource(DEM_SOURCE)) {
    instance.addSource(DEM_SOURCE, DEM_SPEC);
  }
  instance.setTerrain({ source: DEM_SOURCE, exaggeration });
};

/*
 * The detail route holds the map. Every gesture goes off, not just drag:
 * a scroll-zoom on a held map is the same bug as a drag on one.
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
 * Tier 1: the colour LUT. This reloads every tile by design -- the LUT is
 * applied when a tile is coloured -- so scene/theme.ts debounces it and
 * refuses to call it unless palette.key actually changed.
 */
export const applyColorTheme = (lut: string): void => {
  if (!instance) return;
  instance.setColorTheme({ data: lut });
};

/** Tier 2: the Standard import's own knobs. No tile reload. */
export const applyBasemapConfig = (
  changes: [keyof BasemapConfig, unknown][],
): void => {
  if (!instance) return;
  for (const [key, value] of changes) {
    instance.setConfigProperty('basemap', key, value);
  }
};

/* ---- layers ---------------------------------------------------------- */

const asSceneMap = (map: MapboxMap): SceneMap =>
  map as unknown as SceneMap;

/**
 * Tier 3 lives here too: `sync` mounts what the route wants and unmounts
 * what it does not, `repaint` pushes the palette into whatever is
 * mounted.
 */
export const syncLayers = (
  sets: LayerSet[],
  palette: Palette,
): void => {
  if (!instance) return;
  const map = instance;
  whenStyleReady(map, () => {
    registry.sync(asSceneMap(map), sets);
    registry.repaint(asSceneMap(map), sets, palette);
  });
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
  if (dash) {
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
};
