import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import {
  ARTBOARD_DESKTOP,
  cameras,
  fogPresets,
  type Viewport,
} from 'content/cameras';
import {
  forViewport,
  frameCamera,
  MOBILE_MAX_WIDTH,
} from 'scene/camera';
import { globeLimbAngle } from 'scene/globe';
import {
  basemapConfig,
  configChanges,
  createThemePainter,
  fadeoutRange,
  fogFor,
  horizonBlendFor,
  type FogOptions,
  livePalette,
  subscribeTheme,
  THEME_DEBOUNCE_MS,
  THEME_EVENT,
} from 'scene/theme';
import {
  applyTheme,
  THEME_IDS,
  type ThemeId,
} from 'styles/theme-bootstrap';
import {
  BASEMAP_COLOR_KEYS,
  BASEMAP_COLORS,
  type BasemapColorKey,
  basemapColors,
} from 'styles/tokens/cartography';
import {
  FALLBACK_PALETTE,
  makePalette,
  type Palette,
  PALETTE_KEYS,
  PALETTE_TOKENS,
  parseRgb,
  type PaletteColors,
  type Rgb,
} from 'styles/tokens/palette';
import { themeBlock } from 'test/theme-css';

/*
 * jsdom does not cascade custom properties, so readPalette() would see the
 * same fallback under every theme. The declarations are parsed out of
 * themes.css instead and served through a stubbed getComputedStyle keyed
 * on the live data-theme attribute -- which exercises readPalette, and
 * therefore livePalette, for real.
 */
const BLOCKS = new Map<string, Record<string, string>>(
  THEME_IDS.map((id) => [
    id,
    themeBlock(id === 'yellow' ? ':root' : `[data-theme='${id}']`),
  ]),
);

const stubThemedStyles = (): void => {
  vi.stubGlobal('getComputedStyle', (element: Element) => {
    const id = (element as HTMLElement).dataset?.theme ?? 'yellow';
    const block = BLOCKS.get(id) ?? {};
    return {
      getPropertyValue: (name: string) => block[name] ?? '',
    };
  });
};

const withColors = (
  accent: [number, number, number],
  space: [number, number, number],
): Palette =>
  makePalette({
    ...FALLBACK_PALETTE,
    accent,
    space,
  });

const DARK = withColors([255, 229, 32], [22, 22, 22]);
const LIGHT = withColors([120, 96, 0], [244, 242, 236]);

/*
 * The eight palettes themes.css actually ships, read off the stylesheet
 * rather than stubbed, so the cartography claims below are made about the
 * colours that are deployed.
 */
const THEMED: [ThemeId, Palette][] = THEME_IDS.map((id) => {
  const block = BLOCKS.get(id) ?? {};
  return [
    id,
    makePalette(
      Object.fromEntries(
        PALETTE_KEYS.map((name) => [
          name,
          parseRgb(block[PALETTE_TOKENS[name]], [-1, -1, -1]),
        ]),
      ) as PaletteColors,
    ),
  ];
});

/** Plain RGB distance. Enough to ask "nearer to which of these two". */
const distance = (a: Rgb, b: Rgb): number =>
  Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

afterEach(() => {
  vi.unstubAllGlobals();
  document.documentElement.removeAttribute('data-theme');
});

/* ---- tier 1 ----------------------------------------------------------- */

