/*
 * THE COLOUR LUT THE SITE NO LONGER SENDS, KEPT AS A TEST FIXTURE.
 *
 * This was styles/tokens/lut.ts: the 3D colour cube handed to
 * setImportColorTheme('basemap', ...) to re-grade every basemap pixel.
 * The site themes Mapbox Standard through its per-feature-class colour
 * config now -- styles/tokens/cartography.ts has the measurement that
 * retired this -- so nothing in the app builds a LUT any more.
 *
 * IT IS STILL HERE BECAUSE TWO HERMETIC GUARDS NEED A REAL ONE.
 *
 * mapbox-gl re-tints a layer's colour paint properties, and the fog's,
 * through `style.getLut(scope)` unless the matching `-use-theme` is the
 * string `none`. Everything the site draws itself -- the scene's layers
 * and the atmosphere -- lives at the ROOT scope, so a root stylesheet
 * carrying a `color-theme` would re-tint the site's own palette tokens
 * through a cube a second time. scene/layers/sets.ts and scene/theme.ts
 * both seal against that, and e2e/hermetic/layer-lut.spec.ts and
 * globe-atmosphere.spec.ts prove the seals hold by serving a stub whose
 * ROOT carries a colour theme.
 *
 * Those guards need a cube that genuinely decodes and genuinely
 * re-tints, or they pass for the wrong reason. This builds one. It is a
 * fixture and nothing but a fixture: it is outside styles/, outside the
 * coverage tree, and nothing under scene/ or styles/ may import it.
 *
 * (Standard's own root, measured on the real style by
 * e2e/review/cartography.spec.ts, carries NO colour theme -- the record
 * reads `root: {declared: false, lut: false}`. The seals are therefore
 * guarding a case that production does not currently present. They cost
 * nothing and they are correct either way, so they stay; that is a
 * separate thread from this one.)
 *
 * What follows is the module as it shipped, unchanged below this note.
 */
import {
  type Channel,
  luma,
  type Palette,
  type Rgb,
} from 'styles/tokens/palette';

/** Mapbox's ceiling. The cube is 32^3 and the strip is 32 x 1024. */
export const LUT_SIZE = 32;

/** The smallest cube worth building: two steps per axis. */
export const MIN_LUT_SIZE = 2;

/**
 * Where the tone ramp starts, on the LUMA scale -- see palette.ts, and do
 * not linearise it. Mapbox Standard's basemap fills all sit above this
 * (its water is 0.762, its land beige 0.930), so the ramp spends its
 * range on tones the basemap actually emits. About two thirds of the cube
 * -- 21,709 of 32,768 cells at 32^3, 66.3% -- falls below the floor and
 * lands on the ramp's bottom anchor.
 *
 * "Bottom anchor" is not "--map-deep", and the difference is worth
 * knowing before anyone goes hunting in sh(): the shading step still runs
 * at tone 0, with k = SHADE_FLOOR, so yellow's deep [53, 46, 39] comes
 * out at [38, 33, 28], 28% darker than the token. The floor is where the
 * ramp starts, not where the pipeline stops.
 */
export const SOURCE_FLOOR = 0.62;

/** Where Standard's land beige sits once the tone is normalised. */
export const LAND_STOP = 0.82;

/** How much accent the highlight anchor carries, dark themes / light. */
const DARK_TINT = 0.35;
const LIGHT_TINT = 0.12;

/** How much of the source's own chroma survives, dark themes / light. */
const CHROMA_DARK = 0.3;
const CHROMA_LIGHT = 0.2;

/** The darkest the shading step may take a tone, at the bottom of the ramp. */
export const SHADE_FLOOR = 0.72;

export type LutOptions = {
  /**
   * Cube size, clamped to 2..32 and truncated to an integer. The default
   * and the only size Mapbox should ever be handed is 32; the option
   * exists so tests can assert the cube layout on a cube small enough to
   * read. Clamping is not politeness -- every value outside the range
   * fails differently and quietly:
   *
   *   0  -> no DEFLATE block at all (ceil(0 / 65535) is 0), so the zlib
   *         stream is a header and a checksum that no inflater accepts,
   *         wrapped in a 0x0 IHDR that PNG forbids.
   *   1  -> `last` is 0, so every channel is 0/0, and NaN stores as 0
   *         through a Uint8Array: a valid, entirely black PNG that looks
   *         like a working identity LUT until it paints.
   *   33 -> a well-formed 1089x33 PNG that mapbox-gl rejects at runtime,
   *         long after this function returned.
   */
  size?: number;
  /** 0 is an exact identity LUT, 1 the full transform. */
  strength?: number;
};

const clamp01 = (n: number): number => Math.min(1, Math.max(0, n));

const clampSize = (size: number): number =>
  Math.max(MIN_LUT_SIZE, Math.min(LUT_SIZE, size) | 0);

const lerp = (from: number, to: number, at: number): number =>
  from + (to - from) * at;

