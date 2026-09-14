import type { Map as MapboxMap } from 'mapbox-gl';

// The history map instance is shared through globalThis (declared in
// types/globals.d.ts) so Redux thunks can drive it.
export const setMap = (mapboxMap: MapboxMap): MapboxMap => {
  globalThis.map = mapboxMap;
  return mapboxMap;
};

// Paired with map.remove() on unmount. remove() frees the heavy parts — the
// style, the sources, the GL context — but leaves the map's own
// back-references intact: its detached container, and the handlers registered
// in Map.tsx, which chain back to the component. An uncleared handle would
// strand one of those dead shells on globalThis per visit.
export const clearMap = (): void => {
  globalThis.map = undefined;
};

export const getMap = (): MapboxMap | undefined => globalThis.map;

export type GetMap = typeof getMap;
