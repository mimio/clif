import fs from 'node:fs';
import path from 'node:path';
import {
  expect,
  test,
  type Page,
  type TestInfo,
} from '@playwright/test';
import {
  DESKTOP,
  installBasemapOnly,
  installSceneDebug,
  notice,
  samplePixels,
  seedTheme,
  settle,
  showBasemapOnly,
  THEME_IDS,
  type ThemeId,
  waitForScene,
} from '../fixtures/app';
import { parseRgb, type Rgb } from 'styles/tokens/palette';

/*
 * TIER 2, THE FORESTS. A HARD GATE, AND EIGHT PAIRS OF PHOTOGRAPHS.
 *
 * WHY IT EXISTS
 *
 * The owner reported, twice, that the forests on the globe are green
 * under every theme -- on a red theme, on a blue theme, on yellow. Every
 * record this tier already keeps said that could not be happening:
 * scene.spec.ts reads `colorGreenspace` back off the basemap import and
 * finds the theme's own --map-green there, and cartography.spec.ts read
 * Standard's `landcover` paint off the real style and found every
 * forest class derived from that one key. Both are true, and neither
 * looks at a forest. The read-back is what the import is HOLDING; the
 * paint record is what the style SAYS. The only measurement that answers
 * "what colour is that forest" is a pixel taken over one, and until this
 * file nothing in the suite had taken it: the globe captures are framed
 * on the route's camera, where a forest is a few hundred pixels of a
 * sphere mostly made of ocean, and the pixel census in
 * cartography.spec.ts counts the whole frame.
 *
 * So this flies the camera to two forests and photographs them, per
 * theme, and asserts the one thing the design claims: that the forest is
 * painted from --map-green and not from Mapbox's own green.
 *
 * TWO CAMERAS, BECAUSE TWO LAYERS
 *
 * Standard paints woodland from two different layers at two different
 * scales, both driven by `colorGreenspace`, and "at all scales" means
 * both have to be looked at:
 *
 *   amazon   z4.5 over the basin. `landcover` (z0-11, class `wood` is
 *            the config colour itself) is the whole of the ground here,
 *            and nothing else Standard draws at this zoom is green.
 *   hood     z9 over the Mount Hood National Forest. `landcover` is
 *            still at full opacity, `national-park` (z5+) lays the same
 *            hue over it at half saturation, and `landuse` (z8+) has
 *            started: its `wood`, `scrub`, `park` classes are all
 *            lightness offsets of the config colour.
 *
 * Both are flown to with jumpTo on the scene's own map, after the route
 * has settled. The scene re-issues a camera only when the route's target
 * changes (scene/SceneRoot.tsx), so the test's camera holds for the rest
 * of the page's life.
 *
 * TWO LIGHTS, BECAUSE THE SUN IS NOT A COLOUR THE THEME SETS
 *
 * Standard shades every fill by its light preset, and the scene asks for
 * `dawn` on a dark theme's world view -- a warm sun and a warm sky. A
 * warm light over a cool token moves it toward green: teal's forest is
 * authored at hue 197 and comes off the glass nearer 160. That is real,
 * the eye sees it, and it is NOT the defect this file gates on, which is
 * the basemap painting a forest from a colour the theme never set.
 *
 * So each forest is photographed twice. First under the route's own
 * light, which is the picture a visitor gets and is attached for a
 * human to judge. Then under `day`, whose lights are white, which is the
 * one the assertion reads: with white light the painted colour is the
 * authored colour times a brightness, and a brightness cannot turn brown
 * into green.
 *
 * WHAT IS ASSERTED, AND WHY IT IS STATED THAT WAY
 *
 * Not "the mean pixel equals the token": hillshade lays a 12% white over
 * the lit slopes, rivers cross the Amazon, and `day` lights are bright
 * enough to clip a pale token on paper. The claim is about hue and about
 * one axis of it:
 *
 *   greenness  (G - max(R, B)) / mean(R, G, B)
 *              Positive only when green leads both other channels, which
 *              is what "green" means to an eye and what no brown, rust,
 *              teal or pink token does. Scale-invariant, so brightness
 *              and clipping cannot manufacture it; clipping only pulls it
 *              toward zero. Mapbox's default greenspace, hsl(115, 60%,
 *              84%), measures about +0.4; the forest may be no greener
 *              than the theme's own token says, within a margin.
 *
 *   hue        when both the token and the pixel carry enough chroma to
 *              have one, the pixel's hue is within HUE_MARGIN of the
 *              token's. Skipped for a near-grey token (lightness means
 *              more than hue there) and for a clipped sample.
 *
 * Every measurement is written to the job log as a FOREST notice and
 * attached to the report, so a failure arrives with the numbers and the
 * picture rather than with a verdict.
 */