const mix = (from: Rgb, to: Rgb, amount: number): Rgb => [
  lerp(from[0], to[0], amount),
  lerp(from[1], to[1], amount),
  lerp(from[2], to[2], amount),
];

/* ---- PNG plumbing ---------------------------------------------------- */

const CRC_TABLE = ((): Uint32Array => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) {
      c = (c & 1) === 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

const crc32 = (bytes: Uint8Array): number => {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i += 1) {
    c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
};

const adler32 = (bytes: Uint8Array): number => {
  let a = 1;
  let b = 0;
  for (let i = 0; i < bytes.length; i += 1) {
    a = (a + bytes[i]) % 65521;
    b = (b + a) % 65521;
  }
  return ((b << 16) | a) >>> 0;
};

/** A DEFLATE stored block carries at most this many bytes. */
const STORED_MAX = 0xffff;

/**
 * A zlib stream of stored (uncompressed) blocks: two header bytes, one
 * five-byte block header per chunk of payload, then the adler checksum.
 * No compression, and therefore no dependency.
 */
const zlibStored = (raw: Uint8Array): Uint8Array => {
  const blocks = Math.ceil(raw.length / STORED_MAX);
  const out = new Uint8Array(2 + blocks * 5 + raw.length + 4);
  out[0] = 0x78;
  out[1] = 0x01;
  let at = 2;
  for (let i = 0; i < blocks; i += 1) {
    const start = i * STORED_MAX;
    const len = Math.min(STORED_MAX, raw.length - start);
    out[at] = i === blocks - 1 ? 1 : 0;
    out[at + 1] = len & 0xff;
    out[at + 2] = (len >>> 8) & 0xff;
    out[at + 3] = ~len & 0xff;
    out[at + 4] = (~len >>> 8) & 0xff;
    out.set(raw.subarray(start, start + len), at + 5);
    at += 5 + len;
  }
  new DataView(out.buffer).setUint32(at, adler32(raw));
  return out;
};

const chunk = (type: string, data: Uint8Array): Uint8Array => {
  const out = new Uint8Array(12 + data.length);
  const view = new DataView(out.buffer);
  view.setUint32(0, data.length);
  for (let i = 0; i < 4; i += 1) out[4 + i] = type.charCodeAt(i);
  out.set(data, 8);
  view.setUint32(
    8 + data.length,
    crc32(out.subarray(4, 8 + data.length)),
  );
  return out;
};

const PNG_SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];

/** 8-bit RGBA, no interlacing, every scanline on filter 0. */
const encodePng = (
  width: number,
  height: number,
  pixels: Uint8Array,
): Uint8Array => {
  const stride = width * 4;
  const raw = new Uint8Array(height * (stride + 1));
  for (let y = 0; y < height; y += 1) {
    raw.set(
      pixels.subarray(y * stride, y * stride + stride),
      y * (stride + 1) + 1,
    );
  }

  const ihdr = new Uint8Array(13);
  const view = new DataView(ihdr.buffer);
  view.setUint32(0, width);
  view.setUint32(4, height);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // colour type: RGBA

  const parts = [
    Uint8Array.from(PNG_SIGNATURE),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlibStored(raw)),
    chunk('IEND', new Uint8Array(0)),
  ];
  const out = new Uint8Array(
    parts.reduce((total, part) => total + part.length, 0),
  );
  let at = 0;
  for (const part of parts) {
    out.set(part, at);
    at += part.length;
  }
  return out;
};

const BASE64_ALPHABET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

/**
 * Base64 without btoa or Buffer: this runs in the browser, in Node during
 * SSR and in jsdom under the tests, and neither global is available in
 * all three.
 */
export const toBase64 = (bytes: Uint8Array): string => {
  const at = BASE64_ALPHABET;
  let out = '';
  let i = 0;
  for (; i + 2 < bytes.length; i += 3) {
    const n = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
    out +=
      at[(n >>> 18) & 63] +
      at[(n >>> 12) & 63] +
      at[(n >>> 6) & 63] +
      at[n & 63];
  }
  const rest = bytes.length - i;
  if (rest === 1) {
    const n = bytes[i] << 16;
    out += `${at[(n >>> 18) & 63]}${at[(n >>> 12) & 63]}==`;
  }
  if (rest === 2) {
    const n = (bytes[i] << 16) | (bytes[i + 1] << 8);
    out += `${at[(n >>> 18) & 63]}${at[(n >>> 12) & 63]}${at[(n >>> 6) & 63]}=`;
  }
  return out;
};

/* ---- the LUT --------------------------------------------------------- */

/**
 * The ramp's top anchor: the theme's body ink warmed toward the accent
 * on a dark theme, its ground faintly tinted by the accent on a light
 * one -- because a light theme's body ink is nearly black and would turn
 * every road into a scar.
 */
