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

/*
 * Every field of a CameraSpec, read off the table rather than written
 * out again. Two things below compare cameras, and a hand-kept list in
 * either would go quietly out of date the day CameraSpec grows a field:
 * the comparison would accept a camera that differs in it, and a test
 * enumerating the same list by hand would not notice.
 */
const CAMERA_FIELDS = Object.keys(
  cameras.hello,
) as (keyof CameraSpec)[];

const sameValue = (a: unknown, b: unknown): boolean => {
  if (Array.isArray(a)) {
    return (
      Array.isArray(b) &&
      a.length === b.length &&
      a.every((value, at) => value === b[at])
    );
  }
  return a === b;
};

/**
 * Two cameras that would put the globe in the same place.
 *
 * By value, because the producers build fresh objects: forViewport
 * patches a mobile camera, cameraAt and cameraForHover re-centre one.
 * Comparing those by reference makes every route change look like a
 * change even when the destination is identical -- which on mobile fired
 * a second easeTo to the place the first was already flying to, killing
 * the 800ms move about a frame in.
 */
export const sameCamera = (a: CameraSpec, b: CameraSpec): boolean =>
  CAMERA_FIELDS.every((field) => sameValue(a[field], b[field]));

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
  CAMERA_FIELDS.filter((field) => field !== 'center').every((field) =>
    sameValue(declared[field], base[field]),
  );

/*
 * Scenes whose centre only the page knows.
 *
 * The detail route's camera is the client's city, so the table entry is
 * a placeholder -- it has to be something, and it is gopro's. Flying to
 * it is wrong for all fourteen projects including gopro, whose real
 * anchor is [-106.36, 39.64] rather than the table's [-106.355, 39.641].
 *
 * That mattered because SceneRoot's effect runs before the page's: on
 * the first pass after a navigation the declared camera is still the
 * previous route's, refinesCamera rightly rejects it, and the fallback
 * used to be the placeholder. So every detail route flew 900ms to
 * Colorado and then re-aimed with a second 600ms move -- and the
 * foreground, which waits 60% of 900, landed 90% of the way through the
 * move it actually got.
 *
 * Rejecting a stale camera is not the same as having the right one. For
 * these scenes the honest answer is to wait: one pass later the page has
 * declared, and the move that then goes out is the only one.
 */
const NEEDS_REFINEMENT = new Set<SceneId>(['projectDetail']);

/**
 * True when the route's camera is not knowable yet -- the scene needs a
 * centre from the page and the page has not supplied one. The caller
 * should hold the camera where it is rather than fly to a placeholder.
 */
export const awaitingRefinement = (
  pathname: string,
  declared: CameraSpec | null,
): boolean => {
  const sceneId = sceneIdForPath(pathname);
  if (!NEEDS_REFINEMENT.has(sceneId)) return false;
  return (
    declared === null || !refinesCamera(declared, cameras[sceneId])
  );
};

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
  // The patch first, then terrain read off the RESULT: a mobile entry
  // that sets its own exaggeration has to survive the flattening, not be
  // overwritten by the desktop value it replaced.
  const patched = { ...spec, ...(MOBILE_CAMERAS[sceneId] ?? {}) };
  return {
    ...patched,
    terrain: terrainExaggeration(patched.terrain, true),
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
