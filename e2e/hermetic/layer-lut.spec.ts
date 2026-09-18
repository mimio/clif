import { expect, test, type Page } from '@playwright/test';
import { paintsAColor } from 'scene/layers/sets';
import { basemapColor } from 'styles/tokens/lut';
import {
  makePalette,
  type Palette,
  parseRgb,
  type Rgb,
} from 'styles/tokens/palette';
import {
  DESKTOP,
  installBasemapOnly,
  installSceneDebug,
  notice,
  samplePixels,
  showBasemapOnly,
  waitForScene,
} from '../fixtures/app';
import { stubMapboxNetwork } from '../fixtures/mapbox-stub';

/*
 * THE OTHER HALF OF THE DOUBLE TINT, AND THE TIER THAT COULD NOT SEE IT.
 *
 * e2e/hermetic/globe-atmosphere.spec.ts's second test is this one's twin.
 * The fog resolved its three colours through `style.getLut(fog.scope)`,
 * `fog.scope` is the ROOT style's, and Mapbox Standard's root carries a
 * `color-theme` while the stub's did not -- so tier 1 measured the fog as
 * authored and the preview did not. THE SAME ROOT SCOPE REACHES OUR OWN
 * LAYERS. They are added to the root style, so `Style._reloadColorTheme`
 * sets `layer.lut` on every one of them from the same theme, and every
 * colour scene/layers/sets.ts paints -- the project sites, the labels, the
 * history stops and their line, the ring -- was going through our own
 * colour cube a second time on the deployed site only.
 *
 * MEASURED on the routes below, against the real library over a stub whose
 * root carries the app's own LUT -- the drawn pixel with the sentinel, and
 * the same pixel with the sentinel removed:
 *
 *   project-site-points   circle-color         rgb(170, 152, 31) -> rgb(69, 56, 13)
 *   history-stop-points   circle-color         rgb(166, 148, 31) -> rgb(63, 51, 13)
 *   history-stop-ring     circle-stroke-color  rgb(148, 133, 31) -> rgb(60, 49, 15)
 *   history-path-line     line-color           rgb(141,  83, 36) -> rgb(48, 31, 17)
 *
 * a hundred levels of red off the accent, on the one element on /projects
 * the eye is meant to go to first.
 *
 * WHAT THIS FILE ASSERTS, in two halves that fail for different reasons:
 *
 *   THE PIXEL. What is drawn is the palette token, and NOT that token run
 *   through `basemapColor`. Both hypotheses are computed here from the
 *   live palette and from the ground sampled beside the feature in the
 *   same frame, so the assertion is a comparison between two candidate
 *   colours rather than a number somebody wrote down.
 *
 *   THE DECLARATION. Every colour on every layer of ours carries its
 *   `-use-theme`. That covers the layers a hermetic run cannot photograph
 *   -- the stub serves an empty glyph range, so no text is rasterised at
 *   all -- and it covers them by the same structural rule sets.ts paints
 *   by, walked over whatever layers the route happens to mount rather than
 *   over a list of ids.
 *
 * Both halves first prove the theme is REALLY THERE. A root colour theme
 * that failed to load would pass every assertion below while proving
 * nothing, which is exactly the shape of the gap this file exists to
 * close.
 */

/** A fallback no token can produce, so a failed parse is visible. */
const MISSING: Rgb = [-1, -1, -1];

/**
 * How far a drawn pixel may sit from the colour the palette says it should
 * be. The two hypotheses are about a hundred levels apart on the accent,
 * so this is loose enough to absorb the ground sample being a few pixels
 * away from the feature and still nowhere near able to confuse them.
 */
const SLACK = 8;

/** The alpha every accent below is painted at. sets.ts is the authority. */
const RESTING_ALPHA = 0.6;

const open = async (
  context: Parameters<typeof stubMapboxNetwork>[0],
  page: Page,
  route: string,
) => {
  await stubMapboxNetwork(context, { rootColorTheme: true });
  await installSceneDebug(page);
  await page.setViewportSize(DESKTOP);
  await page.goto(route, { waitUntil: 'load' });
  await waitForScene(page);
  await installBasemapOnly(page);
  await showBasemapOnly(page, true);
  // The camera flies, the terrain settles and the glyph request has to
  // come back before the symbol layers stop changing what they cover.
  await page.waitForTimeout(3_500);
};

