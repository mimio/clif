import { test, type TestInfo } from '@playwright/test';
import {
  BASEMAP_IMPORT,
  ROUTES,
  installBasemapOnly,
  installSceneDebug,
  notice,
  settle,
  showBasemapOnly,
  waitForScene,
} from '../fixtures/app';

/*
 * TIER 2, A RECORDING. NOTHING IN THIS FILE CAN FAIL THE BUILD.
 *
 * WHY IT EXISTS
 *
 * The app themes the basemap with one global colour LUT -- a colour
 * grade over everything Mapbox Standard ships. A grade can tint
 * cartography; it cannot re-author it, which is why the globe still
 * wears Standard's own relationships between land, water, parks and
 * roads however hard the LUT pulls. The way out is Standard's
 * PER-FEATURE-CLASS configuration (colorWater, colorGreenspace,
 * colorMotorways, ...), and before anything is designed on top of those
 * keys somebody has to know WHICH KEYS EXIST, what they accept, what
 * they default to, and which layers each one actually reaches.
 *
 * That cannot be answered from this repository, from node_modules or
 * from a development sandbox: the schema is not in mapbox-gl, it is in
 * the style the API serves, and docs.mapbox.com and api.mapbox.com are
 * both unreachable from where this branch was written. The review tier
 * is the ONE place a real Standard style is loaded with a real token --
 * so this file goes and reads it, and prints what it found into the job
 * log.
 *
 * WHAT IT READS, AND WHY EACH IS PUBLIC API
 *
 *   map.getSchema('basemap')     the fragment's config schema: every
 *                                key with its type, default, allowed
 *                                values and numeric bounds. This is the
 *                                same object getConfigProperty() and
 *                                setConfigProperty() resolve through --
 *                                setConfigProperty opens
 *                                `if (!schema || !schema[key]) return`,
 *                                so a key absent here is a call that
 *                                silently does nothing.
 *   map.getConfig('basemap')     what each of those keys is currently
 *                                SET to: the app's seven knobs over
 *                                Standard's own defaults.
 *   map.getStyle().imports       the serialized fragment. Style's
 *                                _serializeImports() assigns
 *                                `importSpec.data = fragment.serialize()`,
 *                                so `.data.layers` is every layer the
 *                                basemap is really made of, with its
 *                                source-layer, zoom range and slot.
 *   map.queryRenderedFeatures()  what is genuinely on the glass at a
 *                                given camera, which a zoom range alone
 *                                does not tell you: a layer whose range
 *                                admits z2 may still draw nothing there.
 *
 * It also answers three questions that decide the shape of the theming
 * work and that nothing else can:
 *
 *   1. WHICH LAYERS EACH CONFIG KEY DRIVES, and HOW. A config key
 *      reaches a paint property as a `["config", "<key>"]` expression
 *      inside the fragment, so walking every layer for those references
 *      maps key -> layers exactly, rather than by inference from the
 *      key's name. The `paint` record then prints the expressions
 *      themselves for the layers the cartography actually rides on --
 *      which is the only way to see whether `theme: 'faded'` selects a
 *      branch that still reads the colour keys.
 *   2. WHICH PAINT PROPERTIES OPT OUT OF THE LUT. mapbox-gl 3.x honours
 *      `<property>-use-theme: "none"` (shouldIgnoreLut in the bundle),
 *      and any property Standard marks that way is one the colour theme
 *      cannot touch at all. It is also the cross-check on our own use of
 *      the same key: scene/layers/sets.ts marks every colour the SITE
 *      paints, on the reasoning that a colour already in the palette must
 *      not go through the palette's own cube, and this says whether
 *      Mapbox reaches for the key in the same circumstances.
 *   3. WHETHER STANDARD'S ROOT CARRIES A COLOUR THEME. `reach.root`
 *      below. Everything the site draws itself is at the root scope, so
 *      that one boolean decides whether our own colours are re-tinted on
 *      the deployed page; it is reasoned to be true and reproduced
 *      offline, and this is the only tier that can read it off the real
 *      style.
 *
 * HOW TO READ IT
 *
 * Every line is prefixed `CARTO` and carries compact JSON, so the whole
 * record comes out of a job log with one grep. The unabridged payloads
 * are attached to the Playwright report as well, because a log
 * truncates and an attachment does not.
 *
 * `expect` is deliberately not imported. There is nothing here to
 * assert: this file is a measuring instrument, and an instrument that
 * can turn the build red is one people learn to stop reading.
 */

