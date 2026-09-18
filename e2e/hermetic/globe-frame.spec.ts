import { expect, test, type Page } from '@playwright/test';
import {
  ARTBOARD_DESKTOP,
  ARTBOARD_MOBILE,
  PROJECTS_FRAME,
} from 'content/cameras';
import {
  installSceneDebug,
  openThemeLens,
  themeOption,
  waitForScene,
} from '../fixtures/app';
import { stubMapboxNetwork } from '../fixtures/mapbox-stub';

/*
 * WHERE THE GLOBE IS AND HOW BIG IT IS, IN PAINTED PIXELS.
 *
 * The prototype's `orbit()` is the spec, and it states the hello scene as
 * ratios of the viewport rather than as a camera:
 *
 *   const cx = mobile ? w * 0.5 : w * 0.66, cy = mobile ? h * 0.3 : h * 0.5;
 *   const r  = mobile ? w * 0.52 : h * 0.44;
 *
 * So on a 1440x900 artboard the sphere's centre is (950.4, 450) -- pushed
 * RIGHT of the column, not centred under it -- and its radius is 396px,
 * a disc 792px across on a 900px-tall page. That is what "quite large in
 * the page" means, and the app shipped a centred disc 567px across.
 *
 *
 * WHY THIS TEST IS THE DELIVERABLE AND THE CAMERA TABLE IS NOT.
 *
 * "content/cameras.ts contains zoom 2.198 and 460.8px of left padding" is
 * not a check that the globe is 792px across and off to the right. It is a
 * check that somebody typed some numbers. The two are joined by mapbox's
 * globe projection -- a PERSPECTIVE projection, whose magnification
 * depends on the zoom and on the viewport height together -- and nothing
 * in the repository but this file has ever looked at the other end of that.
 * Everything below is read off the real mapbox-gl transform, in CSS pixels.
 *
 *
 * HOW THE RADIUS IS MEASURED, AND WHY THE METHOD IS SOUND.
 *
 * The painted globe is the silhouette of a sphere seen in perspective:
 * its edge is the tangent circle, not the 90-degree parallel, so
 * projecting a known point does not find it. What does find it is
 * mapbox's own inverse.
 *
 * `map.unproject(p)` casts a ray through the screen point p and
 * intersects it with the globe. On the globe, the intersection is a real
 * place and `map.project` of it returns p again. OFF the globe there is
 * no intersection, and mapbox clamps to the horizon instead -- so
 * `unproject` returns the same limb coordinate for every point further
 * out, and the round trip stops closing, by a margin that grows one for
 * one with the distance past the edge.
 *
 * "The outermost point whose unproject still round-trips" is therefore
 * exactly the silhouette, with no model of the projection involved, and a
 * bisection finds it to whatever precision is asked for. It is checked
 * along three rays -- right, left and down from the projection centre --
 * which must agree, because a sphere's silhouette is a circle. (Up is
 * left out on purpose: it crosses the north pole at this latitude, where
 * the longitude is degenerate and the round trip breaks for a reason that
 * has nothing to do with the limb.)
 *
 *
 * THE TOLERANCES, AND WHY THEY ARE THESE.
 *
 *   centre  1 CSS pixel. Padding moves the projection centre by exactly
 *           half the difference between opposing sides -- measured, no
 *           rounding anywhere in it -- so this is really an equality. A
 *           pixel is simply the finest claim worth making about where
 *           something is drawn.
 *   radius  0.5% of the target: 2px in 396. The bisection resolves to
 *           0.01px and scene/globe.ts's solver agrees with the browser to
 *           0.005% across this range, so the measurement has two orders of
 *           magnitude in hand. On the other side, the smallest regression
 *           worth catching is about a twentieth of a zoom step, which is
 *           1.7% -- three times this -- and the bug that prompted all of
 *           this was 28% off. Nothing lands in the gap.
 */

/** Rays that do not cross a pole at the hello camera's latitude. */
const RAYS: [number, number][] = [
  [1, 0],
  [-1, 0],
  [0, 1],
];

