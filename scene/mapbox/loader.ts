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

declare global {
  interface Window {
    /**
     * A deterministic stand-in for mapbox-gl, injected by Playwright
     * through `addInitScript` before the app boots.
     *
     * It exists because a screenshot of the globe is only worth taking if
     * it is the same screenshot every time: real tiles arrive over the
     * network, at their own pace, lit by a sun whose position depends on
     * the light preset. A test that wants to assert the scene's own
     * behaviour -- that the camera moved, that the right layers are
     * mounted, that a theme change reached setColorTheme -- injects a stub
     * and reads the calls back off it. A test that wants the real globe
     * points at a preview deployment and does not set this.
     */
    __MAPBOX_STUB__?: MapboxModule;
    /**
     * Set before the app boots to make the scene publish
     * `window.__SCENE__`. See SceneDebug in ./instance.ts: it is off
     * unless something asks, so a normal session carries one unread
     * boolean and no live reference to the map.
     */
    __SCENE_DEBUG__?: boolean;
    __SCENE__?: import('scene/mapbox/instance').SceneDebug;
  }
}

export const getMapboxToken = (): string =>
  process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? '';

export const getMapboxStyle = (): string =>
  process.env.NEXT_PUBLIC_MAPBOX_STYLE || DEFAULT_STYLE;

let pending: Promise<MapboxModule> | null = null;

/**
 * Resolves the mapbox-gl module, or null when there is no token to use it
 * with. Callers must handle null: that is the no-token fallback path, and it
 * is the path unit tests run.
 *
 * An injected stub wins over both, and needs no token: it never talks to
 * Mapbox.
 */
export const loadMapboxGl =
  async (): Promise<MapboxModule | null> => {
    if (typeof window === 'undefined') return null;
    if (window.__MAPBOX_STUB__) return window.__MAPBOX_STUB__;
    if (!getMapboxToken()) return null;
    if (!pending) {
      pending = import('mapbox-gl').then((mod) => mod.default);
    }
    return pending;
  };
