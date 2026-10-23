import { useSyncExternalStore } from 'react';
import type { Viewport } from 'content/cameras';
import { MOBILE_MAX_WIDTH } from 'scene/camera';
import { prefersReducedMotion } from 'scene/budget';

/*
 * The two environment reads the scene branches on: viewport width and the
 * reduced-motion preference.
 *
 * Both are external systems, so both go through useSyncExternalStore
 * rather than an effect that calls setState -- a media query that changes
 * between render and effect would otherwise paint one scene and then
 * correct it. Both also have to answer on the server, where there is no
 * matchMedia: the server snapshot is desktop, full motion, which is what
 * the artboards are drawn at.
 */
export const MOBILE_QUERY = `(max-width: ${MOBILE_MAX_WIDTH - 1}px)`;

export const REDUCED_MOTION_QUERY =
  '(prefers-reduced-motion: reduce)';

/*
 * Built once per query, not once per render.
 *
 * useSyncExternalStore re-subscribes whenever `subscribe` changes
 * identity, so returning a fresh closure from a factory on every render
 * tore down and rebuilt both media-query listeners on every commit of
 * SceneRoot and ChromeRoot -- which is most commits there are.
 */
const watch =
  (query: string) =>
  (onChange: () => void): (() => void) => {
    const list = window.matchMedia(query);
    list.addEventListener('change', onChange);
    return () => list.removeEventListener('change', onChange);
  };

const matches = (query: string) => (): boolean =>
  window.matchMedia(query).matches;

const never = (): boolean => false;

const watchMobile = watch(MOBILE_QUERY);
const matchesMobile = matches(MOBILE_QUERY);
const watchReduced = watch(REDUCED_MOTION_QUERY);

/** Below the tablet breakpoint the mobile cameras apply. */
export const useIsMobile = (): boolean =>
  useSyncExternalStore(watchMobile, matchesMobile, never);

/** Reduced motion: a 200ms crossfade, a static scene, no rotation. */
export const useReducedMotion = (): boolean =>
  useSyncExternalStore(watchReduced, prefersReducedMotion, never);

/* ---- the box the globe is framed in ---------------------------------- */

/*
 * The third environment read, and the one with a size rather than a
 * boolean answer: how big the scene's box is, so scene/camera.ts can
 * resolve a GlobeFrame's ratios into a zoom and a padding.
 *
 * documentElement.clientWidth/clientHeight rather than window.innerWidth:
 * the scene container is `position: fixed; inset: 0`, which is the layout
 * viewport, and innerWidth includes a classic scrollbar the container
 * does not get. The same pair is what a `(max-width:)` media query
 * measures, so this and useIsMobile cannot disagree about where the
 * breakpoint is. Verified against mapbox's own transform.width/height in
 * e2e/hermetic/globe-frame.spec.ts, which reads all three.
 *
 * null where there is no layout to read -- the server, and jsdom, neither
 * of which has one. frameCamera treats that as "leave the table's
 * artboard framing alone" rather than inventing a width.
 */
const watchViewport = (onChange: () => void): (() => void) => {
  window.addEventListener('resize', onChange);
  return () => window.removeEventListener('resize', onChange);
};

/*
 * Cached, because useSyncExternalStore compares snapshots by identity and
 * re-renders in a loop given a fresh object every call.
 */
let lastViewport: Viewport | null = null;

export const readViewport = (): Viewport | null => {
  const { clientWidth, clientHeight } = document.documentElement;
  if (clientWidth <= 0 || clientHeight <= 0) {
    lastViewport = null;
    return null;
  }
  if (
    lastViewport === null ||
    lastViewport.width !== clientWidth ||
    lastViewport.height !== clientHeight
  ) {
    lastViewport = { width: clientWidth, height: clientHeight };
  }
  return lastViewport;
};

const noViewport = (): Viewport | null => null;

/** The box the globe is framed in, or null where there is no layout. */
export const useViewportSize = (): Viewport | null =>
  useSyncExternalStore(watchViewport, readViewport, noViewport);