type Framing = {
  /** The painted silhouette's box, found by bisection on four rays. */
  disc: { x: [number, number]; y: [number, number] };
  /** The stage column's right edge: where the reading column stops. */
  column: number | null;
  /** The layout viewport, which is also the scene container's box. */
  box: { width: number; height: number };
  /** mapbox's own idea of the same box; the two must agree. */
  canvas: { width: number; height: number };
  /** The projection centre: where the sphere is drawn around. */
  centre: { x: number; y: number };
  /** The silhouette radius along each ray, in CSS pixels. */
  radii: number[];
  zoom: number;
  pitch: number;
  /** Diagnostics, so a failure says what the scene thought it was doing. */
  padding: Record<string, number>;
  passes: number;
  sceneErrors: string[];
};

/**
 * Waits for the camera to stop flying and measures what is painted.
 *
 * Settling is not a sleep and not `idle` either. The hello and 404
 * cameras spin for ever, so the map is never idle and `moveend` keeps
 * arriving; what is being waited for is the easeTo, which is a different
 * thing. So: mapbox's own `isEasing`, plus the zoom and the padding
 * holding still across three reads, because those two ARE the framing and
 * a flight that has landed stops changing them.
 *
 * Waiting for a COMPLETED SCENE PASS first is the other half, and it is
 * not belt and braces. A probe that arrives before the scene has applied
 * anything finds the map sitting at its construction default -- zoom 0,
 * no padding -- perfectly still and not easing, and calls that settled.
 * The first draft of this file did exactly that on a slow load and
 * reported zoom 0 on a page that was on its way to 2.2. `passes()` only
 * moves on a scene pass that ran to the end, and SceneRoot issues its
 * easeTo inside that pass, so one pass means the flight has begun.
 */
const measure = (page: Page): Promise<Framing> =>
  page.evaluate(async () => {
    type Point = { x: number; y: number };
    type Probe = {
      project: (at: [number, number]) => Point;
      unproject: (at: [number, number]) => {
        lng: number;
        lat: number;
      };
      getCenter: () => { lng: number; lat: number };
      getZoom: () => number;
      getPitch: () => number;
      getPadding: () => Record<string, number>;
      isEasing: () => boolean;
      transform: { width: number; height: number };
    };
    const scene = window.__SCENE__;
    if (!scene) throw new Error('window.__SCENE__ is not published');
    const map = scene.map as unknown as Probe;

    const wait = (ms: number) =>
      new Promise((done) => {
        setTimeout(done, ms);
      });
    const snapshot = (): string =>
      `${map.getZoom()}/${JSON.stringify(map.getPadding())}`;
    let previous = '';
    let still = 0;
    for (let tries = 0; tries < 300 && still < 3; tries += 1) {
      await wait(100);
      const now = snapshot();
      const settled =
        tries >= 3 &&
        scene.passes() >= 1 &&
        !map.isEasing() &&
        now === previous;
      still = settled ? still + 1 : 0;
      previous = now;
    }
    if (still < 3) throw new Error('the camera never settled');

    const centre = map.project([
      map.getCenter().lng,
      map.getCenter().lat,
    ]);
    /*
     * On the globe iff mapbox's own inverse round-trips. The 0.01px
     * threshold is far below the one-for-one divergence that starts at
     * the limb and far above floating-point noise in the round trip.
     */
    const onGlobe = (x: number, y: number): boolean => {
      const place = map.unproject([x, y]);
      const back = map.project([place.lng, place.lat]);
      return Math.hypot(back.x - x, back.y - y) < 0.01;
    };
    const limb = (dx: number, dy: number): number => {
      let inside = 0;
      let outside = 8_000;
      while (outside - inside > 0.005) {
        const middle = (inside + outside) / 2;
        if (onGlobe(centre.x + dx * middle, centre.y + dy * middle)) {
          inside = middle;
        } else {
          outside = middle;
        }
      }
      return inside;
    };

    /*
     * The DISC, which on a pitched camera is not the projection centre
     * with a radius round it: tilting the camera paints the sphere below
     * the point the padding put it. Four rays from the projection centre
     * give the painted box directly, and the box is what "the globe sits
     * in the open space" is a claim about.
     */
    const disc = {
      x: [centre.x - limb(-1, 0), centre.x + limb(1, 0)] as [
        number,
        number,
      ],
      y: [centre.y - limb(0, -1), centre.y + limb(0, 1)] as [
        number,
        number,
      ],
    };
    const column = document
      .querySelector('.clif-stage-column')
      ?.getBoundingClientRect();

    const root = document.documentElement;
    return {
      disc,
      column: column === undefined ? null : column.right,
      box: { width: root.clientWidth, height: root.clientHeight },
      canvas: {
        width: map.transform.width,
        height: map.transform.height,
      },
      centre: { x: centre.x, y: centre.y },
      radii: (
        [
          [1, 0],
          [-1, 0],
          [0, 1],
        ] as [number, number][]
      ).map(([dx, dy]) => limb(dx, dy)),
      zoom: map.getZoom(),
      pitch: map.getPitch(),
      padding: map.getPadding(),
      passes: scene.passes(),
      sceneErrors: scene.errors(),
    };
  });

