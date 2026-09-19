import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  ARTBOARD_DESKTOP,
  ARTBOARD_MOBILE,
  cameras,
  SPHERE_RIMS,
  SPIN_DEG_PER_SECOND,
  type Viewport,
} from 'content/cameras';
import { paddingFor } from 'scene/camera';
import { globeScreenRadius } from 'scene/globe';
import {
  ensureMap,
  resetMapForTests,
  watchSky,
} from 'scene/mapbox/instance';
import StarField from 'scene/StarField';
import {
  MAPBOX_STAR_COUNT,
  mapboxStarDiameter,
  paintedStars,
  type SkyView,
  skyRotation,
  STAR_ALPHA_MAX,
  STAR_ALPHA_MIN,
  STAR_COUNT,
  STAR_MAX_SCALE,
  STAR_MIN_SCALE,
  STAR_SPACE_EDGE,
  starFade,
  starInk,
  stars,
} from 'scene/stars';
import {
  FALLBACK_PALETTE,
  makePalette,
  type Palette,
} from 'styles/tokens/palette';
import { FakeMap, installMapboxStub } from 'test/fake-mapbox';

/*
 * The accent star field: the numbers it is derived from, the sphere it
 * is scattered on, and where a camera puts it on screen.
 *
 * The first of those is the one worth having. Everything scene/stars.ts
 * claims -- that its stars are bigger than mapbox's biggest, and that
 * they turn with them -- rests on constants and a rotation compiled into
 * mapbox-gl's bundle, which no API exposes and which a minor upgrade is
 * free to change. So the first block below reads them back out of the
 * installed library rather than trusting the comments that quote them.
 */

const require_ = createRequire(import.meta.url);

const mapboxSource = (): string =>
  readFileSync(
    require_.resolve('mapbox-gl/dist/mapbox-gl-dev.js'),
    'utf8',
  );

const dark = FALLBACK_PALETTE;

/*
 * Two palettes built off the fallback rather than written out, so a token
 * added to PaletteColors does not have to be added here as well. One is
 * the same scope over a paper ground, which is the branch the field turns
 * itself off on; the other differs only in the two accents, which is what
 * makes "the stars are theme tokens" a claim a test can separate.
 */
const light: Palette = makePalette({
  ...dark,
  space: [244, 244, 240],
});

const repainted: Palette = makePalette({
  ...dark,
  accent: [10, 120, 200],
  accent2: [200, 40, 120],
});

/** The hello camera, as the transform reports it. */
const helloView: SkyView = {
  center: cameras.hello.center,
  bearing: cameras.hello.bearing,
  pitch: cameras.hello.pitch,
  zoom: cameras.hello.zoom,
  padding: cameras.hello.padding,
};

/* ---- what mapbox actually draws --------------------------------------- */

describe('mapbox s own stars', () => {
  it('still draws them at the size scene/stars.ts measured', () => {
    const source = mapboxSource();
    /*
     * `createDefaultStarsParams`, verbatim from the bundle. The size
     * of a star is `sizeMultiplier * (1 + 0.01 * sizeRange * (rand -
     * 0.5))` in world units on a sphere of radius 200, so these three
     * numbers and the 200 below are the whole of what mapboxStarDiameter
     * is built out of.
     */
    expect(source).toContain(
      `starsCount: ${MAPBOX_STAR_COUNT / 1e3}e3`,
    );
    expect(source).toContain('sizeMultiplier: 0.15');
    expect(source).toContain('sizeRange: 100');
    // The sphere the field is scattered on, from `Atmosphere.update`.
    expect(source).toContain('index.scale$3([], stars[i], 200)');
    // And white, which is the other half of why this field exists.
    expect(source).toContain('vec3 color=vec3(1.0,1.0,1.0)');
  });

  it('still turns them the way skyRotation rebuilds', () => {
    /*
     * THE WHOLE REASON THE FIELD MOVES AT ALL. `Atmosphere.drawStars`
     * composes four quaternion turns and hands the product to
     * `starsProjMatrix`; scene/stars.ts's `skyRotation` is that
     * composition as matrices. If mapbox reorders these, or starts
     * offsetting the star camera by the padding, the two fields drift
     * apart on screen and nothing else in the suite would say so.
     */
    const source = mapboxSource();
    expect(source).toContain(
      'index.rotateX(orientation, orientation, -tr._pitch)',
    );
    expect(source).toContain(
      'index.rotateZ(orientation, orientation, -tr.angle)',
    );
    expect(source).toContain(
      'index.rotateX(orientation, orientation, index.degToRad(tr._center.lat))',
    );
    expect(source).toContain(
      'index.rotateY(orientation, orientation, -index.degToRad(tr._center.lng))',
    );
    // A plain perspective, with no padding in it: the sky turns about
    // the middle of the canvas, not about the globe.
    expect(source).toContain(
      'perspective(this.starsProjMatrix, this._fov, this.width / this.height',
    );
  });

  it('measures the largest at 3.04px on the artboard', () => {
    // 2 * (1.5 * 900) * 0.15 * 1.5 / 200.
    expect(mapboxStarDiameter(ARTBOARD_DESKTOP.height)).toBeCloseTo(
      3.0375,
      4,
    );
    // It is a function of the height alone, and linear in it: mapbox
    // sizes the quad through the same focal length the globe uses.
    expect(mapboxStarDiameter(1800)).toBeCloseTo(
      2 * mapboxStarDiameter(900),
      10,
    );
  });
});

