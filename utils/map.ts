import type { Map as MapboxMap } from 'mapbox-gl';

// The history map instance is shared through globalThis (declared in
// types/globals.d.ts) so Redux thunks can drive it.
export const setMap = (mapboxMap: MapboxMap): MapboxMap => {
  globalThis.map = mapboxMap;
  return mapboxMap;
};

export const getMap = (): MapboxMap | undefined => globalThis.map;

export type GetMap = typeof getMap;
