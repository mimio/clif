import { expect, type Page, test } from '@playwright/test';
import { globeCenterInView, globeLimb, limbRadii } from 'scene/globe';
import {
  type PaintedStar,
  paintedStars,
  type SkyView,
  STAR_SPACE_EDGE,
} from 'scene/stars';
import {
  installBasemapOnly,
  installSceneDebug,
  measureGlobe,
  notice,
  settle,
  showBasemapOnly,
  waitForScene,
} from '../fixtures/app';
import { stubMapboxNetwork } from '../fixtures/mapbox-stub';

/*
 * THE ACCENT STARS KEEP OUT OF THE GLOBE, AND TURN WITH THE SKY.
 *
 * scene/StarField.tsx paints its field onto a canvas over the map's own,
 * because mapbox's stars go down in a pass no style layer can join.
 * Everything that buys is free -- the colours, the sizes, and a field
 * that needs no shader -- and it costs two things mapbox would otherwise
 * have done for us, which are the two this file measures.
 *
 * THE OCCLUSION. mapbox's stars are covered by the planet because the
 * planet is drawn after them; ours are covered by nothing, so they fade
 * themselves out across the band between the globe's limb and the
 * design's atmosphere reach. Only a browser can say whether that lands
 * on the right pixels, so this takes the frame twice -- with the field
 * and with it display:none -- and requires every pixel it changed to lie
 * outside the globe's own silhouette.
 *
 * AND IT IS CHECKED ON A PITCHED ROUTE, which is the regression the
 * third test below exists for. The first version of the mask measured a
 * star's distance from the PADDING-SHIFTED SCREEN CENTRE, which is where
 * the sphere's centre lands only when the camera is level. /projects
 * pitches to 25 and the two points are 91 pixels apart, so four of its
 * hundred-odd stars came out on the planet. mapbox's own
 * `unproject` -> `project` round trip is the oracle there: it closes
 * only on the globe, so it says whether a point is on the ball without
 * any model of the silhouette at all.
 *
 * THE MOTION, which is the regression this field was rebuilt for. The
 * first version authored the stars in SCREEN space, fixed in the frame,
 * while mapbox's are fixed to a celestial sphere the camera turns
 * through -- so on the hello route theirs swept past at about 28 pixels
 * a second and ours sat still. scene/stars.ts now rebuilds mapbox's own
 * star rotation, and the second test below watches the two fields move
 * together over four seconds of the real spin. They are separable in a
 * screenshot because ours are the only coloured things in the sky.
 *
 * THE REAL LIBRARY, over a stubbed network, for the reason
 * e2e/hermetic/globe-atmosphere.spec.ts gives: the globe and its
 * atmosphere need no tiles, so the silhouette this measures against and
 * the stars it measures are the real ones.
 */

/** How many levels a channel has to move before it counts as painted. */
const CHANGED = 6;

/*
 * Six is chosen against both sides. mapbox dithers the atmosphere by a
 * level or so per frame (`temporalOffset` in drawAtmosphereGlow), and
 * the faintest star in the field is alpha 0.16 of an accent over the
 * space token, which is about 37 levels of red. Nothing between those
 * two is being asked about.
 */

const HIDDEN = 'data-no-stars';

/**
 * mapbox's own attribution, hidden for the measurement.
 *
 * It is a control rather than a layer, so it is a child of the scene and
 * `installBasemapOnly` -- which hides the scene's SIBLINGS -- leaves it
 * up. That matters to exactly one assertion: the wordmark is white, it
 * is out in the flat space past the globe, and it never moves, so it
 * lands in the sample of mapbox's stars and drags their persistence from
 * near zero to two thirds. Measured before this rule existed: 875 lit
 * neutral pixels of which 549 were the logo.
 *
 * Nothing else in the suite needs it. e2e/fixtures/app.ts's radial
 * profile takes medians around a ring, which a mark in one corner cannot
 * move.
 */
