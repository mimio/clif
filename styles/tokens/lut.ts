/*
 * The Mapbox colour-theme LUT.
 *
 * WHY THIS EXISTS
 * The site drops its hand-maintained Mapbox style for Mapbox Standard and
 * themes it at runtime instead. Standard takes a 3D colour lookup table:
 *
 *   map.setColorTheme({ data: buildLut(readPalette()) });
 *
 * `data` is a base64 PNG with NO `data:` prefix (mapbox-gl adds one if it
 * is missing). mapbox-gl decodes it and uploads the raw bytes straight to
 * a Texture3D sized [h, h, h], asserting `width === height * height` and
 * `height <= 32`, so the PNG is a cube strip: 32 tall, 1024 wide.
 *
 * THE CUBE LAYOUT, derived rather than guessed
 * The image bytes go to texImage3D as a flat buffer, so texel (x, y, z)
 * sits at (z*N*N + y*N + x) * 4 and image pixel (px, py) sits at
 * (py*N*N + px) * 4. Equate them: py = z, px = y*N + x. The shader then
 * samples with `col.rbg`, so x is RED, y is BLUE and z is GREEN. That
 * gives the layout the loop below writes:
 *
 *   image row        = green
 *   tile along width = blue
 *   pixel in tile    = red
 *
 * This is NOT the usual z-tiled hald strip, and getting it wrong produces
 * a map that looks plausible until you notice the channels are swapped.
 *
 * THE TRANSFORM
 * A luminance ramp with the source's own chroma carried through:
 *
 *   1. Take the cell's colour as the basemap's incoming pixel.
 *   2. Normalise its luminance against SOURCE_FLOOR. Standard's basemap
 *      fills live almost entirely in the top third of the range -- its
 *      water is about 0.76, its land about 0.93 -- so a raw 0-1 ramp puts
 *      every fill on the top anchor and the map comes back one flat
 *      colour. The floor is what makes the ramp use its range.
 *   3. Run the normalised tone through three anchors: --map-deep at the
 *      bottom, --map-land at LAND_STOP (where Standard's land beige
 *      lands), and a highlight at the top -- the theme's body ink warmed
 *      toward the accent on a dark theme, the ground faintly tinted by
 *      the accent on a light one, because a light theme's body ink is
 *      nearly black and would turn every road into a scar.
 *   4. Add back a fraction of the source's own colour opponency
 *      (src - luminance). Without it every fill collapses onto the ramp
 *      and water, parks and roads become one tone; with it water stays
 *      blue and parks stay green inside the theme's terrain.
 *   5. Shade through palette.sh, which is the whole light/dark story in
 *      one function: dark themes multiply toward black, light themes
 *      wash toward the ground instead, and k >= 1 is a no-op so
 *      highlights are never touched.
 *
 * `strength` lerps the whole transform back toward the input, so
 * strength 0 is an exact identity LUT -- the cheapest way to prove the
 * cube layout is right, and what the tests assert.
 *
 * The PNG is written by hand because jsdom has no canvas and this has to
 * run during SSR and under the unit tests. DEFLATE stored blocks mean no
 * compression library: the file is bigger than it needs to be (about
 * 131 KB before base64) and it is built once per theme change.
 *
 * Nothing here is cached. The function is a pure function of the palette
 * numbers; cache it by `palette.key`, which is exactly the value that
 * changes when the theme does.
 */
import {
  type Channel,
  luminance,
  type Palette,
  type Rgb,
} from 'styles/tokens/palette';

/** Mapbox's ceiling. The cube is 32^3 and the strip is 32 x 1024. */
export const LUT_SIZE = 32;

/**
 * Below this relative luminance, a source pixel is already as dark as
 * Standard's basemap gets and maps straight to --map-deep.
 */
const SOURCE_FLOOR = 0.62;

/** Where Standard's land beige sits once the tone is normalised. */
const LAND_STOP = 0.82;

/** How much accent the highlight anchor carries, dark themes / light. */
const DARK_TINT = 0.35;
const LIGHT_TINT = 0.12;

/** How much of the source's own chroma survives, dark themes / light. */
const CHROMA_DARK = 0.3;
const CHROMA_LIGHT = 0.2;

/** The darkest the shading step may take a tone, at the bottom of the ramp. */
const SHADE_FLOOR = 0.72;

export type LutOptions = {
  /** Cube size. Mapbox allows up to 32, which is the default. */
  size?: number;
  /** 0 is an exact identity LUT, 1 the full transform. */
  strength?: number;
};

const clamp01 = (n: number): number => Math.min(1, Math.max(0, n));

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
 * Builds the colour-theme LUT for a palette. Pure, deterministic, and
 * safe to call during SSR: pass FALLBACK_PALETTE when there is no
 * document to read.
 */
export const buildLut = (
  palette: Palette,
  options: LutOptions = {},
): string => {
  const { size = LUT_SIZE, strength = 1 } = options;
  const { deep, land, space, accent, body, light, sh } = palette;

  const highlight = light
    ? mix(space, accent, LIGHT_TINT)
    : mix(body, accent, DARK_TINT);
  const keep = light ? CHROMA_LIGHT : CHROMA_DARK;

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
        const lum = luminance(src);
        const tone = clamp01(
          (lum - SOURCE_FLOOR) / (1 - SOURCE_FLOOR),
        );
        const k = SHADE_FLOOR + (1 - SHADE_FLOOR) * tone;

        for (let ch = 0; ch < 3; ch += 1) {
          const base =
            tone <= LAND_STOP
              ? lerp(deep[ch], land[ch], tone / LAND_STOP)
              : lerp(
                  land[ch],
                  highlight[ch],
                  (tone - LAND_STOP) / (1 - LAND_STOP),
                );
          const carried = base + (src[ch] - lum * 255) * keep;
          const shaded = sh(carried, ch as Channel, k);
          pixels[at] = Math.round(
            Math.min(
              255,
              Math.max(0, lerp(src[ch], shaded, strength)),
            ),
          );
          at += 1;
        }
        pixels[at] = 255;
        at += 1;
      }
    }
  }

  return toBase64(encodePng(width, size, pixels));
};