describe('the basemap config', () => {
  it('maps the three fog presets onto light presets', () => {
    expect(basemapConfig('space', DARK).lightPreset).toBe('dawn');
    expect(basemapConfig('dusk', DARK).lightPreset).toBe('dusk');
    expect(basemapConfig('night', DARK).lightPreset).toBe('night');
  });

  it('lifts every preset a step on a light theme', () => {
    expect(basemapConfig('space', LIGHT).lightPreset).toBe('day');
    expect(basemapConfig('dusk', LIGHT).lightPreset).toBe('day');
    expect(basemapConfig('night', LIGHT).lightPreset).toBe('dusk');
  });

  it('fades the basemap under a light theme and not a dark one', () => {
    expect(basemapConfig('night', LIGHT).theme).toBe('faded');
    expect(basemapConfig('night', DARK).theme).toBe('default');
  });

  /*
   * THE WHOLE OF THE WHITE-LABEL BUG, AS ONE ASSERTION.
   *
   * It used to be "hides roads and labels below z8", off the route's
   * declared zoom, and above z8 it asked Standard for place and road
   * names. Both routes above z8 carry the `night` fog, which on the two
   * light themes is Standard's `dusk` preset, whose labels are white.
   *
   * Lifting the preset did not fix it: the import's colour LUT was
   * applied to a symbol layer's text exactly as to a fill, so Standard's
   * label colour was an input to a tone compressor whose whole span was
   * about 1.4:1 on a light theme. The LUT is gone now and the toggles
   * stay off anyway, because the scene draws the names itself in the
   * site's own mono. scene/theme.ts has the rest.
   */
  it('never lets Standard draw text, at any zoom or theme', () => {
    for (const fog of ['space', 'dusk', 'night'] as const) {
      for (const palette of [DARK, LIGHT]) {
        const where = `${fog}/${palette.light ? 'light' : 'dark'}`;
        const config = basemapConfig(fog, palette);
        expect(config.showRoadLabels, where).toBe(false);
        expect(config.showPlaceLabels, where).toBe(false);
        expect(config.showPointOfInterestLabels, where).toBe(false);
        expect(config.showTransitLabels, where).toBe(false);
        expect(config.show3dObjects, where).toBe(false);
      }
    }
  });

  /*
   * AND THE KEYS IT DOES NOT SEND, WHICH IS NOW A DECISION RATHER THAN A
   * LIMIT. Standard has colorPlaceLabels, colorRoadLabels and
   * colorPointOfInterestLabels, and with the colour LUT retired they
   * would work -- the compressor that made them unusable is gone. They
   * stay unset because the scene draws its own type; this pins that it is
   * a choice, so a future reader does not "fix" it by wiring them up.
   */
  it('sets no colour on text it has turned off', () => {
    const config: Record<string, unknown> = basemapConfig(
      'night',
      DARK,
    );
    for (const key of [
      'colorPlaceLabels',
      'colorRoadLabels',
      'colorPointOfInterestLabels',
      'colorTransitLabels',
    ]) {
      expect(config[key], key).toBeUndefined();
    }
  });

  it('sends every property on the first apply', () => {
    const config = basemapConfig('space', DARK);
    expect(configChanges(config, null)).toHaveLength(
      Object.keys(config).length,
    );
  });

  it('sends nothing when nothing changed', () => {
    const config = basemapConfig('space', DARK);
    expect(
      configChanges(basemapConfig('space', DARK), config),
    ).toEqual([]);
  });

  /*
   * The cartography does not move with the camera, only with the theme,
   * so a route change is still one key. That is worth pinning now that
   * there are twelve colours riding in the same record: a fog change
   * that re-sent them all would be twelve setConfigProperty calls per
   * navigation.
   */
  it('sends only the preset when the route changes its fog', () => {
    const world = basemapConfig('space', DARK);
    const city = basemapConfig('night', DARK);
    expect(configChanges(city, world)).toEqual([
      ['lightPreset', 'night'],
    ]);
  });

  /* And the converse: a theme change is the colours and nothing else. */
  it('sends only the colours when the theme changes under one camera', () => {
    const before = basemapConfig('night', DARK);
    const after = basemapConfig(
      'night',
      makePalette({ ...FALLBACK_PALETTE, water: [1, 2, 3] }),
    );
    expect(configChanges(after, before)).toEqual([
      ['colorWater', 'rgb(1, 2, 3)'],
    ]);
  });
});

/* ---- the cartography -------------------------------------------------- */

