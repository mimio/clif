import {
  ARTBOARD_DESKTOP,
  type CameraSpec,
  type FogColor,
  type FogPreset,
  type FogSpec,
  fogPresets,
  type Viewport,
} from 'content/cameras';
import { globeLimbAngle } from 'scene/globe';
import { buildLut } from 'styles/tokens/lut';
import {
  FALLBACK_PALETTE,
  type Palette,
  readPalette,
} from 'styles/tokens/palette';
import { subscribeTheme, THEME_EVENT } from 'styles/theme-bootstrap';

/*
 * THEMING THE REAL BASEMAP
 *
 * The site has dropped its hand-maintained Mapbox style
 * (mapbox://styles/chiefkleef/..., pinned at minZoom 7, which cannot show
 * a globe) for Mapbox Standard, themed at runtime. Eight themes, one
 * style, no style JSON to maintain. It happens in three tiers, cheapest
 * last:
 *
 *   1. map.setImportColorTheme('basemap', { data: buildLut(palette) })
 *      A 3D colour LUT that re-tints every basemap fill. This is the tier
 *      that makes the globe wear the theme. It is also the expensive one:
 *      mapbox-gl reloads every tile when the colour theme changes, BY
 *      DESIGN -- the LUT is applied when tiles are coloured, so existing
 *      tiles have to be re-coloured. So it is debounced, and skipped
 *      entirely unless `palette.key` actually changed. buildLut caches
 *      nothing on purpose; `lutFor` below is that cache.
 *
 *   2. map.setConfigProperty('basemap', ...)
 *      Standard's own structural knobs: the light preset, the basemap
 *      theme, and the label toggles. No tile reload, so these can follow
 *      the camera as well as the theme.
 *
 *   3. setPaintProperty on our own layers, straight from the palette.
 *      Instant, and it lives with the layer sets in scene/layers/sets.ts.
 *
 * Tier 1 and tier 2 both key off the same palette read, so they are
 * driven from one place: the `oneglobe:theme` event, plus a
 * MutationObserver on documentElement[data-theme] because the attribute
 * is the truth even when no event fires.
 */

/*
 * THE IMPORT EVERY ONE OF THOSE THREE TIERS HAS TO NAME, AND WHY.
 *
 * `mapbox://styles/mapbox/standard` is not a flat stylesheet. What the
 * API serves is a thin root style whose whole content is one import --
 * `{ id: 'basemap', url: ... }` -- and every layer the globe is made of
 * lives inside that fragment, in its own scope. That is why Standard's
 * knobs are addressed as setConfigProperty('basemap', ...) rather than
 * as plain style properties.
 *
 * The colour theme has the same shape and it is much easier to get
 * wrong, because the wrong call SUCCEEDS. In mapbox-gl 3.30:
 *
 *   map.setColorTheme(theme)
 *     -> Style.setColorTheme, on the ROOT style. It stores the theme,
 *        decodes the LUT, and then hands it to `this._layers` -- the
 *        root style's own layers, which on Standard is only what WE
 *        added. Painting reads style.getLut(layer.scope), and the
 *        basemap's layers are in scope 'basemap', which still has no
 *        LUT. No error, no warning, no event: the LUT is accepted, the
 *        debug handle reports it, mapbox's own decode check passes, and
 *        the globe keeps every colour Mapbox shipped it with.
 *
 *   map.setImportColorTheme('basemap', theme)
 *     -> Style.setImportColorTheme, which resolves the fragment and sets
 *        the theme ON IT. Its layers get the LUT and its tiles are
 *        cleared, so the basemap is re-coloured. This is the call that
 *        makes the globe wear the theme.
 *
 * That is the whole of the bug this constant exists to stop coming back:
 * every tier of this file addresses the fragment by name, and
 * scene/mapbox/instance.ts checks at style.load that the fragment is
 * really there -- because a style without it cannot be themed at all,
 * and used to say nothing about it.
 */
export const BASEMAP_IMPORT = 'basemap';

/**
 * The config key the scene probes to find out whether the configured
 * style is Standard-shaped.
 *
 * getConfigProperty(BASEMAP_IMPORT, key) resolves the fragment and then
 * its schema, so a non-null answer means both exist -- which is exactly
 * the precondition setImportColorTheme and setConfigProperty share. It
 * is a member of BasemapConfig so a rename cannot leave it behind.
 */
