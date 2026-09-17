import { Buffer } from 'node:buffer';
import { inflateSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';
import { buildLut, LUT_SIZE, toBase64 } from 'styles/tokens/lut';
import {
  FALLBACK_PALETTE,
  makePalette,
  type Palette,
  PALETTE_TOKENS,
  parseRgb,
  type PaletteColors,
  type Rgb,
} from 'styles/tokens/palette';
import { THEME_SELECTORS, themeBlock } from 'test/theme-css';

const PNG_SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];

type Decoded = {
  width: number;
  height: number;
  bitDepth: number;
  colorType: number;
  pixels: Uint8Array;
};

/*
 * A PNG reader for the encoder in styles/tokens/lut.ts. It goes through
 * node:zlib rather than anything in the module under test, so the
 * assertions below are about the bytes that reach Mapbox, not about the
 * encoder agreeing with itself.
 */
const decodePng = (base64: string): Decoded => {
  const bytes = new Uint8Array(Buffer.from(base64, 'base64'));
  expect([...bytes.subarray(0, 8)]).toEqual(PNG_SIGNATURE);

  const view = new DataView(bytes.buffer);
  const idat: Buffer[] = [];
  let at = 8;
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;

  while (at < bytes.length) {
    const length = view.getUint32(at);
    const type = String.fromCharCode(
      ...bytes.subarray(at + 4, at + 8),
    );
    const data = bytes.subarray(at + 8, at + 8 + length);
    // The chunk's own CRC, which also proves the encoder's crc32 table.
    expect(view.getUint32(at + 8 + length)).toBe(
      crc32(bytes.subarray(at + 4, at + 8 + length)),
    );
    if (type === 'IHDR') {
      const head = new DataView(data.buffer, data.byteOffset, 13);
      width = head.getUint32(0);
      height = head.getUint32(4);
      bitDepth = data[8];
      colorType = data[9];
    }
    if (type === 'IDAT') idat.push(Buffer.from(data));
    at += 12 + length;
  }

  const raw = new Uint8Array(inflateSync(Buffer.concat(idat)));
  const stride = width * 4;
  expect(raw.length).toBe(height * (stride + 1));
  const pixels = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    const from = y * (stride + 1);
    // Every scanline is filter 0; the reader does no un-filtering.
    expect(raw[from]).toBe(0);
    pixels.set(raw.subarray(from + 1, from + 1 + stride), y * stride);
  }
  return { width, height, bitDepth, colorType, pixels };
};

const crc32 = (bytes: Uint8Array): number => {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i += 1) {
    c ^= bytes[i];
    for (let k = 0; k < 8; k += 1) {
      c = (c & 1) === 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
  }
  return (c ^ 0xffffffff) >>> 0;
};

/*
 * The cube layout the module derives in its header: the image row is
 * green, the tile along the width is blue, the pixel inside the tile is
 * red. If this is wrong every other assertion here is meaningless, which
 * is why the identity test exists.
 */
const cell = (
  image: Decoded,
  size: number,
  red: number,
  green: number,
  blue: number,
): number[] => {
  const at = (green * size * size + blue * size + red) * 4;
  return [...image.pixels.subarray(at, at + 4)];
};

const step = (index: number, size: number): number =>
  Math.round((index / (size - 1)) * 255);