/**
 * The colour theme really is on the root scope, and it really did reach
 * our layers -- so what follows is testing the sentinel rather than the
 * absence of a theme.
 */
const proveTheme = async (page: Page) => {
  const seen = await page.evaluate(() => {
    const scene = window.__SCENE__;
    if (!scene) throw new Error('no scene handle');
    const style = (
      scene.map as unknown as {
        style: {
          getLut: (scope: string) => unknown;
          _layers: Record<string, { lut?: unknown }>;
        };
      }
    ).style;
    return {
      root: Boolean(style.getLut('')),
      basemap: Boolean(style.getLut('basemap')),
      // The ROOT style's own layers are exactly the ones this repo adds:
      // everything the basemap is made of lives inside the `basemap`
      // fragment, in its own scope. So this enumerates "our layers"
      // without a list anybody has to keep.
      ours: Object.keys(style._layers),
      tinted: Object.keys(style._layers).filter((id) =>
        Boolean(style._layers[id].lut),
      ),
    };
  });
  expect(
    seen.root,
    'the stub did not put a colour theme on the root scope, so this test is vacuous',
  ).toBe(true);
  expect(seen.basemap).toBe(true);
  expect(seen.ours.length).toBeGreaterThan(0);
  /*
   * And it reached them. `-use-theme` does not remove the LUT from the
   * layer -- it tells the binder to ignore it for that one property -- so
   * this staying true is what makes the pixels below meaningful.
   */
  expect(seen.tinted).toEqual(seen.ours);
  return seen.ours;
};

/**
 * Every colour on every layer of ours carries its sentinel.
 *
 * Read off the map rather than off the module: `getLayer(id).paint` is
 * what mapbox is actually holding, after addLayer and after every repaint
 * the route has done. The recogniser is the production one, so a colour
 * this can see is a colour sets.ts would have sealed.
 */
const everyColorIsSealed = async (page: Page, ours: string[]) => {
  const paints = await page.evaluate((ids) => {
    const map = (window.__SCENE__ as { map: unknown }).map as {
      getLayer: (id: string) => { paint?: Record<string, unknown> };
    };
    return ids.map(
      (id) => [id, map.getLayer(id)?.paint ?? {}] as const,
    );
  }, ours);

  let colors = 0;
  for (const [id, paint] of paints) {
    for (const [property, value] of Object.entries(paint)) {
      if (property.endsWith('-use-theme')) continue;
      if (!paintsAColor(value)) continue;
      colors += 1;
      expect(
        paint[`${property}-use-theme`],
        `${id}/${property} is a colour the root theme would re-tint`,
      ).toBe('none');
    }
  }
  // Not vacuous: a route whose layers carry no colour proves nothing.
  expect(colors).toBeGreaterThan(0);
  return colors;
};

/** The palette this frame is wearing, as the app's own reader builds it. */
const readLivePalette = async (page: Page): Promise<Palette> => {
  const tokens = await page.evaluate(() => {
    const css = getComputedStyle(document.documentElement);
    const read = (name: string) => css.getPropertyValue(name).trim();
    return {
      accent: read('--clif-accent'),
      accent2: read('--clif-accent-2'),
      space: read('--surface-ground'),
      land: read('--map-land'),
      deep: read('--map-deep'),
      body: read('--text-body'),
      accentSmall: read('--text-accent-small'),
      sub: read('--text-secondary'),
      muted: read('--text-muted'),
    };
  });
  const rgb = (value: string) => {
    const parsed = parseRgb(value, MISSING);
    // The tokens are authored as hex, so this is the app's own parser
    // rather than a regex that would read `#161616` as a number.
    expect(parsed, `unparsed token: ${value}`).not.toEqual(MISSING);
    return parsed;
  };
  return makePalette({
    accent: rgb(tokens.accent),
    accent2: rgb(tokens.accent2),
    space: rgb(tokens.space),
    land: rgb(tokens.land),
    deep: rgb(tokens.deep),
    body: rgb(tokens.body),
    accentSmall: rgb(tokens.accentSmall),
    sub: rgb(tokens.sub),
    muted: rgb(tokens.muted),
  });
};