export const BASEMAP_PROBE_KEY: keyof BasemapConfig = 'lightPreset';

/** Standard's sun position presets. */
export type LightPreset = 'dawn' | 'day' | 'dusk' | 'night';

/** Standard's basemap treatments. */
export type BasemapTheme = 'default' | 'faded' | 'monochrome';

export type BasemapConfig = {
  lightPreset: LightPreset;
  theme: BasemapTheme;
  showRoadLabels: boolean;
  showPlaceLabels: boolean;
  showPointOfInterestLabels: boolean;
  showTransitLabels: boolean;
  show3dObjects: boolean;
};

/**
 * The layers card's "no roads or labels below z8", which is now a
 * property of the scene's OWN label layers rather than of Standard's.
 *
 * It used to be applied as a zoom test on the ROUTE's declared zoom,
 * feeding showPlaceLabels/showRoadLabels. Two things were wrong with
 * that and only one of them was the labels themselves: the route's zoom
 * is not the camera's, so scrolling into a city on an interactive route
 * never crossed the threshold, and scrolling away from one never left
 * it. As a layer `minzoom` it is evaluated against the LIVE zoom, every
 * frame, by mapbox -- and it also means the second vector source pays
 * nothing above the globe, because Style._updateSources marks a source
 * unused when every layer that reads it is hidden by its zoom range.
 */
export const LABEL_MIN_ZOOM = 8;

/**
 * Where the scene starts naming neighbourhoods as well as towns. Two
 * zoom steps past the first label, so a city arrives before its
 * districts do rather than with them.
 */
export const LOCALITY_MIN_ZOOM = LABEL_MIN_ZOOM + 2;

/*
 * The fog presets are the design's three moods, and Standard's light
 * preset is the closest structural equivalent -- it moves the sun, which
 * is what actually decides whether the basemap reads as space, dusk or
 * night. Deep space is the world-zoom globe, so it takes the lowest sun
 * that still lights a limb (dawn) rather than full night, which would
 * leave the globe unlit under the LUT.
 *
 * Light themes (paper, chalk) lift every preset one step: their ground is
 * bright, and a night basemap under a light LUT is the "dark mass" that
 * palette.sh exists to avoid.
 */
const LIGHT_PRESETS: Record<
  FogPreset,
  { dark: LightPreset; light: LightPreset }
> = {
  space: { dark: 'dawn', light: 'day' },
  dusk: { dark: 'dusk', light: 'day' },
  night: { dark: 'night', light: 'dusk' },
};

/*
 * STANDARD DRAWS NO TEXT AT ALL, AND THAT IS NOT A PREFERENCE.
 *
 * The site shipped with showPlaceLabels and showRoadLabels on above z8,
 * and the two routes that sit above z8 -- /about at 10.5 and a project
 * detail at 10 -- both carry the `night` fog. On the two light themes
 * that resolved to Standard's `dusk` preset, whose labels are white
 * because it is drawn for a dark basemap, and the owner saw "a TON of
 * text coming through as just white".
 *
 * The obvious repair is to lift the preset so Standard picks a dark
 * label instead. It does not work, and the reason is our own tier 1.
 *
 * mapbox-gl applies an import's colour theme to a symbol layer's TEXT
 * exactly as it does to a fill: SymbolBucket.createArrays hands the
 * bucket's lut to the text binder, and the bucket's lut is
 * style.getLut(scope) for the source's scope, which for everything
 * inside Standard is `basemap`. So Standard's label colour is an INPUT
 * to styles/tokens/lut.ts's ramp, not an output, and the ramp is a tone
 * compressor: every source luma from the floor up is mapped onto
 * deep -> land -> highlight. Measured on the shipped palettes, that span
 * is about 1.4:1 end to end on a light theme. White labels come out at
 * 1.21:1 against the land beside them on paper, 1.15:1 on chalk; dark
 * labels come out at 1.36:1 and 1.38:1. Neither is legible, and no
 * lightPreset moves either, because both ends of the source range land
 * in the same place.
 *
 * Nor can the colour be set directly. setPaintProperty resolves its
 * layer through Style._checkLayer -> getOwnLayer -> this._layers, the
 * ROOT style's own layers, so a layer inside the basemap fragment is not
 * addressable at all.
 *
 * So the toggles are off -- all four of them, at every zoom -- and the
 * scene names places itself, in mono, from its own symbol layers in the
 * root scope, where there is no LUT and a palette token arrives
 * unchanged. scene/layers/sets.ts's `basemapLabelsSet` is that, and
 * LABEL_MIN_ZOOM above is where it starts.
 *
 * WHAT WAS DELIBERATELY NOT CHANGED. The light-preset table and `faded`
 * are both untouched. They were the suspects, and they are not the
 * cause: with no basemap text left, the preset only moves the sun on
 * fills that the LUT re-colours anyway, and the owner's report is that
 * the basemap colouring already reads correctly. Changing either would
 * be changing the one part of this that is working.
 */

