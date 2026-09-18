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

/**
 * How long the globe takes to come round once, in seconds.
 *
 * The prototype's `orbit()` states it directly --
 * `const rot = t * (Math.PI * 2 / 240)`, with `t` in seconds -- and the
 * design inventory says nothing else about the figure, so this is it.
 */
export const REVOLUTION_SECONDS = 240;

/** The same rotation in the units `spinDegPerSecond` is stated in. */
export const SPIN_DEG_PER_SECOND = 360 / REVOLUTION_SECONDS;

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
  /**
   * How fast the Earth turns on its axis, in DEGREES OF CENTRE LONGITUDE
   * PER SECOND, or null for a still camera.
   *
   * Three things about that sentence are load-bearing.
   *
   * IT IS LONGITUDE, NOT BEARING. The prototype's `orbit()` turns the
   * planet -- `rot = t * (Math.PI * 2 / 240)` enters the projection as
   * `a = (lon - centerLon - rot)`, which is the centre meridian walking
   * east while the ground walks west across the glass. `setBearing` is a
   * different motion: at pitch 0 on a globe it rolls the whole sphere
   * about the screen's view axis, poles and all, like a record rather
   * than a planet. The app turned the bearing for its whole life, and
   * nobody would have called that "the globe rotating".
   *
   * IT IS PER SECOND, NOT PER FRAME. A per-frame step is whatever the
   * display and the frame budget make it: measured on a headless runner
   * at 11fps, the old 0.0015 degrees a frame came to one revolution every
   * six hours, and even on a healthy 60Hz display it was one revolution
   * every 67 minutes -- while a 120Hz panel would have run at twice the
   * rate of the 60Hz one beside it. scene/mapbox/instance.ts scales by the elapsed
   * milliseconds instead, so the figure below is true on any display.
   *
   * IT IS POSITIVE FOR LEFTWARD. Advancing the centre longitude EASTWARD
   * carries a fixed place toward smaller screen x, because mapbox draws a
   * place east of the centre to its right and this shrinks that
   * difference. e2e/hermetic/globe-spin.spec.ts measures where a fixed
   * lat/lng actually lands rather than trusting the sign.
   */
  spinDegPerSecond: number | null;
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
    /*
     * One revolution per four minutes: 360 / 240 = 1.5 degrees a second,
     * which is the prototype's `Math.PI * 2 / 240` radians a second said
     * in the units this field is in.
     */
    spinDegPerSecond: SPIN_DEG_PER_SECOND,
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
    spinDegPerSecond: null,
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
    spinDegPerSecond: null,
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
    spinDegPerSecond: null,
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
    // The 404 is hello's globe, so it turns at hello's rate.
    spinDegPerSecond: SPIN_DEG_PER_SECOND,
  },
};

/*
 * THE ATMOSPHERE, AS THE DESIGN STATES IT.
 *
 * The prototype paints the sphere and its surround per pixel in
 * `paintSphere()`, and outside the limb it is TWO RIMS and nothing else.
 * With `dd` the distance from the centre in units of the globe's RADIUS:
 *
 *   if (dd < 1.34) {
 *     const a2 = 0.13 * Math.pow(1 - (dd - 1) / 0.34, 2.2);  // accent2
 *     ...lerp P.space -> P.accent2 by a2
 *     if (dd < 1.14) {
 *       const a = 0.2 * Math.pow(1 - (dd - 1) / 0.14, 2);    // accent
 *       ...lerp that -> P.accent by a
 *     }
 *   }
 *   // past dd = 1.34 it is flat P.space
 *
 * So: a tight `accent` limb peaking at alpha 0.2 and gone by 1.14r,
 * inside a wide, soft `accent2` halo peaking at 0.13 and gone by 1.34r,
 * over P.space. Both colours are THEME TOKENS, not fixed yellow.
 *
 * This table therefore states the DESIGN's numbers, not mapbox's.
 * scene/theme.ts's `fogFor` is the translation, and the comment there is
 * where the design-to-mapbox mapping -- including the parts mapbox
 * cannot express -- is argued.
 */

/**
 * How the glow is anchored, which decides how `horizon-blend` is found.
 *
 * `limb` is a globe camera: the design's reaches are in globe radii, and
 * mapbox's falloff is angular, so the blend has to be SOLVED against the
 * sphere's angular radius at the camera in question. `horizon` is a
 * pitched mercator camera -- the terrain routes -- which has no limb to
 * measure against, and carries mapbox's own number instead.
 */
export type FogGlow =
  | {
      at: 'limb';
      /** `paintSphere`'s accent rim: reach in globe radii, and exponent. */
      limbReach: number;
      limbFalloff: number;
      /** `paintSphere`'s accent2 halo, in the same terms. */
      haloReach: number;
      haloFalloff: number;
    }
  | { at: 'horizon'; horizonBlend: number };