/** Marks every line this file writes, for grepping a job log. */
const TAG = 'FOREST';

type Camera = {
  name: string;
  center: [number, number];
  zoom: number;
  /** Which of Standard's layers paints the woodland at this zoom. */
  layers: string;
};

const CAMERAS: Camera[] = [
  {
    name: 'amazon',
    center: [-63, -5],
    zoom: 4.5,
    layers: 'landcover',
  },
  {
    name: 'hood',
    center: [-121.75, 45.25],
    zoom: 9,
    layers: 'landcover, national-park, landuse',
  },
];

/** A centred third of the 1440x900 frame. */
const CROP = {
  x: DESKTOP.width / 2 - 240,
  y: DESKTOP.height / 2 - 150,
  width: 480,
  height: 300,
};

/**
 * How much greener than its own token a forest may come off the glass.
 * Mapbox's default is about +0.4 above every dark theme's token; 0.1 is
 * a quarter of that gap, and well above what a river or a hillshade
 * highlight moves a mean by.
 */
const GREENNESS_MARGIN = 0.1;

/** Degrees of hue a lit, shaded, partly-clipped forest may wander. */
const HUE_MARGIN = 40;

/** Below this max-min channel spread a colour has no hue worth comparing. */
const MIN_CHROMA = 10;

/** A channel this high has clipped under `day` light; its hue is gone. */
const CLIP = 250;

const greenness = ([r, g, b]: Rgb): number =>
  (g - Math.max(r, b)) / Math.max(1, (r + g + b) / 3);

const chroma = ([r, g, b]: Rgb): number =>
  Math.max(r, g, b) - Math.min(r, g, b);

const hue = ([r, g, b]: Rgb): number => {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === min) return 0;
  const d = max - min;
  const h =
    max === r
      ? (g - b) / d + (g < b ? 6 : 0)
      : max === g
        ? (b - r) / d + 2
        : (r - g) / d + 4;
  return (h * 60) % 360;
};

const hueDistance = (a: number, b: number): number => {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
};

const rgb = (c: Rgb): string =>
  `rgb(${c[0].toFixed(0)}, ${c[1].toFixed(0)}, ${c[2].toFixed(0)})`;

/*
 * The map, as the page sees it. Typed structurally and re-derived inside
 * each evaluate, for the reason cartography.spec.ts gives: Playwright
 * serialises the function and nothing it closes over.
 */
type SceneMap = {
  jumpTo: (options: unknown) => void;
  setConfigProperty: (
    id: string,
    key: string,
    value: unknown,
  ) => void;
  getConfigProperty: (id: string, key: string) => unknown;
};

const aim = (page: Page, camera: Camera): Promise<void> =>
  page.evaluate(
    ([center, zoom]) => {
      const map = window.__SCENE__?.map as unknown as
        SceneMap | undefined;
      if (!map) throw new Error('window.__SCENE__ is not published');
      map.jumpTo({
        center,
        zoom,
        pitch: 0,
        bearing: 0,
        // The route's camera may carry an offset (the projects globe sits
        // in the right-hand rail); this crop wants the forest centred.
        padding: { top: 0, right: 0, bottom: 0, left: 0 },
      });
    },
    [camera.center, camera.zoom] as const,
  );

const lightPreset = (page: Page): Promise<string> =>
  page.evaluate(() => {
    const map = window.__SCENE__?.map as unknown as
      SceneMap | undefined;
    if (!map) throw new Error('window.__SCENE__ is not published');
    return String(map.getConfigProperty('basemap', 'lightPreset'));
  });

const setLightPreset = (page: Page, preset: string): Promise<void> =>
  page.evaluate((value) => {
    const map = window.__SCENE__?.map as unknown as
      SceneMap | undefined;
    if (!map) throw new Error('window.__SCENE__ is not published');
    map.setConfigProperty('basemap', 'lightPreset', value);
  }, preset);