const installHideAttribution = (page: Page): Promise<void> =>
  page
    .addStyleTag({
      content: `html[data-basemap-only] .mapboxgl-control-container {
        visibility: hidden !important;
      }`,
    })
    .then(() => undefined);

const installHideStars = (page: Page): Promise<void> =>
  page
    .addStyleTag({
      content: `html[${HIDDEN}] .clif-stars { display: none !important; }`,
    })
    .then(() => undefined);

const showStars = (page: Page, on: boolean): Promise<void> =>
  page.evaluate(
    ([attribute, wanted]) =>
      new Promise<void>((resolve) => {
        document.documentElement.toggleAttribute(
          attribute as string,
          !(wanted as boolean),
        );
        requestAnimationFrame(() =>
          requestAnimationFrame(() => resolve()),
        );
      }),
    [HIDDEN, on] as const,
  );

type FieldDiff = {
  /** Pixels the field painted on. */
  painted: number;
  /** Nearest and furthest of them, in globe radii from its centre. */
  nearest: number;
  furthest: number;
  /** How many landed past the design's atmosphere reach. */
  beyondReach: number;
  /** Mean red minus mean blue over the painted pixels: the accent tell. */
  opponency: number;
};

/**
 * What the field painted, and where.
 *
 * Both frames are decoded in the page, in one round trip, because a
 * screenshot per sample is dozens of chances for the frame to change
 * under the measurement -- the same argument sampleRadial makes in
 * e2e/fixtures/app.ts.
 */
const diffField = (
  page: Page,
  withField: Buffer,
  without: Buffer,
  centre: { x: number; y: number },
  radius: number,
  width: number,
): Promise<FieldDiff> =>
  page.evaluate(
    ({ a, b, at, r, threshold, reach, box }) =>
      new Promise<FieldDiff>((resolve, reject) => {
        const decode = (encoded: string): Promise<ImageData> =>
          new Promise((done, fail) => {
            const image = new Image();
            image.onerror = () =>
              fail(new Error('the capture did not decode'));
            image.onload = () => {
              const canvas = document.createElement('canvas');
              canvas.width = image.naturalWidth;
              canvas.height = image.naturalHeight;
              const context = canvas.getContext('2d');
              if (!context) {
                fail(
                  new Error('no 2d context to decode the capture in'),
                );
                return;
              }
              context.drawImage(image, 0, 0);
              done(
                context.getImageData(
                  0,
                  0,
                  canvas.width,
                  canvas.height,
                ),
              );
            };
            image.src = `data:image/png;base64,${encoded}`;
          });

        void Promise.all([decode(a), decode(b)])
          .then(([lit, dark]) => {
            // The screenshot is in device pixels and the globe was
            // measured in CSS ones.
            const scale = lit.width / box;
            let painted = 0;
            let nearest = Number.POSITIVE_INFINITY;
            let furthest = 0;
            let beyondReach = 0;
            let red = 0;
            let blue = 0;
            for (let px = 0; px < lit.data.length; px += 4) {
              const moved =
                Math.abs(lit.data[px] - dark.data[px]) >= threshold ||
                Math.abs(lit.data[px + 1] - dark.data[px + 1]) >=
                  threshold ||
                Math.abs(lit.data[px + 2] - dark.data[px + 2]) >=
                  threshold;
              if (!moved) continue;
              const index = px / 4;
              const x = (index % lit.width) / scale;
              const y = Math.floor(index / lit.width) / scale;
              const dd = Math.hypot(x - at.x, y - at.y) / r;
              painted += 1;
              if (dd < nearest) nearest = dd;
              if (dd > furthest) furthest = dd;
              if (dd >= reach) beyondReach += 1;
              red += lit.data[px];
              blue += lit.data[px + 2];
            }
            resolve({
              painted,
              nearest,
              furthest,
              beyondReach,
              opponency: painted === 0 ? 0 : (red - blue) / painted,
            });
          })
          .catch(reject);
      }),
    {
      a: withField.toString('base64'),
      b: without.toString('base64'),
      at: centre,
      r: radius,
      threshold: CHANGED,
      reach: STAR_SPACE_EDGE,
      box: width,
    },
  );

