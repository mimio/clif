import type { Map as MapboxMap } from 'mapbox-gl';
import {
  type CameraSpec,
  fogPresets,
  SCENE_MOVE_MS,
} from 'content/cameras';
import {
  getMapboxStyle,
  getMapboxToken,
  loadMapboxGl,
} from 'scene/mapbox/loader';

/*
 * The single Map instance, held for the life of the tab.
 *
 * Device pixel ratio is the scene's other dial besides terrain exaggeration.
 * mapbox-gl reads devicePixelRatio itself at construction and exposes no
 * setter, so the DPR_CLAMP in scene/budget.ts applies to what the scene
 * paints on its own canvas, not to this map's.
 *
 * The old history page built a map on mount and called remove() on unmount,
 * because skipping it stranded one WebGL context per visit. The instance is
 * never destroyed now, so that whole lifecycle is gone and its hazard with
 * it: there is exactly one context, ever. Route changes are camera moves.
 */
let instance: MapboxMap | null = null;
let creating: Promise<MapboxMap | null> | null = null;

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
    projection: { name: 'globe' },
    attributionControl: false,
    // A globe needs to zoom out past the old style's minZoom: 7.
    minZoom: 0,
  });
  return instance;
};

/** Creates the map on first call, and hands back the same one after that. */
export const ensureMap = async (
  container: HTMLElement | null,
): Promise<MapboxMap | null> => {
  if (!container) return null;
  if (instance) return instance;
  if (!creating) creating = create(container);
  return creating;
};

/** Eases the live map toward a camera. A no-op before the map exists. */
export const applyCamera = (spec: CameraSpec | null): void => {
  if (!instance || !spec) return;
  const fog = fogPresets[spec.fog];
  instance.easeTo({
    center: spec.center,
    zoom: spec.zoom,
    pitch: spec.pitch,
    bearing: spec.bearing,
    duration: SCENE_MOVE_MS,
  });
  instance.setFog({
    range: fog.range,
    color: fog.color,
    'high-color': fog.highColor,
  });
};

/** Test-only: forgets the instance so a fresh one can be built. */
export const resetMapForTests = (): void => {
  instance = null;
  creating = null;
};
