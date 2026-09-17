import { afterEach, describe, expect, it } from 'vitest';
import {
  FALLBACK_PALETTE,
  luminance,
  makePalette,
  PALETTE_TOKENS,
  parseRgb,
  type PaletteColors,
  type Rgb,
  readPalette,
} from 'styles/tokens/palette';
import {
  THEMES_CSS,
  THEME_SELECTORS,
  themeBlock,
} from 'test/theme-css';

const PALETTE_KEYS = Object.keys(
  PALETTE_TOKENS,
) as (keyof PaletteColors)[];

const DARK: PaletteColors = {
  accent: [255, 229, 32],
  accent2: [255, 138, 43],
  space: [22, 22, 22],
  land: [89, 75, 64],
  deep: [53, 46, 39],
  body: [235, 235, 235],
  accentSmall: [255, 229, 32],
  sub: [193, 193, 193],
  muted: [193, 193, 193],
};

const LIGHT: PaletteColors = {
  ...DARK,
  accent: [212, 64, 46],
  space: [237, 233, 225],
  land: [246, 241, 233],
  deep: [217, 191, 159],
  body: [26, 24, 21],
};

afterEach(() => {
  document.documentElement.removeAttribute('style');
  document.head
    .querySelectorAll('style')
    .forEach((el) => el.remove());
});

describe('parseRgb', () => {
  const fallback: Rgb = [1, 2, 3];

  it('reads six-digit hex', () => {
    expect(parseRgb('#FFE520', fallback)).toEqual([255, 229, 32]);
  });

  it('reads three-digit hex', () => {
    expect(parseRgb('#fff', fallback)).toEqual([255, 255, 255]);
  });

  it('ignores the whitespace getPropertyValue leaves behind', () => {
    expect(parseRgb('  #161616 ', fallback)).toEqual([22, 22, 22]);
  });

  it('reads rgb() and rgba(), alpha and all', () => {
    expect(parseRgb('rgb(89, 75, 64)', fallback)).toEqual([
      89, 75, 64,
    ]);
    expect(parseRgb('rgba(255, 229, 32, 0.6)', fallback)).toEqual([
      255, 229, 32,
    ]);
  });

  it('reads the space-separated form', () => {
    expect(parseRgb('rgb(255 229 32 / 0.6)', fallback)).toEqual([
      255, 229, 32,
    ]);
  });

  it('falls back on an unset property', () => {
    expect(parseRgb('', fallback)).toBe(fallback);
  });

  it('falls back on anything it cannot read', () => {
    expect(parseRgb('currentColor', fallback)).toBe(fallback);
    expect(parseRgb('rgb(1, 2)', fallback)).toBe(fallback);
  });
});

describe('luminance', () => {
  it('is 0 at black and 1 at white', () => {
    expect(luminance([0, 0, 0])).toBe(0);
    expect(luminance([255, 255, 255])).toBeCloseTo(1, 10);
  });
});

describe('makePalette', () => {
  it('calls a near-black ground dark, and shades by multiplying', () => {
    const pal = makePalette(DARK);
    expect(pal.light).toBe(false);
    expect(pal.ink).toBe(0.15);
    expect(pal.sh(100, 0, 0.5)).toBe(50);
    // k >= 1 is only special-cased on light themes.
    expect(pal.sh(100, 0, 1.2)).toBeCloseTo(120);
  });

  it('calls a paper ground light, and washes toward it instead', () => {
    const pal = makePalette(LIGHT);
    expect(pal.light).toBe(true);
    expect(pal.ink).toBe(0.34);
    // 100 -> 100 + (237 - 100) * 0.5 * 0.9
    expect(pal.sh(100, 0, 0.5)).toBeCloseTo(161.65);
    expect(pal.sh(100, 0, 1)).toBe(100);
  });

  it('builds the rgba helpers off the two accents', () => {
    const pal = makePalette(DARK);
    expect(pal.a(0.6)).toBe('rgba(255, 229, 32, 0.6)');
    expect(pal.b(0.14)).toBe('rgba(255, 138, 43, 0.14)');
  });

  it('precomputes the four ink strings', () => {
    const pal = makePalette(DARK);
    expect(pal.accentInk).toBe('rgb(255, 229, 32)');
    expect(pal.bodyInk).toBe('rgb(235, 235, 235)');
    expect(pal.subInk).toBe('rgb(193, 193, 193)');
    expect(pal.mutedInk).toBe('rgb(193, 193, 193)');
  });

  it('keys the repaint cache on accent, ground and terrain', () => {
    expect(makePalette(DARK).key).toBe(
      '255,229,32|22,22,22|89,75,64',
    );
    expect(makePalette(LIGHT).key).not.toBe(makePalette(DARK).key);
  });
});

describe('readPalette', () => {
  it('falls back token by token when nothing is styled', () => {
    const pal = readPalette(document.createElement('div'));
    for (const key of PALETTE_KEYS) {
      expect(pal[key]).toEqual(FALLBACK_PALETTE[key]);
    }
  });

  it('reads the documentElement by default', () => {
    document.documentElement.style.setProperty(
      '--clif-accent',
      '#C8F04B',
    );
    expect(readPalette().accent).toEqual([200, 240, 75]);
  });

  it('reads whatever element it is handed', () => {
    const el = document.createElement('div');
    el.style.setProperty('--map-land', 'rgb(65, 84, 72)');
    document.body.append(el);
    expect(readPalette(el).land).toEqual([65, 84, 72]);
    el.remove();
  });

  it('picks up a real theme scope from the real stylesheet', () => {
    const style = document.createElement('style');
    style.textContent = THEMES_CSS;
    document.head.append(style);
    document.documentElement.dataset.theme = 'chalk';
    const pal = readPalette();
    expect(pal.accent).toEqual([14, 124, 139]);
    expect(pal.light).toBe(true);
    delete document.documentElement.dataset.theme;
  });
});

/*
 * The drift guard. FALLBACK_PALETTE is the yellow theme written out in
 * TypeScript so the scene has numbers before any stylesheet resolves;
 * themes.css is the same numbers in CSS. Nothing in the running app
 * compares them, so this does.
 */
describe('FALLBACK_PALETTE against themes.css', () => {
  const root = themeBlock(':root');

  it.each(PALETTE_KEYS)('matches %s', (key) => {
    const declared = root[PALETTE_TOKENS[key]];
    expect(declared).toBeDefined();
    expect(parseRgb(declared, [-1, -1, -1])).toEqual(
      FALLBACK_PALETTE[key],
    );
  });

  it('reads the :root block off the yellow scope, once', () => {
    expect(THEMES_CSS).toContain(":root,\n[data-theme='yellow'] {");
    expect(
      THEMES_CSS.match(/^\[data-theme='yellow'\]/gm),
    ).toHaveLength(1);
  });
});

describe('every theme scope', () => {
  it.each(THEME_SELECTORS)(
    '%s defines all nine tokens',
    (selector) => {
      const block = themeBlock(selector);
      for (const key of PALETTE_KEYS) {
        expect(block[PALETTE_TOKENS[key]]).toBeDefined();
      }
    },
  );

  it('is eight scopes and no more', () => {
    expect(THEME_SELECTORS).toHaveLength(8);
  });
});