/**
 * Tier 2, as data. `faded` on a light theme pulls Standard's own colour
 * back so the LUT's wash is what the eye reads; on a dark theme the LUT
 * has enough contrast to work against the default.
 */
export const basemapConfig = (
  fog: FogPreset,
  light: boolean,
): BasemapConfig => {
  const preset = LIGHT_PRESETS[fog];
  return {
    lightPreset: light ? preset.light : preset.dark,
    theme: light ? 'faded' : 'default',
    showRoadLabels: false,
    showPlaceLabels: false,
    showPointOfInterestLabels: false,
    showTransitLabels: false,
    show3dObjects: false,
  };
};

/**
 * Only the properties that actually changed. setConfigProperty is cheap
 * but not free, and it runs on every camera move because the label
 * toggles are zoom-derived.
 */
export const configChanges = (
  next: BasemapConfig,
  previous: BasemapConfig | null,
): [keyof BasemapConfig, BasemapConfig[keyof BasemapConfig]][] =>
  (Object.keys(next) as (keyof BasemapConfig)[])
    .filter((key) => previous === null || previous[key] !== next[key])
    .map((key) => [key, next[key]]);

/* ---- tier 1: the LUT ------------------------------------------------- */

let cachedKey: string | null = null;
let cachedLut = '';

/**
 * The colour LUT for a palette, built once per theme. `palette.key` is
 * exactly the value that changes when the theme does, which is why
 * buildLut deliberately does no caching of its own.
 */
export const lutFor = (palette: Palette): string => {
  if (palette.key !== cachedKey) {
    cachedLut = buildLut(palette);
    cachedKey = palette.key;
  }
  return cachedLut;
};

/** Test-only: drops the memoised LUT so a fresh one is built. */
export const resetLutCacheForTests = (): void => {
  cachedKey = null;
  cachedLut = '';
};

/** The live token scope, or the yellow fallback when there is no DOM. */
export const livePalette = (): Palette =>
  typeof document === 'undefined' ? FALLBACK_PALETTE : readPalette();

/* ---- watching for a theme change -------------------------------------
 *
 * The event name and the subscription are ONE definition, in
 * styles/theme-bootstrap.ts, which already owns theme identity and which
 * every layer may import. They are re-exported here so the scene still has
 * a single theme module, but there is nothing to keep in step: this is the
 * same binding the theme lens dispatches through.
 */
export { subscribeTheme, THEME_EVENT };

/** Long enough to swallow a burst of lens clicks, short enough to feel
 *  immediate. A repaint costs every visible tile. */
export const THEME_DEBOUNCE_MS = 120;

export type ThemePaint = (palette: Palette, lut: string) => void;

export type ThemePainter = {
  /** Schedules a repaint; repeated calls inside the window coalesce. */
  request: () => void;
  /** Runs a pending repaint now. Used for the first paint. */
  flush: () => void;
  /** Drops a pending repaint, for effect teardown. */
  cancel: () => void;
};

/**
 * The one thing standing between the theme lens and a full tile reload
 * per click. It coalesces, and it refuses to repaint when the palette
 * key is unchanged -- so a MutationObserver firing for an unrelated
 * attribute write, or the same theme being re-applied, costs nothing.
 *
 * The camera holds through all of this: a theme change is the one scene
 * change with no camera move.
 */