/* ---- the field --------------------------------------------------------- */

describe('the accent field', () => {
  it('is one star for every five of mapbox s, on a sphere', () => {
    expect(STAR_COUNT).toBe(MAPBOX_STAR_COUNT / 5);
    expect(stars).toHaveLength(STAR_COUNT);
    for (const star of stars) {
      expect(Math.hypot(...star.at)).toBeCloseTo(1, 10);
    }
  });

  it('packs the sphere evenly rather than at random', () => {
    /*
     * The claim the Fibonacci lattice makes, stated as a property: no
     * two stars land on top of each other. A uniform random sample --
     * which is what mapbox does -- would put the closest pair an order
     * of magnitude nearer than this. The even packing for 3,200 points
     * is about 3.59 degrees; measuring every pair is 5 million dot
     * products, so this takes a slice.
     */
    const sample = stars.slice(0, 200);
    let closest = Math.PI;
    for (const star of sample) {
      for (const other of stars) {
        if (other === star) continue;
        const dot =
          star.at[0] * other.at[0] +
          star.at[1] * other.at[1] +
          star.at[2] * other.at[2];
        closest = Math.min(closest, Math.acos(Math.min(1, dot)));
      }
    }
    expect((closest * 180) / Math.PI).toBeGreaterThan(3);
  });

  it('spreads size and brightness together, over both accents', () => {
    for (const star of stars) {
      expect(star.scale).toBeGreaterThanOrEqual(STAR_MIN_SCALE);
      expect(star.scale).toBeLessThanOrEqual(STAR_MAX_SCALE);
      expect(star.alpha).toBeGreaterThanOrEqual(STAR_ALPHA_MIN);
      expect(star.alpha).toBeLessThanOrEqual(STAR_ALPHA_MAX);
      // One draw decides both, so the two always agree about a star.
      const t =
        (star.scale - STAR_MIN_SCALE) /
        (STAR_MAX_SCALE - STAR_MIN_SCALE);
      expect(star.alpha).toBeCloseTo(
        STAR_ALPHA_MIN + (STAR_ALPHA_MAX - STAR_ALPHA_MIN) * t,
        10,
      );
    }
    const inks = new Set(stars.map((star) => star.ink));
    expect([...inks].sort()).toEqual(['accent', 'accent2']);
  });

  it('puts 770 of the 3200 over mapbox s largest, the widest at 1.70x', () => {
    /*
     * THE POINT OF THE WHOLE FIELD, pinned to the digit because the
     * seed makes it a fact rather than a distribution. A change to the
     * seed, the count, the spread or the falloff lands here.
     */
    const bigger = stars.filter((star) => star.scale > 1);
    expect(bigger).toHaveLength(770);
    const widest = Math.max(...stars.map((star) => star.scale));
    expect(widest).toBeCloseTo(1.6991, 4);
    expect(
      widest * mapboxStarDiameter(ARTBOARD_DESKTOP.height),
    ).toBeCloseTo(5.16, 2);
  });

  it('takes both accents from the live palette, at a given alpha', () => {
    expect(starInk(dark, 'accent', 0.4)).toBe(dark.a(0.4));
    expect(starInk(dark, 'accent2', 0.4)).toBe(dark.b(0.4));
    // Theme tokens, not fixed yellow: a different palette repaints it.
    expect(starInk(repainted, 'accent', 0.4)).not.toBe(
      starInk(dark, 'accent', 0.4),
    );
  });
});