const paletteFor = (selector: string): Palette => {
  const block = themeBlock(selector);
  const read = (key: keyof PaletteColors): Rgb =>
    parseRgb(block[PALETTE_TOKENS[key]], FALLBACK_PALETTE[key]);
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

const distance = (a: number[], b: Rgb): number =>
  Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

describe('toBase64', () => {
  it('encodes a length divisible by three with no padding', () => {
    expect(toBase64(Uint8Array.from([77, 97, 110]))).toBe('TWFu');
  });

  it('pads a one-byte remainder with two =', () => {
    expect(toBase64(Uint8Array.from([77]))).toBe('TQ==');
  });

  it('pads a two-byte remainder with one =', () => {
    expect(toBase64(Uint8Array.from([77, 97]))).toBe('TWE=');
  });

  it('agrees with Node on a long run of bytes', () => {
    const bytes = new Uint8Array(1000);
    for (let i = 0; i < bytes.length; i += 1)
      bytes[i] = (i * 37) % 256;
    expect(toBase64(bytes)).toBe(
      Buffer.from(bytes).toString('base64'),
    );
  });
});

describe('buildLut', () => {
  const yellow = paletteFor(':root');

  it('is bare base64, with no data: prefix for mapbox-gl to strip', () => {
    const data = buildLut(yellow);
    expect(data.startsWith('data:')).toBe(false);
    expect(data).toMatch(/^[A-Za-z0-9+/]+={0,2}$/);
  });

  it('decodes to the 32 x 1024 RGBA strip mapbox-gl asserts on', () => {
    const image = decodePng(buildLut(yellow));
    expect(image.height).toBe(LUT_SIZE);
    expect(image.height).toBeLessThanOrEqual(32);
    expect(image.width).toBe(image.height * image.height);
    expect(image.width).toBe(1024);
    expect(image.bitDepth).toBe(8);
    expect(image.colorType).toBe(6);
    expect(image.pixels.length).toBe(1024 * 32 * 4);
  });

  it('is stable across calls', () => {
    expect(buildLut(yellow)).toBe(buildLut(yellow));
  });

  it('at strength 0 every cell maps to its own coordinate', () => {
    const image = decodePng(buildLut(yellow, { strength: 0 }));
    for (let g = 0; g < LUT_SIZE; g += 1) {
      for (let b = 0; b < LUT_SIZE; b += 1) {
        for (let r = 0; r < LUT_SIZE; r += 1) {
          expect(cell(image, LUT_SIZE, r, g, b)).toEqual([
            step(r, LUT_SIZE),
            step(g, LUT_SIZE),
            step(b, LUT_SIZE),
            255,
          ]);
        }
      }
    }
  });

  it('honours a smaller cube, still width = height squared', () => {
    const image = decodePng(
      buildLut(yellow, { size: 4, strength: 0 }),
    );
    expect(image.width).toBe(16);
    expect(image.height).toBe(4);
    expect(cell(image, 4, 3, 0, 1)).toEqual([255, 0, 85, 255]);
  });

  it('sends black to the theme terrain, not to black', () => {
    const image = decodePng(buildLut(yellow));
    const dark = cell(image, LUT_SIZE, 0, 0, 0);
    expect(distance(dark, yellow.deep)).toBeLessThan(
      distance(dark, yellow.land),
    );
    expect(distance(dark, [0, 0, 0])).toBeGreaterThan(20);
  });

  it('sends white to the theme highlight: body ink warmed by accent', () => {
    const image = decodePng(buildLut(yellow));
    const high = cell(image, LUT_SIZE, 31, 31, 31);
    // mix(body, accent, 0.35) for the yellow theme.
    expect(high.slice(0, 3)).toEqual([242, 233, 164]);
  });

  it('keeps the source chroma apart: blue stays bluer than red', () => {
    const image = decodePng(buildLut(yellow));
    const blue = cell(image, LUT_SIZE, 8, 8, 24);
    const red = cell(image, LUT_SIZE, 24, 8, 8);
    expect(blue[2]).toBeGreaterThan(red[2]);
    expect(red[0]).toBeGreaterThan(blue[0]);
  });

  it('gives all eight themes a different map', () => {
    const luts = THEME_SELECTORS.map((selector) =>
      buildLut(paletteFor(selector)),
    );
    expect(new Set(luts).size).toBe(8);
  });

  it('lifts a light theme instead of shading it down', () => {
    const paper = paletteFor("[data-theme='paper']");
    expect(paper.light).toBe(true);
    const image = decodePng(buildLut(paper));
    const dark = cell(image, LUT_SIZE, 0, 0, 0);
    // The light branch of sh washes toward the ground, so the darkest
    // input lands ABOVE --map-deep rather than below it.
    expect(dark[0]).toBeGreaterThan(paper.deep[0]);
    expect(dark[1]).toBeGreaterThan(paper.deep[1]);
    expect(dark[2]).toBeGreaterThan(paper.deep[2]);
  });
});