export const createThemePainter = (
  paint: ThemePaint,
  delay: number = THEME_DEBOUNCE_MS,
): ThemePainter => {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let lastKey: string | null = null;

  const run = (): void => {
    timer = null;
    const palette = livePalette();
    if (palette.key === lastKey) return;
    lastKey = palette.key;
    paint(palette, lutFor(palette));
  };

  return {
    request: () => {
      if (timer === null) timer = setTimeout(run, delay);
    },
    flush: () => {
      if (timer === null) return;
      clearTimeout(timer);
      run();
    },
    cancel: () => {
      if (timer === null) return;
      clearTimeout(timer);
      timer = null;
    },
  };
};

/* ---- the fog, and the design it comes from ---------------------------
 *
 * THE DESIGN
 *
 * content/cameras.ts's fogPresets carry the prototype's own numbers: a
 * tight `accent` limb, alpha 0.2 at the limb and gone 0.14 radii out, and
 * a wide `accent2` halo, alpha 0.13 and gone at 0.34 radii, over P.space.
 * The prototype composites them in that order -- halo first, limb over
 * it -- so at the limb itself a pixel is
 *
 *   0.696 * space  +  0.104 * accent2  +  0.2 * accent
 *
 * (0.104 rather than 0.13 because the accent rim covers 20% of the halo).
 *
 *
 * WHAT MAPBOX ACTUALLY PAINTS
 *
 * Read off mapbox-gl 3.30 rather than the docs, which this sandbox cannot
 * reach: `atmosphereFrag` in dist/mapbox-gl-dev.js, plus
 * `drawAtmosphereGlow`. Outside the sphere the shader computes
 *
 *   theta          the angle between the view ray and the globe's centre
 *   u_horizon_angle  asin(R / D) -- the sphere's ANGULAR radius, i.e. the
 *                  limb
 *   t = exp(-(theta - u_horizon_angle) / (PI * u_fadeout_range))
 *
 * and then, with a0 = `color`'s alpha and a1 = `high-color`'s,
 *
 *   c0 = mix(space-color, high-color, a1)
 *   c1 = mix(c0, color, a0)
 *   c2 = mix(c0, c1, t)          out = vec4(c2 * t, t), blended premultiplied
 *
 * which multiplies out, over a background that is `space-color`, to
 *
 *   space-color * (1 - w_color - w_high)
 *     + high-color * w_high  + color * w_color
 *   w_color = a0 * t^2        w_high = a1 * t * (1 - a0 * t)
 *
 * `u_fadeout_range` is the AUTHORED horizon-blend remapped by
 * `mapValue(hb, 0, 1, 5e-4, 0.25)`.
 *
 *
 * THE MAPPING, AND WHERE IT IS EXACT
 *
 * Mapbox's two colour stops nest exactly the way the prototype's two rims
 * do -- `high-color` under `color`, over `space-color`, just as accent2
 * sits under accent over space. So the colours map straight across:
 *
 *   color        <- accent    (the tight rim)
 *   high-color   <- accent2   (the wide halo)
 *   space-color  <- space     (what the prototype paints past 1.34r)
 *
 * and at the limb, where t = 1, the alphas map EXACTLY:
 *
 *   w_color = a0 = 0.2                  = the design's accent alpha
 *   w_high  = a1 * (1 - a0) = 0.13*0.8  = 0.104 = the design's accent2
 *
 * So `color` at alpha 0.2 and `high-color` at alpha 0.13 reproduce the
 * design's limb pixel to the last decimal, on every theme, with no fitting
 * involved. That is the half of this that is a derivation.
 *
 *
 * WHERE IT CANNOT BE EXACT, SAID PLAINLY
 *
 * The design's two rims have TWO DIFFERENT REACHES -- 0.14r and 0.34r --
 * and two different exponents. Mapbox has ONE falloff, `t`, and both
 * colour weights are functions of it: w_color = a0 t^2 and
 * w_high = a1 t (1 - a0 t). One scalar cannot carry two ranges, and an
 * exponential has no end at all where the prototype has a hard one at
 * 1.34r. Mapbox's fog is a physical atmosphere, not two rings, and it
 * will not be made into two rings.
 *
 * So the reach is FITTED, and the criterion is the one the complaint is
 * about -- how much light comes out from behind the globe. horizonBlendFor
 * solves for the horizon-blend whose glow integrates, over the annulus
 * and area-weighted, to the same total as the design's two rims. Nothing
 * here is chosen by eye.
 *
 * What that costs, in colour weight at the hello frame (1440x900):
 *
 *   dd     design acc / acc2      mapbox acc / acc2
 *   1.00   0.2000 / 0.1040        0.2000 / 0.1040   <- exact
 *   1.05   0.0827 / 0.0840        0.0732 / 0.0691
 *   1.10   0.0163 / 0.0594        0.0270 / 0.0443
 *   1.20   0.0000 / 0.0185        0.0038 / 0.0174
 *   1.34   0.0000 / 0.0000        0.0003 / 0.0046   <- design has stopped
 *   1.50   0.0000 / 0.0000        0.0000 / 0.0010
 *
 * Per rim the fit is loose in the middle -- at 1.10r mapbox puts 1.7x the
 * design's accent and 0.75x its accent2 -- because one falloff cannot be
 * tight and wide at once. COMBINED, which is what the eye reads, it is
 * within 15% of the design everywhere inside 1.2r: 0.304/0.304 at the
 * limb, 0.167/0.142 at 1.05r, 0.076/0.071 at 1.10r, 0.019/0.021 at 1.20r.
 * Past the design's hard edge mapbox leaves a tail of about 0.005, one
 * 8-bit level of the accent against the ground, and the glow is
 * effectively over by 1.36r against the design's 1.27r (both measured at
 * the level where the weight drops under 1/255).
 *
 *
 * WHY IT IS SOLVED PER CAMERA RATHER THAN BEING A CONSTANT
 *
 * `t` decays with an ANGLE and the design states its reach in globe
 * RADII, so the conversion runs through the sphere's angular radius --
 * which is a function of the zoom and the viewport height. A constant
 * horizon-blend therefore means a different halo on every frame. Measured
 * at the level where the glow drops under one 8-bit step of the accent,
 * the shipped 0.04 ran to 1.50r on 1a's desktop hello, 1.74r on the 404's
 * smaller globe, 1.85r on 1f's mobile hello and 2.35r on the mobile 404 --
 * against a design that says 1.34r everywhere. Solved per camera it is
 * 1.36r at all four. That spread is exactly what "much less light behind
 * the globe" looks like on a phone, and solving is what removes it rather
 * than moving it.
 */

