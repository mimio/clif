import { describe, expect, it } from 'vitest';
import { ARTBOARD_DESKTOP } from 'content/cameras';
import {
  clampGlobeZoom,
  GLOBE_MIN_ZOOM,
  globeCenterInView,
  globeLimb,
  globeLimbAngle,
  globeScreenRadius,
  globeWorldRadius,
  globeZoomForScreenRadius,
  globeZoomForWorldRadius,
  limbRadii,
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

describe('the globe angular radius', () => {
  /*
   * The angle mapbox's atmosphere shader measures its falloff from --
   * `u_horizon_angle`, which `drawAtmosphereGlow` computes as
   * `acos(sqrt(D^2 - R^2) / D)`, i.e. `asin(R / D)`. This module reaches
   * it the other way round, through the painted radius and the focal
   * length, so the two are worth holding together.
   */
  it('is the painted radius over the focal length', () => {
    for (const height of [900, 800, 844, 1440]) {
      for (const zoom of [0.5, 1.4, 2.2, 2.6, 3]) {
        expect(globeLimbAngle(zoom, height)).toBeCloseTo(
          Math.atan(globeScreenRadius(zoom, height) / (1.5 * height)),
          12,
        );
        // ...and the same as asin(R / (d + R)), which is the form the
        // shader uses and this file's header derives the radius from.
        const r = globeWorldRadius(zoom);
        const d = 1.5 * height * Math.SQRT1_2;
        expect(globeLimbAngle(zoom, height)).toBeCloseTo(
          Math.asin(r / (d + r)),
          12,
        );
      }
    }
  });

  it('shrinks with the globe, which is why the fog is solved per camera', () => {
    // 1a's desktop hello against 1f's mobile one: the mobile sphere
    // subtends nearly half the angle, so an angular fadeout that is
    // right for one covers 1.7x as many RADII on the other.
    const desktop = globeLimbAngle(2.198198043081919, 900);
    const mobile = globeLimbAngle(1.0455375319488909, 844);
    expect(desktop).toBeGreaterThan(mobile * 1.7);
  });
});

/*
 * The same measurement again, now for a globe that is not on the view
 * axis, because that is where the two ways of asking "is this point on
 * the planet?" come apart.
 *
 * READ OFF THE LIVE TRANSFORM, in Chromium, through the hermetic
 * harness: `/` unpitched and `/projects` at pitch 25, each with mapbox's
 * own `globeCenterInViewSpace` and the limb bisected in three
 * directions from the padded axis. e2e/hermetic/globe-stars.spec.ts
 * takes the same readings on every PR; these hold the arithmetic to
 * them without a browser.
 */
const SILHOUETTES = [
  {
    route: '/',
    box: { width: 1280, height: 720 },
    pitch: 0,
    padding: { top: 0, right: 0, bottom: 0, left: 409.6 },
    worldSize: 1879.6781598500424,
    centerInView: [0, 0, -1062.8353942434833],
    axis: { x: 844.8, y: 360 },
    // left, right, down from the axis, to the 0.005px the
    // bisection stops at.
    limb: [316.8068, 316.8068, 316.8068],
  },
  {
    route: '/projects',
    box: { width: 1280, height: 720 },
    pitch: 25,
    padding: { top: 0, right: 0, bottom: 72, left: 798.72 },
    worldSize: 1164.3822200671025,
    centerInView: [0, -78.31842700616227, -931.629732399609],
    axis: { x: 1039.36, y: 324 },
    limb: [197.9561, 197.9561, 314.5561],
  },
] as const;

const geometryFor = (shot: (typeof SILHOUETTES)[number]) => ({
  zoom: globeZoomForWorldRadius(shot.worldSize / (2 * Math.PI)),
  pitch: shot.pitch,
  padding: shot.padding,
});

describe('the globe silhouette', () => {
  it('puts the sphere where mapbox puts it', () => {
    for (const shot of SILHOUETTES) {
      const { zoom } = geometryFor(shot);
      const at = globeCenterInView(zoom, shot.pitch, shot.box.height);
      // Every digit the transform prints, on both routes. Note x: the
      // /projects camera carries a bearing of -12 and the centre is
      // still exactly on the axis, because the bearing turns the planet
      // about that very point.
      expect(at[0]).toBeCloseTo(shot.centerInView[0], 9);
      expect(at[1]).toBeCloseTo(shot.centerInView[1], 9);
      expect(at[2]).toBeCloseTo(shot.centerInView[2], 9);
    }
  });

  it('lands the padded axis where the map centre is drawn', () => {
    for (const shot of SILHOUETTES) {
      const limb = globeLimb(geometryFor(shot), shot.box);
      expect(limb.axis.x).toBeCloseTo(shot.axis.x, 6);
      expect(limb.axis.y).toBeCloseTo(shot.axis.y, 6);
    }
  });

  it('reads exactly one radius at the painted limb, at any pitch', () => {
    for (const shot of SILHOUETTES) {
      const limb = globeLimb(geometryFor(shot), shot.box);
      const [left, right, down] = shot.limb;
      const points = [
        [shot.axis.x - left, shot.axis.y],
        [shot.axis.x + right, shot.axis.y],
        [shot.axis.x, shot.axis.y + down],
      ] as const;
      for (const [x, y] of points) {
        // The bisection that measured these stops at 0.005px, so four
        // decimal places is the measurement's own floor, not the
        // model's.
        expect(limbRadii(limb, x, y)).toBeCloseTo(1, 4);
      }
    }
  });

  it('is the painted disc when nothing is pitched', () => {
    /*
     * Unpitched, the sphere's centre is ON the axis, so the angular
     * measure collapses to the screen one this file's first half
     * solves: `tan(angle) / tanLimb` is `hypot / (f * tanLimb)`. Which
     * makes globeScreenRadius the special case rather than a second
     * answer -- and the /specimens board's stand-in circle exact.
     */
    for (const height of [720, 900, 844]) {
      for (const zoom of [0.5, 1.6, 2.6]) {
        const limb = globeLimb(
          {
            zoom,
            pitch: 0,
            padding: { top: 0, right: 0, bottom: 0, left: 0 },
          },
          { width: 1280, height },
        );
        expect(limb.r).toBeCloseTo(
          globeScreenRadius(zoom, height),
          9,
        );
        expect(limb.cx).toBeCloseTo(640, 9);
        expect(limb.cy).toBeCloseTo(height / 2, 9);
        expect(limbRadii(limb, 640 + limb.r, height / 2)).toBeCloseTo(
          1,
          9,
        );
        // ...and twice the painted radius really is two radii out,
        // which is the scale scene/stars.ts fades its field across.
        expect(
          limbRadii(limb, 640 + 2 * limb.r, height / 2),
        ).toBeCloseTo(2, 9);
      }
    }
  });

  it('slides the silhouette down the frame as the camera tilts', () => {
    const still = globeLimb(
      {
        zoom: 1.6,
        pitch: 0,
        padding: { top: 0, right: 0, bottom: 0, left: 0 },
      },
      { width: 1280, height: 720 },
    );
    const tilted = globeLimb(
      {
        zoom: 1.6,
        pitch: 35,
        padding: { top: 0, right: 0, bottom: 0, left: 0 },
      },
      { width: 1280, height: 720 },
    );
    expect(tilted.cy).toBeGreaterThan(still.cy + 100);
    expect(tilted.cx).toBeCloseTo(still.cx, 9);
    // And the point the axis lands on, which is where the disc model
    // thought the centre was, is off the planet by then -- a star put
    // there by the old screen-distance measure was a star on the globe.
    expect(
      limbRadii(tilted, tilted.axis.x, tilted.axis.y),
    ).toBeLessThan(1);
    expect(limbRadii(tilted, tilted.cx, tilted.cy)).toBeCloseTo(0, 6);
  });

  it('falls back to the artboard when there is no viewport', () => {
    const geometry = {
      zoom: 1.6,
      pitch: 0,
      padding: { top: 0, right: 0, bottom: 0, left: 0 },
    };
    expect(globeLimb(geometry, null)).toEqual(
      globeLimb(geometry, ARTBOARD_DESKTOP),
    );
  });
});