/* ---- the sky's rotation ------------------------------------------------ */

describe('the rotation the sky turns by', () => {
  const apply = (
    rotation: readonly number[],
    v: readonly [number, number, number],
  ): [number, number, number] => [
    rotation[0] * v[0] + rotation[1] * v[1] + rotation[2] * v[2],
    rotation[3] * v[0] + rotation[4] * v[1] + rotation[5] * v[2],
    rotation[6] * v[0] + rotation[7] * v[1] + rotation[8] * v[2],
  ];

  const still: SkyView['center'] = [0, 0];

  it('is the identity for a camera at the origin', () => {
    const rotation = skyRotation({
      center: still,
      bearing: 0,
      pitch: 0,
    });
    expect([...rotation]).toEqual([1, 0, 0, 0, 1, 0, 0, 0, 1]);
  });

  it('turns about Y for longitude and about X for latitude', () => {
    /*
     * A camera 90 degrees east swings the sphere's +X behind the
     * viewer: the camera looks down -Z, so +Z is over its shoulder.
     * That is the whole of the hello route's motion, one quarter turn
     * at a time.
     */
    const east = skyRotation({
      center: [90, 0],
      bearing: 0,
      pitch: 0,
    });
    const swung = apply(east, [1, 0, 0]);
    expect(swung[0]).toBeCloseTo(0, 10);
    expect(swung[2]).toBeCloseTo(1, 10);

    // And 90 degrees north swings +Y onto +Z.
    const north = skyRotation({
      center: [0, 90],
      bearing: 0,
      pitch: 0,
    });
    const lifted = apply(north, [0, 1, 0]);
    expect(lifted[1]).toBeCloseTo(0, 10);
    expect(lifted[2]).toBeCloseTo(1, 10);
  });

  it('stays a rotation: orthonormal, and its own inverse turned back', () => {
    const rotation = skyRotation({
      center: [-122.7, 45.5],
      bearing: -12,
      pitch: 25,
    });
    const rows: [number, number, number][] = [
      [rotation[0], rotation[1], rotation[2]],
      [rotation[3], rotation[4], rotation[5]],
      [rotation[6], rotation[7], rotation[8]],
    ];
    for (const row of rows) {
      expect(Math.hypot(...row)).toBeCloseTo(1, 10);
    }
    const dot = (a: number[], b: number[]) =>
      a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    expect(dot(rows[0], rows[1])).toBeCloseTo(0, 10);
    expect(dot(rows[0], rows[2])).toBeCloseTo(0, 10);
    expect(dot(rows[1], rows[2])).toBeCloseTo(0, 10);
  });
});

/* ---- what lands on screen ---------------------------------------------- */