/** mapbox remaps the authored horizon-blend onto this range. */
const FADEOUT_MIN = 5e-4;
const FADEOUT_MAX = 0.25;

/** `u_fadeout_range`, from an authored horizon-blend. */
export const fadeoutRange = (horizonBlend: number): number =>
  FADEOUT_MIN + horizonBlend * (FADEOUT_MAX - FADEOUT_MIN);

/** One of the prototype's rims at `dd`, in globe radii from the centre. */
const rim = (
  peak: number,
  reach: number,
  falloff: number,
  dd: number,
): number =>
  dd < 1 + reach ? peak * Math.pow(1 - (dd - 1) / reach, falloff) : 0;

/**
 * Simpson over [1, hi] of `weight(dd) * dd` -- the annulus area weight,
 * so a ring far out counts for the extra ground it covers. The constant
 * 2 * PI is common to both sides of the fit and is left out.
 */
const STEPS = 512;

const light = (
  weight: (dd: number) => number,
  hi: number,
): number => {
  const h = (hi - 1) / STEPS;
  let sum = weight(1) * 1 + weight(hi) * hi;
  for (let i = 1; i < STEPS; i += 1) {
    const dd = 1 + i * h;
    sum += (i % 2 === 0 ? 2 : 4) * weight(dd) * dd;
  }
  return (sum * h) / 3;
};

/**
 * How far out the fit integrates mapbox's side.
 *
 * The exponential has no end, so one has to be chosen. Six design reaches
 * is far enough that the remaining tail is below 1e-6 of the total at
 * every camera in the table -- test/scene-theme.test.ts pins that -- and
 * near enough that the integral keeps its precision.
 */
const FIT_REACH = 6;

/** Bisection bounds. mapbox clamps horizon-blend to [0, 1] itself. */
const BLEND_LO = 1e-6;
const BLEND_HI = 1;
const BISECTIONS = 60;

/**
 * The horizon-blend whose atmosphere emits as much light as the design's
 * two rims, for a globe of this angular radius.
 *
 * Monotonic in the blend -- a wider fadeout can only add light at every
 * radius -- so a bisection is exact to the bit in 60 steps.
 */