/* ---- following the two fields across the sky --------------------------- */

/**
 * How far above the space token a pixel has to sit to be a star core.
 *
 * mapbox's brightest is white at alpha 0.30 over --surface-ground, which
 * is 92 against 22 -- seventy levels -- and its faintest is nothing at
 * all, so any floor picks a share of its field rather than all of it.
 * High enough that the atmosphere's own last levels past 1.34r cannot
 * reach it, and low enough to leave a few hundred pixels to count.
 */
const STAR_FLOOR = 30;

type SkyStep = {
  /** How many of the predicted stars were found where they were predicted. */
  found: number;
  checked: number;
  /** The worst miss, in CSS pixels, among the ones that were found. */
  worst: number;
  /**
   * How much of mapbox's own field is unchanged between the two frames.
   *
   * Their stars are the only white things in the sky, so this is the
   * share of lit neutral pixels in the first frame that are still lit in
   * the second. A sky that turned leaves almost none; a field pinned to
   * the frame leaves nearly all of them.
   */
  theirOverlap: number;
  theirPixels: number;
  /** The same measure over our own field, which is known to have moved. */
  ourOverlap: number;
  ourPixels: number;
};

/**
 * Whether each field is where it should be, in both frames.
 *
 * OURS IS CHECKED AGAINST ITS OWN ARITHMETIC. `paintedStars` is pure and
 * the unit suite pins it; what only a browser can say is whether the
 * canvas actually draws that, and whether it redraws when the transform
 * moves. So the camera is read off the live map beside each screenshot,
 * the field is resolved for it here, and every star that should be out
 * in flat space is looked for within a pixel or two of where it was
 * predicted -- in both frames, which are four seconds of spin apart.
 *
 * THEIRS IS CHECKED FOR HAVING MOVED AT ALL, by hue: ours are drawn from
 * --clif-accent and --clif-accent-2, which are warm, and mapbox's are
 * `vec3(1.0, 1.0, 1.0)`. Without that half the test would pass just as
 * well on a still sky, which is the one thing it must not do.
 */
