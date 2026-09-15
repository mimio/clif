/*
 * Browser smoke test for the production build. Run `pnpm build` first, then:
 *
 *   pnpm test:e2e
 *
 * Starts `next start` on a free port, drives every route in headless
 * Chromium, and fails on page errors, failed requests, or a broken feature:
 * the d3 globe, the filmstrip drag, the three.js image effect, and the
 * Mapbox history map, whose hover, selection, prev/next, clear and reset
 * interactions are driven end to end through the Redux layer that owns them.
 * Mapbox style, glyph, session and telemetry requests
 * are answered locally so the test needs no network and no token quota.
 * Screenshots of every route land in SMOKE_OUT (default: .smoke-output).
 */
import { spawn, type ChildProcess } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, type Page } from 'playwright';
import { WORK_SOURCE } from '../constants/source.ts';

const PORT = Number(process.env.PORT) || 3999;
const BASE = `http://127.0.0.1:${PORT}`;
const OUT = path.resolve(process.env.SMOKE_OUT || '.smoke-output');
// Third-party hosts whose availability is not the app's concern.
const IGNORED_HOSTS =
  /(google-analytics\.com|googletagmanager\.com|fonts\.gstatic\.com|fonts\.googleapis\.com)/;

const localStyle = {
  version: 8,
  name: 'smoke-style',
  sources: {},
  glyphs:
    'https://api.mapbox.com/fonts/v1/mapbox/{fontstack}/{range}.pbf',
  layers: [
    {
      id: 'background',
      type: 'background',
      paint: { 'background-color': '#101418' },
    },
  ],
};

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

const readJson = (relativePath: string): unknown =>
  JSON.parse(
    fs.readFileSync(
      fileURLToPath(new URL(`../${relativePath}`, import.meta.url)),
      'utf8',
    ),
  );

// The same generated data the app imports, so the interaction checks below can
// say which feature they expect rather than just "a different one". Typed
// exactly as constants/history.ts types it: an id with no entry is undefined,
// not a silently-trusted object.
const featureIds = readJson(
  'public/history/featureIds.json',
) as number[];
const featureLookup = readJson(
  'public/history/featureLookup.json',
) as Partial<
  Record<number, { company: string; role: string; outlier?: boolean }>
>;

// The work layer carries an inline GeoJSON source, so Mapbox registers that
// source under the layer's own id and one string names both. Spelled out
// separately so a query by layer is not mistaken for a query by source.
const WORK_LAYER = WORK_SOURCE;

type FeatureStateWrites = { selected: number; hover: number };

// The live map with the setFeatureState counter attached by the test.
type CountedMap = NonNullable<typeof globalThis.map> & {
  smokeWrites?: FeatureStateWrites;
};
const MAP_LAYER_IDS = readJson(
  'public/history/mapLayerIds.json',
) as string[];

const PREV_CONTROL = 'button[aria-label="Go To Previous Feature"]';
const NEXT_CONTROL = 'button[aria-label="Go To Next Feature"]';
const RESET_CONTROL = 'button[aria-label="Reset Map Extent"]';

// Camera moves are animated, so every assertion about what is under a screen
// coordinate has to wait for the fly-to to finish first.
const settleMap = (page: Page) =>
  page.waitForFunction(
    () => Boolean(window.map) && !window.map?.isMoving(),
    null,
    { timeout: 30000 },
  );

type MapSnapshot = {
  selected: number[];
  hovered: number[];
  popups: number;
  popupText: string;
  prevDisabled: boolean | null;
  nextDisabled: boolean | null;
  camera: { zoom: number; pitch: number; lng: number; lat: number };
};

