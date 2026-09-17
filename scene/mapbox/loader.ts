/*
 * The only module that knows mapbox-gl exists.
 *
 * The old mapbox-gl-ssr.ts did `typeof window !== 'undefined' ? require(...)`
 * at module scope, which pulled the library into whatever chunk imported it
 * and broke outright under any ESM test runner. This loads it lazily, once,
 * and only in a browser that has a token -- so the home route does not pay
 * for the library before the scene needs it, and a token-less dev server
 * degrades instead of exploding.
 */
import type mapboxgl from 'mapbox-gl';

export type MapboxModule = typeof mapboxgl;

export const DEFAULT_STYLE = 'mapbox://styles/mapbox/standard';

export const getMapboxToken = (): string =>
  process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? '';

export const getMapboxStyle = (): string =>
  process.env.NEXT_PUBLIC_MAPBOX_STYLE || DEFAULT_STYLE;

let pending: Promise<MapboxModule> | null = null;

/**
 * Resolves the mapbox-gl module, or null when there is no token to use it
 * with. Callers must handle null: that is the no-token fallback path, and it
 * is the path unit tests run.
 */
export const loadMapboxGl =
  async (): Promise<MapboxModule | null> => {
    if (!getMapboxToken()) return null;
    if (typeof window === 'undefined') return null;
    if (!pending) {
      pending = import('mapbox-gl').then((mod) => mod.default);
    }
    return pending;
  };
