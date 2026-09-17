import type { FogPreset } from 'content/cameras';
import { buildLut } from 'styles/tokens/lut';
import {
  FALLBACK_PALETTE,
  type Palette,
  readPalette,
} from 'styles/tokens/palette';

/*
 * THEMING THE REAL BASEMAP
 *
 * The site has dropped its hand-maintained Mapbox style
 * (mapbox://styles/chiefkleef/..., pinned at minZoom 7, which cannot show
 * a globe) for Mapbox Standard, themed at runtime. Eight themes, one
 * style, no style JSON to maintain. It happens in three tiers, cheapest
 * last:
 *
 *   1. map.setColorTheme({ data: buildLut(palette) })
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

/** The event the theme lens dispatches when it swaps themes. */
export const THEME_EVENT = 'oneglobe:theme';

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

/** The layers card: "no roads or labels below z8". */
export const LABEL_MIN_ZOOM = 8;

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

/**
 * Tier 2, as data. `faded` on a light theme pulls Standard's own colour
 * back so the LUT's wash is what the eye reads; on a dark theme the LUT
 * has enough contrast to work against the default.
 */
export const basemapConfig = (
  fog: FogPreset,
  zoom: number,
  light: boolean,
): BasemapConfig => {
  const labels = zoom >= LABEL_MIN_ZOOM;
  const preset = LIGHT_PRESETS[fog];
  return {
    lightPreset: light ? preset.light : preset.dark,
    theme: light ? 'faded' : 'default',
    showRoadLabels: labels,
    showPlaceLabels: labels,
    // The scene names places itself, in mono, through its own symbol
    // layers. Standard's POI and transit labels are never wanted.
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

/* ---- watching for a theme change ------------------------------------- */

/**
 * Two sources, because neither alone is complete: the lens dispatches
 * `oneglobe:theme`, and the attribute is the truth even when something
 * else -- devtools, the specimen harness, the bootstrap script -- sets it
 * without an event.
 */
export const subscribeTheme = (
  onChange: () => void,
): (() => void) => {
  const observer = new MutationObserver(onChange);
  window.addEventListener(THEME_EVENT, onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });
  return () => {
    window.removeEventListener(THEME_EVENT, onChange);
    observer.disconnect();
  };
};

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
