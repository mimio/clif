import {
  ARTBOARD_DESKTOP,
  SPHERE_RIMS,
  type Viewport,
} from 'content/cameras';
import {
  focalLength,
  type GlobeDisc,
  globeDisc,
  type GlobeGeometry,
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
 *
 * WHAT MAPBOX'S STARS ACTUALLY ARE, because "bigger than the biggest"
 * is a claim about a number and the number is not documented anywhere.
 * Read off mapbox-gl 3.30's own bundle (`Atmosphere.update` and
 * `starsVert`/`starsFrag`):
 *
 *   count     16,000, uniform on a sphere of radius 200 about the camera
 *   size      `1 + 0.01 * sizeRange * (rand - 0.5)` with sizeRange 100,
 *             so 0.5 to 1.5, times a sizeMultiplier of 0.15
 *   opacity   `1 + 0.01 * intensityRange * (rand - 0.5)` with
 *             intensityRange 200, so 0 to 2, times star-intensity
 *   colour    vec3(1.0, 1.0, 1.0). White, and only white.
 *   shape     a camera-facing quad, solid to 60% of its half-width and
 *             linear to nothing at the rim
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
 *
 * WHY THEY DO NOT MOVE. mapbox's stars are on a celestial sphere
 * oriented by the camera's own centre, so the hello route's rotation
 * carries them across the sky once every four minutes. These do not
 * follow, and that is a choice rather than an omission: the prototype's
 * `paintSphere()` paints flat P.space and no stars at all, so this field
 * is authored rather than simulated, and an authored one belongs to the
 * composition -- fixed in the frame, like the type in the column it
 * sits behind. They do not twinkle either. Artboard 1e's yellow budget
 * allows one live thing per view and it is never the background.
 */

/** Where in the palette a star takes its colour. */
export type StarInk = 'accent' | 'accent2';

export type Star = {
  /** Where it sits, as a fraction of the viewport's width and height. */
  at: [number, number];
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

/**
 * The diameter of mapbox's LARGEST star, in CSS pixels, in a viewport
 * this tall: 3.04px at the artboard's 900.
 *
 * It is a diameter and not a radius because that is the number a reader
 * can check against a screenshot. Note that mapbox fades its quad over
 * the outer 40% of that width, so a solid circle of the same diameter
 * reads slightly larger than the star it is being compared with -- this
 * function is the conservative side of the comparison, not the generous
 * one.
 */
export const mapboxStarDiameter = (height: number): number =>
  (2 *
    focalLength(height) *
    MAPBOX_STAR_MULTIPLIER *
    MAPBOX_STAR_SIZE_MAX) /
  MAPBOX_STAR_SPHERE;

/* ---- ours ------------------------------------------------------------ */

/*
 * A jittered grid, not a uniform scatter.
 *
 * Sixteen columns and ten rows divide the artboard into cells of exactly
 * 90 by 90 CSS pixels -- 1440/16 and 900/10 -- and each cell holds one
 * star placed at random inside it. Uniform sampling over the whole field
 * would be the obvious thing and is worse at this count: it clumps, and
 * a clump of accent reads as a mark on the screen rather than as sky.
 * Stratifying removes the clumps without introducing a lattice, because
 * the jitter inside each cell is a full cell wide.
 *
 * The count follows from the grid rather than the other way round. 160
 * over the artboard is one accent star per 8,100 square pixels, against
 * the roughly 900 of mapbox's own that land in the same frame.
 */
export const STAR_COLUMNS = 16;
export const STAR_ROWS = 10;
export const STAR_COUNT = STAR_COLUMNS * STAR_ROWS;

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
 * is small and the large ones are rare -- with the seed above, 37 of the
 * 160 are wider than anything mapbox draws, and the widest is 1.68x its
 * largest: 5.12px against 3.04px at the artboard height.
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
 * mulberry32, the generator mapbox seeds its own field with. Four draws
 * per star: two for the position inside its cell, one for the size and
 * brightness it shares, one for the ink.
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
 * The field, built once.
 *
 * It is a module constant rather than a hook or a memo because it is a
 * constant: nothing about a star depends on the viewport, the palette or
 * the camera. Those three decide how big it is drawn, what colour it is
 * drawn in and whether it is drawn at all, and all three are applied at
 * paint time by the functions below.
 */
export const stars: Star[] = (() => {
  const random = mulberry32(STAR_SEED);
  const field: Star[] = [];
  for (let row = 0; row < STAR_ROWS; row += 1) {
    for (let column = 0; column < STAR_COLUMNS; column += 1) {
      const at: [number, number] = [
        (column + random()) / STAR_COLUMNS,
        (row + random()) / STAR_ROWS,
      ];
      const t = random() ** STAR_SIZE_FALLOFF;
      field.push({
        at,
        scale: STAR_MIN_SCALE + (STAR_MAX_SCALE - STAR_MIN_SCALE) * t,
        ink: random() < STAR_ACCENT_SHARE ? 'accent' : 'accent2',
        alpha: STAR_ALPHA_MIN + (STAR_ALPHA_MAX - STAR_ALPHA_MIN) * t,
      });
    }
  }
  return field;
})();

/**
 * A star's radius in CSS pixels, in a viewport this tall.
 *
 * A null viewport is the server's and jsdom's answer, and it is treated
 * the way scene/theme.ts's fogFor treats it: the artboard.
 */
export const starRadius = (
  star: Star,
  viewport: Viewport | null,
): number => {
  const height =
    viewport === null ? ARTBOARD_DESKTOP.height : viewport.height;
  return (star.scale * mapboxStarDiameter(height)) / 2;
};

/** A star's colour, resolved against the live palette. */
export const starInk = (palette: Palette, star: Star): string =>
  star.ink === 'accent'
    ? palette.a(star.alpha)
    : palette.b(star.alpha);

/* ---- where the sky is ------------------------------------------------ */

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
 * The disc the field is cut out of: the globe grown to the design's own
 * atmosphere reach.
 *
 * It is the whole of the field's relationship with the globe. A star
 * beyond this circle is sky and is drawn at full strength; one inside it
 * is behind the planet or behind its glow, and scene/StarField.tsx fades
 * the field to nothing across the band between the limb and this edge
 * rather than cutting it at either.
 */
export const starSpace = (
  geometry: GlobeGeometry,
  viewport: Viewport | null,
): GlobeDisc => {
  const disc = globeDisc(geometry, viewport);
  return { ...disc, r: STAR_SPACE_EDGE * disc.r };
};