// Everything the history checks assert on: the Mapbox feature-state the
// listener middleware maintains, the popup the portal renders, and the
// enabled-ness of the controls, which is derived from the store.
const snapshotMap = (page: Page): Promise<MapSnapshot> =>
  page.evaluate(
    ({ ids, source, prevSelector, nextSelector }) => {
      const { map } = window;
      const flagged = (flag: 'selected' | 'hover') =>
        ids.filter(
          (id) =>
            map?.getFeatureState({ source, id })?.[flag] === true,
        );
      const disabled = (selector: string) => {
        const el = document.querySelector(selector);
        return el instanceof HTMLButtonElement ? el.disabled : null;
      };
      const popups = document.querySelectorAll('.mapboxgl-popup');
      return {
        selected: flagged('selected'),
        hovered: flagged('hover'),
        popups: popups.length,
        popupText: (popups[0]?.textContent ?? '')
          .replace(/\s+/g, ' ')
          .trim(),
        prevDisabled: disabled(prevSelector),
        nextDisabled: disabled(nextSelector),
        camera: {
          zoom: map?.getZoom() ?? 0,
          pitch: map?.getPitch() ?? 0,
          lng: map?.getCenter().lng ?? 0,
          lat: map?.getCenter().lat ?? 0,
        },
      };
    },
    {
      ids: featureIds,
      source: WORK_SOURCE,
      prevSelector: PREV_CONTROL,
      nextSelector: NEXT_CONTROL,
    },
  );

// A screen point sitting on the given feature's circle, or on no feature at
// all, but only when the map canvas is what the pointer would actually hit:
// the controls and the popup float above it.
const locateFeature = (page: Page, featureId: number) =>
  page.evaluate(
    ({ id, layer }) => {
      const { map } = window;
      if (!map) return null;
      const feature = map
        .queryRenderedFeatures({ layers: [layer] })
        .find((candidate) => candidate.id === id);
      if (!feature || feature.geometry.type !== 'Point') return null;
      const [lng, lat] = feature.geometry.coordinates;
      const { x, y } = map.project([lng, lat]);
      const hit = document.elementFromPoint(x, y);
      if (!hit?.closest('.mapboxgl-canvas-container')) return null;
      return { x, y };
    },
    { id: featureId, layer: WORK_LAYER },
  );

const locateEmptySpot = (page: Page) =>
  page.evaluate((layers) => {
    const { map } = window;
    if (!map) return null;
    const canvas = map.getCanvas();
    const { clientWidth: width, clientHeight: height } = canvas;
    for (let row = 1; row < 8; row += 1) {
      for (let column = 1; column < 8; column += 1) {
        const x = (width * column) / 8;
        const y = (height * row) / 8;
        if (map.queryRenderedFeatures([x, y], { layers }).length > 0)
          continue;
        const hit = document.elementFromPoint(x, y);
        if (hit?.closest('.mapboxgl-canvas-container'))
          return { x, y };
      }
    }
    return null;
  }, MAP_LAYER_IDS);

const waitForSelection = (page: Page, featureId: number | null) =>
  page.waitForFunction(
    ({ ids, source, expected }) => {
      const { map } = window;
      const selected = ids.filter(
        (id) =>
          map?.getFeatureState({ source, id })?.selected === true,
      );
      if (expected === null)
        return (
          selected.length === 0 &&
          document.querySelectorAll('.mapboxgl-popup').length === 0
        );
      const popup = document.querySelector('.mapboxgl-popup');
      return (
        selected.length === 1 &&
        selected[0] === expected &&
        Boolean(popup?.textContent)
      );
    },
    { ids: featureIds, source: WORK_SOURCE, expected: featureId },
    { timeout: 20000 },
  );

// Wraps Mapbox's setFeatureState so the listener's bookkeeping can be counted,
// not just its end state. Counted per flag, because moving the pointer onto a
// feature or off it writes `hover` independently of any selection. moveFlag
// writes `selected` once for a first selection (set the new id) and twice for
// a step (unset the old, set the new), so a second writer — a thunk syncing
// the map as well as the listener — shows up here and nowhere else: the end
// state alone is identical either way, since setFeatureState is idempotent.
const countFeatureStateWrites = (page: Page) =>
  page.evaluate(() => {
    const map = window.map as CountedMap | undefined;
    if (!map || map.smokeWrites) return false;
    const write = map.setFeatureState.bind(map);
    const writes = { selected: 0, hover: 0 };
    map.smokeWrites = writes;
    map.setFeatureState = (target, state) => {
      if (state && 'selected' in state) writes.selected += 1;
      if (state && 'hover' in state) writes.hover += 1;
      return write(target, state);
    };
    return true;
  });