const skyStep = (
  page: Page,
  frames: [Buffer, Buffer],
  fields: [PaintedStar[], PaintedStar[]],
  centre: { x: number; y: number },
  radius: number,
  width: number,
): Promise<SkyStep> =>
  page.evaluate(
    ({ shots, predicted, at, r, reach, box, floor }) =>
      new Promise<SkyStep>((resolve, reject) => {
        const decode = (encoded: string): Promise<ImageData> =>
          new Promise((done, fail) => {
            const image = new Image();
            image.onerror = () =>
              fail(new Error('the capture did not decode'));
            image.onload = () => {
              const canvas = document.createElement('canvas');
              canvas.width = image.naturalWidth;
              canvas.height = image.naturalHeight;
              const context = canvas.getContext('2d');
              if (!context) {
                fail(
                  new Error('no 2d context to decode the capture in'),
                );
                return;
              }
              context.drawImage(image, 0, 0);
              done(
                context.getImageData(
                  0,
                  0,
                  canvas.width,
                  canvas.height,
                ),
              );
            };
            image.src = `data:image/png;base64,${encoded}`;
          });

        void Promise.all(shots.map(decode))
          .then(([first, second]) => {
            const scale = first.width / box;
            const channel = (
              frame: ImageData,
              x: number,
              y: number,
              offset: number,
            ): number => {
              const px = Math.round(y) * frame.width + Math.round(x);
              return frame.data[px * 4 + offset];
            };
            /** The warmest red-minus-blue within `span` of a point. */
            const warmestNear = (
              frame: ImageData,
              x: number,
              y: number,
              span: number,
            ): number => {
              let best = -255;
              const step = 1 / scale;
              for (let dy = -span; dy <= span; dy += step) {
                for (let dx = -span; dx <= span; dx += step) {
                  const px = (x + dx) * scale;
                  const py = (y + dy) * scale;
                  if (
                    px < 0 ||
                    py < 0 ||
                    px >= frame.width ||
                    py >= frame.height
                  ) {
                    continue;
                  }
                  const hue =
                    channel(frame, px, py, 0) -
                    channel(frame, px, py, 2);
                  if (hue > best) best = hue;
                }
              }
              return best;
            };

            let found = 0;
            let checked = 0;
            let worst = 0;
            const frames = [first, second];
            predicted.forEach((field, which) => {
              for (const star of field) {
                // Only the ones out in flat space, where the ground is
                // the space token and a warm pixel can only be a star.
                if (
                  Math.hypot(star.x - at.x, star.y - at.y) <
                  reach * r
                ) {
                  continue;
                }
                // And only the ones bright and wide enough to register
                // against the eight bits a screenshot carries.
                if (star.alpha < 0.3 || star.r < 0.9) continue;
                checked += 1;
                const span = star.r + 1.5;
                if (
                  warmestNear(frames[which], star.x, star.y, span) >=
                  18
                ) {
                  found += 1;
                  worst = Math.max(worst, span);
                }
              }
            });

            /*
             * And how much of each field stayed put, over the same
             * region and by the same test: a pixel that was a star core
             * in the first frame, and is still one in the second.
             */
            const persistence = (
              warm: boolean,
            ): { pixels: number; overlap: number } => {
              const isStar = (
                frame: ImageData,
                px: number,
              ): boolean => {
                const lift =
                  Math.max(
                    frame.data[px],
                    frame.data[px + 1],
                    frame.data[px + 2],
                  ) - 22;
                const hue = frame.data[px] - frame.data[px + 2];
                if (lift < floor) return false;
                return warm ? hue >= 18 : hue <= 6;
              };
              let pixels = 0;
              let stayed = 0;
              for (let px = 0; px < first.data.length; px += 4) {
                const index = px / 4;
                const x = (index % first.width) / scale;
                const y = Math.floor(index / first.width) / scale;
                if (Math.hypot(x - at.x, y - at.y) < reach * r) {
                  continue;
                }
                if (!isStar(first, px)) continue;
                pixels += 1;
                if (isStar(second, px)) stayed += 1;
              }
              return {
                pixels,
                overlap: pixels === 0 ? 1 : stayed / pixels,
              };
            };

            const theirs = persistence(false);
            const ours = persistence(true);
            resolve({
              found,
              checked,
              worst,
              theirPixels: theirs.pixels,
              theirOverlap: theirs.overlap,
              ourPixels: ours.pixels,
              ourOverlap: ours.overlap,
            });
          })
          .catch(reject);
      }),
    {
      shots: frames.map((frame) => frame.toString('base64')),
      predicted: fields,
      at: centre,
      r: radius,
      reach: STAR_SPACE_EDGE,
      box: width,
      floor: STAR_FLOOR,
    },
  );

/** The transform, read off the live map beside a screenshot. */
const readView = (page: Page): Promise<SkyView> =>
  page.evaluate(() => {
    const scene = window.__SCENE__;
    if (!scene) throw new Error('window.__SCENE__ is not published');
    const map = scene.map as unknown as {
      getCenter: () => { lng: number; lat: number };
      getBearing: () => number;
      getPitch: () => number;
      getZoom: () => number;
      getPadding: () => Record<string, number>;
    };
    const { lng, lat } = map.getCenter();
    const padding = map.getPadding();
    return {
      center: [lng, lat] as [number, number],
      bearing: map.getBearing(),
      pitch: map.getPitch(),
      zoom: map.getZoom(),
      padding: {
        top: padding.top ?? 0,
        right: padding.right ?? 0,
        bottom: padding.bottom ?? 0,
        left: padding.left ?? 0,
      },
    };
  });