describe('the field, resolved against a camera', () => {
  it('fades a star in across the atmosphere and not before', () => {
    expect(starFade(0.5)).toBe(0);
    expect(starFade(1)).toBe(0);
    expect(starFade(STAR_SPACE_EDGE)).toBe(1);
    expect(starFade(9)).toBe(1);
    // Halfway across the halo, and the halo is the design's own reach.
    expect(starFade(1 + SPHERE_RIMS.haloReach / 2)).toBeCloseTo(
      0.5,
      10,
    );
    expect(STAR_SPACE_EDGE).toBe(1 + SPHERE_RIMS.haloReach);
  });

  it('leaves about sixty stars in hello s sky, plus the halo band', () => {
    /*
     * The density the screen-space field this replaced was built for:
     * 3,200 on the sphere is roughly 157 inside a 1440x900 frame, and
     * the globe takes all but 90 of those. 56 of the 90 are out past
     * the atmosphere's reach at their own brightness; the rest are in
     * the band between the limb and 1.34r, dimmed into the halo.
     */
    const painted = paintedStars(helloView, ARTBOARD_DESKTOP);
    expect(painted).toHaveLength(90);
    const radius = globeScreenRadius(
      cameras.hello.zoom,
      ARTBOARD_DESKTOP.height,
    );
    const past = painted.filter(
      (star) =>
        Math.hypot(star.x - 0.66 * 1440, star.y - 450) / radius >=
        STAR_SPACE_EDGE,
    );
    expect(past).toHaveLength(56);
    for (const star of painted) {
      expect(star.alpha).toBeGreaterThan(0);
      expect(star.alpha).toBeLessThanOrEqual(STAR_ALPHA_MAX);
      expect(star.r).toBeGreaterThan(0);
    }
  });

  it('keeps every one of them clear of the globe and its halo', () => {
    /*
     * The claim the fade makes. The disc is the padded one -- artboard
     * 1a's sphere of radius h * 0.44 about w * 0.66, h * 0.5 -- while
     * the sky itself turns about the middle of the canvas, which is the
     * asymmetry mapbox's own star camera has.
     */
    const painted = paintedStars(helloView, ARTBOARD_DESKTOP);
    const radius = globeScreenRadius(
      cameras.hello.zoom,
      ARTBOARD_DESKTOP.height,
    );
    for (const star of painted) {
      const dd =
        Math.hypot(star.x - 0.66 * 1440, star.y - 450) / radius;
      expect(dd).toBeGreaterThan(1);
    }
  });

  it('turns the whole field east as the globe turns', () => {
    /*
     * THE REGRESSION THIS FIELD WAS REBUILT FOR. A second of the hello
     * spin walks the centre longitude 1.5 degrees east, and mapbox's own
     * stars answer by sweeping across the frame. Measured here on the
     * star nearest the middle of the sky, which is the one a viewer
     * watches: about 27 pixels a second, leftward on screen is what
     * "east" looks like for the ground -- the sky goes the other way.
     */
    const before = paintedStars(helloView, ARTBOARD_DESKTOP);
    const after = paintedStars(
      {
        ...helloView,
        center: [
          helloView.center[0] + SPIN_DEG_PER_SECOND,
          helloView.center[1],
        ],
      },
      ARTBOARD_DESKTOP,
    );
    // Not the same sky: every position has moved.
    const moved = before.filter((star) =>
      after.every(
        (other) => Math.hypot(other.x - star.x, other.y - star.y) > 1,
      ),
    );
    expect(moved).toHaveLength(before.length);

    // And by the amount the geometry says. The field is rigid on the
    // sphere, so the whole of it travels together: the median step is
    // the honest measure of the rate.
    const steps = before
      .map((star) => {
        const near = after.reduce((best, other) =>
          Math.hypot(other.x - star.x, other.y - star.y) <
          Math.hypot(best.x - star.x, best.y - star.y)
            ? other
            : best,
        );
        return Math.hypot(near.x - star.x, near.y - star.y);
      })
      .sort((a, b) => a - b);
    const median = steps[Math.floor(steps.length / 2)];
    expect(median).toBeGreaterThan(15);
    expect(median).toBeLessThan(45);
  });

  it('is behind the globe entirely on a terrain route', () => {
    // /about sits at zoom 10.5, where the disc is many viewports wide.
    const painted = paintedStars(
      {
        center: cameras.about.center,
        bearing: cameras.about.bearing,
        pitch: cameras.about.pitch,
        zoom: cameras.about.zoom,
        padding: cameras.about.padding,
      },
      ARTBOARD_DESKTOP,
    );
    expect(painted).toEqual([]);
  });

  it('scales the field with the box, and falls back to the artboard', () => {
    expect(paintedStars(helloView, null)).toEqual(
      paintedStars(helloView, ARTBOARD_DESKTOP),
    );
    // A shorter viewport has a shorter focal length, so the same star
    // draws smaller: mapbox sizes its own through the same one.
    const tall: Viewport = { width: 1440, height: 1800 };
    const short = paintedStars(helloView, ARTBOARD_MOBILE);
    const big = paintedStars(helloView, tall);
    expect(short.length).toBeGreaterThan(0);
    expect(big.length).toBeGreaterThan(0);
    const widest = (field: { r: number }[]) =>
      Math.max(...field.map((star) => star.r));
    expect(widest(big)).toBeGreaterThan(widest(short));
  });

  it('puts the globe where paddingFor put it', () => {
    /*
     * The round trip. paddingFor turns a fraction of the viewport into
     * the padding mapbox takes; the fade reads that padding back into
     * pixels, because a camera read off the transform carries the
     * padding and not the fraction it came from. A globe pushed hard to
     * one side leaves the sky on the other.
     */
    const left = paintedStars(
      {
        ...helloView,
        padding: paddingFor([0.1, 0.5], ARTBOARD_DESKTOP),
      },
      ARTBOARD_DESKTOP,
    );
    const right = paintedStars(
      {
        ...helloView,
        padding: paddingFor([0.9, 0.5], ARTBOARD_DESKTOP),
      },
      ARTBOARD_DESKTOP,
    );
    const mean = (field: { x: number }[]) =>
      field.reduce((sum, star) => sum + star.x, 0) / field.length;
    expect(mean(left)).toBeGreaterThan(mean(right));
  });
});

