import { expect, type Page, test } from '@playwright/test';
import { STAR_COUNT, STAR_SPACE_EDGE } from 'scene/stars';
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
 * THE ACCENT STARS KEEP OUT OF THE GLOBE.
 *
 * scene/StarField.tsx paints its field over the map's canvas rather than
 * inside it, because mapbox's own stars go down in a pass no style layer
 * can join. Everything that buys is free -- the colours, the sizes, and
 * a field that does not need a shader -- and the one thing it costs is
 * the occlusion: mapbox's stars are covered by the planet because the
 * planet is drawn after them, and these are not covered by anything.
 * They cut their own hole instead, out of an SVG mask whose circle is
 * the globe grown to the design's atmosphere reach.
 *
 * That is a claim about pixels and it is checked as one. The unit suite
 * can say the mask circle carries the right cx, cy and r; only a browser
 * can say whether a mask with those numbers actually hides anything, and
 * jsdom does not render one. So this takes the frame twice -- with the
 * field and with it display:none -- and requires every pixel the field
 * changed to lie outside the globe's own silhouette.
 *
 * THE REAL LIBRARY, over a stubbed network, for the reason
 * e2e/hermetic/globe-atmosphere.spec.ts gives: the globe and its
 * atmosphere need no tiles, so the silhouette this measures against is
 * the real one.
 *
 * REDUCED MOTION, because the diff is between two screenshots and the
 * hello camera turns for ever otherwise. It also settles mapbox's own
 * per-frame dither in the atmosphere, which the threshold below would
 * survive anyway.
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

test.describe('the accent star field', () => {
  test.use({ reducedMotion: 'reduce' });

  test.beforeEach(async ({ context, page }) => {
    await stubMapboxNetwork(context);
    await installSceneDebug(page);
  });

  test('is a field of 160, behind the page and out of the way', async ({
    page,
  }) => {
    await page.goto('/', { waitUntil: 'load' });
    await waitForScene(page, 'live');
    const field = page.locator('[data-testid="scene-stars"]');
    await expect(field).toBeAttached();
    await expect(field.locator('g circle')).toHaveCount(STAR_COUNT);
    // It is full bleed over a map that is draggable on this route.
    expect(
      await field.evaluate(
        (node) => getComputedStyle(node).pointerEvents,
      ),
    ).toBe('none');
  });

  test('paints nothing inside the globe s silhouette', async ({
    page,
  }) => {
    await page.goto('/', { waitUntil: 'load' });
    await waitForScene(page, 'live');
    await settle(page);
    await installBasemapOnly(page);
    await installHideStars(page);
    // The foreground hides; the field does not, because it is a child of
    // the scene rather than one of its siblings.
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
     * not because the mask is allowed to leak.
     */
    expect(diff.nearest).toBeGreaterThanOrEqual(
      1 - 1 / framing.radius,
    );
    // Most of it is out in the flat space the design paints past 1.34r.
    expect(diff.furthest).toBeGreaterThan(STAR_SPACE_EDGE);
    expect(diff.beyondReach).toBeGreaterThan(diff.painted / 2);
  });
});