const noWrites: FeatureStateWrites = { selected: -1, hover: -1 };

const readFeatureStateWrites = (
  page: Page,
): Promise<FeatureStateWrites> =>
  page.evaluate(
    (none) =>
      (window.map as CountedMap | undefined)?.smokeWrites ?? none,
    noWrites,
  );

const waitForHover = (page: Page, featureId: number | null) =>
  page.waitForFunction(
    ({ ids, source, expected }) => {
      const { map } = window;
      const hovered = ids.filter(
        (id) => map?.getFeatureState({ source, id })?.hover === true,
      );
      return expected === null
        ? hovered.length === 0
        : hovered.length === 1 && hovered[0] === expected;
    },
    { ids: featureIds, source: WORK_SOURCE, expected: featureId },
    { timeout: 20000 },
  );

async function startServer(): Promise<ChildProcess> {
  const nextBin = fileURLToPath(
    import.meta.resolve('next/dist/bin/next'),
  );
  const server = spawn(
    process.execPath,
    [nextBin, 'start', '-p', String(PORT)],
    {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, NODE_ENV: 'production' },
    },
  );
  let output = '';
  server.stdout?.on('data', (chunk: Buffer) => {
    output += chunk.toString();
  });
  server.stderr?.on('data', (chunk: Buffer) => {
    output += chunk.toString();
  });
  for (let i = 0; i < 120; i += 1) {
    if (server.exitCode !== null) {
      throw new Error(`next start exited early:\n${output}`);
    }
    try {
      const res = await fetch(`${BASE}/`);
      if (res.ok) return server;
    } catch {
      // not up yet
    }
    await sleep(500);
  }
  server.kill();
  throw new Error(`server did not respond on ${BASE}\n${output}`);
}

