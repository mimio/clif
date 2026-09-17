/*
 * The token scope, as numbers.
 *
 * Canvas and Mapbox paint per pixel, so they cannot use var(): they read
 * the live token scope off the document once and mix the numbers
 * themselves (design inventory 6.5). Everything painted outside CSS --
 * the globe, the terrain, the colour-theme LUT in ./lut.ts -- starts here.
 *
 * Nine tokens, and one derived flag that changes how all of them are
 * shaded. The rest of the design system stays in CSS.
 */

export type Rgb = readonly [number, number, number];

/** Index into an Rgb. `sh` needs it to reach the matching ground channel. */
export type Channel = 0 | 1 | 2;

/** The nine tokens read off the element. */
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
   * The repaint cache key. A still scene only redraws when this changes,
   * which is exactly when the theme changed.
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
};

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

/** Rec. 709 relative luminance, 0-1. */
export const luminance = (c: Rgb): number =>
  (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255;

/** Wraps the nine numbers in everything derived from them. */
export const makePalette = (colors: PaletteColors): Palette => {
  const {
    accent,
    accent2,
    space,
    land,
    body,
    sub,
    muted,
    accentSmall,
  } = colors;
  const light = luminance(space) > 0.5;
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
    key: `${accent.join()}|${space.join()}|${land.join()}`,
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
  return makePalette({
    accent: read('accent'),
    accent2: read('accent2'),
    space: read('space'),
    land: read('land'),
    deep: read('deep'),
    body: read('body'),
    accentSmall: read('accentSmall'),
    sub: read('sub'),
    muted: read('muted'),
  });
};
