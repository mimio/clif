import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  ARTBOARD_DESKTOP,
  ARTBOARD_MOBILE,
  cameras,
  SPHERE_RIMS,
  type Viewport,
} from 'content/cameras';
import { paddingFor } from 'scene/camera';
import { globeScreenRadius } from 'scene/globe';
import {
  ensureMap,
  resetMapForTests,
  watchGlobe,
} from 'scene/mapbox/instance';
import StarField from 'scene/StarField';
import {
  mapboxStarDiameter,
  STAR_ALPHA_MAX,
  STAR_ALPHA_MIN,
  STAR_COLUMNS,
  STAR_COUNT,
  STAR_MAX_SCALE,
  STAR_MIN_SCALE,
  STAR_ROWS,
  STAR_SPACE_EDGE,
  starInk,
  starRadius,
  stars,
  starSpace,
} from 'scene/stars';
import {
  FALLBACK_PALETTE,
  makePalette,
  type Palette,
} from 'styles/tokens/palette';
import { FakeMap, installMapboxStub } from 'test/fake-mapbox';

/*
 * The accent star field: the numbers it is derived from, the field
 * itself, and the hole it cuts for the globe.
 *
 * The first of those is the one worth having. Everything scene/stars.ts
 * claims about being "larger than mapbox's largest" rests on constants
 * compiled into mapbox-gl's bundle, which no API exposes and which a
 * minor upgrade is free to change. So the first block below reads them
 * back out of the installed library rather than trusting the comment
 * that quotes them.
 */

const require_ = createRequire(import.meta.url);

const mapboxSource = (): string =>
  readFileSync(
    require_.resolve('mapbox-gl/dist/mapbox-gl-dev.js'),
    'utf8',
  );

const dark = FALLBACK_PALETTE;

const light: Palette = makePalette({
  accent: [120, 90, 0],
  accent2: [150, 70, 20],
  space: [244, 244, 240],
  land: [230, 228, 220],
  deep: [200, 205, 210],
  body: [20, 20, 20],
  accentSmall: [90, 70, 0],
  sub: [70, 70, 70],
  muted: [110, 110, 110],
});

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
    expect(source).toContain('starsCount: 16e3');
    expect(source).toContain('sizeMultiplier: 0.15');
    expect(source).toContain('sizeRange: 100');
    // The sphere the field is scattered on, from `Atmosphere.update`.
    expect(source).toContain('index.scale$3([], stars[i], 200)');
    // And white, which is the other half of why this field exists.
    expect(source).toContain('vec3 color=vec3(1.0,1.0,1.0)');
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
  it('holds one star per cell of a 16 by 10 grid', () => {
    expect(STAR_COUNT).toBe(STAR_COLUMNS * STAR_ROWS);
    expect(stars).toHaveLength(STAR_COUNT);
    // The cells are square on the artboard, which is what the count is
    // chosen for: 1440/16 and 900/10 are both 90.
    expect(ARTBOARD_DESKTOP.width / STAR_COLUMNS).toBe(
      ARTBOARD_DESKTOP.height / STAR_ROWS,
    );
  });

  it('stratifies rather than scatters: every star inside its own cell', () => {
    /*
     * The claim jittering makes, stated as a property. A uniform draw
     * over the whole field would pass the range check below and fail
     * this one, which is the difference between an even sky and a
     * clumped one.
     */
    stars.forEach((star, at) => {
      const column = at % STAR_COLUMNS;
      const row = Math.floor(at / STAR_COLUMNS);
      expect(star.at[0]).toBeGreaterThanOrEqual(
        column / STAR_COLUMNS,
      );
      expect(star.at[0]).toBeLessThan((column + 1) / STAR_COLUMNS);
      expect(star.at[1]).toBeGreaterThanOrEqual(row / STAR_ROWS);
      expect(star.at[1]).toBeLessThan((row + 1) / STAR_ROWS);
    });
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

  it('puts 37 of the 160 over mapbox s largest, the widest at 1.68x', () => {
    /*
     * THE POINT OF THE WHOLE FIELD, pinned to the digit because the
     * seed makes it a fact rather than a distribution. A change to the
     * seed, the grid, the spread or the falloff lands here.
     */
    const bigger = stars.filter((star) => star.scale > 1);
    expect(bigger).toHaveLength(37);
    const widest = Math.max(...stars.map((star) => star.scale));
    expect(widest).toBeCloseTo(1.6844, 4);
    expect(
      widest * mapboxStarDiameter(ARTBOARD_DESKTOP.height),
    ).toBeCloseTo(5.12, 2);
  });

  it('sizes a star against the viewport, and the artboard without one', () => {
    const [star] = stars;
    const tall: Viewport = { width: 1440, height: 1800 };
    expect(starRadius(star, null)).toBeCloseTo(
      (star.scale * mapboxStarDiameter(ARTBOARD_DESKTOP.height)) / 2,
      10,
    );
    expect(starRadius(star, ARTBOARD_MOBILE)).toBeLessThan(
      starRadius(star, null),
    );
    expect(starRadius(star, tall)).toBeCloseTo(
      2 * starRadius(star, null),
      10,
    );
  });

  it('takes both accents from the live palette, at the star s alpha', () => {
    const first = stars.find((star) => star.ink === 'accent');
    const second = stars.find((star) => star.ink === 'accent2');
    expect(starInk(dark, first!)).toBe(dark.a(first!.alpha));
    expect(starInk(dark, second!)).toBe(dark.b(second!.alpha));
    // Theme tokens, not fixed yellow: a different palette repaints it.
    expect(starInk(light, first!)).not.toBe(starInk(dark, first!));
  });
});