/** Which palette token a fog colour is drawn from. */
export type FogInk = 'accent' | 'accent2' | 'space';

/** One of mapbox's fog colours: which palette token, and its peak alpha. */
export type FogColor = { ink: FogInk; alpha: number };

export type FogSpec = {
  /**
   * Mapbox fog `range`, in units of the camera's field of view.
   *
   * IT DOES NOTHING ON A GLOBE, and that is mapbox's rule rather than a
   * claim about these numbers: `Fog.state` lerps the authored range
   * toward a fixed `[2, 4.5]` by `globeToMercatorTransition(zoom)`,
   * which is `smoothstep(5, 6, zoom)` -- zero below zoom 5. hello
   * resolves to about 2.2 and projects sits at 2.6, so both run on
   * mapbox's fixed range and neither reads the number below. It is kept
   * because the cameras are interactive -- zoom past 5 and it starts to
   * apply -- and because on the terrain routes (mercator, pitch 60) it
   * is the distance haze and is fully live.
   */
  range: [number, number];
  /**
   * mapbox's `color`: the TIGHT rim, weighted `alpha * t^2`.
   *
   * On the terrain routes this alpha is DOUBLE-DUTY: mapbox reads it as
   * the strength of the distance haze as well (`Fog.state.alpha`, and
   * `u_fog_color.a` in the fog prelude), so it cannot be lowered there
   * without taking the haze with it.
   */
  color: FogColor;
  /**
   * mapbox's `high-color`: the WIDE halo, weighted
   * `alpha * t * (1 - color.alpha * t)`. Alpha zero removes it outright.
   */
  highColor: FogColor;
  glow: FogGlow;
};

/**
 * `paintSphere`'s two rims, verbatim. Both globe cameras get them,
 * because the prototype draws both globes with the same function --
 * `orbit()` (hello) and `projectsGlobe()` (projects) each call it.
 *
 * `satisfies` rather than a `FogGlow` annotation, and exported, because
 * `haloReach` is the number scene/stars.ts cuts the sky out at -- past
 * it there is nothing but the space token, so that is where space
 * begins. Reaching it through `fogPresets.space.glow` would mean
 * narrowing the union at the other end and carrying a branch that can
 * never be taken; this way the reach is simply available, once, from
 * the place that states it.
 */
export const SPHERE_RIMS = {
  at: 'limb',
  limbReach: 0.14,
  limbFalloff: 2,
  haloReach: 0.34,
  haloFalloff: 2.2,
} satisfies FogGlow;

export const fogPresets: Record<FogPreset, FogSpec> = {
  space: {
    range: [0.6, 12],
    color: { ink: 'accent', alpha: 0.2 },
    highColor: { ink: 'accent2', alpha: 0.13 },
    glow: SPHERE_RIMS,
  },
  dusk: {
    range: [0.4, 6],
    color: { ink: 'accent', alpha: 0.2 },
    highColor: { ink: 'accent2', alpha: 0.13 },
    glow: SPHERE_RIMS,
  },
  /*
   * The terrain routes, and the one preset NOT re-derived from
   * `paintSphere` -- said plainly rather than left to be inferred.
   *
   * about and projectDetail sit at zoom 10+, where mapbox has long since
   * left the globe (the transition finishes at zoom 6), so there is no
   * limb and no atmosphere ring here at all: what `horizon-blend`
   * spreads is the band of sky above the horizon line. The prototype's
   * matching scene is `surface(..., curved = false)` -- every terrain
   * artboard is `data-scene="terrain"` -- whose sky is
   * `0.1 * Math.pow(k, 1.6)` of P.ACCENT over P.space across the top
   * 22.5% of the frame. That is why the accent is on `highColor` here
   * and on `color` above.
   *
   * Measured against that band, what ships is TIGHTER than the design,
   * not wider: horizon-blend 0.04 spreads it over about 0.049 of the
   * viewport height, roughly a fifth of what `surface()` draws. The
   * over-glow this branch is fixing is a globe problem and these two
   * routes have no globe, so the GEOMETRY here is left exactly as it
   * shipped and only the colours move onto the theme.
   *
   * Widening it to `surface()` is a real change and a separate one,
   * blocked on the double duty noted on `color`: the design's 0.1 sky
   * alpha would also cut the terrain haze to a tenth of its strength.
   *
   * `color` is the ground token rather than the `#121212` that shipped.
   * That hex is a dark grey on all eight themes, which on paper and
   * chalk meant a near-black haze and a near-black band of sky over a
   * near-white page. The design has no fixed colour anywhere: distance
   * washes toward P.space, and P.space is the ground.
   */
  night: {
    range: [0.2, 4],
    color: { ink: 'space', alpha: 1 },
    highColor: { ink: 'accent', alpha: 0.12 },
    glow: { at: 'horizon', horizonBlend: 0.04 },
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