describe('the basemap cartography', () => {
  /*
   * Every key comes off a token, and off the RIGHT token. The mapping is
   * data in styles/tokens/cartography.ts precisely so this can walk it
   * rather than restate it -- a test that listed the pairs again would
   * agree with a typo.
   */
  it('paints every key from the palette token that owns it', () => {
    const config: Record<string, unknown> = basemapConfig(
      'night',
      DARK,
    );
    for (const key of BASEMAP_COLOR_KEYS) {
      const token = DARK[BASEMAP_COLORS[key]];
      expect(config[key], key).toBe(
        `rgb(${token[0]}, ${token[1]}, ${token[2]})`,
      );
    }
  });

  /*
   * THE COMPLAINT THIS WHOLE CHANGE CAME FROM, AS AN ASSERTION.
   *
   * A colour LUT could only grade Mapbox's own cartography, so a forest
   * on a blue theme came out a blue-tinted GREEN -- the hue survived the
   * grade because the grade carried a fraction of the source's chroma by
   * design. A config colour has no source to carry: greenspace is
   * whatever --map-green says, and --map-green is a shade of the theme.
   *
   * Stated as "no surface is nearer Mapbox's own hue for that class than
   * it is to the theme's own tokens", because "is blue" is not a thing a
   * test can ask. Standard's defaults are the ones the review record read
   * off the real style.
   */
  it('takes no hue from Mapbox for any surface', () => {
    const MAPBOX_DEFAULTS: Record<string, Rgb> = {
      // hsl(115, 60%, 84%) -- Standard's greenspace
      colorGreenspace: [186, 240, 178],
      // hsl(200, 100%, 80%) -- Standard's water
      colorWater: [153, 221, 255],
      // hsl(20, 20%, 95%) -- Standard's land
      colorLand: [244, 240, 238],
    };
    for (const [id, palette] of THEMED) {
      const config = basemapColors(palette);
      for (const [key, mapbox] of Object.entries(MAPBOX_DEFAULTS)) {
        const ours = parseRgb(
          config[key as BasemapColorKey],
          [-1, -1, -1],
        );
        const own = Math.min(
          ...PALETTE_KEYS.map((name) =>
            distance(ours, palette[name]),
          ),
        );
        expect(
          distance(ours, mapbox),
          `${id} ${key} is nearer Mapbox's colour than its own theme's`,
        ).toBeGreaterThan(own);
      }
    }
  });

  /*
   * The point of the whole tier: eight themes must produce eight
   * different basemaps. If two of these collided the globe would simply
   * not retheme, and nothing else in the app would say so. It used to be
   * eight distinct LUT strips; it is eight distinct colour records now,
   * which is the same claim about the same thing.
   */
  it('produces a distinct cartography for all eight themes', () => {
    const seen = new Map<ThemeId, string>();
    for (const [id, palette] of THEMED) {
      seen.set(id, JSON.stringify(basemapColors(palette)));
    }
    expect(new Set(seen.values()).size).toBe(THEME_IDS.length);
  });

  it('follows the live data-theme attribute', () => {
    stubThemedStyles();
    applyTheme('yellow');
    const yellow = livePalette();
    applyTheme('paper');
    const paper = livePalette();
    expect(paper.key).not.toBe(yellow.key);
    // paper is one of the two light themes, and the whole reason sh()
    // has a second branch.
    expect(paper.light).toBe(true);
    expect(yellow.light).toBe(false);
  });

  it('reads the fallback palette when there is no document', () => {
    vi.stubGlobal('document', undefined);
    expect(livePalette().key).toBe(FALLBACK_PALETTE.key);
  });
});

/* ---- watching for a theme change -------------------------------------- */