/* ---- the hole ---------------------------------------------------------- */

describe('the sky the field is cut out of', () => {
  it('begins where the design s atmosphere ends', () => {
    expect(STAR_SPACE_EDGE).toBe(1 + SPHERE_RIMS.haloReach);
    expect(STAR_SPACE_EDGE).toBeCloseTo(1.34, 10);
  });

  it('puts the hole where paddingFor put the globe', () => {
    /*
     * The round trip. paddingFor turns a fraction of the viewport into
     * the padding mapbox takes; starSpace reads that padding back into
     * pixels, because a camera read off the transform carries the
     * padding and not the fraction it came from.
     */
    const at: [number, number] = [0.66, 0.5];
    const space = starSpace(
      { zoom: 2, padding: paddingFor(at, ARTBOARD_DESKTOP) },
      ARTBOARD_DESKTOP,
    );
    expect(space.cx).toBeCloseTo(at[0] * ARTBOARD_DESKTOP.width, 10);
    expect(space.cy).toBeCloseTo(at[1] * ARTBOARD_DESKTOP.height, 10);
    expect(space.r).toBeCloseTo(
      STAR_SPACE_EDGE * globeScreenRadius(2, ARTBOARD_DESKTOP.height),
      10,
    );
  });

  it('frames the hello globe where artboard 1a draws it', () => {
    const space = starSpace(cameras.hello, ARTBOARD_DESKTOP);
    // 1a: a sphere of radius h * 0.44 about w * 0.66, h * 0.5.
    expect(space.cx).toBeCloseTo(0.66 * 1440, 6);
    expect(space.cy).toBeCloseTo(450, 6);
    expect(space.r / STAR_SPACE_EDGE).toBeCloseTo(0.44 * 900, 6);
  });

  it('swallows the whole field on a terrain route', () => {
    // /about sits at zoom 10.5, where the disc is many viewports wide:
    // there is no sky on those routes and the mask is what says so.
    const space = starSpace(cameras.about, ARTBOARD_DESKTOP);
    const corner = Math.hypot(space.cx, space.cy);
    expect(space.r).toBeGreaterThan(10 * corner);
  });

  it('falls back to the artboard where there is no layout', () => {
    expect(starSpace(cameras.hello, null)).toEqual(
      starSpace(cameras.hello, ARTBOARD_DESKTOP),
    );
  });
});

