import { anchors, type AnchorId } from 'content/anchors';
import {
  type CameraPadding,
  type CameraSpec,
  cameras,
  NOT_FOUND_FRAME_MOBILE,
  ORBIT_FRAME_MOBILE,
  SCENE_MOVE_LONG_MS,
  SCENE_MOVE_MS,
  type SceneId,
  type Viewport,
} from 'content/cameras';
import { terrainExaggeration } from 'scene/budget';
import {
  clampGlobeZoom,
  globeZoomForScreenRadius,
} from 'scene/globe';

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

/*
 * Structural, all the way down, and that is load-bearing rather than
 * tidy. Two of CameraSpec's fields are objects that get REBUILT every
 * time a camera is resolved -- `padding`, which frameCamera computes from
 * the live viewport, and `frame`, which the mobile patch swaps -- so
 * comparing them by reference reports "changed" on every render.
 * sameCamera is what decides whether to issue an easeTo, so that is not a
 * wasted comparison: it is a fresh 600ms camera move per render, for ever.
 */
const sameValue = (a: unknown, b: unknown): boolean => {
  if (Array.isArray(a)) {
    return (
      Array.isArray(b) &&
      a.length === b.length &&
      a.every((value, at) => sameValue(value, b[at]))
    );
  }
  if (a !== null && typeof a === 'object') {
    if (b === null || typeof b !== 'object' || Array.isArray(b)) {
      return false;
    }
    const left = a as Record<string, unknown>;
    const right = b as Record<string, unknown>;
    const keys = Object.keys(left);
    return (
      keys.length === Object.keys(right).length &&
      keys.every((key) => sameValue(left[key], right[key]))
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
 * camera has no mobile artboard and is unchanged apart from terrain; the
 * 404 has no artboard at either size and follows hello, which is the only
 * thing there is to follow.
 */
export const MOBILE_MAX_WIDTH = 650;

const MOBILE_CAMERAS: Partial<Record<SceneId, Partial<CameraSpec>>> =
  {
    /*
     * The two framed scenes swap the FRAME, not the zoom, and carry the
     * frame resolved at 1f's 390x844 alongside it for the same reason the
     * desktop table does: it is what ships where there is no box to
     * measure. test/scene-camera.test.ts holds them to their frames.
     */
    hello: {
      frame: ORBIT_FRAME_MOBILE,
      zoom: 1.0455375319488909,
      // 0.4 * 844: half of it lifts the centre to 0.3 * 844 = 253.2.
      padding: { top: 0, right: 0, bottom: 337.6, left: 0 },
    },
    projects: { zoom: 2.2, pitch: 20 },
    about: { zoom: 10.2, pitch: 55 },
    notFound: {
      frame: NOT_FOUND_FRAME_MOBILE,
      zoom: 0.24553753194889083,
      padding: { top: 0, right: 0, bottom: 337.6, left: 0 },
    },
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

/*
 * THE FRAME, RESOLVED.
 *
 * A GlobeFrame says where the sphere goes and how big it is, both as
 * fractions of the viewport. mapbox takes a zoom and a padding. This is
 * the conversion, and it is the last step of the camera pipeline --
 * after resolveCamera has picked the route's camera and forViewport has
 * chosen the breakpoint's frame.
 *
 * WHY PADDING AND NOT easeTo's `offset`. Both sound like they move the
 * globe and only one does. `offset` is a one-shot: mapbox reads it as
 * "put the destination CENTRE this far from the middle of the screen" and
 * turns it into a different lng/lat, so the sphere stays dead centre and
 * the geography slides under it -- the opposite of what 1a draws, which
 * is Portland still facing the viewer with the whole sphere pushed right.
 * It is also not camera state, so it survives nothing: not a resize, not
 * a drag, not the next move. `padding` moves the PROJECTION CENTRE, which
 * is the point the globe is drawn around, and it persists on the
 * transform. Measured: a left padding of P puts the sphere's centre P/2
 * to the right and leaves the painted radius untouched to the pixel.
 *
 * WHY IT RE-RESOLVES RATHER THAN BEING A CONSTANT. Both halves are
 * viewport-relative. The radius is a fraction of the height and mapbox's
 * globe is a perspective projection whose magnification depends on the
 * viewport height too, so the zoom that frames it is a function of the
 * height and nothing else; the padding is in pixels, so a resize leaves
 * yesterday's pixels behind. A single committed zoom is right at exactly
 * one window size.
 */

/** The padding that puts the projection centre at `at` in this viewport. */
export const paddingFor = (
  at: [number, number],
  viewport: Viewport,
): CameraPadding => {
  // centerPoint is (size + near - far) / 2, so the gap between opposing
  // sides has to be twice the offset wanted.
  const dx = viewport.width * (2 * at[0] - 1);
  const dy = viewport.height * (2 * at[1] - 1);
  return {
    top: dy > 0 ? dy : 0,
    right: dx < 0 ? -dx : 0,
    bottom: dy < 0 ? -dy : 0,
    left: dx > 0 ? dx : 0,
  };
};

/**
 * The camera with its frame resolved against a real box, or unchanged
 * when there is no frame or nothing to measure.
 *
 * A null viewport is not a fallback so much as an honest answer: on the
 * server, and under jsdom, there is no layout and any width would be
 * invented. The table's own `zoom` and `padding` are that frame at the
 * artboard size, so passing the spec through is the artboard camera --
 * which is the one thing that is certainly not a guess.
 */
export const frameCamera = (
  spec: CameraSpec,
  viewport: Viewport | null,
): CameraSpec => {
  const { frame } = spec;
  if (frame === null || viewport === null) return spec;
  const axis =
    frame.of === 'width' ? viewport.width : viewport.height;
  return {
    ...spec,
    zoom: clampGlobeZoom(
      globeZoomForScreenRadius(frame.radius * axis, viewport.height) +
        frame.zoomOffset,
    ),
    padding: paddingFor(frame.at, viewport),
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