/** Marks every line this file writes, for grepping a job log. */
const TAG = 'CARTO';

/**
 * A payload is emitted in slices rather than as one enormous line:
 * GitHub's log viewer folds very long lines and the reporter buffers
 * them. Reassembly is `parts` slices of `name`, in order.
 */
const SLICE = 3_000;

const record = async (
  testInfo: TestInfo,
  name: string,
  value: unknown,
): Promise<void> => {
  const json = JSON.stringify(value);
  const parts = Math.max(1, Math.ceil(json.length / SLICE));
  notice(`${TAG} ${name}`, `bytes=${json.length} parts=${parts}`);
  for (let i = 0; i < parts; i += 1) {
    const slice = json.slice(i * SLICE, (i + 1) * SLICE);
    notice(`${TAG} ${name} ${i + 1}/${parts}`, slice);
  }
  await testInfo.attach(`${name}.json`, {
    body: JSON.stringify(value, null, 1),
    contentType: 'application/json',
  });
};

/**
 * Anything that goes wrong is recorded, never thrown. A probe that
 * cannot run is itself a finding -- it means the public API this plan
 * is built on is not there -- and it is worth strictly more as an
 * annotation on a green job than as a red one nobody reads.
 */
const guard = async (
  testInfo: TestInfo,
  name: string,
  run: () => Promise<unknown>,
): Promise<void> => {
  try {
    await record(testInfo, name, await run());
  } catch (error) {
    notice(`${TAG} ${name} FAILED`, String(error));
    testInfo.annotations.push({
      type: 'carto-unavailable',
      description: `${name}: ${String(error)}`,
    });
  }
};

/*
 * The map, as the page sees it.
 *
 * Typed structurally rather than against mapbox-gl, and re-derived
 * inside every evaluate rather than shared through a helper: Playwright
 * serialises the evaluated function and nothing it closes over, so a
 * module-scope helper would be undefined in the page. The type crosses
 * the boundary because types are erased; the value cannot.
 *
 * getSchema and getConfig are optional on purpose. They are public
 * mapbox-gl 3.x API and the whole plan leans on them, so if a deployed
 * bundle does not carry them that is the single most important thing
 * this file can report.
 */
type StyleLayer = Record<string, unknown> & {
  id: string;
  type: string;
  source?: string;
  'source-layer'?: string;
  slot?: string;
  minzoom?: number;
  maxzoom?: number;
  paint?: Record<string, unknown>;
  layout?: Record<string, unknown>;
};

type StyleImport = {
  id: string;
  url?: string;
  config?: Record<string, unknown>;
  data?: { layers?: StyleLayer[]; schema?: unknown };
};

type ProbeMap = {
  getSchema?: (id: string) => unknown;
  getConfig?: (id: string) => unknown;
  getStyle: () => {
    layers?: StyleLayer[];
    imports?: StyleImport[];
    'color-theme'?: unknown;
  };
  /** The live Style, for the one question only the decoded LUT answers. */
  style?: { getLut?: (scope: string) => unknown };
  getZoom: () => number;
  getCenter: () => { lng: number; lat: number };
  getPitch: () => number;
  queryRenderedFeatures: () => {
    layer?: { id?: string; type?: string };
    sourceLayer?: string;
    source?: string;
  }[];
};

test.beforeEach(async ({ page }) => {
  await installSceneDebug(page);
});