async function main(): Promise<void> {
  fs.mkdirSync(OUT, { recursive: true });
  const server = await startServer();
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--use-gl=angle',
      '--use-angle=swiftshader',
      '--enable-unsafe-swiftshader',
      '--ignore-gpu-blocklist',
    ],
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  await context.route(
    /https:\/\/(api|events)\.mapbox\.com\/.*/,
    (route) => route.fulfill({ status: 204, body: '' }),
  );
  await context.route(
    /https:\/\/api\.mapbox\.com\/styles\/v1\/.*/,
    (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(localStyle),
      }),
  );
  await context.route(
    /https:\/\/api\.mapbox\.com\/fonts\/v1\/.*/,
    (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/x-protobuf',
        body: Buffer.alloc(0),
      }),
  );

  let failures = 0;
  const report = (name: string, ok: boolean, detail?: string) => {
    console.log(
      `${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ` ${detail}` : ''}`,
    );
    if (!ok) failures += 1;
  };

  async function visit<T>(
    route: string,
    checks: (page: Page) => Promise<T>,
  ): Promise<T | null> {
    const page = await context.newPage();
    const pageErrors: string[] = [];
    const consoleErrors: string[] = [];
    const failedRequests: string[] = [];
    page.on('pageerror', (e) => pageErrors.push(String(e)));
    page.on('console', (m) => {
      if (
        m.type() === 'error' &&
        !/Failed to load resource/.test(m.text())
      ) {
        consoleErrors.push(m.text());
      }
    });
    page.on('requestfailed', (r) => {
      if (!IGNORED_HOSTS.test(r.url())) {
        failedRequests.push(`${r.failure()?.errorText} ${r.url()}`);
      }
    });
    const response = await page.goto(`${BASE}${route}`, {
      waitUntil: 'load',
      timeout: 60000,
    });
    report(
      `${route} responds 200`,
      response?.status() === 200,
      String(response?.status()),
    );
    await page.waitForTimeout(1500);
    let result: T | null = null;
    try {
      result = await checks(page);
    } catch (err) {
      report(
        `${route} checks`,
        false,
        err instanceof Error ? err.message : String(err),
      );
    }
    await page.screenshot({
      path: path.join(
        OUT,
        `${route.replace(/\//g, '_') || '_root'}.png`,
      ),
    });
    report(
      `${route} no page errors`,
      pageErrors.length === 0,
      pageErrors.join(' | '),
    );
    report(
      `${route} no failed requests`,
      failedRequests.length === 0,
      failedRequests.join(' | '),
    );
    report(
      `${route} no console errors`,
      consoleErrors.length === 0,
      consoleErrors.slice(0, 3).join(' | '),
    );
    await page.close();
    return result;
  }

  await visit('/', async (page) => {
    // Counts painted pixels in the middle of the globe canvas, returning
    // null while there are none so it doubles as the waitForFunction
    // predicate: the land topology loads after mount, so the first painted
    // frame comes some time after the load event.
    const paintedGlobePixels = (): number | null => {
      const canvas = document.getElementById(
        'globe',
      ) as HTMLCanvasElement | null;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return null;
      const { width, height } = canvas;
      const data = ctx.getImageData(
        width / 2 - 50,
        height / 2 - 50,
        100,
        100,
      ).data;
      let painted = 0;
      for (let i = 3; i < data.length; i += 4)
        if (data[i] > 0) painted += 1;
      return painted > 0 ? painted : null;
    };
    const painted =
      (await page
        .waitForFunction(paintedGlobePixels, undefined, {
          timeout: 10000,
        })
        .then((handle) => handle.jsonValue())
        .catch(() => null)) ?? 0;
    report('/ globe canvas painted', painted > 0, `${painted} px`);
    // The body background is the --color-surface token from
    // styles/globals.css, so this proves the compiled stylesheet loaded.
    const background = await page.evaluate(
      () => getComputedStyle(document.body).backgroundColor,
    );
    report(
      '/ stylesheet applied',
      background === 'rgb(22, 22, 22)',
      `body background ${background}`,
    );
  });

  const firstProject = await visit('/projects', async (page) => {
    const links = await page.locator('a[href^="/projects/"]').count();
    report(
      '/projects project links rendered',
      links > 0,
      `${links} links`,
    );
    const strip = await page.evaluate(() => {
      let el: Element | null = document.querySelector(
        'a[href^="/projects/"]',
      );
      while (el && el !== document.body) {
        const overflow = getComputedStyle(el).overflowX;
        if (
          /(hidden|auto|scroll)/.test(overflow) &&
          el.scrollWidth > el.clientWidth
        )
          break;
        el = el.parentElement;
      }
      if (!el || el === document.body) return null;
      el.setAttribute('data-smoke-strip', '1');
      const rect = el.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        scrollLeft: el.scrollLeft,
      };
    });
    report('/projects filmstrip container found', Boolean(strip));
    if (strip) {
      await page.mouse.move(strip.x, strip.y);
      await page.mouse.down();
      for (let i = 1; i <= 10; i += 1) {
        await page.mouse.move(strip.x - i * 40, strip.y);
        await page.waitForTimeout(16);
      }
      await page.mouse.up();
      await page.waitForTimeout(1000);
      const after = await page.evaluate(
        () =>
          document.querySelector('[data-smoke-strip]')?.scrollLeft ??
          0,
      );
      report(
        '/projects drag scrolls filmstrip',
        after > strip.scrollLeft,
        `scrollLeft ${strip.scrollLeft} -> ${after}`,
      );
    }
    const previews = await page.evaluate(
      () =>
        Array.from(document.images).filter(
          (img) => img.complete && img.naturalWidth > 0,
        ).length,
    );
    report(
      '/projects preview images loaded',
      previews > 0,
      `${previews} images`,
    );
    return page
      .locator('a[href^="/projects/"]')
      .first()
      .getAttribute('href');
  });

  const projectRoute = firstProject || '/projects/haikumi';
  await visit(projectRoute, async (page) => {
    const canvases = await page.evaluate(() =>
      Array.from(document.querySelectorAll('canvas')).map((c) => ({
        w: c.width,
        webgl: Boolean(
          c.getContext('webgl2') || c.getContext('webgl'),
        ),
      })),
    );
    report(
      `${projectRoute} three.js canvas has WebGL`,
      canvases.some((c) => c.webgl && c.w > 0),
      JSON.stringify(canvases),
    );
  });

  await visit('/history', async (page) => {
    await page.waitForFunction(
      (layer) =>
        window.map &&
        window.map.loaded() &&
        window.map.getLayer(layer) !== undefined,
      WORK_LAYER,
      { timeout: 60000 },
    );
    const info = await page.evaluate((source) => {
      const { map } = window;
      if (!map) return { pitch: 0, layers: 0, features: 0 };
      return {
        pitch: map.getPitch(),
        layers: map.getStyle()?.layers.length ?? 0,
        features: map.querySourceFeatures(source).length,
      };
    }, WORK_SOURCE);
    report(
      '/history map loaded with layers',
      info.layers === 4 && info.features === 10,
      JSON.stringify(info),
    );
    report(
      '/history pitch preserved',
      info.pitch === 60,
      String(info.pitch),
    );

    // The map is driven entirely by Redux: hovering and clicking a feature,
    // stepping with the prev/next controls, clearing the selection and
    // resetting the extent all go through thunks, and the highlighting is
    // applied by a listener reacting to the resulting state change. Check the
    // observable results of each rather than the store itself.
    await settleMap(page);
    report(
      '/history feature-state writes instrumented',
      await countFeatureStateWrites(page),
    );

    const idle = await snapshotMap(page);
    report(
      '/history starts with nothing selected and the controls disabled',
      idle.selected.length === 0 &&
        idle.popups === 0 &&
        idle.prevDisabled === true &&
        idle.nextDisabled === true,
      JSON.stringify(idle),
    );

    // Chosen from the generated data rather than hard-coded: the feature needs
    // a previous and a next to step to, must not be the chronological outlier
    // that sits far outside the starting extent, and must actually be on
    // screen to click.
    let startIndex = -1;
    let startPoint: { x: number; y: number } | null = null;
    for (let i = 1; i < featureIds.length - 1; i += 1) {
      const candidate = featureIds[i];
      if (
        candidate === undefined ||
        featureLookup[candidate]?.outlier
      )
        continue;
      const point = await locateFeature(page, candidate);
      if (point) {
        startIndex = i;
        startPoint = point;
        break;
      }
    }
    const startId =
      startIndex === -1 ? undefined : featureIds[startIndex];
    const nextId =
      startIndex === -1 ? undefined : featureIds[startIndex + 1];
    const start =
      startId === undefined ? undefined : featureLookup[startId];
    const next =
      nextId === undefined ? undefined : featureLookup[nextId];
    const emptyPoint = await locateEmptySpot(page);
    report(
      '/history found a steppable on-screen feature and an empty spot',
      Boolean(startPoint) &&
        Boolean(emptyPoint) &&
        start !== undefined &&
        next !== undefined,
      JSON.stringify({ startId, nextId, startPoint, emptyPoint }),
    );
    if (
      startId === undefined ||
      nextId === undefined ||
      start === undefined ||
      next === undefined ||
      !startPoint ||
      !emptyPoint
    )
      return;

    await page.mouse.move(startPoint.x, startPoint.y);
    const hoverApplied = await waitForHover(page, startId)
      .then(() => true)
      .catch(() => false);
    report(
      `/history hovering feature ${startId} highlights it`,
      hoverApplied,
      JSON.stringify(await snapshotMap(page)),
    );

    await page.mouse.move(emptyPoint.x, emptyPoint.y);
    const hoverCleared = await waitForHover(page, null)
      .then(() => true)
      .catch(() => false);
    report(
      '/history moving off the feature clears the highlight',
      hoverCleared,
      JSON.stringify(await snapshotMap(page)),
    );

    // Reported per step rather than thrown, so one failure names the step it
    // happened in and the steps after it still run.
    const selects = async (featureId: number, label: string) => {
      const reached = await waitForSelection(page, featureId)
        .then(() => true)
        .catch(() => false);
      await settleMap(page);
      // Asserted on the settled snapshot, not just on the instant the
      // predicate first held, so a selection that flickers away during the
      // fly-to still fails.
      const snapshot = await snapshotMap(page);
      const ok =
        reached &&
        snapshot.selected.length === 1 &&
        snapshot.selected[0] === featureId;
      report(label, ok, JSON.stringify(snapshot));
      return { ok, snapshot };
    };

    // A control that stays disabled because an earlier step failed would
    // otherwise block for the full actionability timeout and throw into the
    // shared handler, taking every later check with it.
    const clickControl = async (selector: string, label: string) => {
      const ok = await page
        .click(selector, { timeout: 5000 })
        .then(() => true)
        .catch(() => false);
      if (!ok) report(label, false, `${selector} was not clickable`);
      return ok;
    };

    let writesBefore = await readFeatureStateWrites(page);
    await page.mouse.click(startPoint.x, startPoint.y);
    const selected = await selects(
      startId,
      `/history clicking feature ${startId} selects it`,
    );
    const selectWrites =
      (await readFeatureStateWrites(page)).selected -
      writesBefore.selected;
    if (selected.ok) {
      report(
        `/history feature ${startId} popup renders its role and company`,
        selected.snapshot.popups === 1 &&
          selected.snapshot.popupText.includes(start.company) &&
          // Not discriminating on its own — two features share a role — but it
          // proves the whole popup body rendered, not just its heading.
          selected.snapshot.popupText.includes(start.role) &&
          selected.snapshot.prevDisabled === false &&
          selected.snapshot.nextDisabled === false,
        JSON.stringify(selected.snapshot),
      );
      report(
        '/history selecting writes the selected flag exactly once',
        selectWrites === 1,
        `${selectWrites} write(s)`,
      );
    }

    writesBefore = await readFeatureStateWrites(page);
    if (!(await clickControl(NEXT_CONTROL, '/history next control')))
      return;
    const advanced = await selects(
      nextId,
      `/history next control moves the selection to feature ${nextId}`,
    );
    const stepWrites =
      (await readFeatureStateWrites(page)).selected -
      writesBefore.selected;
    if (advanced.ok) {
      report(
        `/history feature ${nextId} popup replaces the previous one`,
        advanced.snapshot.popups === 1 &&
          advanced.snapshot.popupText.includes(next.company),
        JSON.stringify(advanced.snapshot),
      );
      report(
        '/history stepping writes the selected flag exactly twice',
        stepWrites === 2,
        `${stepWrites} write(s)`,
      );
    }

    if (!(await clickControl(PREV_CONTROL, '/history prev control')))
      return;
    const stepped = await selects(
      startId,
      `/history prev control moves the selection back to feature ${startId}`,
    );
    if (stepped.ok) {
      report(
        `/history feature ${startId} popup returns with it`,
        stepped.snapshot.popups === 1 &&
          stepped.snapshot.popupText.includes(start.company),
        JSON.stringify(stepped.snapshot),
      );
    }

    const blankPoint = await locateEmptySpot(page);
    report(
      '/history found an empty spot at the zoomed-in extent',
      Boolean(blankPoint),
    );
    if (!blankPoint) return;

    await page.mouse.click(blankPoint.x, blankPoint.y);
    const clearedOk = await waitForSelection(page, null)
      .then(() => true)
      .catch(() => false);
    await settleMap(page);
    const cleared = await snapshotMap(page);
    report(
      '/history clicking empty map clears the selection and closes the popup',
      clearedOk &&
        cleared.selected.length === 0 &&
        cleared.popups === 0 &&
        cleared.prevDisabled === true &&
        cleared.nextDisabled === true,
      JSON.stringify(cleared),
    );

    // The reset assertion below is "the camera came back", which only means
    // something if it left: without this, deleting the fly-to from
    // selectFeature would satisfy the reset predicate on its first poll and
    // the whole suite would pass with a camera that never moved.
    const moved =
      cleared.camera.zoom !== idle.camera.zoom ||
      cleared.camera.lng !== idle.camera.lng ||
      cleared.camera.lat !== idle.camera.lat;
    report(
      '/history selecting a feature moved the camera',
      moved,
      `${JSON.stringify(idle.camera)} -> ${JSON.stringify(cleared.camera)}`,
    );

    // fitBounds() is the one thunk the steps above never reach. The map was
    // constructed with the same bounds and the same padding this thunk passes,
    // so resetting must land the camera exactly where it started — which
    // catches a dropped pitch (fitBounds flattens to 0 without its pitch
    // argument), the wrong bounds, or padding other than BOUNDS_PADDING. It
    // does not cover the mobile padding branch: the reset runs with nothing
    // selected, so that ternary is false here whatever the viewport.
    if (
      !(await clickControl(RESET_CONTROL, '/history reset control'))
    )
      return;
    const restored = await page
      .waitForFunction(
        (start) => {
          const { map } = window;
          if (!map || map.isMoving()) return false;
          const { lng, lat } = map.getCenter();
          const camera = {
            zoom: map.getZoom(),
            pitch: map.getPitch(),
            lng,
            lat,
          };
          const close = (a: number, b: number) =>
            Math.abs(a - b) < 1e-6;
          return close(camera.zoom, start.zoom) &&
            close(camera.pitch, start.pitch) &&
            close(camera.lng, start.lng) &&
            close(camera.lat, start.lat)
            ? camera
            : false;
        },
        idle.camera,
        { timeout: 20000 },
      )
      .then((handle) => handle.jsonValue())
      .catch(() => false as const);
    report(
      '/history reset control restores the starting camera',
      restored !== false,
      `from ${JSON.stringify(cleared.camera)} to ${
        restored === false ? 'unrestored' : JSON.stringify(restored)
      }, expected ${JSON.stringify(idle.camera)}`,
    );
  });

  // Without WebGL the project page must fall back to the plain image, with
  // no dialog and no page error (three.js logs its own context error, which
  // is expected here).
  const noWebgl = await chromium.launch({
    headless: true,
    args: ['--disable-webgl', '--disable-webgl2'],
  });
  const fallbackPage = await noWebgl.newPage({
    viewport: { width: 1280, height: 800 },
  });
  const fallbackErrors: string[] = [];
  let dialogs = 0;
  fallbackPage.on('pageerror', (e) => fallbackErrors.push(String(e)));
  fallbackPage.on('dialog', (dialog) => {
    dialogs += 1;
    void dialog.dismiss();
  });
  await fallbackPage.goto(`${BASE}${projectRoute}`, {
    waitUntil: 'load',
    timeout: 60000,
  });
  await fallbackPage
    .waitForSelector('img[alt]', { timeout: 10000 })
    .catch(() => null);
  const fallback = await fallbackPage.evaluate(() => ({
    images: Array.from(document.querySelectorAll('img')).filter(
      (img) => img.alt.length > 0 && img.clientWidth > 0,
    ).length,
    canvases: document.querySelectorAll('canvas').length,
  }));
  report(
    `${projectRoute} without WebGL shows the plain image`,
    fallback.images > 0 && fallback.canvases === 0,
    JSON.stringify(fallback),
  );
  report(
    `${projectRoute} without WebGL no page errors or dialogs`,
    fallbackErrors.length === 0 && dialogs === 0,
    [...fallbackErrors, dialogs ? `${dialogs} dialog(s)` : '']
      .filter(Boolean)
      .join(' | '),
  );
  await noWebgl.close();

  await browser.close();
  server.kill();
  console.log(
    failures
      ? `\n${failures} check(s) failed (screenshots in ${OUT})`
      : '\nall checks passed',
  );
  process.exit(failures ? 1 : 0);
}

main().catch((err: unknown) => {
  console.error('smoke test crashed:', err);
  process.exit(2);
});