const solve = (fog: FogSpec, limbAngle: number): number => {
  if (fog.glow.at === 'horizon') return fog.glow.horizonBlend;
  const glow = fog.glow;

  const designed = light((dd) => {
    const a = rim(
      fog.color.alpha,
      glow.limbReach,
      glow.limbFalloff,
      dd,
    );
    const a2 = rim(
      fog.highColor.alpha,
      glow.haloReach,
      glow.haloFalloff,
      dd,
    );
    // The prototype lays the halo down first and the limb over it.
    return a + a2 * (1 - a);
  }, 1 + glow.haloReach);

  const tanLimb = Math.tan(limbAngle);
  const painted = (blend: number): number =>
    light(
      (dd) => {
        const t = Math.exp(
          -(Math.atan(tanLimb * dd) - limbAngle) /
            (Math.PI * fadeoutRange(blend)),
        );
        return (
          fog.color.alpha * t * t +
          fog.highColor.alpha * t * (1 - fog.color.alpha * t)
        );
      },
      1 + glow.haloReach * FIT_REACH,
    );

  let lo = BLEND_LO;
  let hi = BLEND_HI;
  for (let i = 0; i < BISECTIONS; i += 1) {
    const mid = (lo + hi) / 2;
    if (painted(mid) > designed) hi = mid;
    else lo = mid;
  }
  return (lo + hi) / 2;
};

/*
 * One slot, like lutFor's.
 *
 * The solve is about thirty thousand exp() calls and this is a render
 * path: SceneRoot re-applies the fog on every scene pass, including the
 * ones that are only a repaint or a hover. The answer is a pure function
 * of the preset and the angle, and both hold still for the whole of a
 * route, so remembering the last one is enough -- a route change or a
 * resize misses once and then hits for ever. A Map keyed on the viewport
 * would only accumulate window sizes nobody is looking at any more.
 */
let lastFog: FogSpec | null = null;
let lastLimb = Number.NaN;
let lastBlend = 0;

export const horizonBlendFor = (
  fog: FogSpec,
  limbAngle: number,
): number => {
  if (fog !== lastFog || limbAngle !== lastLimb) {
    lastFog = fog;
    lastLimb = limbAngle;
    lastBlend = solve(fog, limbAngle);
  }
  return lastBlend;
};

/** A fog colour, resolved against the live palette. */
const ink = (palette: Palette, color: FogColor): string => {
  const rgb =
    color.ink === 'accent'
      ? palette.accent
      : color.ink === 'accent2'
        ? palette.accent2
        : palette.space;
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${color.alpha})`;
};

/** Exactly the shape map.setFog takes, so nothing is assembled twice. */
export type FogOptions = {
  range: [number, number];
  color: string;
  'high-color': string;
  'space-color': string;
  'horizon-blend': number;
  'star-intensity': number;
};

/**
 * Stars would be noise over a bright ground, so light themes get none.
 * The figure is unchanged from the first version of the scene.
 */
const STAR_INTENSITY = 0.15;

/**
 * The fog this camera wants, in this theme.
 *
 * A null viewport is the server's and jsdom's answer, and it is treated
 * the way scene/camera.ts's frameCamera treats it: the artboard. The
 * camera that ships without a box to measure is 1a's, so the atmosphere
 * that ships with it is 1a's too.
 */
export const fogFor = (
  spec: CameraSpec,
  palette: Palette,
  viewport: Viewport | null,
): FogOptions => {
  const fog = fogPresets[spec.fog];
  const height =
    viewport === null ? ARTBOARD_DESKTOP.height : viewport.height;
  return {
    range: fog.range,
    // Palette tokens at the design's peak alphas. On the globe that is
    // the tight `accent` rim inside the wide `accent2` halo, in the
    // prototype's own order; on the terrain routes the roles differ, so
    // the preset names the token rather than this function assuming it.
    color: ink(palette, fog.color),
    'high-color': ink(palette, fog.highColor),
    // What the prototype paints past 1.34r: P.space, exactly. It used to
    // be the ground shaded to 0.9, which drew the space behind the globe
    // three levels darker than the page it sits on.
    'space-color': `rgb(${palette.space[0]}, ${palette.space[1]}, ${palette.space[2]})`,
    'horizon-blend': horizonBlendFor(
      fog,
      globeLimbAngle(spec.zoom, height),
    ),
    'star-intensity': palette.light ? 0 : STAR_INTENSITY,
  };
};
