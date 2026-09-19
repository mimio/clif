import {
  ARTBOARD_DESKTOP,
  SPHERE_RIMS,
  type Viewport,
} from 'content/cameras';
import {
  focalLength,
  type GlobeGeometry,
  globeLimb,
  limbRadii,
} from 'scene/globe';
import type { Palette } from 'styles/tokens/palette';

/*
 * The accent stars.
 *
 * mapbox already paints a sky: `star-intensity` is 0.15 on every dark
 * theme (scene/theme.ts) and mapbox answers it with sixteen thousand
 * white points. What it will not do is paint them in the site's colours
 * or at the site's sizes -- `star-intensity` is the only dial the fog
 * exposes, and everything else about that field is compiled into
 * mapbox's own atmosphere pass. So this is a second field, few and
 * coloured, scattered through the first.
 *
 * SCATTERED THROUGH IT MEANS ON THE SAME SPHERE. The first version of
 * this file authored the field in SCREEN space -- a jittered grid over
 * the viewport, fixed in the frame -- on the argument that an authored
 * field belongs to the composition rather than to the sky. That was
 * wrong, and visibly so: mapbox's stars are fixed to a celestial sphere
 * the camera turns through, so on the hello route they sweep across the
 * frame at about 28 pixels a second while ours sat still. Two skies
 * sliding past each other is not a composition. Everything below is
 * therefore a direction on that same sphere, transformed by the same
 * rotation mapbox uses and projected through the same camera.
 *
 *
 * WHAT MAPBOX'S STARS ACTUALLY ARE, because "bigger than the biggest"
 * is a claim about a number and the number is not documented anywhere.
 * Read off mapbox-gl 3.30's own bundle (`Atmosphere.update`,
 * `Atmosphere.drawStars` and `starsVert`/`starsFrag`):
 *
 *   count     16,000, uniform on a sphere of radius 200 about the camera
 *   size      `1 + 0.01 * sizeRange * (rand - 0.5)` with sizeRange 100,
 *             so 0.5 to 1.5, times a sizeMultiplier of 0.15
 *   opacity   `1 + 0.01 * intensityRange * (rand - 0.5)` with
 *             intensityRange 200, so 0 to 2, times star-intensity
 *   colour    vec3(1.0, 1.0, 1.0). White, and only white.
 *   shape     a camera-facing quad, solid to 60% of its half-width and
 *             linear to nothing at the rim
 *   camera    `starsProjMatrix`, a plain perspective at the map's own
 *             field of view -- and, note, WITHOUT the camera padding, so
 *             the sky turns about the middle of the canvas while the
 *             globe sits wherever the padding puts it
 *
 * A quad of half-width `0.15 * size` at distance 200 lands `f * 0.15 *
 * size / 200` from its centre on screen, so the DIAMETER in CSS pixels
 * is `2 * f * 0.15 * size / 200` -- 1.01px at size 0.5 and 3.04px at
 * size 1.5, in a 900px-tall window. The brightest is white at alpha
 * 0.30. That is the whole field: nothing in it is coloured, nothing in
 * it is wider than about three pixels, and it scales with the viewport
 * height because `f` does.
 *
 * Everything below is stated as a MULTIPLE of that largest star rather
 * than in pixels, which is what keeps this field in step with mapbox's
 * at every window size instead of only at the artboard's.
 *
 * They do not twinkle. Artboard 1e's yellow budget allows one live thing
 * per view and it is never the background; the only motion here is the
 * sky's own.
 */

/** Where in the palette a star takes its colour. */
export type StarInk = 'accent' | 'accent2';

export type Star = {
  /** A unit direction on the celestial sphere, in mapbox's own frame. */
  at: readonly [number, number, number];
  /** Diameter, in multiples of mapbox's largest star. */
  scale: number;
  ink: StarInk;
  alpha: number;
};

/* ---- mapbox's own field, measured ------------------------------------ */

/** The radius of the sphere mapbox scatters its stars on. */
const MAPBOX_STAR_SPHERE = 200;

/** mapbox's `sizeMultiplier`, and the top of its `sizeRange` spread. */
const MAPBOX_STAR_MULTIPLIER = 0.15;
const MAPBOX_STAR_SIZE_MAX = 1.5;

/** How many stars mapbox puts on the sphere at any intensity above zero. */
export const MAPBOX_STAR_COUNT = 16_000;

/** The half-width of mapbox's largest star, in world units. */
const MAPBOX_STAR_HALF_WIDTH =
  MAPBOX_STAR_MULTIPLIER * MAPBOX_STAR_SIZE_MAX;

