import { useSyncExternalStore } from 'react';
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

/** Below the tablet breakpoint the mobile cameras apply. */
export const useIsMobile = (): boolean =>
  useSyncExternalStore(
    watch(MOBILE_QUERY),
    matches(MOBILE_QUERY),
    never,
  );

/** Reduced motion: a 200ms crossfade, a static scene, no rotation. */
export const useReducedMotion = (): boolean =>
  useSyncExternalStore(
    watch(REDUCED_MOTION_QUERY),
    prefersReducedMotion,
    never,
  );