/** A screen point near `at` that none of our layers covers. */
const groundBeside = async (
  page: Page,
  ours: string[],
  at: [number, number],
): Promise<[number, number]> => {
  const found = await page.evaluate(
    ([ids, point]) => {
      const map = (window.__SCENE__ as { map: unknown }).map as {
        queryRenderedFeatures: (
          point: [number, number],
          options: { layers: string[] },
        ) => unknown[];
      };
      const [x, y] = point as [number, number];
      for (let step = 16; step <= 64; step += 8) {
        for (const [dx, dy] of [
          [step, 0],
          [-step, 0],
          [0, step],
          [0, -step],
        ]) {
          const probe: [number, number] = [x + dx, y + dy];
          if (probe[0] < 4 || probe[1] < 4) continue;
          if (
            map.queryRenderedFeatures(probe, {
              layers: ids as string[],
            }).length === 0
          ) {
            return probe;
          }
        }
      }
      return null;
    },
    [ours, at] as const,
  );
  if (!found) throw new Error(`no clear ground beside ${at}`);
  return found;
};

/** The mean colour of a small box, centred on a point. */
const at = async (
  page: Page,
  [x, y]: [number, number],
  size = 3,
): Promise<Rgb> => {
  const half = size >> 1;
  const seen = await samplePixels(page, {
    x: x - half,
    y: y - half,
    width: size,
    height: size,
  });
  return [seen.red, seen.green, seen.blue];
};

const over = (ink: Rgb, alpha: number, ground: Rgb): Rgb => [
  ink[0] * alpha + ground[0] * (1 - alpha),
  ink[1] * alpha + ground[1] * (1 - alpha),
  ink[2] * alpha + ground[2] * (1 - alpha),
];

const distance = (a: Rgb, b: Rgb): number =>
  Math.max(
    Math.abs(a[0] - b[0]),
    Math.abs(a[1] - b[1]),
    Math.abs(a[2] - b[2]),
  );

const show = (c: Rgb) =>
  `rgb(${c.map((v) => Math.round(v)).join(', ')})`;

/**
 * The drawn pixel is the colour the palette asks for, and NOT that colour
 * run through our own cube a second time.
 *
 * The caller computes both candidates, because what "the colour the
 * palette asks for" resolves to depends on what is under the feature and
 * at what alpha -- and the two routes below answer that differently, one
 * by modelling the composite and one by finding a feature drawn opaque.
 * What is shared is the shape of the claim: a comparison between two named
 * colours, not a tolerance around a number somebody wrote down.
 */
const wearsTheToken = async (
  page: Page,
  label: string,
  point: [number, number],
  authored: Rgb,
  themed: Rgb,
  size: number,
) => {
  const drawn = await at(page, point, size);
  const toAuthored = distance(drawn, authored);
  const toThemed = distance(drawn, themed);
  notice(
    `layer lut — ${label}`,
    `drawn ${show(drawn)} · authored ${show(authored)} ` +
      `(d=${toAuthored.toFixed(1)}) · re-tinted ${show(themed)} ` +
      `(d=${toThemed.toFixed(1)})`,
  );
  // The two candidates really are far apart, or nothing below means
  // anything.
  expect(
    distance(authored, themed),
    `${label}: the LUT barely moves this colour, so nothing was proved`,
  ).toBeGreaterThan(SLACK * 4);
  expect(
    toAuthored,
    `${label}: drawn ${show(drawn)}, the palette says ${show(authored)}, ` +
      `a second pass of our own LUT would say ${show(themed)}`,
  ).toBeLessThanOrEqual(SLACK);
};