/**
 * The diameter of mapbox's LARGEST star, in CSS pixels, in a viewport
 * this tall, at the centre of the frame: 3.04px at the artboard's 900.
 *
 * It is a diameter and not a radius because that is the number a reader
 * can check against a screenshot. Two caveats, both of which make this
 * the conservative side of the comparison rather than the generous one:
 * mapbox fades its quad over the outer 40% of that width, so a solid
 * circle of the same diameter reads slightly larger; and a star off the
 * view axis is nearer than 200 and so draws slightly wider than this.
 */
export const mapboxStarDiameter = (height: number): number =>
  (2 * focalLength(height) * MAPBOX_STAR_HALF_WIDTH) /
  MAPBOX_STAR_SPHERE;

/* ---- ours ------------------------------------------------------------ */

/*
 * One accent star for every five of mapbox's.
 *
 * The count is a density on the SPHERE now rather than a count in the
 * frame, because the frame is a window onto it: 3,200 over the whole sky
 * puts about 157 inside a 1440x900 frame, which is what the screen-space
 * grid this replaced held, and about 58 of those survive the globe and
 * its atmosphere. Tie it to mapbox's own figure and the two fields keep
 * their proportion whatever either of them is set to.
 */
export const STAR_COUNT = MAPBOX_STAR_COUNT / 5;

/**
 * The PRNG seed. 1440 is the artboard's width and means nothing else:
 * what matters is only that it never changes, because the field has to
 * be identical on the server, in a test and in every tab.
 */
export const STAR_SEED = 1440;

/**
 * The size spread, in multiples of mapbox's largest star.
 *
 * The bottom sits under mapbox's own smallest (0.45 against 0.33 of the
 * largest) and the top well over its largest, which is the whole point:
 * a field that stopped where mapbox's stops would add colour and nothing
 * else. `STAR_SIZE_FALLOFF` cubes a uniform draw, so most of the field
 * is small and the large ones are rare -- with the seed above, 770 of
 * the 3,200 are wider than anything mapbox draws, and the widest is
 * 1.70x its largest: 5.16px against 3.04px at the artboard height.
 */
export const STAR_MIN_SCALE = 0.45;
export const STAR_MAX_SCALE = 1.7;
const STAR_SIZE_FALLOFF = 3;

/**
 * The alpha spread, over the same draw as the size: a bigger star is a
 * brighter one, which is how a sky reads.
 *
 * The top is well above mapbox's own brightest (0.62 against 0.30), and
 * that is not this field shouting. Alpha is measured against the space
 * token, and a saturated colour needs more of it than white does to
 * still BE that colour: --clif-accent over --surface-ground lands at
 * rgb(92, 84, 25) at mapbox's 0.30, which reads as a grey-olive speck,
 * and at rgb(166, 150, 28) at 0.62, which reads as the accent. White at
 * 0.30 is rgb(92, 92, 92) and has no colour to lose.
 */
export const STAR_ALPHA_MIN = 0.16;
export const STAR_ALPHA_MAX = 0.62;

/**
 * How much of the field takes the first accent rather than the second.
 *
 * Three in eight, the minority, because `accent` is the louder token --
 * the atmosphere gives it the tight 0.2 rim and hands the wide 0.13 halo
 * to `accent2`, and the same order applies out here.
 */
const STAR_ACCENT_SHARE = 0.375;

/**
 * mulberry32, the generator mapbox seeds its own field with. Three draws
 * per star: one for where it sits in its own band of the sphere, one for
 * the size and brightness it shares, one for the ink.
 */