test.describe('the accent star field', () => {
  test.beforeEach(async ({ context, page }) => {
    await stubMapboxNetwork(context);
    await installSceneDebug(page);
  });

  test('is a canvas over the map, out of the way of a drag', async ({
    page,
  }) => {
    await page.goto('/', { waitUntil: 'load' });
    await waitForScene(page, 'live');
    const field = page.locator('[data-testid="scene-stars"]');
    await expect(field).toBeAttached();
    const shape = await field.evaluate((node) => ({
      tag: node.tagName,
      // It is full bleed over a map that is draggable on this route.
      pointerEvents: getComputedStyle(node).pointerEvents,
      // And its bitmap is the box, at the scene's own ratio clamp.
      bitmap: (node as HTMLCanvasElement).width,
      css: node.getBoundingClientRect().width,
    }));
    expect(shape.tag).toBe('CANVAS');
    expect(shape.pointerEvents).toBe('none');
    expect(shape.bitmap).toBeGreaterThanOrEqual(shape.css);
    expect(shape.bitmap).toBeLessThanOrEqual(shape.css * 1.5);
  });

  test.describe('held still', () => {
    /*
     * REDUCED MOTION, because the diff below is between two screenshots
     * and the hello camera turns for ever otherwise. It also settles
     * mapbox's own per-frame dither in the atmosphere, which the
     * threshold above would survive anyway.
     */
    test.use({ reducedMotion: 'reduce' });

    test('paints nothing inside the globe s silhouette', async ({
      page,
    }) => {
      await page.goto('/', { waitUntil: 'load' });
      await waitForScene(page, 'live');
      await settle(page);
      await installBasemapOnly(page);
      await installHideStars(page);
      // The foreground hides; the field does not, because it is a child
      // of the scene rather than one of its siblings.
      await showBasemapOnly(page, true);

      const framing = await measureGlobe(page);
      notice(
        'stars: framing',
        `centre=${framing.centre.x.toFixed(1)},${framing.centre.y.toFixed(1)} ` +
          `r=${framing.radius.toFixed(1)} zoom=${framing.zoom.toFixed(3)} ` +
          `box=${framing.box.width}x${framing.box.height}`,
      );

      await showStars(page, true);
      const lit = await page.screenshot();
      await showStars(page, false);
      const unlit = await page.screenshot();
      await showStars(page, true);

      const diff = await diffField(
        page,
        lit,
        unlit,
        framing.centre,
        framing.radius,
        framing.box.width,
      );
      notice(
        'stars: field',
        `painted=${diff.painted}px dd=${diff.nearest.toFixed(3)}..${diff.furthest.toFixed(3)} ` +
          `beyondReach=${diff.beyondReach} opponency=${diff.opponency.toFixed(1)}`,
      );

      // It painted, and it painted in the accent rather than in white.
      expect(diff.painted).toBeGreaterThan(0);
      expect(diff.opponency).toBeGreaterThan(20);

      /*
       * And every pixel of it is outside the planet. One pixel of slack,
       * expressed in radii, because the silhouette is a median of three
       * bisected rays and the screenshot is rounded to whole pixels --
       * not because the fade is allowed to leak.
       */
      expect(diff.nearest).toBeGreaterThanOrEqual(
        1 - 1 / framing.radius,
      );
      // Most of it is out in the flat space the design paints past 1.34r.
      expect(diff.furthest).toBeGreaterThan(STAR_SPACE_EDGE);
      expect(diff.beyondReach).toBeGreaterThan(diff.painted / 2);
    });
  });

  test('travels with mapbox s own stars as the globe turns', async ({
    page,
  }) => {
    /*
     * Four seconds of the real spin, with the frame held still at each
     * end of it. Reduced motion is what stops the globe -- the scene
     * reads it through matchMedia and turns its animation loop off -- so
     * toggling it means the camera cannot advance between the read and
     * the screenshot, and the field can be checked against the exact
     * transform that drew it.
     */
    test.setTimeout(180_000);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/', { waitUntil: 'load' });
    await waitForScene(page, 'live');
    await settle(page);
    await installBasemapOnly(page);
    await installHideAttribution(page);
    await showBasemapOnly(page, true);

    const framing = await measureGlobe(page);
    const before = await readView(page);
    const first = await page.screenshot();

    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.waitForTimeout(4_000);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await settle(page);
    const after = await readView(page);
    const second = await page.screenshot();

    const turned = after.center[0] - before.center[0];
    notice(
      'stars: spin',
      `centre ${before.center[0].toFixed(3)} -> ${after.center[0].toFixed(3)} ` +
        `(${turned.toFixed(3)} degrees)`,
    );
    // The globe turned east while motion was allowed, or there is
    // nothing here to measure.
    expect(turned).toBeGreaterThan(1);

    const box = {
      width: framing.box.width,
      height: framing.box.height,
    };
    const fields: [PaintedStar[], PaintedStar[]] = [
      paintedStars(before, box),
      paintedStars(after, box),
    ];
    // And the field really did move between the two: a sky pinned to the
    // frame would predict the same positions twice.
    const moved = fields[0].filter((star) =>
      fields[1].every(
        (other) => Math.hypot(other.x - star.x, other.y - star.y) > 8,
      ),
    );
    expect(moved.length).toBeGreaterThan(fields[0].length * 0.9);

    const step = await skyStep(
      page,
      [first, second],
      fields,
      framing.centre,
      framing.radius,
      framing.box.width,
    );
    notice(
      'stars: sky',
      `ours ${step.found}/${step.checked} found within ${step.worst.toFixed(1)}px; ` +
        `kept: ours ${(step.ourOverlap * 100).toFixed(1)}% of ${step.ourPixels}px, ` +
        `mapbox ${(step.theirOverlap * 100).toFixed(1)}% of ${step.theirPixels}px`,
    );

    /*
     * THE ASSERTION THIS FILE EXISTS FOR. The canvas drew the field the
     * arithmetic specifies, at BOTH cameras -- so it is anchored to the
     * sky rather than to the frame, and it redraws when the transform
     * moves.
     */
    expect(step.checked).toBeGreaterThan(20);
    expect(step.found).toBeGreaterThan(step.checked * 0.85);

    /*
     * And mapbox's own field moved too, which is what makes the first
     * assertion mean anything: on a sky that happened to be still, a
     * field pinned to the frame would pass it as well.
     */
    expect(step.theirPixels).toBeGreaterThan(100);
    expect(step.ourPixels).toBeGreaterThan(50);
    expect(step.theirOverlap).toBeLessThan(0.35);
    expect(step.ourOverlap).toBeLessThan(0.35);
  });
});

