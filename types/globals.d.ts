import type { Map as MapboxMap } from 'mapbox-gl';

declare global {
  // The history page shares its Mapbox map instance through globalThis so
  // Redux thunks can drive it (see utils/map.ts).
  var map: MapboxMap | undefined;

  interface Window {
    // Google Analytics 4, loaded by pages/_app.tsx when configured.
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export {};