const mulberry32 = (seed: number): (() => number) => {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/**
 * The golden angle, which is what makes the lattice below even.
 *
 * mapbox samples its sphere uniformly at random, which clumps -- at
 * sixteen thousand white specks that is invisible, and at three thousand
 * coloured ones it is not. A Fibonacci lattice gives every star its own
 * band of equal area between two heights and walks the azimuth by the
 * golden angle, so no two land near each other: measured over the field
 * below, the nearest neighbour is between 3.15 and 3.55 degrees against
 * the 3.59 a perfectly even packing would give. The height inside each
 * band is the random one, which is the same stratified draw a jittered
 * grid makes, on a sphere.
 */
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

/**
 * The field, built once.
 *
 * It is a module constant rather than a hook or a memo because it is a
 * constant: a star is a direction, a size and a colour role, and none of
 * those depend on the camera, the viewport or the palette. Where it
 * lands, how wide it is drawn and what colour it is drawn in are all
 * applied at paint time by `paintedStars` below.
 */
export const stars: Star[] = (() => {
  const random = mulberry32(STAR_SEED);
  const field: Star[] = [];
  for (let index = 0; index < STAR_COUNT; index += 1) {
    // Equal-area bands: z is uniform on [-1, 1] over the sphere.
    const z = 1 - (2 * (index + random())) / STAR_COUNT;
    const ring = Math.sqrt(Math.max(0, 1 - z * z));
    const azimuth = index * GOLDEN_ANGLE;
    const t = random() ** STAR_SIZE_FALLOFF;
    field.push({
      at: [ring * Math.cos(azimuth), ring * Math.sin(azimuth), z],
      scale: STAR_MIN_SCALE + (STAR_MAX_SCALE - STAR_MIN_SCALE) * t,
      ink: random() < STAR_ACCENT_SHARE ? 'accent' : 'accent2',
      alpha: STAR_ALPHA_MIN + (STAR_ALPHA_MAX - STAR_ALPHA_MIN) * t,
    });
  }
  return field;
})();

/**
 * A star's colour, resolved against the live palette.
 *
 * Takes the role and the alpha rather than a `Star`, because the thing
 * that gets painted is a `PaintedStar` whose alpha has already been
 * faded by the atmosphere it sits behind.
 */
export const starInk = (
  palette: Palette,
  ink: StarInk,
  alpha: number,
): string => (ink === 'accent' ? palette.a(alpha) : palette.b(alpha));

/* ---- the sky's own rotation ------------------------------------------ */

/**
 * A rotation, row-major: `v' = M v`.
 *
 * Nine numbers rather than a library type because this is the only
 * matrix the scene builds outside mapbox, and mapbox's gl-matrix is not
 * ours to import.
 */
export type Rotation = readonly [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
];

const DEG = Math.PI / 180;

const times = (a: Rotation, b: Rotation): Rotation => [
  a[0] * b[0] + a[1] * b[3] + a[2] * b[6],
  a[0] * b[1] + a[1] * b[4] + a[2] * b[7],
  a[0] * b[2] + a[1] * b[5] + a[2] * b[8],
  a[3] * b[0] + a[4] * b[3] + a[5] * b[6],
  a[3] * b[1] + a[4] * b[4] + a[5] * b[7],
  a[3] * b[2] + a[4] * b[5] + a[5] * b[8],
  a[6] * b[0] + a[7] * b[3] + a[8] * b[6],
  a[6] * b[1] + a[7] * b[4] + a[8] * b[7],
  a[6] * b[2] + a[7] * b[5] + a[8] * b[8],
];

const aboutX = (radians: number): Rotation => {
  const c = Math.cos(radians);
  const s = Math.sin(radians);
  return [1, 0, 0, 0, c, -s, 0, s, c];
};

const aboutY = (radians: number): Rotation => {
  const c = Math.cos(radians);
  const s = Math.sin(radians);
  return [c, 0, s, 0, 1, 0, -s, 0, c];
};

const aboutZ = (radians: number): Rotation => {
  const c = Math.cos(radians);
  const s = Math.sin(radians);
  return [c, -s, 0, s, c, 0, 0, 0, 1];
};

/**
 * Where the camera is pointing, in the terms the sky is turned by.
 *
 * Not a CameraSpec: this is read off the live transform mid-flight, and
 * it carries the four fields `drawStars` actually reads. The zoom and
 * the padding that decide the globe's disc travel with them, in
 * scene/globe.ts's GlobeGeometry.
 */
export type SkyCamera = {
  center: [number, number];
  bearing: number;
  pitch: number;
};

/**
 * Everything a frame of the field needs off the transform: where the
 * camera points, and the zoom and padding that put the globe on screen.
 * It is what scene/mapbox/instance.ts's `watchSky` reports, and the two
 * halves come from different places in mapbox -- see the note on the
 * several centres in `paintedStars`.
 *
 * The pitch is in both halves, and that is not an accident: it turns the
 * sky about the camera AND slides the silhouette down the frame, and the
 * field has to agree with itself about how far it moved each.
 */
export type SkyView = SkyCamera & GlobeGeometry;

/**
 * The rotation mapbox applies to its star sphere, rebuilt exactly.
 *
 * `Atmosphere.drawStars` composes it as four quaternion turns and hands
 * the result to `starsProjMatrix`:
 *
 *   rotateX(-pitch) · rotateZ(-angle) · rotateX(lat) · rotateY(-lng)
 *
 * gl-matrix's `quat.rotateX(out, a, rad)` POST-multiplies -- it computes
 * `a * qx(rad)` -- so the four compose left to right in that order, and
 * `mat4.fromQuat` of the product is the product of the matrices in the
 * same order. `tr.angle` is `-bearing * DEG`, so the second turn is a
 * rotation by the bearing itself.
 *
 * Only the third and fourth ever change on the hello route: pitch and
 * bearing are zero there and the latitude is fixed, so the whole of the
 * motion is the centre longitude walking east at 1.5 degrees a second.
 */
export const skyRotation = (camera: SkyCamera): Rotation =>
  times(
    times(
      times(
        aboutX(-camera.pitch * DEG),
        aboutZ(camera.bearing * DEG),
      ),
      aboutX(camera.center[1] * DEG),
    ),
    aboutY(-camera.center[0] * DEG),
  );

/* ---- what lands on screen -------------------------------------------- */

/** A star, resolved to pixels. */
export type PaintedStar = {
  x: number;
  y: number;
  /** Radius in CSS pixels. */
  r: number;
  ink: StarInk;
  /** The star's own alpha, faded by the atmosphere it sits behind. */
  alpha: number;
};

/*
 * The design says where space begins, and it is not the limb.
 *
 * content/cameras.ts states the prototype's surround as two rims over
 * flat P.space: an `accent` limb gone by 1.14 globe radii inside an
 * `accent2` halo gone by 1.34, and nothing but the space token past
 * that. So 1.34r is where the sky starts, and a star inside it would be
 * a star painted on the atmosphere.
 *
 * Read off the rims rather than written down again, so the two cannot
 * drift. The terrain routes' fog has no limb to measure from and needs
 * none: by the time a camera is on one, the globe's disc is many times
 * the viewport and the whole field is behind it.
 */
export const STAR_SPACE_EDGE = 1 + SPHERE_RIMS.haloReach;

/**
 * How much of a star survives, this far from the globe's centre in globe
 * radii: nothing at the limb, all of it past the atmosphere's reach.
 *
 * It is the mask the first version of this field cut out of the layer,
 * applied per star instead of per pixel -- which is both cheaper and
 * exact, since a star is smaller than the band it is faded across.
 */
export const starFade = (radii: number): number => {
  if (radii <= 1) return 0;
  if (radii >= STAR_SPACE_EDGE) return 1;
  return (radii - 1) / SPHERE_RIMS.haloReach;
};

/**
 * The whole field, resolved against a camera and a box.
 *
 * Pure, and the reason the canvas in scene/StarField.tsx has no
 * arithmetic in it: everything here is a number a unit test can read,
 * and everything there is a `fill()`.
 *
 * THE SKY IS CENTRED ON THE CANVAS, NOT ON THE GLOBE. `starsProjMatrix`
 * carries no padding, so the vanishing point of the star field is the
 * middle of the frame even on hello, where the globe is pushed to 66% of
 * the width. The silhouette the field is cut around is the padded one,
 * and at any pitch its centre is lower still. Those really are three
 * different points, and mapbox's own stars use the first of them.
 *
 * A null viewport is the server's and jsdom's answer, and it is treated
 * the way scene/theme.ts's fogFor treats it: the artboard.
 */
export const paintedStars = (
  view: SkyView,
  viewport: Viewport | null,
): PaintedStar[] => {
  const box = viewport ?? ARTBOARD_DESKTOP;
  const focal = focalLength(box.height);
  const limb = globeLimb(view, viewport);
  const rotation = skyRotation(view);
  const painted: PaintedStar[] = [];
  for (const star of stars) {
    const [x, y, z] = star.at;
    const ez = rotation[6] * x + rotation[7] * y + rotation[8] * z;
    // The camera looks down -Z; anything at or behind the plane is out.
    if (ez >= 0) continue;
    const ex = rotation[0] * x + rotation[1] * y + rotation[2] * z;
    const ey = rotation[3] * x + rotation[4] * y + rotation[5] * z;
    const depth = -ez;
    const at = {
      x: box.width / 2 + (focal * ex) / depth,
      y: box.height / 2 - (focal * ey) / depth,
    };
    const radius =
      (focal * MAPBOX_STAR_HALF_WIDTH * star.scale) /
      (MAPBOX_STAR_SPHERE * depth);
    if (
      at.x < -radius ||
      at.y < -radius ||
      at.x > box.width + radius ||
      at.y > box.height + radius
    ) {
      continue;
    }
    const fade = starFade(limbRadii(limb, at.x, at.y));
    if (fade <= 0) continue;
    painted.push({
      x: at.x,
      y: at.y,
      r: radius,
      ink: star.ink,
      alpha: star.alpha * fade,
    });
  }
  return painted;
};
