import { describe, expect, it } from 'vitest';
import {
  clampGlobeZoom,
  GLOBE_MIN_ZOOM,
  globeScreenRadius,
  globeWorldRadius,
  globeZoomForScreenRadius,
  globeZoomForWorldRadius,
} from 'scene/globe';

/*
 * scene/globe.ts is a model of something that lives in a browser, so the
 * only test worth writing is one that checks it against the browser.
 *
 * MEASURED, in Chromium, against the real mapbox-gl 3.30 through the
 * hermetic harness, by bisecting for the painted limb: the outermost
 * screen point whose `unproject` still round-trips through `project`.
 * The bisection stops at 0.005px and the round-trip tolerance is 0.01px,
 * so each figure carries about +0.01px of its own.
 *
 * e2e/hermetic/globe-frame.spec.ts runs that measurement on every PR and
 * asserts the FRAMING it produces. This holds the arithmetic to the same
 * numbers without a browser, so a change to the model that the e2e tier
 * would catch fails here first and says which term moved.
 */
const MEASURED: {
  zoom: number;
  height: number;
  radius: number;
}[] = [
  // The sweep: one viewport, the whole globe-projection range.
  { zoom: 0, height: 900, radius: 106.5 },
  { zoom: 0.8, height: 900, radius: 176.16 },
  { zoom: 1.6, height: 900, radius: 283.58 },
  { zoom: 2.198, height: 900, radius: 395.966 },
  { zoom: 2.8, height: 900, radius: 542.45 },
  // Height is the only other term: same zoom, four viewports.
  { zoom: 1.6, height: 1080, radius: 292.0 },
  { zoom: 1.6, height: 800, radius: 277.72 },
  { zoom: 1.6, height: 700, radius: 270.7 },
  { zoom: 1.6, height: 640, radius: 265.76 },
  // The framed zooms themselves, desktop and mobile.
  { zoom: 2.4612, height: 1080, radius: 475.21 },
  { zoom: 1.0455, height: 844, radius: 202.81 },
  { zoom: 1.0283, height: 400, radius: 176.01 },
];

describe('the globe projection', () => {
  it('matches mapbox-gl to a tenth of a percent', () => {
    MEASURED.forEach(({ zoom, height, radius }) => {
      const modelled = globeScreenRadius(zoom, height);
      expect(
        Math.abs(modelled - radius) / radius,
        `z=${zoom} h=${height}: modelled ${modelled}, measured ${radius}`,
      ).toBeLessThan(0.001);
    });
  });

  it('is bigger than the flat radius low down and smaller high up', () => {
    // The perspective factor, which is the whole reason the naive
    // worldSize / (2 * PI) answer is wrong: about 1.31 at zoom 0, and
    // through 1.0 somewhere around zoom 2.6 on a 900px viewport.
    expect(
      globeScreenRadius(0, 900) / globeWorldRadius(0),
    ).toBeCloseTo(1.307, 2);
    expect(
      globeScreenRadius(2.8, 900) / globeWorldRadius(2.8),
    ).toBeLessThan(1);
  });

  it('inverts itself', () => {
    [400, 640, 844, 900, 1080, 1600].forEach((height) => {
      [0.2, 0.44, 0.52, 0.8].forEach((ratio) => {
        const wanted = ratio * height;
        const zoom = globeZoomForScreenRadius(wanted, height);
        expect(globeScreenRadius(zoom, height)).toBeCloseTo(
          wanted,
          6,
        );
      });
    });
  });

  it('round-trips the flat radius too', () => {
    [0, 1.6, 2.2, 10.5].forEach((zoom) => {
      expect(
        globeZoomForWorldRadius(globeWorldRadius(zoom)),
      ).toBeCloseTo(zoom, 12);
    });
  });

  it('depends on the height and not on the width', () => {
    // 0.44 * height at every height resolves to the same zoom only
    // because the camera distance scales with the height as well.
    expect(globeZoomForScreenRadius(0.44 * 900, 900)).toBeCloseTo(
      2.198198,
      6,
    );
    expect(globeZoomForScreenRadius(0.44 * 450, 450)).toBeCloseTo(
      1.198198,
      6,
    );
  });

  it('leaves a zoom the map will adopt', () => {
    expect(clampGlobeZoom(2.2)).toBe(2.2);
    expect(clampGlobeZoom(-1.5)).toBe(GLOBE_MIN_ZOOM);
    // A frame with no box to fill solves to -Infinity, and easeTo must
    // never see it.
    expect(clampGlobeZoom(globeZoomForScreenRadius(0, 900))).toBe(
      GLOBE_MIN_ZOOM,
    );
    expect(clampGlobeZoom(Number.NaN)).toBe(GLOBE_MIN_ZOOM);
  });
});
