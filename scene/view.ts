/*
 * What a route says about the scene that is not where the camera is.
 *
 * `CameraSpec` answers *where the globe is*: centre, zoom, pitch, bearing,
 * terrain, fog. It has no room for anything else, and it should not grow
 * any -- `refinesCamera` tells a page's refinement from a stale camera by
 * comparing every field except the centre, so a non-framing field on that
 * record would either corrupt that comparison or need an exclusion list
 * that quietly rots.
 *
 * But routes do have things to say about the scene. Two so far, and they
 * are not the same kind of thing as each other, which is why this is a
 * record rather than a boolean:
 *
 *   labels        The map's own place labels. Off wherever the route's own
 *                 type would overprint them -- artboards 1c and 1g both
 *                 carry data-labels="0". /projects carries the whole
 *                 catalogue in one full-bleed table, which is a fact about
 *                 the page rather than about the viewport, so the viewport
 *                 cannot derive it.
 *   selectedStop  Which work-history stop is the live element. Artboard
 *                 1e's yellow budget allows exactly one live thing per
 *                 view, and on /about that is the *selected* stop -- the
 *                 one the sheet and the scrubber are showing. Deriving it
 *                 from the data instead (`end === null`, the current job)
 *                 lights Salesforce for ever and leaves the map as the one
 *                 part of the route that ignores the selection.
 *
 * A route declares a patch; anything it does not mention keeps its
 * default. Composition with the environment happens here too, and only
 * here: `labels` is a veto, not an override, because the viewport has its
 * own reason to suppress labels and neither input outranks the other.
 */

export type SceneView = {
  /** False suppresses the basemap's place labels and our own map type. */
  labels: boolean;
  /** The history stop drawn live, by id, or null for none. */
  selectedStop: number | null;
};

/** What a route gets for saying nothing. */
export const DEFAULT_VIEW: SceneView = {
  labels: true,
  selectedStop: null,
};

/** A route declares only what it cares about. */
export type SceneViewPatch = Partial<SceneView>;

export const mergeView = (
  patch: SceneViewPatch | null | undefined,
): SceneView => ({ ...DEFAULT_VIEW, ...patch });

/**
 * Compared by value, not by identity.
 *
 * useSceneCamera asks callers to memoise, because a CameraSpec is
 * assembled from content and a page has somewhere to memoise it. This is
 * a two-field record a page will write inline -- `useSceneView({ labels:
 * !browseAll })` -- and a fresh object every render would set state every
 * render and never settle. Comparing the fields costs nothing and removes
 * the footgun instead of documenting it.
 */
export const sameView = (a: SceneView, b: SceneView): boolean =>
  a.labels === b.labels && a.selectedStop === b.selectedStop;

/**
 * Whether map type is drawn at all. Both inputs matter and either can
 * veto: below the tablet breakpoint there is no band where the table and
 * the map labels can both be read (1g), and on /projects the table is
 * full bleed over the map at every width (1c).
 */
export const showLabels = (
  view: SceneView,
  isMobile: boolean,
): boolean => view.labels && !isMobile;