const CENTRE_TOLERANCE_PX = 1;
const RADIUS_TOLERANCE = 0.005;

/** Asserts the painted globe against the prototype's ratios. */
const expectFramed = (
  framing: Framing,
  at: [number, number],
  radius: { of: 'width' | 'height'; ratio: number },
): void => {
  // The ratios are of the viewport, so mapbox had better be measuring
  // the same box the fractions are taken from.
  expect(framing.canvas).toEqual(framing.box);
  expect(framing.pitch).toBe(0);
  expect(
    framing.sceneErrors,
    `the scene reported errors: ${framing.sceneErrors.join(' | ')}`,
  ).toEqual([]);

  expect(
    Math.abs(framing.centre.x - at[0] * framing.box.width),
    `centre x: ${framing.centre.x} vs ${at[0] * framing.box.width} (${JSON.stringify(framing)})`,
  ).toBeLessThanOrEqual(CENTRE_TOLERANCE_PX);
  expect(
    Math.abs(framing.centre.y - at[1] * framing.box.height),
    `centre y: ${framing.centre.y} vs ${at[1] * framing.box.height}`,
  ).toBeLessThanOrEqual(CENTRE_TOLERANCE_PX);

  const wanted =
    radius.ratio *
    (radius.of === 'width' ? framing.box.width : framing.box.height);
  // A sphere's silhouette is a circle, so all three rays are the radius.
  framing.radii.forEach((measured, ray) => {
    expect(
      Math.abs(measured - wanted) / wanted,
      `ray ${RAYS[ray].join(',')}: measured ${measured}, wanted ${wanted}`,
    ).toBeLessThan(RADIUS_TOLERANCE);
  });
};

const DESKTOP_FRAME = {
  at: [0.66, 0.5] as [number, number],
  radius: { of: 'height' as const, ratio: 0.44 },
};
const MOBILE_FRAME = {
  at: [0.5, 0.3] as [number, number],
  radius: { of: 'width' as const, ratio: 0.52 },
};

const open = async (page: Page, path: string): Promise<void> => {
  await page.goto(path, { waitUntil: 'load' });
  await waitForScene(page);
};

