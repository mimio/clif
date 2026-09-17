import { describe, expect, it } from 'vitest';
import {
  isMobile,
  isTablet,
  MOBILE,
  TABLET,
} from 'styles/breakpoints';
import { palette } from 'styles/palette';

/*
 * These two modules predate the rewrite and their consumers are already gone:
 * breakpoints.ts fed the deleted device selectors, and palette.ts fed the
 * deleted Mapbox layer paint. styles/ belongs to the design-token lane, so
 * Lane A left them in place rather than reaching into someone else's
 * directory. This file exists only to keep the 100% gate honest until that
 * lane replaces them -- delete it with them.
 */
describe('breakpoints (legacy)', () => {
  it('shifts one class off the CSS breakpoints', () => {
    expect(MOBILE).toBe(650);
    expect(TABLET).toBe(1000);
  });

  it('treats an unknown width as neither', () => {
    expect(isMobile(undefined)).toBe(false);
    expect(isTablet(undefined)).toBe(false);
  });

  it('classifies a width', () => {
    expect(isMobile(400)).toBe(true);
    expect(isMobile(800)).toBe(false);
    expect(isTablet(800)).toBe(true);
    expect(isTablet(1400)).toBe(false);
  });
});

describe('palette (legacy)', () => {
  it('is the one colour code paints with', () => {
    expect(palette.accent.toLowerCase()).toBe('#ffe520');
  });
});
