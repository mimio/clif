import { anchors } from 'content/anchors';

export type FogPreset = 'space' | 'dusk' | 'night';

/** A box to fit the globe into, in CSS pixels. */
export type Viewport = { width: number; height: number };

/** The artboards' desktop and mobile frames: 1a and 1f. */
export const ARTBOARD_DESKTOP: Viewport = {
  width: 1440,
  height: 900,
};
export const ARTBOARD_MOBILE: Viewport = { width: 390, height: 844 };

/**
 * mapbox's camera padding, in CSS pixels. It shifts the projection
 * centre -- the point the globe is drawn around -- by half the
 * difference between opposing sides, which is the only mechanism that
 * moves the SPHERE rather than the geography under it.
 */
export type CameraPadding = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export const NO_PADDING: CameraPadding = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
};

/**
 * Where the globe sits and how big it is, as fractions of the viewport
 * rather than as a zoom.
 *
 * This is how the artboards state it, and it is the only form that
 * survives a window that is not 1440x900. The prototype's `orbit()` draws
 * the hello sphere at `w * 0.66, h * 0.5` with radius `h * 0.44` on
 * desktop and `w * 0.5, h * 0.3` with radius `w * 0.52` on mobile -- both
 * ratios, neither a pixel size. scene/camera.ts's `frameCamera` resolves a
 * frame against the live viewport into the `zoom` and `padding` mapbox
 * takes.
 */
export type GlobeFrame = {
  /** The sphere's centre, as a fraction of the viewport's width and height. */
  at: [number, number];
  /** The sphere's painted radius, as a fraction of the axis named by `of`. */
  radius: number;
  of: 'width' | 'height';
  /**
   * Zoom steps to sit back from the framed zoom, or 0 to be framed
   * exactly. Only the 404 uses it: see its entry below.
   */
  zoomOffset: number;
};

/*
 * The hello scene's two frames, straight off the prototype's `orbit()`.
 *
 * Desktop pushes the sphere RIGHT, to 66% of the width, because the page
 * word and its column sit on the left: artboard 1a puts them at left
 * 112px in a 640px column, which is the inset SceneStage still uses. On
 * mobile the column moves to the bottom (1f: left 24px, bottom 120px) and
 * the sphere goes back to the horizontal centre, 30% down, sized off the
 * WIDTH because a phone has far more height than the globe wants.
 */
export const ORBIT_FRAME: GlobeFrame = {
  at: [0.66, 0.5],
  radius: 0.44,
  of: 'height',
  zoomOffset: 0,
};

export const ORBIT_FRAME_MOBILE: GlobeFrame = {
  at: [0.5, 0.3],
  radius: 0.52,
  of: 'width',
  zoomOffset: 0,
};

/*
 * The 404's two frames.
 *
 * THERE IS NO 404 ARTBOARD. The prototype draws 1a and 1f for hello and
 * nothing for the not-found route; the only thing said about it anywhere
 * is 1a's motion note, "scene settles 900ms ease-in-out-cubic from zoom
 * 0.8", against a hello camera the same card states as zoom 1.6. So the
 * one fact on record about the 404's framing is that it is EIGHT TENTHS
 * OF A ZOOM STEP BACK FROM HELLO, and that is exactly what is written
 * here -- as an offset, so it keeps holding when hello's own zoom is
 * resolved from the viewport rather than read off a card. Its centre is
 * hello's because it has none of its own and the page is the same
 * left-column stage; nothing else about it is invented.
 */
const NOT_FOUND_ZOOM_OFFSET = -0.8;

export const NOT_FOUND_FRAME: GlobeFrame = {
  ...ORBIT_FRAME,
  zoomOffset: NOT_FOUND_ZOOM_OFFSET,
};

export const NOT_FOUND_FRAME_MOBILE: GlobeFrame = {
  ...ORBIT_FRAME_MOBILE,
  zoomOffset: NOT_FOUND_ZOOM_OFFSET,
};

export type CameraSpec = {
  center: [number, number];
  zoom: number;
  pitch: number;
  bearing: number;
  /**
   * The globe's box, or null for a camera that is simply a zoom.
   *
   * When it is set, `zoom` and `padding` below are DERIVED: they are this
   * frame resolved at the artboard viewport, which is what ships when
   * there is no box to measure (the server, and jsdom, which has no
   * layout), and scene/camera.ts's `frameCamera` recomputes both for the
   * viewport the visitor actually has. test/scene-camera.test.ts holds the
   * two in step, so the numbers in this table cannot drift from the
   * ratios that produced them.
   */
  frame: GlobeFrame | null;
  /**
   * Where the projection centre sits, in CSS pixels.
   *
   * Every route states it, including the ones that want none, because
   * mapbox's padding is CAMERA STATE: it persists across an easeTo that
   * does not mention it, so a route that said nothing would inherit the
   * previous route's offset and draw its globe off to one side.
   */
  padding: CameraPadding;
  /** Terrain exaggeration, or null for a flat globe. */
  terrain: number | null;
  fog: FogPreset;
  /** False on the detail route, where the map is HELD. */
  interactive: boolean;
  /** Degrees of bearing per frame, or null for a still camera. */
  spin: number | null;
};