/** The live --map-green, which is the colour the forest is meant to be. */
const forestToken = async (page: Page): Promise<Rgb> =>
  parseRgb(
    await page.evaluate(() =>
      getComputedStyle(document.documentElement)
        .getPropertyValue('--map-green')
        .trim(),
    ),
    [-1, -1, -1],
  );

/**
 * Photographs the crop, attaches it, mirrors it under test-results so the
 * review-screenshots artifact carries it, and hands back its mean colour.
 */
const photograph = async (
  page: Page,
  testInfo: TestInfo,
  name: string,
): Promise<Rgb> => {
  const file = `${name}.png`;
  const shot = await page.screenshot({
    clip: CROP,
    animations: 'disabled',
    caret: 'hide',
    scale: 'css',
  });
  await testInfo.attach(file, {
    body: shot,
    contentType: 'image/png',
  });
  const root = testInfo.config.configFile
    ? path.dirname(testInfo.config.configFile)
    : process.cwd();
  const mirror = path.join(
    root,
    'test-results',
    'review-forests',
    file,
  );
  await fs.promises.mkdir(path.dirname(mirror), { recursive: true });
  await fs.promises.writeFile(mirror, shot);

  const stats = await samplePixels(page, CROP);
  return [stats.red, stats.green, stats.blue];
};

test.use({ viewport: DESKTOP });

test.beforeEach(async ({ page }) => {
  await installSceneDebug(page);
});

const describeTheme = (theme: ThemeId) => {
  test(`the forests wear ${theme}`, async ({ page }, testInfo) => {
    // Two cameras, two lights each, every one of them waiting on tiles
    // over the network.
    test.setTimeout(240_000);

    await seedTheme(page, theme);
    await page.goto('/', { waitUntil: 'load' });
    await waitForScene(page, 'live');
    await settle(page);
    await installBasemapOnly(page);

    const token = await forestToken(page);
    expect(
      token,
      `--map-green did not resolve on ${theme}`,
    ).not.toEqual([-1, -1, -1]);
    const routeLight = await lightPreset(page);

    for (const camera of CAMERAS) {
      // The route's own light first: the picture a visitor sees.
      await setLightPreset(page, routeLight);
      await aim(page, camera);
      await settle(page);
      await settle(page);
      await showBasemapOnly(page, true);
      const lit = await photograph(
        page,
        testInfo,
        `forest-${camera.name}-${theme}`,
      );

      // Then white light, which is what the assertion reads.
      await setLightPreset(page, 'day');
      await settle(page);
      await settle(page);
      const flat = await photograph(
        page,
        testInfo,
        `forest-${camera.name}-${theme}-flat`,
      );
      await showBasemapOnly(page, false);

      const measured = {
        token: {
          rgb: rgb(token),
          hue: hue(token).toFixed(0),
          greenness: greenness(token).toFixed(3),
        },
        [routeLight]: {
          rgb: rgb(lit),
          hue: hue(lit).toFixed(0),
          greenness: greenness(lit).toFixed(3),
        },
        day: {
          rgb: rgb(flat),
          hue: hue(flat).toFixed(0),
          greenness: greenness(flat).toFixed(3),
          chroma: chroma(flat).toFixed(0),
        },
      };
      const line = JSON.stringify(measured);
      notice(`${TAG} ${camera.name} ${theme}`, line);
      testInfo.annotations.push({
        type: `forest:${camera.name}`,
        description: line,
      });

      const where =
        `${theme} over ${camera.name} (${camera.layers}, z${camera.zoom})` +
        ` under day light reads ${rgb(flat)} against a --map-green of ` +
        `${rgb(token)}`;

      expect(
        greenness(flat),
        `${where}: the forest is greener than the theme's own forest ` +
          'token, so the basemap is painting it from a colour the theme ' +
          'never set',
      ).toBeLessThanOrEqual(greenness(token) + GREENNESS_MARGIN);

      const clipped = Math.max(...flat) >= CLIP;
      if (
        chroma(token) >= MIN_CHROMA &&
        chroma(flat) >= MIN_CHROMA &&
        !clipped
      ) {
        expect(
          hueDistance(hue(flat), hue(token)),
          `${where}: hue ${hue(flat).toFixed(0)} is not the token's ` +
            `${hue(token).toFixed(0)}`,
        ).toBeLessThanOrEqual(HUE_MARGIN);
      }
    }
  });
};

for (const theme of THEME_IDS) describeTheme(theme);
