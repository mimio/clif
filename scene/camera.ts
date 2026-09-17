import { anchors, type AnchorId } from 'content/anchors';
import {
  type CameraSpec,
  cameras,
  SCENE_MOVE_LONG_MS,
  SCENE_MOVE_MS,
  type SceneId,
} from 'content/cameras';
import { terrainExaggeration } from 'scene/budget';

/*
 * Route -> camera, and every rule about how the camera gets there.
 *
 * The premise of the rewrite is that a route change is a camera move, so
 * the mapping from `router.pathname` to a resting camera has to be static
 * and total: SceneRoot resolves it on every navigation without asking the
 * page anything. Pages then *refine* it -- the detail route swaps in its
 * client city, the about route swaps in the selected stop -- through
 * useSceneCamera.
 *
 * Nothing here touches mapbox-gl. It is arithmetic and table lookup, which
 * is why the whole camera contract is unit-tested rather than inferred
 * from a screenshot.
 */

/** Next's pathname for every route that has a resting camera. */
export const SCENE_BY_PATH: Record<string, SceneId> = {
  '/': 'hello',
  '/projects': 'projects',
  '/projects/[projectId]': 'projectDetail',
  '/about': 'about',
};

/**
 * Anything unmapped is the 404 camera -- /404, /_error and any route a
 * later lane adds before it declares a scene. There is no "no camera"
 * state: the globe is always somewhere.
 */
export const sceneIdForPath = (pathname: string): SceneId =>
  SCENE_BY_PATH[pathname] ?? 'notFound';

export const cameraForPath = (pathname: string): CameraSpec =>
  cameras[sceneIdForPath(pathname)];

/**
 * True when `declared` is the route's own camera reframed rather than
 * another route's camera left over.
 *
 * This is what makes the handoff between SceneRoot and a page safe.
 * SceneRoot's effect runs before the page's (it is the earlier sibling in
 * _app.tsx), so on every navigation it briefly sees the *previous* route's
 * declared camera. Comparing the framing -- everything except the centre
 * -- tells the two apart: a refinement only ever moves the centre, so a
 * stale camera falls through to the route's table entry and the scene
 * never eases to the wrong place and back.
 */
export const refinesCamera = (
  declared: CameraSpec,
  base: CameraSpec,
): boolean =>
  declared.zoom === base.zoom &&
  declared.pitch === base.pitch &&
  declared.bearing === base.bearing &&
  declared.terrain === base.terrain &&
  declared.fog === base.fog &&
  declared.interactive === base.interactive &&
  declared.spin === base.spin;

/** The camera a pathname wants, with the page's refinement if it fits. */
export const resolveCamera = (
  pathname: string,
  declared: CameraSpec | null,
): CameraSpec => {
  const base = cameraForPath(pathname);
  if (declared && refinesCamera(declared, base)) return declared;
  return base;
};

/** Re-centres a camera without touching its framing. */
export const cameraAt = (
  spec: CameraSpec,
  center: [number, number],
): CameraSpec => ({ ...spec, center });

/*
 * Mobile variants, from design inventory 6.2. They are not separate
 * scenes -- same fog, same terrain flag, same interactivity -- so they are
 * a patch over the desktop entry rather than a second table. The detail
 * and 404 cameras have no mobile artboard and are unchanged apart from
 * terrain.
 */
export const MOBILE_MAX_WIDTH = 650;

const MOBILE_CAMERAS: Partial<Record<SceneId, Partial<CameraSpec>>> =
  {
    hello: { zoom: 1.4 },
    projects: { zoom: 2.2, pitch: 20 },
    about: { zoom: 10.2, pitch: 55 },
  };

/**
 * The camera as this viewport should see it. Terrain exaggeration drops to
 * 1.0 on small screens for every route that has terrain at all, which is
 * the budget dial from scene/budget.ts rather than a per-route number.
 */
export const forViewport = (
  spec: CameraSpec,
  sceneId: SceneId,
  isMobile: boolean,
): CameraSpec => {
  if (!isMobile) return spec;
  return {
    ...spec,
    ...(MOBILE_CAMERAS[sceneId] ?? {}),
    terrain: terrainExaggeration(spec.terrain, true),
  };
};

/** Terrain only switches on once the camera is close enough to show it. */
export const TERRAIN_MIN_ZOOM = 9;

export const terrainFor = (spec: CameraSpec): number | null =>
  spec.terrain !== null && spec.zoom >= TERRAIN_MIN_ZOOM
    ? spec.terrain
    : null;

/*
 * Durations. 800ms between routes, 900ms into the detail (and out of the
 * 404, per artboard 1a's "settles 900ms from zoom 0.8"), 600ms for a
 * reframe inside a route -- a hover nudge, or selecting a work-history
 * stop -- and 200ms under reduced motion, which is the crossfade the
 * motion card specifies rather than a move at all.
 */
export const SCENE_REFRAME_MS = 600;
export const REDUCED_MOVE_MS = 200;

export const moveDurationFor = (
  from: SceneId | null,
  to: SceneId,
  reduced: boolean,
): number => {
  if (reduced) return REDUCED_MOVE_MS;
  if (from === to) return SCENE_REFRAME_MS;
  if (to === 'projectDetail' || from === 'notFound') {
    return SCENE_MOVE_LONG_MS;
  }
  return SCENE_MOVE_MS;
};

/** Hovering a project eases the camera this far toward its anchor city. */
export const HOVER_NUDGE = 0.08;

export const nudgeToward = (
  spec: CameraSpec,
  target: [number, number],
  amount: number = HOVER_NUDGE,
): CameraSpec =>
  cameraAt(spec, [
    spec.center[0] + (target[0] - spec.center[0]) * amount,
    spec.center[1] + (target[1] - spec.center[1]) * amount,
  ]);

/** The camera with a hovered project's nudge applied, if there is one. */
export const cameraForHover = (
  spec: CameraSpec,
  hover: AnchorId | null,
): CameraSpec =>
  hover === null ? spec : nudgeToward(spec, anchors[hover].center);

/**
 * The coordinate pill's caption. On the detail route the camera is not
 * yours, and a frozen coordinate under the word CAMERA reads as a bug --
 * so the label says so. The chrome calls this with the live camera.
 */
export const coordLabel = (spec: CameraSpec | null): string =>
  spec !== null && !spec.interactive ? 'held' : 'camera';

/** Reduced motion turns rotation off rather than slowing it. */
export const spinRateFor = (
  spec: CameraSpec,
  reduced: boolean,
): number | null => (reduced ? null : spec.spin);

/**
 * The travelling dash pauses on terrain routes to stay inside the frame
 * budget (artboard 1e), and under reduced motion it never runs.
 */
export const dashRuns = (
  spec: CameraSpec,
  reduced: boolean,
): boolean => !reduced && spec.terrain === null;