test.describe('a colour theme on the ROOT style', () => {
  test('does not re-tint the project sites', async ({
    context,
    page,
  }) => {
    await open(context, page, '/projects');
    const ours = await proveTheme(page);
    const sealed = await everyColorIsSealed(page, ours);
    notice(
      'layer lut — /projects',
      `${ours.length} root layers, ${sealed} colours sealed`,
    );

    const palette = await readLivePalette(page);
    /*
     * Portland, which is the largest of the five site points -- six
     * projects, so `circle-radius` resolves to 6.8 and a 3x3 box at the
     * centre is wholly inside it. The point is found by projecting the
     * anchor rather than by a screen coordinate written down here, so a
     * camera change moves the sample with it.
     */
    const point = await page.evaluate(() => {
      const map = (window.__SCENE__ as { map: unknown }).map as {
        project: (lngLat: [number, number]) => {
          x: number;
          y: number;
        };
        queryRenderedFeatures: (
          point: [number, number],
          options: { layers: string[] },
        ) => { properties?: Record<string, unknown> }[];
      };
      const source = (
        map as unknown as {
          getSource: (id: string) => {
            _data?: {
              features: {
                geometry: { coordinates: [number, number] };
                properties: { count: number };
              }[];
            };
          };
        }
      ).getSource('project-sites');
      const features = source?._data?.features ?? [];
      const biggest = [...features].sort(
        (a, b) => b.properties.count - a.properties.count,
      )[0];
      if (!biggest) return null;
      const { x, y } = map.project(biggest.geometry.coordinates);
      const spot: [number, number] = [Math.round(x), Math.round(y)];
      return map.queryRenderedFeatures(spot, {
        layers: ['project-site-points'],
      }).length
        ? spot
        : null;
    });
    expect(
      point,
      'no site point is on screen to measure, so the pixel half of this test is vacuous',
    ).not.toBeNull();

    /*
     * A site point at rest is `palette.a(0.6)`, so what is drawn is the
     * accent composited over whatever is under it. The ground is sampled
     * beside the feature in the same frame and goes into BOTH candidates,
     * so it cancels out of the comparison and the only thing left between
     * them is whether our own LUT ran on our own colour.
     */
    const ground = await at(
      page,
      await groundBeside(page, ours, point as [number, number]),
    );
    await wearsTheToken(
      page,
      'project-site-points/circle-color',
      point as [number, number],
      over(palette.accent, RESTING_ALPHA, ground),
      over(
        basemapColor(palette, palette.accent),
        RESTING_ALPHA,
        ground,
      ),
      3,
    );
  });

  test('does not re-tint the history stops', async ({
    context,
    page,
  }) => {
    await open(context, page, '/about');
    const ours = await proveTheme(page);
    const sealed = await everyColorIsSealed(page, ours);
    notice(
      'layer lut — /about',
      `${ours.length} root layers, ${sealed} colours sealed`,
    );

    const palette = await readLivePalette(page);
    /*
     * THE LIVE STOP, WHICH IS THE ONE THING ON THE MAP DRAWN OPAQUE.
     *
     * `historySet` paints the selected stop `palette.a(1)` at radius 4.5
     * and every other one `palette.a(0.6)` at radius 3. So the live one is
     * the accent token itself, over nothing, with a middle wide enough to
     * sample -- no alpha to model, no ground to sample, no arithmetic
     * between the measurement and the claim. It is found by asking which
     * stop the RING is drawn on, because the ring is the same selection
     * expressed as a second layer.
     *
     * THE LINE AND THE RESTING STOPS ARE NOT MEASURED HERE, and that is a
     * limit rather than an oversight. Both are one to three pixels across
     * on a 60-degree pitch over terrain, so what is drawn is the token
     * diluted by a coverage this file cannot know -- and dilution pulls
     * toward the ground, which is the direction the re-tint pulls too. A
     * tolerance wide enough for them stops separating the two candidates.
     * They are covered by `everyColorIsSealed` above, which reads their
     * declared paint off the map rather than photographing it, and by
     * test/scene-layers.test.ts, which walks every state and both palettes.
     */
    const live = await page.evaluate(() => {
      const map = (window.__SCENE__ as { map: unknown }).map as {
        project: (lngLat: [number, number]) => {
          x: number;
          y: number;
        };
        getSource: (id: string) => {
          _data?: {
            features: {
              geometry: { coordinates: [number, number] };
            }[];
          };
        };
        queryRenderedFeatures: (
          point: [number, number],
          options: { layers: string[] },
        ) => unknown[];
      };
      const features =
        map.getSource('history-stops')?._data?.features ?? [];
      for (const feature of features) {
        const { x, y } = map.project(feature.geometry.coordinates);
        const spot: [number, number] = [Math.round(x), Math.round(y)];
        const on = (layer: string) =>
          map.queryRenderedFeatures(spot, { layers: [layer] })
            .length > 0;
        if (on('history-stop-points') && on('history-stop-ring'))
          return spot;
      }
      return null;
    });
    expect(
      live,
      'no live history stop is on screen, so the pixel half of this test is vacuous',
    ).not.toBeNull();

    await wearsTheToken(
      page,
      'history-stop-points/circle-color',
      live as [number, number],
      palette.accent,
      basemapColor(palette, palette.accent),
      3,
    );
  });
});