/* ---- the component ----------------------------------------------------- */

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

  const circles = (): SVGCircleElement[] => [
    ...screen
      .getByTestId('scene-stars')
      .querySelectorAll<SVGCircleElement>('g circle'),
  ];

  const hole = (): SVGCircleElement =>
    screen
      .getByTestId('scene-stars')
      .querySelector<SVGCircleElement>('mask circle')!;

  it('paints the whole field, masked, over the canvas', () => {
    field();
    const svg = screen.getByTestId('scene-stars');
    expect(circles()).toHaveLength(STAR_COUNT);
    // It is behind the page and cannot take a drag from the map.
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveStyle({ pointerEvents: 'none', zIndex: '1' });
    // The mask the group is cut with is the one the hole is drawn into.
    const maskId = svg
      .querySelector('g')
      ?.getAttribute('mask')
      ?.slice(5, -1);
    expect(maskId).toBeTruthy();
    expect(svg.querySelector('mask')?.id).toBe(maskId);
  });

  it('draws each star in its own colour at its own size', () => {
    field(dark, ARTBOARD_DESKTOP);
    const drawn = circles();
    stars.forEach((star, at) => {
      expect(drawn[at].getAttribute('fill')).toBe(
        starInk(dark, star),
      );
      expect(Number(drawn[at].getAttribute('r'))).toBeCloseTo(
        starRadius(star, ARTBOARD_DESKTOP),
        10,
      );
      expect(drawn[at].getAttribute('cx')).toBe(
        `${star.at[0] * 100}%`,
      );
    });
  });

  it('is nothing at all over a bright ground', () => {
    /*
     * scene/theme.ts sends mapbox a star-intensity of zero on a light
     * theme for the same reason. The two have to agree, or half the sky
     * is there.
     */
    field(light);
    expect(
      screen.queryByTestId('scene-stars'),
    ).not.toBeInTheDocument();
  });

  it('seeds the hole from the route s camera before the map speaks', () => {
    field(dark, ARTBOARD_DESKTOP);
    const space = starSpace(cameras.hello, ARTBOARD_DESKTOP);
    expect(Number(hole().getAttribute('cx'))).toBeCloseTo(
      space.cx,
      6,
    );
    expect(Number(hole().getAttribute('r'))).toBeCloseTo(space.r, 6);
  });

  it('follows the transform once there is one', async () => {
    const teardown = installMapboxStub();
    try {
      field(dark, ARTBOARD_DESKTOP);
      await act(async () => {
        await ensureMap(document.createElement('div'));
      });
      const map = FakeMap.last;
      await act(async () => {
        map.loadStyle();
      });

      // Mid-flight: a zoom and a padding the route table does not
      // carry, which is exactly the state no derivation can produce.
      await act(async () => {
        map.easeTo({
          center: [0, 0],
          zoom: 4.25,
          padding: { top: 0, right: 0, bottom: 0, left: 200 },
          duration: 800,
        });
      });

      const space = starSpace(
        {
          zoom: 4.25,
          padding: { top: 0, right: 0, bottom: 0, left: 200 },
        },
        ARTBOARD_DESKTOP,
      );
      expect(Number(hole().getAttribute('cx'))).toBeCloseTo(
        space.cx,
        6,
      );
      expect(Number(hole().getAttribute('r'))).toBeCloseTo(
        space.r,
        6,
      );
    } finally {
      teardown();
    }
  });

  it('holds its own camera when it is not following', async () => {
    /*
     * The /specimens board draws a half-scale field in a box of its own,
     * behind which the live scene is still mounted. Following the map
     * there would reframe a patch that has nothing to do with it.
     */
    const teardown = installMapboxStub();
    try {
      field(dark, ARTBOARD_DESKTOP, false);
      await act(async () => {
        await ensureMap(document.createElement('div'));
      });
      await act(async () => {
        FakeMap.last.easeTo({ zoom: 9, duration: 0 });
      });
      const space = starSpace(cameras.hello, ARTBOARD_DESKTOP);
      expect(Number(hole().getAttribute('r'))).toBeCloseTo(
        space.r,
        6,
      );
    } finally {
      teardown();
    }
  });

  it('lets go of the map when it unmounts', async () => {
    const teardown = installMapboxStub();
    try {
      const view = field();
      await act(async () => {
        await ensureMap(document.createElement('div'));
      });
      const map = FakeMap.last;
      const before = map.bound.length;
      await act(async () => {
        view.unmount();
      });
      expect(map.calls.strayOff).toEqual([]);
      expect(map.bound.length).toBeLessThan(before);
    } finally {
      teardown();
    }
  });

  it('says nothing for a spin, which does not move the disc', async () => {
    /*
     * The whole reason this may live in React state. `move` fires on
     * every frame of the hello rotation -- setCenter is jumpTo -- and
     * the disc is the same disc throughout, so the subscription has to
     * be silent or the field re-renders sixty times a second for ever.
     */
    const teardown = installMapboxStub();
    try {
      const seen: unknown[] = [];
      const stop = watchGlobe((geometry) => seen.push(geometry));
      await act(async () => {
        await ensureMap(document.createElement('div'));
      });
      const map = FakeMap.last;
      const settled = seen.length;
      expect(settled).toBeGreaterThan(0);

      map.setCenter([10, 0]);
      map.setCenter([20, 0]);
      expect(seen).toHaveLength(settled);

      // A zoom is a different matter, and so is a padding on its own.
      map.easeTo({ zoom: 3, duration: 0 });
      expect(seen).toHaveLength(settled + 1);
      map.easeTo({
        zoom: 3,
        padding: { top: 0, right: 0, bottom: 0, left: 40 },
        duration: 0,
      });
      expect(seen).toHaveLength(settled + 2);
      map.easeTo({
        zoom: 3,
        padding: { top: 0, right: 0, bottom: 0, left: 40 },
        duration: 0,
      });
      expect(seen).toHaveLength(settled + 2);

      stop();
      map.easeTo({ zoom: 5, duration: 0 });
      expect(seen).toHaveLength(settled + 2);
    } finally {
      teardown();
    }
  });
});
