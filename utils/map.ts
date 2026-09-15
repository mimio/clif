import type { Map as MapboxMap } from 'mapbox-gl';

// The history map instance is shared through globalThis (declared in
// types/globals.d.ts) so Redux thunks can drive it.
export const setMap = (mapboxMap: MapboxMap): MapboxMap => {
  globalThis.map = mapboxMap;
  return mapboxMap;
};

// Paired with map.remove() on unmount. remove() frees the heavy parts — the
// style, the sources, the GL context — but not the references the map itself
// still holds: its detached container and the handlers registered in Map.tsx.
// An uncleared handle leaves that dead map reachable from globalThis until
// the next visit's setMap overwrites it.
export const clearMap = (): void => {
  globalThis.map = undefined;
};

export const getMap = (): MapboxMap | undefined => globalThis.map;

export type GetMap = typeof getMap;
