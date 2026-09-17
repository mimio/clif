import { afterEach, describe, expect, it } from 'vitest';
import {
  FALLBACK_PALETTE,
  luma,
  makePalette,
  PALETTE_KEYS,
  PALETTE_TOKENS,
  parseRgb,
  type PaletteColors,
  type Rgb,
  readPalette,
} from 'styles/tokens/palette';
import {
  styleSheets,
  THEMES_CSS,
  THEME_SELECTORS,
  themeBlock,
} from 'test/theme-css';

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

describe('luma', () => {
  it('is 0 at black and 1 at white', () => {
    expect(luma([0, 0, 0])).toBe(0);
    expect(luma([255, 255, 255])).toBeCloseTo(1, 10);
  });

  /*
   * The endpoints alone do not pin the colour space: luma, relative
   * luminance, a plain average and max() all give 0 and 1 there. Mid grey
   * is where they separate, and lut.ts's whole calibration rides on this
   * being the gamma-encoded one. A linearising implementation returns
   * 0.2159 and fails here instead of silently flattening the basemap.
   */
  it('is gamma-encoded luma, not relative luminance', () => {
    expect(luma([128, 128, 128])).toBeCloseTo(0.501961, 6);
    expect(luma([128, 128, 128])).toBeGreaterThan(0.4);
  });

  it('weights green over red over blue', () => {
    expect(luma([0, 255, 0])).toBeCloseTo(0.7152, 6);
    expect(luma([255, 0, 0])).toBeCloseTo(0.2126, 6);
    expect(luma([0, 0, 255])).toBeCloseTo(0.0722, 6);
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

  /*
   * The key is a cache key: scene/theme.ts skips rebuilding the Mapbox
   * LUT while it holds, and the still canvases skip repainting. So the
   * assertion that matters is the invariant, not the literal string --
   * change any colour the palette carries and the key has to move. The
   * design bundle keyed on accent|space|land, which is three of nine and
   * misses --map-deep, a colour buildLut reads.
   */
  it('changes when any one of the nine colours changes', () => {
    const base = makePalette(DARK);
    for (const name of PALETTE_KEYS) {
      const nudged = makePalette({
        ...DARK,
        [name]: [DARK[name][0] + 1, DARK[name][1], DARK[name][2]],
      });
      expect(nudged.key, `${name} is missing from the key`).not.toBe(
        base.key,
      );
    }
  });

  it('carries every colour, in PALETTE_KEYS order', () => {
    expect(PALETTE_KEYS).toHaveLength(9);
    expect(makePalette(DARK).key.split('|')).toHaveLength(9);
    expect(makePalette(DARK).key).toBe(
      PALETTE_KEYS.map((name) => DARK[name].join()).join('|'),
    );
  });

  it('separates two different palettes', () => {
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

/*
 * Tailwind's `inline` governs what a utility contains, not whether the
 * variable exists: every --color-* the scanner sees is still emitted into
 * :root, in @layer theme, already resolved against :root. Reading one back
 * by hand therefore pins it to the root theme, which is wrong anywhere
 * [data-theme] sits below <html> -- the theme lens previews each theme on
 * its own swatch and would show eight copies of the current one.
 *
 * globals.css spends a paragraph saying so. This makes it enforceable for
 * the files this lane owns.
 */
describe('the --color-* aliases', () => {
  // Comments are stripped first: globals.css's own warning spells the
  // pattern out, and `var(--color-*)` with a literal star is not a token
  // Tailwind can emit anything for. It is the declarations that matter.
  it.each(styleSheets())(
    '%s reaches for the token, not the alias',
    (_file, css) => {
      const declarations = css.replace(/\/\*[\s\S]*?\*\//g, '');
      expect(declarations.match(/var\(\s*--color-/g)).toBeNull();
    },
  );
});