/* ---- the pitched routes ------------------------------------------------ */

/** The transform's own idea of where the sphere is, beside our model's. */
const readSphere = (
  page: Page,
): Promise<{ view: SkyView; centerInViewSpace: number[] }> =>
  readView(page).then((view) =>
    page
      .evaluate(() => {
        const scene = window.__SCENE__;
        if (!scene)
          throw new Error('window.__SCENE__ is not published');
        const { transform } = scene.map as unknown as {
          transform: { globeCenterInViewSpace: number[] };
        };
        return [...transform.globeCenterInViewSpace];
      })
      .then((centerInViewSpace) => ({ view, centerInViewSpace })),
  );

/**
 * Which of these screen points mapbox would call part of the globe.
 *
 * `unproject` answers a lng/lat for every point in the frame, but off
 * the globe it is answering about the horizon plane rather than the
 * ball, and projecting that answer back lands somewhere else. So the
 * round trip closes on the planet and nowhere else -- which is the same
 * oracle e2e/fixtures/app.ts bisects the limb with, asked as a
 * predicate instead.
 */
const starsOnGlobe = (
  page: Page,
  field: PaintedStar[],
): Promise<{ x: number; y: number }[]> =>
  page.evaluate((stars) => {
    const scene = window.__SCENE__;
    if (!scene) throw new Error('window.__SCENE__ is not published');
    const map = scene.map as unknown as {
      project: (at: [number, number]) => { x: number; y: number };
      unproject: (at: [number, number]) => {
        lng: number;
        lat: number;
      };
    };
    return stars
      .filter((star) => {
        const place = map.unproject([star.x, star.y]);
        const back = map.project([place.lng, place.lat]);
        return Math.hypot(back.x - star.x, back.y - star.y) < 0.01;
      })
      .map((star) => ({ x: star.x, y: star.y }));
  }, field);