test.describe('standard cartography', () => {
  /* ---- 1: the schema, and what it reaches --------------------------- */

  test('the config schema Standard really has', async ({
    page,
  }, testInfo) => {
    await page.goto('/', { waitUntil: 'load' });
    await waitForScene(page, 'live').catch(() => undefined);
    await settle(page);

    await guard(testInfo, 'schema', () =>
      page.evaluate((importId) => {
        const map = window.__SCENE__?.map as unknown as ProbeMap;
        if (!map)
          throw new Error('window.__SCENE__ is not published');
        const fragment = map
          .getStyle()
          .imports?.find((entry) => entry.id === importId);
        const schema =
          (map.getSchema?.(importId) as Record<
            string,
            unknown
          > | null) ??
          (fragment?.data?.schema as Record<string, unknown>) ??
          null;
        return {
          importId,
          styleUrl: window.__SCENE__?.styleUrl() ?? null,
          hasGetSchema: typeof map.getSchema === 'function',
          hasGetConfig: typeof map.getConfig === 'function',
          importUrl: fragment?.url ?? null,
          keys: schema === null ? null : Object.keys(schema).sort(),
          schema,
          /** What those keys are set to right now. */
          config: (map.getConfig?.(importId) as unknown) ?? null,
          /** What the app asked for, as the root style records it. */
          requested: fragment?.config ?? null,
        };
      }, BASEMAP_IMPORT),
    );

    /*
     * The half no amount of reading the schema answers: which layers a
     * key actually paints, and which paint properties Standard has
     * excluded from the colour theme.
     */
    await guard(testInfo, 'reach', () =>
      page.evaluate((importId) => {
        const map = window.__SCENE__?.map as unknown as ProbeMap;
        if (!map)
          throw new Error('window.__SCENE__ is not published');
        const layers =
          map
            .getStyle()
            .imports?.find((entry) => entry.id === importId)?.data
            ?.layers ?? [];

        const byKey: Record<string, string[]> = {};
        const useTheme: Record<string, string> = {};
        const slots: string[] = [];

        const walk = (node: unknown, layerId: string): void => {
          if (Array.isArray(node)) {
            if (node[0] === 'config' && typeof node[1] === 'string') {
              const list = byKey[node[1]] ?? [];
              if (!list.includes(layerId)) list.push(layerId);
              byKey[node[1]] = list;
            }
            for (const item of node) walk(item, layerId);
            return;
          }
          if (node !== null && typeof node === 'object') {
            const entries = Object.values(
              node as Record<string, unknown>,
            );
            for (const value of entries) walk(value, layerId);
          }
        };

        for (const layer of layers) {
          if (layer.type === 'slot') slots.push(layer.id);
          walk(layer.paint, layer.id);
          walk(layer.layout, layer.id);
          walk(layer.filter, layer.id);
          const paint = layer.paint ?? {};
          for (const property of Object.keys(paint)) {
            if (property.endsWith('-use-theme')) {
              useTheme[`${layer.id}.${property}`] = JSON.stringify(
                paint[property],
              );
            }
          }
        }

        /*
         * THE FACT THIS WHOLE BRANCH TURNS ON, AND THE ONLY PLACE IT CAN
         * BE CHECKED.
         *
         * `Style.getLut(scope)` is what re-tints a colour, and the ROOT
         * scope's theme comes from the ROOT STYLESHEET -- the app only
         * ever calls setImportColorTheme('basemap', ...), which sets the
         * fragment's override and leaves the root's alone. Everything the
         * site draws itself lives at the root scope, so whether Standard's
         * root carries a `color-theme` decides whether our own colours are
         * passed through our own cube a second time.
         *
         * Reasoned to be TRUE from the fog's behaviour on the first real
         * preview -- the space behind the globe read rgb(38, 33, 28)
         * against a ground token of rgb(22, 22, 22) -- and reproduced
         * offline by putting a root `color-theme` on the hermetic stub. It
         * has never been read off the real style, because no tier but this
         * one can. scene/layers/sets.ts and scene/theme.ts are both written
         * on the assumption it is true and are correct either way; this is
         * what turns the assumption into a measurement.
         */
        const root = {
          declared: Boolean(map.getStyle()['color-theme']),
          lut: Boolean(map.style?.getLut?.('')),
          fragmentLut: Boolean(map.style?.getLut?.(importId)),
        };

        return {
          layerCount: layers.length,
          slots,
          root,
          /** config key -> how many layers it reaches, and the first twelve. */
          reach: Object.fromEntries(
            Object.keys(byKey)
              .sort()
              .map((key) => [
                key,
                {
                  count: byKey[key].length,
                  layers: byKey[key].slice(0, 12),
                },
              ]),
          ),
          useTheme,
        };
      }, BASEMAP_IMPORT),
    );

    /*
     * THE PAINT EXPRESSIONS OF THE LAYERS THE CARTOGRAPHY DRIVES.
     *
     * The reach walk above says WHICH layers a config key is referenced
     * in. It does not say HOW, and one question turns on that: the app
     * sends `theme: 'faded'` on its two light themes, `theme` is
     * referenced by 100 layers, and Standard writes it as a `match` --
     * so a branch selected by `faded` could perfectly well resolve to a
     * literal rather than to `["config", "colorWater"]`, which would
     * mean the authored water colour is dropped on paper and chalk and
     * nothing anywhere says so.
     *
     * `roadsBrightness` (default 0.4, "how bright roads appear in dark
     * styles") is the same shape of question for the road colours.
     *
     * Neither can be answered by reading a schema; both are plainly
     * readable in the serialized paint. So this prints it, for the
     * handful of layers that carry the surfaces the globe is actually
     * made of, and the answer decides whether `theme` stays where it is.
     */
    await guard(testInfo, 'paint', () =>
      page.evaluate((importId) => {
        const map = window.__SCENE__?.map as unknown as ProbeMap;
        if (!map)
          throw new Error('window.__SCENE__ is not published');
        const layers =
          map
            .getStyle()
            .imports?.find((entry) => entry.id === importId)?.data
            ?.layers ?? [];
        /*
         * EVERY LAYER THAT PAINTS AN AREA, swept rather than named.
         *
         * This was a hand list of thirteen and that was how a leak
         * stayed hidden: a fill nobody thought to name is exactly the
         * fill that is still wearing Mapbox's own colour. The fragment
         * has 190 layers but only a fraction of them are fills, so the
         * sweep is affordable -- and `usesConfig` tags each one with
         * whether any ["config", ...] reference appears in its paint at
         * all, which is the one-bit answer to "is this ours or theirs".
         */
        const AREA = [
          'background',
          'fill',
          'fill-extrusion',
          'model',
        ];
        const mentionsConfig = (node: unknown): boolean => {
          if (Array.isArray(node)) {
            if (node[0] === 'config') return true;
            return node.some(mentionsConfig);
          }
          if (node !== null && typeof node === 'object') {
            return Object.values(
              node as Record<string, unknown>,
            ).some(mentionsConfig);
          }
          return false;
        };
        return Object.fromEntries(
          layers
            .filter((layer) => AREA.includes(layer.type))
            .map((layer) => [
              layer.id,
              {
                type: layer.type,
                z: [layer.minzoom ?? null, layer.maxzoom ?? null],
                usesConfig: mentionsConfig(layer.paint),
                paint: layer.paint ?? null,
              },
            ]),
        );
      }, BASEMAP_IMPORT),
    );

    /*
     * Every layer the basemap is made of, as one compact table. This is
     * the "all the layers we can customise" half of the question, and
     * the zoom columns are what the per-camera records below are read
     * against.
     */
    await guard(testInfo, 'layers', () =>
      page.evaluate((importId) => {
        const map = window.__SCENE__?.map as unknown as ProbeMap;
        if (!map)
          throw new Error('window.__SCENE__ is not published');
        const style = map.getStyle();
        const layers =
          style.imports?.find((entry) => entry.id === importId)?.data
            ?.layers ?? [];
        return {
          basemap: layers.map((layer) => ({
            i: layer.id,
            t: layer.type,
            s: layer.source ?? null,
            l: layer['source-layer'] ?? null,
            z: [layer.minzoom ?? null, layer.maxzoom ?? null],
            sl: layer.slot ?? null,
          })),
          /** The root style's own layers: ours, and any slot we filled. */
          root: (style.layers ?? []).map((layer) => ({
            i: layer.id,
            t: layer.type,
            sl: layer.slot ?? null,
          })),
        };
      }, BASEMAP_IMPORT),
    );
  });

  /* ---- 1b: what the basemap is actually PAINTED, in pixels ----------- */

  /*
   * THE MEASUREMENT EVERY OTHER RECORD IN THIS FILE IS A PROXY FOR.
   *
   * Everything above reads what the scene SENT and what the style SAYS.
   * Neither reads the screen, and that gap is where "I still see green in
   * forest areas" lives -- a report the other records insist cannot be
   * happening.
   *
   * THE FIRST VERSION OF THIS PROBE WAS NEARLY USELESS and the way it
   * failed is worth keeping. It histogrammed HUE, and skipped any pixel
   * whose max channel minus min channel was under 12 as "grey". This
   * palette is deliberately desaturated -- the map tokens run s=11% to
   * s=25% -- so that threshold threw away 99.2% of the frame (7,214
   * counted out of 921,600) and histogrammed what was left: the accent
   * dots, the atmosphere rim, the stars. It reported 48% of pixels in the
   * "green band" while measuring almost none of the map.
   *
   * So this one does not bucket by hue and does not filter by
   * saturation. It counts the actual RGB values, quantised, and reports
   * the biggest masses with the nearest --map-* token to each. That turns
   * the question into one line per mass: this much of the screen is this
   * colour, and it is (or is not) the token we set.
   *
   * Two cameras, because they show different things: /projects is the
   * globe at z2.6, where `landcover` covers whole continents and a forest
   * mass is at its largest; /about is z10.5 over Portland.
   */
  for (const route of ['/projects', '/about']) {
    test(`what the basemap is actually painted on ${route}`, async ({
      page,
    }, testInfo) => {
      await page.goto(route, { waitUntil: 'load' });
      await waitForScene(page, 'live').catch(() => undefined);
      await installBasemapOnly(page);
      await settle(page);
      await showBasemapOnly(page, true);
      /*
       * settle() waits for the map's own `idle`, which it can reach
       * before a single tile has been decoded on a cold preview. The
       * previous run photographed exactly that. So: wait for the map to
       * report its sources loaded, then settle again, then shoot.
       */
      await page
        .waitForFunction(
          () => {
            const map = window.__SCENE__?.map as unknown as {
              areTilesLoaded?: () => boolean;
              isSourceLoaded?: (id: string) => boolean;
            };
            return Boolean(map?.areTilesLoaded?.());
          },
          undefined,
          { timeout: 30_000 },
        )
        .catch(() => undefined);
      await settle(page);
      await page.waitForTimeout(2_000);

      const shot = (await page.screenshot()).toString('base64');

      await guard(
        testInfo,
        `pixels${route.replace(/\//g, '-')}`,
        () =>
          page.evaluate(
            ([encoded, names]) =>
              new Promise((resolve, reject) => {
                const image = new Image();
                image.onerror = () =>
                  reject(new Error('the capture did not decode'));
                image.onload = () => {
                  const canvas = document.createElement('canvas');
                  canvas.width = image.naturalWidth;
                  canvas.height = image.naturalHeight;
                  const context = canvas.getContext('2d');
                  if (!context) {
                    reject(new Error('no 2d context'));
                    return;
                  }
                  context.drawImage(image, 0, 0);
                  const { data } = context.getImageData(
                    0,
                    0,
                    canvas.width,
                    canvas.height,
                  );

                  /* The live value of every --map-* token, as rgb. */
                  const css = getComputedStyle(
                    document.documentElement,
                  );
                  const tokens: [string, number[]][] = (
                    names as string[]
                  ).map((name) => {
                    const probe = document.createElement('div');
                    probe.style.color = css
                      .getPropertyValue(name)
                      .trim();
                    document.body.append(probe);
                    const resolved = getComputedStyle(probe).color;
                    probe.remove();
                    const n = (
                      resolved.match(/\d+/g) ?? ['0', '0', '0']
                    )
                      .slice(0, 3)
                      .map(Number);
                    return [name, n];
                  });

                  /* Mapbox's own greenspace default, as 8-bit. */
                  const MAPBOX_GREEN = [163, 240, 158];
                  const bins = new Map<string, number>();
                  let mapboxGreen = 0;
                  const total = data.length / 4;
                  for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    // Quantised to 4 levels so near-identical shades of
                    // one fill land in one bin; no saturation filter, so
                    // the map's own low-chroma surfaces are counted.
                    const key = `${r >> 2}.${g >> 2}.${b >> 2}`;
                    bins.set(key, (bins.get(key) ?? 0) + 1);
                    if (
                      Math.abs(r - MAPBOX_GREEN[0]) < 40 &&
                      Math.abs(g - MAPBOX_GREEN[1]) < 40 &&
                      Math.abs(b - MAPBOX_GREEN[2]) < 40
                    ) {
                      mapboxGreen += 1;
                    }
                  }

                  const hue = ([r, g, b]: number[]) => {
                    const mx = Math.max(r, g, b);
                    const mn = Math.min(r, g, b);
                    if (mx === mn) return -1;
                    const d = mx - mn;
                    const h =
                      mx === r
                        ? ((g - b) / d + (g < b ? 6 : 0)) / 6
                        : mx === g
                          ? ((b - r) / d + 2) / 6
                          : ((r - g) / d + 4) / 6;
                    return Math.round(h * 360);
                  };

                  const masses = [...bins.entries()]
                    .sort((a, c) => c[1] - a[1])
                    .slice(0, 14)
                    .map(([key, n]) => {
                      const rgb = key
                        .split('.')
                        .map((v) => Number(v) * 4 + 2);
                      let best = '';
                      let bestD = Infinity;
                      for (const [name, value] of tokens) {
                        const d = Math.hypot(
                          rgb[0] - value[0],
                          rgb[1] - value[1],
                          rgb[2] - value[2],
                        );
                        if (d < bestD) {
                          bestD = d;
                          best = name;
                        }
                      }
                      return {
                        rgb,
                        hue: hue(rgb),
                        share: Number((n / total).toFixed(4)),
                        nearest: best,
                        distance: Math.round(bestD),
                      };
                    });

                  resolve({
                    sampled: total,
                    masses,
                    mapboxGreen,
                    tokens: Object.fromEntries(tokens),
                  });
                };
                image.src = `data:image/png;base64,${encoded}`;
              }),
            [
              shot,
              [
                '--map-land',
                '--map-water',
                '--map-green',
                '--map-building',
                '--map-road',
                '--map-road-major',
                '--map-boundary',
                '--surface-ground',
                '--clif-accent',
                '--clif-accent-2',
              ],
            ] as [string, string[]],
          ),
      );

      await showBasemapOnly(page, false);
    });
  }

  /* ---- 2: what each camera actually shows ---------------------------- */

  /*
   * One record per route, because "which layers show at which zoom" is
   * a question about the five cameras in content/cameras.ts and not
   * about zoom in the abstract. Each records the camera it settled at,
   * the basemap layers whose zoom range admits it, and -- the honest
   * answer -- what queryRenderedFeatures found on the glass, grouped by
   * source-layer and by layer.
   */
  for (const route of ROUTES) {
    test(`what ${route.name} shows`, async ({ page }, testInfo) => {
      await page.goto(route.path, { waitUntil: 'load' });
      await waitForScene(page, 'live').catch(() => undefined);
      await settle(page);

      await guard(testInfo, `camera-${route.name}`, () =>
        page.evaluate((importId) => {
          const map = window.__SCENE__?.map as unknown as ProbeMap;
          if (!map) {
            throw new Error('window.__SCENE__ is not published');
          }
          const zoom = map.getZoom();
          const inRange = (
            map
              .getStyle()
              .imports?.find((entry) => entry.id === importId)?.data
              ?.layers ?? []
          )
            .filter(
              (layer) =>
                (layer.minzoom ?? 0) <= zoom &&
                (layer.maxzoom ?? 24) > zoom,
            )
            .map((layer) => layer.id);

          const bySourceLayer: Record<string, number> = {};
          const byLayer: Record<string, number> = {};
          let queried: number | null = null;
          let queryError: string | null = null;
          try {
            const features = map.queryRenderedFeatures();
            queried = features.length;
            for (const feature of features) {
              const source = feature.sourceLayer ?? '(none)';
              bySourceLayer[source] =
                (bySourceLayer[source] ?? 0) + 1;
              const id = feature.layer?.id ?? '(none)';
              byLayer[id] = (byLayer[id] ?? 0) + 1;
            }
          } catch (error) {
            queryError = String(error);
          }

          return {
            zoom,
            center: map.getCenter(),
            pitch: map.getPitch(),
            inRangeCount: inRange.length,
            inRange,
            queried,
            queryError,
            bySourceLayer,
            byLayer,
          };
        }, BASEMAP_IMPORT),
      );
    });
  }
});
