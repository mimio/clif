import { test, type TestInfo } from '@playwright/test';
import {
  BASEMAP_IMPORT,
  ROUTES,
  installSceneDebug,
  notice,
  settle,
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
 * It also answers two questions that decide the shape of the theming
 * work and that nothing else can:
 *
 *   1. WHICH LAYERS EACH CONFIG KEY DRIVES. A config key reaches a
 *      paint property as a `["config", "<key>"]` expression inside the
 *      fragment, so walking every layer for those references maps key
 *      -> layers exactly, rather than by inference from the key's name.
 *   2. WHICH PAINT PROPERTIES OPT OUT OF THE LUT. mapbox-gl 3.x honours
 *      `<property>-use-theme: "none"` (shouldIgnoreLut in the bundle),
 *      and any property Standard marks that way is one the colour theme
 *      cannot touch at all.
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
  };
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

        return {
          layerCount: layers.length,
          slots,
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