describe('subscribeTheme', () => {
  it('fires on the oneglobe:theme event', () => {
    const onChange = vi.fn();
    const stop = subscribeTheme(onChange);
    window.dispatchEvent(new Event(THEME_EVENT));
    expect(onChange).toHaveBeenCalledTimes(1);
    stop();
    window.dispatchEvent(new Event(THEME_EVENT));
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('fires on a data-theme write with no event at all', async () => {
    const onChange = vi.fn();
    const stop = subscribeTheme(onChange);
    document.documentElement.dataset.theme = 'paper';
    // MutationObserver delivers on a microtask.
    await Promise.resolve();
    expect(onChange).toHaveBeenCalled();
    stop();
  });

  it('stops observing the attribute once unsubscribed', async () => {
    const onChange = vi.fn();
    subscribeTheme(onChange)();
    document.documentElement.dataset.theme = 'chalk';
    await Promise.resolve();
    expect(onChange).not.toHaveBeenCalled();
  });
});

/* ---- the debounce ----------------------------------------------------- */

describe('the theme painter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    applyTheme('yellow');
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('coalesces a burst of theme changes into one repaint', () => {
    const paint = vi.fn();
    const painter = createThemePainter(paint);
    painter.request();
    painter.request();
    painter.request();
    expect(paint).not.toHaveBeenCalled();
    vi.advanceTimersByTime(THEME_DEBOUNCE_MS);
    expect(paint).toHaveBeenCalledTimes(1);
  });

  it('hands the paint callback the live palette', () => {
    const paint = vi.fn();
    createThemePainter(paint).request();
    vi.runAllTimers();
    const [palette] = paint.mock.calls[0];
    expect(palette.key).toBe(livePalette().key);
    // It used to be handed a prebuilt LUT alongside. Nothing is prebuilt
    // now: the palette IS the payload, and the scene pass turns it into
    // setConfigProperty calls.
    expect(paint.mock.calls[0]).toHaveLength(1);
  });

  it('refuses to repaint when the palette has not moved', () => {
    const paint = vi.fn();
    const painter = createThemePainter(paint);
    painter.request();
    vi.runAllTimers();
    // What an unrelated attribute write, or re-picking the live theme,
    // looks like. A repaint here would re-send every colour key for
    // nothing -- and, before the LUT was retired, reload every tile.
    painter.request();
    vi.runAllTimers();
    expect(paint).toHaveBeenCalledTimes(1);
  });

  it('repaints when the theme really did change', () => {
    stubThemedStyles();
    const paint = vi.fn();
    const painter = createThemePainter(paint);
    painter.request();
    vi.runAllTimers();
    applyTheme('paper');
    painter.request();
    vi.runAllTimers();
    expect(paint).toHaveBeenCalledTimes(2);
    expect(paint.mock.calls[0][0].key).not.toBe(
      paint.mock.calls[1][0].key,
    );
  });

  it('flushes a pending repaint for the first paint', () => {
    const paint = vi.fn();
    const painter = createThemePainter(paint);
    painter.request();
    painter.flush();
    expect(paint).toHaveBeenCalledTimes(1);
    // Flushing with nothing pending is a no-op, not a second paint.
    painter.flush();
    expect(paint).toHaveBeenCalledTimes(1);
  });

  it('drops a pending repaint on teardown', () => {
    const paint = vi.fn();
    const painter = createThemePainter(paint);
    painter.request();
    painter.cancel();
    painter.cancel();
    vi.runAllTimers();
    expect(paint).not.toHaveBeenCalled();
  });
});

/* ---- the atmosphere -------------------------------------------------- */

/*
 * THE PROTOTYPE'S OWN ARITHMETIC, TRANSCRIBED.
 *
 * Straight out of `paintSphere()` in the design prototype, outside the
 * sphere. It is written out here rather than imported so that the
 * assertions below compare the shipped fog against the DESIGN and not
 * against another copy of the app's own opinion.
 *
 *   if (dd < 1.34) {
 *     const a2 = 0.13 * Math.pow(1 - (dd - 1) / 0.34, 2.2);
 *     R = P.space[0] + (P.accent2[0] - P.space[0]) * a2;   ...
 *     if (dd < 1.14) {
 *       const a = 0.2 * Math.pow(1 - (dd - 1) / 0.14, 2);
 *       R = R + (P.accent[0] - R) * a;                     ...
 *     }
 *   }
 */
const designPixel = (
  palette: Palette,
  dd: number,
  channel: 0 | 1 | 2,
): number => {
  let value = palette.space[channel];
  if (dd < 1.34) {
    const a2 = 0.13 * Math.pow(1 - (dd - 1) / 0.34, 2.2);
    value += (palette.accent2[channel] - value) * a2;
    if (dd < 1.14) {
      const a = 0.2 * Math.pow(1 - (dd - 1) / 0.14, 2);
      value += (palette.accent[channel] - value) * a;
    }
  }
  return value;
};

/*
 * MAPBOX'S OWN ARITHMETIC, TRANSCRIBED.
 *
 * `atmosphereFrag` in mapbox-gl 3.30's dist bundle, multiplied out over a
 * background of `space-color` -- see the long note in scene/theme.ts. Also
 * written out here rather than imported, for the same reason.
 */
const paintedPixel = (
  palette: Palette,
  fog: FogOptions,
  t: number,
  channel: 0 | 1 | 2,
): number => {
  const a0 = Number(/[\d.]+\)$/.exec(fog.color)?.[0].slice(0, -1));
  const a1 = Number(
    /[\d.]+\)$/.exec(fog['high-color'])?.[0].slice(0, -1),
  );
  const c0 =
    palette.space[channel] * (1 - a1) + palette.accent2[channel] * a1;
  const c1 = c0 * (1 - a0) + palette.accent[channel] * a0;
  const c2 = c0 * (1 - t) + c1 * t;
  return palette.space[channel] * (1 - t) + c2 * t;
};