/** Every scene the camera has a resting position for. */
export type SceneId =
  'hello' | 'projects' | 'projectDetail' | 'about' | 'notFound';

/*
 * Values are the ARTBOARD numbers from design inventory §6.2, which
 * supersede the scene-cameras card wherever the two disagree.
 *
 * The one real conflict is `projects`. The card says
 * centre -100.200, 39.600 / zoom 3.4 / pitch 55 / bearing -20, with the
 * hover state at zoom 3.9. Every artboard (1b, 1c desktop; 1g mobile) says
 * -98, 39 / zoom 2.6 / pitch 25 / bearing -12, and describes the hover as a
 * nudge 8% toward the anchor rather than a zoom step. The artboards win.
 *
 * Mobile variants, also from §6.2, are not separate scenes: projects drops
 * to 2.2/pitch 20 and about to 10.2/pitch 55 with terrain exaggeration
 * 1.0. hello and the 404 swap FRAMES rather than zooms, because 1f states
 * the mobile globe as `w * 0.52` about `w * 0.5, h * 0.3` -- a different
 * anchor and a different axis, which no single zoom can express. The scene
 * layer applies all of them; they are not routes.
 */
export const cameras: Record<SceneId, CameraSpec> = {
  hello: {
    center: [-122.7, 45.5],
    /*
     * ORBIT_FRAME at 1440x900, NOT the card's 1.6.
     *
     * The card's zoom paints a disc 567px across on a 900px-tall
     * artboard. 1a draws one 792px across -- `h * 0.44` of radius -- and
     * pushed right of the column rather than centred under it, which is
     * the whole difference between the design and what shipped. The
     * number is the frame's, so it is stated to the precision the frame
     * resolves to rather than rounded to something legible.
     */
    zoom: 2.198198043081919,
    pitch: 0,
    bearing: 0,
    frame: ORBIT_FRAME,
    // 0.32 * 1440: half of it moves the centre to 0.66 * 1440 = 950.4.
    padding: { top: 0, right: 0, bottom: 0, left: 460.8 },
    terrain: null,
    fog: 'space',
    interactive: true,
    // One revolution per four minutes, at 60fps.
    spin: 0.0015,
  },
  projects: {
    center: [-98.0, 39.0],
    zoom: 2.6,
    pitch: 25,
    bearing: -12,
    frame: null,
    padding: NO_PADDING,
    terrain: null,
    fog: 'dusk',
    interactive: true,
    spin: null,
  },
  projectDetail: {
    // Overridden per project with the client city; 1d's gopro is the default.
    center: [-106.355, 39.641],
    zoom: 10,
    pitch: 60,
    bearing: -20,
    frame: null,
    padding: NO_PADDING,
    terrain: 1.4,
    fog: 'night',
    // The one route where the camera is not yours: drag, scroll-zoom and
    // rotate are all off and the readout reads HELD.
    interactive: false,
    spin: null,
  },
  about: {
    center: [-122.658, 45.512],
    zoom: 10.5,
    pitch: 60,
    bearing: -12,
    frame: null,
    padding: NO_PADDING,
    terrain: 1.4,
    fog: 'night',
    interactive: true,
    spin: null,
  },
  notFound: {
    // No 404 artboard exists. See NOT_FOUND_FRAME above for what that
    // leaves to go on, which is hello's framing eight tenths of a zoom
    // step back -- here, that frame resolved at 1440x900.
    center: [-122.7, 45.5],
    zoom: 1.398198043081919,
    pitch: 0,
    bearing: 0,
    frame: NOT_FOUND_FRAME,
    padding: { top: 0, right: 0, bottom: 0, left: 460.8 },
    terrain: null,
    fog: 'space',
    interactive: true,
    spin: 0.0015,
  },
};

export type FogSpec = {
  /** Mapbox fog `range`, in units of the camera's field of view. */
  range: [number, number];
  color: string;
  highColor: string;
};

export const fogPresets: Record<FogPreset, FogSpec> = {
  space: {
    range: [0.6, 12],
    color: '#161616',
    highColor: 'rgba(255, 229, 32, 0.2)',
  },
  dusk: {
    range: [0.4, 6],
    color: '#1b1a14',
    highColor: 'rgba(255, 229, 32, 0.3)',
  },
  night: {
    range: [0.2, 4],
    color: '#121212',
    highColor: 'rgba(255, 229, 32, 0.12)',
  },
};

/** Every route change is an easeTo on this curve (900ms into the detail). */
export const SCENE_MOVE_MS = 800;
export const SCENE_MOVE_LONG_MS = 900;
export const SCENE_EASE: [number, number, number, number] = [
  0.65, 0, 0.35, 1,
];
/** The foreground starts entering once the scene is this far through. */
export const SCENE_HANDOFF = 0.6;

/** Re-centres a camera on one of the city anchors, keeping its framing. */
export const cameraAtAnchor = (
  spec: CameraSpec,
  anchorId: keyof typeof anchors,
): CameraSpec => ({ ...spec, center: anchors[anchorId].center });