test.describe('the hello globe is framed as the prototype draws it', () => {
  const sizes = [
    {
      name: '1a, desktop',
      size: ARTBOARD_DESKTOP,
      frame: DESKTOP_FRAME,
    },
    {
      name: '1f, mobile',
      size: ARTBOARD_MOBILE,
      frame: MOBILE_FRAME,
    },
  ];

  for (const { name, size, frame } of sizes) {
    test(`${name}: ${size.width}x${size.height}`, async ({
      context,
      page,
    }) => {
      await stubMapboxNetwork(context);
      await installSceneDebug(page);
      await page.setViewportSize(size);
      await open(page, '/');

      const framing = await measure(page);
      expectFramed(framing, frame.at, frame.radius);
    });
  }

  /*
   * The 404.
   *
   * THERE IS NO 404 ARTBOARD -- the prototype draws 1a and 1f for hello
   * and nothing for the not-found route -- so there is no ratio to assert
   * its size against, and inventing one would be worse than not having
   * it. The only statement on record is 1a's motion note, "settles 900ms
   * from zoom 0.8", against a hello the same card calls 1.6: eight tenths
   * of a zoom step further out. That is asserted here, off the live map,
   * along with the one thing the 404 does inherit in pixels -- the offset,
   * because it is the same left-column page and the globe has to clear it.
   */
  for (const { name, size, frame } of sizes) {
    test(`the 404 sits back from it (${name})`, async ({
      context,
      page,
    }) => {
      await stubMapboxNetwork(context);
      await installSceneDebug(page);
      await page.setViewportSize(size);

      await open(page, '/');
      const hello = await measure(page);
      await open(page, '/no-such-page');
      const missing = await measure(page);

      expect(missing.zoom).toBeCloseTo(hello.zoom - 0.8, 3);
      expect(
        Math.abs(missing.centre.x - frame.at[0] * size.width),
      ).toBeLessThanOrEqual(CENTRE_TOLERANCE_PX);
      expect(
        Math.abs(missing.centre.y - frame.at[1] * size.height),
      ).toBeLessThanOrEqual(CENTRE_TOLERANCE_PX);
      // Further out means smaller, which is the whole of the claim.
      expect(missing.radii[0]).toBeLessThan(hello.radii[0]);
    });
  }
});

/*
 * THE PROJECTS GLOBE SITS IN THE OPEN SPACE, WHOLE.
 *
 * This is the one framed camera with a pitch on it, and pitch is exactly
 * what a frame cannot express: `at` places the PROJECTION CENTRE, and at
 * pitch 25 the sphere is painted about 0.124 of the viewport height below
 * that point. content/cameras.ts answers it by lifting `at` -- which is a
 * measured correction, so it is measured here rather than argued.
 *
 * The claim is stated against the layout instead of against the frame's own
 * ratios, because the frame's ratios are the means and this is the end: the
 * disc clears the reading column, it is inside the viewport on all four
 * sides, and it is near the middle of what is left. Read the column's right
 * edge off the DOM rather than recomputing --reading-max here, so a change
 * to the rail's tokens is caught instead of being duplicated.
 *
 * The tolerances are generous on purpose. The exact centre of the open box
 * drifts with the viewport once --reading-column caps the table (past about
 * 1700px), and PROJECTS_FRAME is a pair of constants; what must hold at
 * every width is that the whole disc is in the box, not that it is centred
 * to the pixel.
 */
test.describe('the projects globe is framed into the open space', () => {
  const SIZES = [
    ARTBOARD_DESKTOP,
    { width: 1280, height: 800 },
    { width: 1920, height: 1080 },
  ];

  /** Room to spare on each side of the disc, so "inside" is not "flush". */
  const AIR_PX = 4;

  for (const size of SIZES) {
    test(`${size.width}x${size.height}`, async ({
      context,
      page,
    }) => {
      await stubMapboxNetwork(context);
      await installSceneDebug(page);
      await page.setViewportSize(size);
      await open(page, '/projects');

      const framing = await measure(page);
      const { disc, column } = framing;
      const detail = JSON.stringify({ disc, column });

      expect(framing.pitch, detail).toBe(25);
      expect(framing.sceneErrors).toEqual([]);
      expect(column, detail).not.toBeNull();

      // Clear of the table on the left, inside the viewport on the right.
      expect(
        disc.x[0],
        `disc starts left of the column: ${detail}`,
      ).toBeGreaterThanOrEqual((column ?? 0) + AIR_PX);
      expect(
        disc.x[1],
        `disc runs off the right: ${detail}`,
      ).toBeLessThanOrEqual(size.width - AIR_PX);

      // Whole: nothing cut off top or bottom either.
      expect(
        disc.y[0],
        `disc is cut off at the top: ${detail}`,
      ).toBeGreaterThanOrEqual(AIR_PX);
      expect(
        disc.y[1],
        `disc is cut off at the bottom: ${detail}`,
      ).toBeLessThanOrEqual(size.height - AIR_PX);

      // And near the middle of the box it is in. An eighth of the box on
      // each axis: a globe that drifted a quarter of the way out of the
      // open space is the regression worth catching, not a 20px lean.
      const boxCentreX = ((column ?? 0) + size.width) / 2;
      const discCentreX = (disc.x[0] + disc.x[1]) / 2;
      const discCentreY = (disc.y[0] + disc.y[1]) / 2;
      expect(
        Math.abs(discCentreX - boxCentreX),
        `off centre horizontally: ${detail}`,
      ).toBeLessThan((size.width - (column ?? 0)) / 8);
      expect(
        Math.abs(discCentreY - size.height / 2),
        `off centre vertically: ${detail}`,
      ).toBeLessThan(size.height / 8);
    });
  }
});

