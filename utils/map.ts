import type { Map as MapboxMap } from 'mapbox-gl';

// The history map instance is shared through globalThis (declared in
// types/globals.d.ts) so Redux thunks can drive it.
export const setMap = (mapboxMap: MapboxMap): MapboxMap => {
  globalThis.map = mapboxMap;
  return mapboxMap;
};

// Paired with map.remove() on unmount. Every consumer reads a defined handle
// as a live map, so leaving the removed one here would have thunks and
// listeners calling into a map whose WebGL context is already gone.
export const clearMap = (): void => {
  globalThis.map = undefined;
};

export const getMap = (): MapboxMap | undefined => globalThis.map;

export type GetMap = typeof getMap;
