import type { Map as MapboxMap } from 'mapbox-gl';

// The history map instance is shared through globalThis (declared in
// types/globals.d.ts) so Redux thunks can drive it.
export const setMap = (mapboxMap: MapboxMap): MapboxMap => {
  globalThis.map = mapboxMap;
  return mapboxMap;
};

// Paired with map.remove() on unmount. Most consumers gate on selectMapLoaded
// as well, which the unmount's mapReset clears, but fitBounds() is gated on
// the handle alone — and leaving it set would keep the removed map's whole
// object graph reachable from globalThis.
export const clearMap = (): void => {
  globalThis.map = undefined;
};

export const getMap = (): MapboxMap | undefined => globalThis.map;

export type GetMap = typeof getMap;