test.describe('the mask, on the routes that tilt the camera', () => {
  test.use({ reducedMotion: 'reduce' });

  test.beforeEach(async ({ context, page }) => {
    await stubMapboxNetwork(context);
    await installSceneDebug(page);
  });

  /*
   * Hello is level and /projects pitches to 25, which is the whole range
   * content/cameras.ts uses. Both, because a mask that is right only
   * when the camera is level passes on the first and is the bug on the
   * second.
   */
  for (const path of ['/', '/projects']) {
    test(`keeps every star off the globe on ${path}`, async ({
      page,
    }) => {
      test.setTimeout(120_000);
      await page.goto(path, { waitUntil: 'load' });
      await waitForScene(page, 'live');
      await settle(page);

      const framing = await measureGlobe(page);
      const { view, centerInViewSpace } = await readSphere(page);
      const limb = globeLimb(view, framing.box);
      const at = globeCenterInView(
        view.zoom,
        view.pitch,
        framing.box.height,
      );

      notice(
        `stars: ${path} sphere`,
        `pitch=${view.pitch} zoom=${view.zoom.toFixed(3)} ` +
          `mapbox=[${centerInViewSpace.map((v) => v.toFixed(3)).join(', ')}] ` +
          `ours=[${at.map((v) => v.toFixed(3)).join(', ')}] ` +
          `axis=${limb.axis.x.toFixed(1)},${limb.axis.y.toFixed(1)} ` +
          `centre=${limb.cx.toFixed(1)},${limb.cy.toFixed(1)} ` +
          `radii=[${framing.radii.map((v) => v.toFixed(2)).join(', ')}]`,
      );

      /*
       * OUR MODEL OF THE SPHERE IS MAPBOX'S. `globeCenterInView` is
       * derived rather than read -- the transform does not expose it
       * anywhere the app can reach at paint time -- so this is what
       * holds the derivation to the library it models. To a twentieth
       * of a pixel in a thousand, which is the tolerance and not the
       * error -- the two agree to every digit the transform prints.
       */
      expect(at[0]).toBeCloseTo(centerInViewSpace[0], 1);
      expect(at[1]).toBeCloseTo(centerInViewSpace[1], 1);
      expect(at[2]).toBeCloseTo(centerInViewSpace[2], 1);

      /*
       * And the measure the mask is cut with reads exactly one radius at
       * the painted limb, in all three directions the harness bisects --
       * including the downward ray, which at pitch is much the longest
       * of them and is where a circle about the axis goes wrong.
       */
      const rays: [number, number][] = [
        [1, 0],
        [-1, 0],
        [0, 1],
      ];
      framing.radii.forEach((reach, ray) => {
        const [dx, dy] = rays[ray];
        expect(
          limbRadii(
            limb,
            framing.centre.x + dx * reach,
            framing.centre.y + dy * reach,
          ),
        ).toBeCloseTo(1, 3);
      });

      /*
       * THE ASSERTION THIS TEST EXISTS FOR. Every star the field would
       * paint, put to mapbox's own round trip: not one of them may be on
       * the ball. Measured before the fix, /projects painted four.
       */
      const field = paintedStars(view, framing.box);
      const hits = await starsOnGlobe(page, field);
      notice(
        `stars: ${path} mask`,
        `${field.length} painted, ${hits.length} on the globe` +
          (hits.length === 0
            ? ''
            : ` (${hits
                .slice(0, 5)
                .map((h) => `${h.x.toFixed(1)},${h.y.toFixed(1)}`)
                .join(' ')})`),
      );
      expect(field.length).toBeGreaterThan(40);
      expect(hits).toEqual([]);
    });
  }
});