describe('the atmosphere', () => {
  const desktop = { width: 1440, height: 900 };

  // The same seam the LUT tests use: jsdom does not cascade custom
  // properties, so the theme blocks are parsed out of themes.css and
  // served through a stubbed getComputedStyle. readPalette runs for real.
  beforeEach(stubThemedStyles);

  it('reproduces the design LIMB pixel exactly, on every theme', () => {
    for (const id of THEME_IDS) {
      applyTheme(id);
      const palette = livePalette();
      const fog = fogFor(cameras.hello, palette, desktop);
      for (const channel of [0, 1, 2] as const) {
        // t = 1 is the limb. The two arithmetics are independent
        // transcriptions and they agree to floating point, which is the
        // claim the whole mapping rests on: mapbox nests `high-color`
        // under `color` exactly as the prototype nests accent2 under
        // accent, so alphas 0.2 and 0.13 need no fitting.
        expect(paintedPixel(palette, fog, 1, channel)).toBeCloseTo(
          designPixel(palette, 1, channel),
          10,
        );
      }
    }
    applyTheme('yellow');
  });

  it('takes both rim colours from the theme, not from a hex', () => {
    const seen = new Set<string>();
    for (const id of THEME_IDS) {
      applyTheme(id);
      const palette = livePalette();
      const fog = fogFor(cameras.hello, palette, desktop);
      expect(fog.color).toBe(palette.a(0.2));
      expect(fog['high-color']).toBe(palette.b(0.13));
      // Past the halo the prototype paints P.space, so space-color is the
      // ground token itself -- not the ground shaded to 0.9, which drew
      // the space behind the globe darker than the page around it.
      expect(fog['space-color']).toBe(
        `rgb(${palette.space[0]}, ${palette.space[1]}, ${palette.space[2]})`,
      );
      seen.add(fog.color);
    }
    applyTheme('yellow');
    // Six distinct accents across the eight themes (paper shares
    // yellow's accent, chalk shares it too) -- the point is only that the
    // fog is not one fixed colour for all of them.
    expect(seen.size).toBeGreaterThan(1);
  });

  /*
   * The fog colours are read straight off the theme's tokens, so a colour
   * theme -- whose job is to map MAPBOX'S colours into this palette --
   * must not be applied to them a second time. mapbox honours that only
   * for the exact string `none`, per fog colour, and
   * `drawAtmosphereGlow` reads it off the ROOT scope. The site sets no
   * colour theme on either scope now, and the review record says
   * Standard's root carries none either, so these three keys currently
   * guard a case production does not present -- they are free and
   * correct either way. See the note on FogOptions.
   */
  it('keeps the colour theme off all three fog colours', () => {
    for (const id of THEME_IDS) {
      applyTheme(id);
      const palette = livePalette();
      for (const spec of [
        cameras.hello,
        cameras.projects,
        cameras.about,
      ]) {
        const fog = fogFor(spec, palette, desktop);
        expect(fog['color-use-theme']).toBe('none');
        expect(fog['high-color-use-theme']).toBe('none');
        expect(fog['space-color-use-theme']).toBe('none');
      }
    }
    applyTheme('yellow');
  });

  it('turns the stars off on a light ground and on elsewhere', () => {
    applyTheme('paper');
    expect(
      fogFor(cameras.hello, livePalette(), desktop)['star-intensity'],
    ).toBe(0);
    applyTheme('yellow');
    expect(
      fogFor(cameras.hello, livePalette(), desktop)['star-intensity'],
    ).toBe(0.15);
  });

  /*
   * THE FIT, PINNED.
   *
   * These are the solved horizon-blends, and they are here so that a
   * change to the solver, to the design's numbers or to a camera's zoom
   * has to be acknowledged rather than absorbed. Every one of them is a
   * long way from the constant 0.04 the scene used to send, and they
   * differ from each other by nearly a factor of two -- which is the
   * whole argument for solving per camera.
   *
   * projects moved when its globe was framed into the rail rather than
   * zoomed to 2.6: a smaller sphere subtends a smaller angle, so the same
   * reach in globe RADII is a narrower fadeout in radians. It used to be
   * the widest of the four and is now the second narrowest, which is the
   * solver doing exactly what it is for.
   */
  it('solves a different horizon-blend for each globe', () => {
    const palette = livePalette();
    const at = (spec: typeof cameras.hello, viewport: Viewport) =>
      fogFor(spec, palette, viewport)['horizon-blend'];

    expect(at(cameras.hello, desktop)).toBeCloseTo(0.03215, 5);
    expect(at(cameras.notFound, desktop)).toBeCloseTo(0.02103, 5);
    expect(at(cameras.projects, desktop)).toBeCloseTo(0.01917, 5);

    // 1f's mobile frame: a smaller sphere subtends a smaller angle, so
    // the same reach in RADII is a much narrower fadeout in radians.
    const mobile = { width: 390, height: 844 };
    const helloMobile = forViewport(cameras.hello, 'hello', true);
    expect(at(helloMobile, mobile)).toBeCloseTo(0.01795, 5);
  });

  it('holds the design reach at any viewport, which a constant cannot', () => {
    const palette = livePalette();
    // The reach where the glow drops under one 8-bit level of the accent
    // against the ground, in globe radii.
    const reachOf = (fog: FogOptions, limb: number): number => {
      const a0 = 0.2;
      const a1 = 0.13;
      for (let dd = 1; dd < 4; dd += 0.001) {
        const t = Math.exp(
          -(Math.atan(Math.tan(limb) * dd) - limb) /
            (Math.PI * fadeoutRange(fog['horizon-blend'])),
        );
        if (a0 * t * t + a1 * t * (1 - a0 * t) < 1 / 255) return dd;
      }
      return Number.NaN;
    };
    const boxes: Viewport[] = [
      { width: 1440, height: 900 },
      { width: 1280, height: 800 },
      { width: 2560, height: 1440 },
      { width: 390, height: 844 },
    ];
    for (const box of boxes) {
      const mobile = box.width <= MOBILE_MAX_WIDTH;
      const spec = frameCamera(
        forViewport(cameras.hello, 'hello', mobile),
        box,
      );
      const fog = fogFor(spec, palette, box);
      const limb = globeLimbAngle(spec.zoom, box.height);
      // Within a twentieth of a radius of each other at every box, and
      // all of them inside the 1.4r the tail needs to be gone by. At the
      // old constant 0.04 the same measurement ran from 1.51r to 1.86r.
      expect(reachOf(fog, limb)).toBeGreaterThan(1.3);
      expect(reachOf(fog, limb)).toBeLessThan(1.4);
    }
  });

  it('falls back to the artboard when there is no box to measure', () => {
    const palette = livePalette();
    expect(
      fogFor(cameras.hello, palette, null)['horizon-blend'],
    ).toBe(
      fogFor(cameras.hello, palette, {
        width: ARTBOARD_DESKTOP.width,
        height: ARTBOARD_DESKTOP.height,
      })['horizon-blend'],
    );
  });

  /*
   * The terrain routes are mercator -- mapbox finishes leaving the globe
   * at zoom 6 and these sit at 10 and up -- so there is no limb to solve
   * against and the preset carries mapbox's own number. Their colours
   * still come from the theme.
   */
  it('passes the terrain presets horizon-blend straight through', () => {
    for (const id of THEME_IDS) {
      applyTheme(id);
      const palette = livePalette();
      for (const spec of [cameras.about, cameras.projectDetail]) {
        const fog = fogFor(spec, palette, desktop);
        // Mercator: no limb to solve against, so mapbox's own number.
        expect(fog['horizon-blend']).toBe(0.04);
        expect(fog.range).toEqual([0.2, 4]);
        /*
         * THE ROLES SWAP HERE, and that is the design's doing.
         * `surface()` paints the band above the horizon in P.ACCENT over
         * P.space, so the accent is on `high-color` and `color` is the
         * ground -- which is also what mapbox uses as the distance haze,
         * at full alpha, exactly as it shipped. The hex it replaces
         * (#121212) was a dark grey on all eight themes.
         */
        const space = palette.space;
        expect(fog.color).toBe(
          `rgba(${space[0]}, ${space[1]}, ${space[2]}, 1)`,
        );
        expect(fog['high-color']).toBe(palette.a(0.12));
      }
    }
    applyTheme('yellow');
  });

  it('integrates far enough out that the truncated tail is nothing', () => {
    // FIT_REACH is 6 halo reaches, i.e. dd = 3.04. The claim in
    // scene/theme.ts is that what is left past there is under 1e-6 of
    // the design's total, at every camera in the table.
    const blend = fogFor(cameras.projects, livePalette(), desktop)[
      'horizon-blend'
    ];
    const limb = globeLimbAngle(cameras.projects.zoom, 900);
    const t = Math.exp(
      -(Math.atan(Math.tan(limb) * 3.04) - limb) /
        (Math.PI * fadeoutRange(blend)),
    );
    expect(0.2 * t * t + 0.13 * t).toBeLessThan(1e-6);
  });

  it('remembers the last solve, and only the last one', () => {
    const limb = globeLimbAngle(cameras.hello.zoom, 900);
    const first = horizonBlendFor(fogPresets.space, limb);
    // Same preset, same angle: the cached answer, bit for bit.
    expect(horizonBlendFor(fogPresets.space, limb)).toBe(first);
    // Same preset, a different globe: a fresh solve.
    const other = horizonBlendFor(fogPresets.space, limb * 0.6);
    expect(other).not.toBe(first);
    // A different preset at the SAME angle: also a fresh solve, and
    // night's is mapbox's own constant rather than anything solved.
    expect(horizonBlendFor(fogPresets.night, limb * 0.6)).toBe(0.04);
    // And the first one comes back by being computed again, not by
    // having been kept: one slot, so it was evicted.
    expect(horizonBlendFor(fogPresets.space, limb)).toBeCloseTo(
      first,
      12,
    );
  });

  it('remaps horizon-blend the way mapbox does', () => {
    // mapValue(hb, 0, 1, 5e-4, 0.25), read off drawAtmosphereGlow.
    expect(fadeoutRange(0)).toBeCloseTo(5e-4, 12);
    expect(fadeoutRange(1)).toBeCloseTo(0.25, 12);
    expect(fadeoutRange(0.04)).toBeCloseTo(0.01048, 6);
  });
});
