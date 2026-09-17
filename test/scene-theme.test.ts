import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import {
  basemapConfig,
  configChanges,
  createThemePainter,
  LABEL_MIN_ZOOM,
  livePalette,
  lutFor,
  resetLutCacheForTests,
  subscribeTheme,
  THEME_DEBOUNCE_MS,
  THEME_EVENT,
} from 'scene/theme';
import {
  applyTheme,
  THEME_IDS,
  type ThemeId,
} from 'styles/theme-bootstrap';
import { buildLut } from 'styles/tokens/lut';
import {
  FALLBACK_PALETTE,
  makePalette,
  type Palette,
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

beforeEach(() => {
  resetLutCacheForTests();
});

afterEach(() => {
  vi.unstubAllGlobals();
  document.documentElement.removeAttribute('data-theme');
});

/* ---- tier 2 ----------------------------------------------------------- */

describe('the basemap config', () => {
  it('maps the three fog presets onto light presets', () => {
    expect(basemapConfig('space', 1.6, false).lightPreset).toBe(
      'dawn',
    );
    expect(basemapConfig('dusk', 2.6, false).lightPreset).toBe(
      'dusk',
    );
    expect(basemapConfig('night', 10, false).lightPreset).toBe(
      'night',
    );
  });

  it('lifts every preset a step on a light theme', () => {
    expect(basemapConfig('space', 1.6, true).lightPreset).toBe('day');
    expect(basemapConfig('dusk', 2.6, true).lightPreset).toBe('day');
    expect(basemapConfig('night', 10, true).lightPreset).toBe('dusk');
  });

  it('fades the basemap under a light theme and not a dark one', () => {
    expect(basemapConfig('night', 10, true).theme).toBe('faded');
    expect(basemapConfig('night', 10, false).theme).toBe('default');
  });

  it('hides roads and labels below z8', () => {
    const world = basemapConfig('space', 1.6, false);
    expect(world.showRoadLabels).toBe(false);
    expect(world.showPlaceLabels).toBe(false);

    const city = basemapConfig('night', LABEL_MIN_ZOOM, false);
    expect(city.showRoadLabels).toBe(true);
    expect(city.showPlaceLabels).toBe(true);
  });

  it('never wants Standard POI, transit or 3D objects', () => {
    const config = basemapConfig('night', 12, false);
    expect(config.showPointOfInterestLabels).toBe(false);
    expect(config.showTransitLabels).toBe(false);
    expect(config.show3dObjects).toBe(false);
  });

  it('sends every property on the first apply', () => {
    const config = basemapConfig('space', 1.6, false);
    expect(configChanges(config, null)).toHaveLength(
      Object.keys(config).length,
    );
  });

  it('sends nothing when nothing changed', () => {
    const config = basemapConfig('space', 1.6, false);
    expect(
      configChanges(basemapConfig('space', 1.6, false), config),
    ).toEqual([]);
  });

  it('sends only what changed when the camera crosses z8', () => {
    const world = basemapConfig('night', 7, false);
    const city = basemapConfig('night', 9, false);
    expect(configChanges(city, world)).toEqual([
      ['showRoadLabels', true],
      ['showPlaceLabels', true],
    ]);
  });
});

/* ---- tier 1 ----------------------------------------------------------- */

describe('the colour LUT', () => {
  it('is the cube strip buildLut produces', () => {
    expect(lutFor(DARK)).toBe(buildLut(DARK));
  });

  it('is built once per palette key', () => {
    const first = lutFor(DARK);
    expect(lutFor(makePalette({ ...DARK }))).toBe(first);
  });

  it('is rebuilt when the key changes, and differs per theme', () => {
    expect(lutFor(LIGHT)).not.toBe(lutFor(DARK));
  });

  /*
   * The point of the whole tier: eight themes must produce eight
   * different basemaps. If two of these collided the globe would simply
   * not retheme, and nothing else in the app would say so.
   */
  it('produces a distinct LUT for all eight themes', () => {
    stubThemedStyles();
    const luts = new Map<ThemeId, string>();
    for (const id of THEME_IDS) {
      applyTheme(id);
      resetLutCacheForTests();
      luts.set(id, lutFor(livePalette()));
    }
    expect(new Set(luts.values()).size).toBe(THEME_IDS.length);
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

  it('hands the paint callback the palette and its LUT', () => {
    const paint = vi.fn();
    createThemePainter(paint).request();
    vi.runAllTimers();
    const [palette, lut] = paint.mock.calls[0];
    expect(palette.key).toBe(livePalette().key);
    expect(lut).toBe(buildLut(palette));
  });

  it('refuses to repaint when the palette has not moved', () => {
    const paint = vi.fn();
    const painter = createThemePainter(paint);
    painter.request();
    vi.runAllTimers();
    // What an unrelated attribute write, or re-picking the live theme,
    // looks like. A repaint here would reload every tile for nothing.
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
    expect(paint.mock.calls[0][1]).not.toBe(paint.mock.calls[1][1]);
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
