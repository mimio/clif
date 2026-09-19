/*
 * The token scope, as numbers.
 *
 * Canvas and Mapbox paint per pixel, so they cannot use var(): they read
 * the live token scope off the document once and mix the numbers
 * themselves (design inventory 6.5). Everything painted outside CSS --
 * the globe, the terrain, the basemap's own cartography in
 * ./cartography.ts -- starts here.
 *
 * Fifteen tokens, and one derived flag that changes how all of them are
 * shaded. The rest of the design system stays in CSS.
 */

export type Rgb = readonly [number, number, number];

/** Index into an Rgb. `sh` needs it to reach the matching ground channel. */
export type Channel = 0 | 1 | 2;

/** The fifteen tokens read off the element. */
export type PaletteColors = {
  accent: Rgb;
  accent2: Rgb;
  /** --surface-ground: the page behind the scene, and the light/dark tell. */
  space: Rgb;
  land: Rgb;
  deep: Rgb;
  body: Rgb;
  /** The ground-aware accent for 9-11px type, not the accent itself. */
  accentSmall: Rgb;
  sub: Rgb;
  muted: Rgb;
  /*
   * THE CARTOGRAPHY. Six surfaces, each one a colour the basemap is
   * actually painted in rather than a colour it is graded toward.
   *
   * They arrived with the colour theme: Mapbox Standard names every
   * feature class as a config key, so `land` above stopped being the
   * middle anchor of a tone ramp and became literally what the ground
   * is painted, and these six joined it. styles/tokens/cartography.ts
   * maps each one onto the keys it drives.
   */
  water: Rgb;
  green: Rgb;
  building: Rgb;
  road: Rgb;
  roadMajor: Rgb;
  boundary: Rgb;
};

export type Palette = PaletteColors & {
  /** The ground is brighter than mid grey: paper and chalk. */
  light: boolean;
  /** Contour blend strength. Contours are drawn stronger on light themes. */
  ink: number;
  /** rgba() of the accent at `alpha`. */
  a: (alpha: number) => string;
  /** rgba() of the second colour at `alpha`. */
  b: (alpha: number) => string;
  /**
   * Shade a single channel by `k`.
   *
   * Dark themes shade by multiplying toward black. Light themes must wash
   * toward the ground instead, or the globe reads as a dark mass and the
   * contours vanish -- so on a light theme this is a 90%-weighted lerp
   * toward the ground and any k >= 1 is a no-op.
   */
  sh: (value: number, channel: Channel, k: number) => number;
  accentInk: string;
  bodyInk: string;
  subInk: string;
  mutedInk: string;
  /**
   * The repaint cache key: every colour in the palette, in PALETTE_KEYS
   * order. Two palettes share a key if and only if all fifteen tokens
   * match, so a consumer that skips work while the key holds -- the
   * scene's still canvases, and the config diff in scene/theme.ts --
   * cannot miss a change.
   *
   * Design inventory 6.5 keys on accent|space|land alone. That is three
   * of fifteen, and it is now the difference between a theme switch that
   * repaints the cartography and one that does not: two themes differing
   * only in --map-water would have shared a key, and the basemap would
   * have kept the previous theme's ocean. Derived from PALETTE_KEYS
   * rather than listed, so a token added to PALETTE_TOKENS joins the key
   * without anyone remembering to widen it.
   */
  key: string;
};

/** The CSS custom property behind each colour. */
export const PALETTE_TOKENS: Record<keyof PaletteColors, string> = {
  accent: '--clif-accent',
  accent2: '--clif-accent-2',
  space: '--surface-ground',
  land: '--map-land',
  deep: '--map-deep',
  body: '--text-body',
  accentSmall: '--text-accent-small',
  sub: '--text-secondary',
  muted: '--text-muted',
  water: '--map-water',
  green: '--map-green',
  building: '--map-building',
  road: '--map-road',
  roadMajor: '--map-road-major',
  boundary: '--map-boundary',
};

/**
 * The colours, in a fixed order. The cache key is built from this, so a
 * token added to PALETTE_TOKENS joins the key without anyone remembering
 * to widen it.
 */
export const PALETTE_KEYS = Object.keys(
  PALETTE_TOKENS,
) as (keyof PaletteColors)[];

/**
 * #rgb, #rrggbb, or any rgb()/rgba() form -- the first three numbers win,
 * so `rgb(255 229 32 / 0.6)` parses the same as `rgba(255,229,32,0.6)`.
 * Anything else falls back.
 */