const highlightOf = (palette: Palette): Rgb =>
  palette.light
    ? mix(palette.space, palette.accent, LIGHT_TINT)
    : mix(palette.body, palette.accent, DARK_TINT);

const byte = (value: number): number =>
  Math.round(Math.min(255, Math.max(0, value)));

/**
 * WHAT THE COLOUR THEME TURNS ONE BASEMAP PIXEL INTO.
 *
 * The five steps in this file's header, as a function of one incoming
 * colour, so that the transform is written once and can be asked
 * questions as well as baked into a cube. buildLut below is a sweep of
 * this over every cell, and test/map-text.test.ts measures the scene's
 * type against it -- which is the only way to know what map type is
 * actually drawn on, because the surfaces under a label are this
 * function's output and not a token.
 *
 * It matters that this is REACHABLE rather than inlined, because it is
 * what makes the basemap's own labels impossible to theme. mapbox-gl
 * applies the import's LUT to a symbol layer's text exactly as it does
 * to a fill -- `SymbolBucket.createArrays` hands `this.lut` to the text
 * binder, and the bucket's lut is `style.getLut(scope)` for the SOURCE's
 * scope, which for every layer inside Standard is `basemap`. So whatever
 * colour Standard picks for a place name arrives here first, and comes
 * out somewhere on the deep -> land -> highlight ramp. On a light theme
 * that ramp spans about 1.4:1 end to end, so white labels and black
 * labels land within a level or two of the land they are drawn on, and
 * no light preset can separate them. Text the site wants, the site has
 * to draw itself, at the root scope, where there is no LUT.
 *
 * Returns the 8-bit pixel, because that is what is actually shown.
 */
export const basemapColor = (palette: Palette, src: Rgb): Rgb => {
  const { deep, land, light, sh } = palette;
  const highlight = highlightOf(palette);
  const keep = light ? CHROMA_LIGHT : CHROMA_DARK;
  const tint = luma(src);
  const tone = clamp01((tint - SOURCE_FLOOR) / (1 - SOURCE_FLOOR));
  const k = SHADE_FLOOR + (1 - SHADE_FLOOR) * tone;
  const out: number[] = [];
  for (let ch = 0; ch < 3; ch += 1) {
    const base =
      tone <= LAND_STOP
        ? lerp(deep[ch], land[ch], tone / LAND_STOP)
        : lerp(
            land[ch],
            highlight[ch],
            (tone - LAND_STOP) / (1 - LAND_STOP),
          );
    const carried = base + (src[ch] - tint * 255) * keep;
    out.push(byte(sh(carried, ch as Channel, k)));
  }
  return [out[0], out[1], out[2]];
};

/**
 * The tones the ramp is anchored at, as SOURCE lumas: the floor, the
 * land stop, and the top. Anything Standard emits lands between them.
 */
export const RAMP_SAMPLES: readonly number[] = [
  SOURCE_FLOOR,
  SOURCE_FLOOR + LAND_STOP * (1 - SOURCE_FLOOR),
  1,
];

/**
 * The themed basemap's spine: the three ramp anchors, as colours.
 *
 * Neutral greys go in, so what comes back carries no chroma of its own
 * -- step 4's `(src - luma) * keep` is zero on a grey. Chroma moves a
 * real fill off this spine (that is what keeps water blue), but it moves
 * it at roughly constant tone, so the spine is the right thing to
 * measure type against: it is the full RANGE of ground the map can put
 * under a label, from the deepest water to the brightest road.
 */
export const basemapRamp = (palette: Palette): Rgb[] =>
  RAMP_SAMPLES.map((tone) => {
    const grey = tone * 255;
    return basemapColor(palette, [grey, grey, grey]);
  });

/**
 * Builds the colour-theme LUT for a palette. Pure, deterministic, and
 * safe to call during SSR: pass FALLBACK_PALETTE when there is no
 * document to read.
 *
 * A sweep of `basemapColor` over every cell of the cube, so that "what
 * the theme does to a colour" has one definition and the answer a test
 * asks is the answer the map is painted with.
 */
export const buildLut = (
  palette: Palette,
  options: LutOptions = {},
): string => {
  const { size: requested = LUT_SIZE, strength = 1 } = options;
  const size = clampSize(requested);

  const last = size - 1;
  const width = size * size;
  const pixels = new Uint8Array(width * size * 4);
  let at = 0;

  for (let green = 0; green < size; green += 1) {
    for (let blue = 0; blue < size; blue += 1) {
      for (let red = 0; red < size; red += 1) {
        const src: Rgb = [
          (red / last) * 255,
          (green / last) * 255,
          (blue / last) * 255,
        ];
        const themed = basemapColor(palette, src);
        for (let ch = 0; ch < 3; ch += 1) {
          pixels[at] = byte(lerp(src[ch], themed[ch], strength));
          at += 1;
        }
        pixels[at] = 255;
        at += 1;
      }
    }
  }

  return toBase64(encodePng(width, size, pixels));
};