/* ---- the component ----------------------------------------------------- */

/**
 * How many `move` handlers this map is carrying.
 *
 * `bound` holds the scene's own lifecycle bindings too, so counting all
 * of them would answer a different question -- see LIFECYCLE_EVENTS in
 * test/fake-mapbox.ts.
 */
const moves = (map: FakeMap): number =>
  map.bound.filter((entry) => entry.startsWith('move|')).length;

describe('StarField', () => {
  beforeEach(() => {
    resetMapForTests();
  });

  afterEach(() => {
    resetMapForTests();
  });

  const field = (
    palette = dark,
    viewport: Viewport | null = null,
    follow = true,
  ) =>
    render(
      <StarField
        camera={cameras.hello}
        follow={follow}
        palette={palette}
        viewport={viewport}
      />,
    );

  it('is a canvas over the map, out of the way of a drag', () => {
    const { container } = field();
    const canvas = container.querySelector('canvas');
    expect(canvas).not.toBeNull();
    expect(canvas).toHaveAttribute('aria-hidden', 'true');
    expect(canvas).toHaveStyle({
      pointerEvents: 'none',
      zIndex: '1',
    });
  });

  it('is nothing at all over a bright ground', () => {
    /*
     * scene/theme.ts sends mapbox a star-intensity of zero on a light
     * theme for the same reason. The two have to agree, or half the sky
     * is there.
     */
    const { container } = field(light);
    expect(container.querySelector('canvas')).toBeNull();
  });

  it('follows the transform, and lets go when it unmounts', async () => {
    const teardown = installMapboxStub();
    try {
      const view = field(dark, ARTBOARD_DESKTOP);
      await act(async () => {
        await ensureMap(document.createElement('div'));
      });
      const map = FakeMap.last;
      expect(moves(map)).toBe(1);
      await act(async () => {
        map.easeTo({ center: [10, 20], zoom: 3, duration: 0 });
      });
      await act(async () => {
        view.unmount();
      });
      expect(map.calls.strayOff).toEqual([]);
      expect(moves(map)).toBe(0);
    } finally {
      teardown();
    }
  });

  it('never subscribes when it is not following', async () => {
    const teardown = installMapboxStub();
    try {
      field(dark, ARTBOARD_DESKTOP, false);
      await act(async () => {
        await ensureMap(document.createElement('div'));
      });
      // The /specimens board draws one instant of a sky of its own; the
      // map behind the page has nothing to say about it.
      expect(moves(FakeMap.last)).toBe(0);
    } finally {
      teardown();
    }
  });
});

/* ---- the subscription -------------------------------------------------- */

describe('watchSky', () => {
  beforeEach(() => {
    resetMapForTests();
  });

  afterEach(() => {
    resetMapForTests();
  });

  it('reports a moved transform and stays quiet about a still one', async () => {
    const teardown = installMapboxStub();
    try {
      const seen: SkyView[] = [];
      const stop = watchSky((view) => seen.push(view));
      await act(async () => {
        await ensureMap(document.createElement('div'));
      });
      const map = FakeMap.last;
      const settled = seen.length;
      expect(settled).toBeGreaterThan(0);

      /*
       * THE SPIN IS A MOVE HERE, and that is the difference from
       * watchCamera's filter. The sky is anchored to the planet's
       * centre, so a rotation that leaves the globe's disc exactly where
       * it was still turns every star in the frame.
       */
      map.setCenter([10, 0]);
      expect(seen).toHaveLength(settled + 1);
      expect(seen.at(-1)?.center).toEqual([10, 0]);

      // A camera that has not moved is not an event, however it arrives.
      map.setCenter([10, 0]);
      expect(seen).toHaveLength(settled + 1);

      map.easeTo({ zoom: 3, duration: 0 });
      expect(seen).toHaveLength(settled + 2);
      expect(seen.at(-1)?.zoom).toBe(3);

      map.easeTo({
        zoom: 3,
        padding: { top: 0, right: 0, bottom: 0, left: 40 },
        duration: 0,
      });
      expect(seen).toHaveLength(settled + 3);
      expect(seen.at(-1)?.padding.left).toBe(40);

      stop();
      map.setCenter([20, 0]);
      expect(seen).toHaveLength(settled + 3);
    } finally {
      teardown();
    }
  });
});