export const parseRgb = (value: string, fallback: Rgb): Rgb => {
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(
    String(value).trim(),
  );
  if (hex) {
    const digits = hex[1];
    const full =
      digits.length === 3
        ? digits
            .split('')
            .map((c) => c + c)
            .join('')
        : digits;
    const n = parseInt(full, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const parts = String(value).match(/-?[\d.]+/g);
  return parts && parts.length >= 3
    ? [Number(parts[0]), Number(parts[1]), Number(parts[2])]
    : fallback;
};

const rgb = (c: Rgb): string => `rgb(${c[0]}, ${c[1]}, ${c[2]})`;

const rgba = (c: Rgb, alpha: number): string =>
  `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${alpha})`;

/**
 * Luma (Y'), 0-1: the Rec. 709 coefficients applied to GAMMA-ENCODED
 * sRGB, straight off the token, with no linearisation.
 *
 * It is named `luma` and not `luminance` on purpose. The coefficients
 * belong to relative luminance, but relative luminance linearises first
 * and this does not, and the gap is not academic: mid grey is 0.502 here
 * and 0.216 as relative luminance. Do not "correct" this.
 *
 *   - `light` splits on > 0.5, which is the mid-grey split on THIS scale.
 *     Under relative luminance 0.5 is nowhere near the middle.
 *   - lut.ts calibrates SOURCE_FLOOR and LAND_STOP against Mapbox
 *     Standard's palette measured on this scale. Linearise and Standard's
 *     water drops from 0.762 to 0.551, under the floor, so every water
 *     pixel pins to the bottom anchor, the land beige falls off its stop,
 *     and the share of the cube at the floor goes from 66.3% to 86.2%.
 *     The basemap goes flat and the water disappears.
 *
 * Gamma-encoded is the right space for the job: this is picking
 * perceptual tone steps out of an 8-bit palette, not adding light.
 * test/styles-tokens.test.ts pins the mid-grey value, so the two spaces
 * cannot be swapped silently.
 */
export const luma = (c: Rgb): number =>
  (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255;

/**
 * Relative luminance, 0-1, as WCAG 2 defines it: each channel LINEARISED
 * out of sRGB first, then the same Rec. 709 weights.
 *
 * This is the other half of the pair the note above warns about, and the
 * two are not interchangeable in either direction. `luma` picks
 * perceptual tone steps out of an 8-bit palette and has to stay
 * gamma-encoded; this one feeds `contrastRatio`, which is defined on
 * linear light and means nothing without it. Mid grey is 0.502 there and
 * 0.216 here.
 *
 * Nothing but contrast should call this.
 */
export const relativeLuminance = (c: Rgb): number => {
  const channel = (value: number): number => {
    const s = value / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return (
    0.2126 * channel(c[0]) +
    0.7152 * channel(c[1]) +
    0.0722 * channel(c[2])
  );
};

/**
 * The WCAG 2 contrast ratio between two colours: 1 when they match, 21
 * for black on white. Order does not matter.
 *
 * THE MAP NEEDED THIS AND THE PAGE DID NOT.
 *
 * The design's contrast guarantee is stated and measured against the
 * GROUND -- body ink, secondary ink and small accent text all sit on
 * --surface-ground, so the ladder in themes.css was derived once per
 * theme against one background. Map type does not sit there. It sits on
 * land, water and terrain, which are the colour theme's OUTPUT and not a
 * token at all, so nothing in the token layer could have measured it.
 * styles/tokens/lut.ts's `basemapColor` is what those surfaces actually
 * are, and this is what turns the pair into a number.
 */
export const contrastRatio = (a: Rgb, b: Rgb): number => {
  const first = relativeLuminance(a);
  const second = relativeLuminance(b);
  return (
    (Math.max(first, second) + 0.05) /
    (Math.min(first, second) + 0.05)
  );
};

/** Wraps the fifteen numbers in everything derived from them. */
export const makePalette = (colors: PaletteColors): Palette => {
  const { accent, accent2, space, body, sub, muted, accentSmall } =
    colors;
  const light = luma(space) > 0.5;
  return {
    ...colors,
    light,
    ink: light ? 0.34 : 0.15,
    a: (alpha) => rgba(accent, alpha),
    b: (alpha) => rgba(accent2, alpha),
    sh: (value, channel, k) =>
      light
        ? k >= 1
          ? value
          : value + (space[channel] - value) * (1 - k) * 0.9
        : value * k,
    accentInk: rgb(accentSmall),
    bodyInk: rgb(body),
    subInk: rgb(sub),
    mutedInk: rgb(muted),
    key: PALETTE_KEYS.map((name) => colors[name].join()).join('|'),
  };
};

/*
 * The yellow theme, for server rendering and for the moment before the
 * stylesheet resolves. These are the :root values in ./themes.css, and
 * test/styles-tokens.test.ts reads that file and asserts every number
 * still matches -- drift is a test failure, not a scene that quietly
 * paints last month's palette.
 *
 * Note --text-secondary and --text-muted are both rgb(193, 193, 193):
 * themes.css collapsed the two steps that colors.css used to separate,
 * and themes.css is what ships.
 */
export const FALLBACK_PALETTE: Palette = makePalette({
  accent: [255, 229, 32],
  accent2: [255, 138, 43],
  space: [22, 22, 22],
  land: [89, 75, 64],
  deep: [53, 46, 39],
  body: [235, 235, 235],
  accentSmall: [255, 229, 32],
  sub: [193, 193, 193],
  muted: [193, 193, 193],
  water: [57, 55, 34],
  green: [81, 64, 49],
  building: [117, 96, 80],
  road: [148, 129, 113],
  roadMajor: [173, 169, 133],
  boundary: [134, 126, 58],
});

/**
 * Reads the live token scope off an element -- the documentElement by
 * default, which is where [data-theme] sits. Each token falls back to its
 * yellow value, so a half-loaded stylesheet degrades one channel at a time
 * rather than throwing.
 */
export const readPalette = (
  el: Element = document.documentElement,
): Palette => {
  const cs = getComputedStyle(el);
  const read = (name: keyof PaletteColors): Rgb =>
    parseRgb(
      cs.getPropertyValue(PALETTE_TOKENS[name]),
      FALLBACK_PALETTE[name],
    );
  /*
   * Swept from PALETTE_KEYS rather than written out, so a token added to
   * PALETTE_TOKENS is read without anyone remembering to add a line here.
   * This used to name all nine by hand; the six cartographic surfaces
   * would have been the sixth through fifteenth chance to miss one.
   */
  return makePalette(
    Object.fromEntries(
      PALETTE_KEYS.map((name) => [name, read(name)]),
    ) as PaletteColors,
  );
};