/*
 * THE FOUR WAYS THE FRAMING CAN BE LOST.
 *
 * The offset is mapbox's camera padding, which is state on the transform
 * rather than a property of a move, and the zoom is solved from the
 * viewport height. Both have a way of going stale that a single load
 * never shows:
 *
 *   a route change  padding persists across an easeTo that does not
 *                   mention it, so a route that says nothing inherits the
 *                   last one -- and the route back has to restore it.
 *                   /projects has an offset of its OWN now that its globe
 *                   is framed into the rail, so the round trip is one
 *                   frame replacing another rather than one being cleared
 *                   and put back; the failure it guards against is the
 *                   same either way.
 *   a theme change  the one scene change with no camera move at all. If
 *                   the repaint re-issued a camera it would issue one
 *                   without the frame.
 *   a resize        padding is in PIXELS and the zoom is a function of
 *                   the height, so both are wrong the moment the window
 *                   is not the size they were computed for.
 *   the breakpoint  1a and 1f frame the globe on different points, off
 *                   different axes. Crossing 650px has to swap both.
 */
test.describe('the framing survives', () => {
  test('a route change, a theme change, a resize and the breakpoint', async ({
    context,
    page,
  }) => {
    test.setTimeout(120_000);
    await stubMapboxNetwork(context);
    await installSceneDebug(page);
    await page.setViewportSize(ARTBOARD_DESKTOP);
    await open(page, '/');
    expectFramed(
      await measure(page),
      DESKTOP_FRAME.at,
      DESKTOP_FRAME.radius,
    );

    // Out to the route with the OTHER offset, and back.
    await page.evaluate(() =>
      (
        window as unknown as {
          next: { router: { push: (to: string) => void } };
        }
      ).next.router.push('/projects'),
    );
    await page.waitForURL('**/projects');
    const away = await measure(page);
    expect(away.centre.x).toBeCloseTo(
      PROJECTS_FRAME.at[0] * ARTBOARD_DESKTOP.width,
      0,
    );
    expect(away.centre.y).toBeCloseTo(
      PROJECTS_FRAME.at[1] * ARTBOARD_DESKTOP.height,
      0,
    );

    await page.evaluate(() =>
      (
        window as unknown as {
          next: { router: { push: (to: string) => void } };
        }
      ).next.router.push('/'),
    );
    await page.waitForURL((url) => url.pathname === '/');
    expectFramed(
      await measure(page),
      DESKTOP_FRAME.at,
      DESKTOP_FRAME.radius,
    );

    // The lens, through the chrome the visitor uses.
    const panel = await openThemeLens(page);
    await themeOption(panel, 'rust').click();
    await page.waitForTimeout(1_000);
    expectFramed(
      await measure(page),
      DESKTOP_FRAME.at,
      DESKTOP_FRAME.radius,
    );

    // A window that is not the artboard. Both halves have to move: the
    // padding is pixels and the zoom is solved from the height.
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(1_500);
    const resized = await measure(page);
    expect(resized.box).toEqual({ width: 1280, height: 720 });
    expectFramed(resized, DESKTOP_FRAME.at, DESKTOP_FRAME.radius);

    // And across the breakpoint, onto the other artboard's framing.
    await page.setViewportSize(ARTBOARD_MOBILE);
    await page.waitForTimeout(1_500);
    expectFramed(
      await measure(page),
      MOBILE_FRAME.at,
      MOBILE_FRAME.radius,
    );
  });
});
