import type { BrowserContext, Page } from '@playwright/test';

/*
 * The hermetic Mapbox seam.
 *
 * Two halves, and they do different jobs:
 *
 *   installMapboxGl()   replaces the library. scene/mapbox/loader.ts reads
 *                       window.__MAPBOX_STUB__ BEFORE it looks at the
 *                       token, so an addInitScript that sets it means
 *                       mapbox-gl is never imported, never asks for a
 *                       style, and never needs a GL context. Everything
 *                       the scene does to the map is recorded instead of
 *                       drawn.
 *
 *   stubMapboxNetwork() answers api.mapbox.com anyway. With the stub
 *                       installed nothing should reach it -- so this is a
 *                       net, not a dependency: if a later lane adds a
 *                       direct fetch to Mapbox, the suite answers it
 *                       locally rather than turning a blocked egress into
 *                       a console error nobody can reproduce.
 *
 * WHY A RECORDING STUB RATHER THAN THE REAL LIBRARY OVER A FAKE STYLE
 * The token this suite builds with cannot fetch a tile, so a real map
 * draws nothing and any assertion about drawn content would be a lie.
 * What tier 1 can settle is the app's own behaviour: that one map is
 * constructed and only one, that its canvas outlives a route change, that
 * a theme reaches setColorTheme with a LUT Mapbox will accept, that
 * nothing is called before the style is ready. All of that is a recorded
 * fact here. What the real basemap looks like is tier 2's job, and only
 * tier 2's.
 *
 * THE STUB IS NOT MORE FORGIVING THAN THE LIBRARY. Every method mapbox-gl
 * guards with Style._checkLoaded() throws the same message here until
 * style.load, for the reason test/fake-mapbox.ts already records: a stub
 * that answers cheerfully where the real thing throws is not a test
 * double, it is a way of not finding out.
 */

/** How the stubbed stylesheet resolves. */
export type StubStyle = 'auto' | 'fail';

export type StubOptions = {
  /**
   * 'auto' loads the style on a macrotask, which is the shape of the real
   * thing -- construct, then a round trip. 'fail' is the stylesheet a
   * token that cannot fetch it produces: an error event and no style.load,
   * which is what drives SceneRoot to its fallback plate.
   */
  style?: StubStyle;
};

/** Everything the in-page stub records, read back with readStub(). */
export type StubRecord = {
  /** How many maps were constructed. The whole rewrite rests on "one". */
  constructed: number;
  /** Every LUT handed to setColorTheme, newest last. */
  colorTheme: string[];
  /** Every setConfigProperty, as [key, value] on the basemap import. */
  config: [string, unknown][];
  /** Counts only: that they happened is the assertion, not their values. */
  fog: number;
  bearings: number;
  terrain: (number | null)[];
  easeTo: { zoom: number; duration: number }[];
  /** Layer and source ids currently mounted. */
  layers: string[];
  sources: string[];
  /** Gesture handlers currently disabled, which is 1d's held map. */
  disabled: string[];
  /** True once style.load fired. */
  styleLoaded: boolean;
};

declare global {
  interface Window {
    /** The stub's recording, present only when the stub is installed. */
    __ONEGLOBE_STUB__?: StubRecord & { map?: unknown };
  }
}

/*
 * Runs in the page before any of the app does. It must be entirely
 * self-contained: Playwright serialises this function's source, so
 * anything it closed over here would be undefined there.
 */
const stubScript = (options: StubOptions): void => {
  const STYLE_NOT_LOADED = 'Style is not done loading';

  // scene/mapbox/instance.ts's HANDLERS: every gesture, not just drag.
  const HANDLERS = [
    'dragPan',
    'dragRotate',
    'scrollZoom',
    'boxZoom',
    'keyboard',
    'doubleClickZoom',
    'touchZoomRotate',
    'touchPitch',
  ];

  const record: NonNullable<Window['__ONEGLOBE_STUB__']> = {
    constructed: 0,
    colorTheme: [],
    config: [],
    fog: 0,
    bearings: 0,
    terrain: [],
    easeTo: [],
    layers: [],
    sources: [],
    disabled: [],
    styleLoaded: false,
  };
  window.__ONEGLOBE_STUB__ = record;

  /*
   * A factory called with `new`. Returning an object from a constructor
   * makes that object the result, which keeps the whole stub out of class
   * syntax and therefore out of anything a transpiler might rewrite into a
   * helper this serialised function cannot see.
   */
  function StubMap(
    this: unknown,
    mapOptions: Record<string, unknown>,
  ): Record<string, unknown> {
    record.constructed += 1;

    /*
     * The canvas is real, and it is in the container, because mapbox-gl's
     * is. "The map survived the route change" has to be answerable by
     * comparing element identity, and it cannot be if the stub puts
     * nothing in the DOM at all.
     */
    const container = mapOptions.container as HTMLElement;
    container.classList.add('mapboxgl-map');
    const canvasContainer = document.createElement('div');
    canvasContainer.className = 'mapboxgl-canvas-container';
    const canvas = document.createElement('canvas');
    canvas.className = 'mapboxgl-canvas';
    canvas.width = Math.max(1, container.clientWidth);
    canvas.height = Math.max(1, container.clientHeight);
    canvasContainer.appendChild(canvas);
    container.appendChild(canvasContainer);

    const listeners = new Map<
      string,
      ((payload?: unknown) => void)[]
    >();
    const sources = new Map<string, unknown>();
    const layers = new Map<string, unknown>();
    const disabled = new Set<string>();
    let bearing = 0;

    const sync = (): void => {
      record.layers = [...layers.keys()];
      record.sources = [...sources.keys()];
      record.disabled = [...disabled];
    };

    const fire = (type: string, payload?: unknown): void => {
      const current = listeners.get(type);
      if (!current) return;
      for (const listener of [...current]) listener(payload);
    };

    const guard = (): void => {
      if (!record.styleLoaded) throw new Error(STYLE_NOT_LOADED);
    };

    const map: Record<string, unknown> = {
      getCanvas: () => canvas,
      getContainer: () => container,
      isStyleLoaded: () => record.styleLoaded,

      on: (...args: unknown[]): void => {
        const type = args[0] as string;
        const handler = args[args.length - 1] as (
          payload?: unknown,
        ) => void;
        listeners.set(type, [
          ...(listeners.get(type) ?? []),
          handler,
        ]);
      },
      once: (
        type: string,
        handler: (payload?: unknown) => void,
      ): void => {
        const wrapped = (payload?: unknown): void => {
          const current = listeners.get(type) ?? [];
          const at = current.indexOf(wrapped);
          if (at >= 0) current.splice(at, 1);
          handler(payload);
        };
        listeners.set(type, [
          ...(listeners.get(type) ?? []),
          wrapped,
        ]);
      },
      off: (...args: unknown[]): void => {
        const type = args[0] as string;
        const handler = args[args.length - 1];
        const current = listeners.get(type) ?? [];
        const at = current.indexOf(
          handler as (payload?: unknown) => void,
        );
        if (at >= 0) current.splice(at, 1);
      },

      // No style precondition: the camera only touches the transform.
      easeTo: (spec: Record<string, unknown>): void => {
        record.easeTo.push({
          zoom: spec.zoom as number,
          duration: spec.duration as number,
        });
      },
      getBearing: (): number => bearing,
      setBearing: (next: number): void => {
        bearing = next;
        record.bearings += 1;
      },

      getSource: (id: string): unknown => sources.get(id),
      getLayer: (id: string): unknown => layers.get(id),

      addSource: (id: string, spec: unknown): void => {
        guard();
        sources.set(id, spec);
        sync();
      },
      addLayer: (entry: { id: string }): void => {
        guard();
        layers.set(entry.id, entry);
        sync();
      },
      removeSource: (id: string): void => {
        guard();
        sources.delete(id);
        sync();
      },
      removeLayer: (id: string): void => {
        guard();
        layers.delete(id);
        sync();
      },
      setPaintProperty: (): void => {
        guard();
      },
      setFog: (): void => {
        guard();
        record.fog += 1;
      },
      setTerrain: (spec: { exaggeration?: number } | null): void => {
        guard();
        record.terrain.push(
          spec === null ? null : (spec.exaggeration ?? 0),
        );
      },
      setColorTheme: (theme: { data: string }): void => {
        guard();
        record.colorTheme.push(theme.data);
      },
      setConfigProperty: (
        _fragment: string,
        key: string,
        value: unknown,
      ): void => {
        guard();
        record.config.push([key, value]);
      },
    };

    for (const name of HANDLERS) {
      map[name] = {
        enable: (): void => {
          disabled.delete(name);
          sync();
        },
        disable: (): void => {
          disabled.add(name);
          sync();
        },
      };
    }

    record.map = map;
    sync();

    /*
     * A macrotask, not a microtask: the promise chain in ensureMap resolves
     * on microtasks, so a microtask here would let the style beat the
     * caller that is still waiting to find out whether a map exists at all
     * -- which the real library, being a network round trip, never does.
     */
    window.setTimeout(() => {
      if (options.style === 'fail') {
        fire('error', { error: new Error('Unauthorized') });
        return;
      }
      record.styleLoaded = true;
      fire('style.load');
    }, 0);

    return map;
  }

  window.__MAPBOX_STUB__ = {
    Map: StubMap,
  } as unknown as Window['__MAPBOX_STUB__'];
};

/** Installs the stub for every document this page loads. */
export const installMapboxGl = async (
  page: Page,
  options: StubOptions = {},
): Promise<void> => {
  await page.addInitScript(stubScript, {
    style: options.style ?? 'auto',
  });
};

/**
 * Reads the stub's recording back out of the page.
 *
 * The LUTs come back as fingerprints rather than whole payloads: each one
 * is about 175KB of base64 and nine of them is a couple of megabytes over
 * the debug protocol for a test that only ever asks whether two of them
 * differ. Whether a LUT is one Mapbox will take is answered by
 * measureRecordedLuts below, which never leaves the page.
 *
 * The fingerprint hashes the WHOLE payload, and it has to. Every theme's
 * LUT is the same 1024x32 PNG written by the same stored-block encoder, so
 * two themes agree exactly on length and on their first hundred-odd
 * characters -- signature, IHDR, the start of the first scanline. A
 * prefix fingerprint says every theme produced the same LUT, which is both
 * wrong and the kind of wrong that makes a test pass.
 */
export const readStub = (page: Page): Promise<StubRecord> =>
  page.evaluate(() => {
    const record = window.__ONEGLOBE_STUB__;
    if (!record) throw new Error('the mapbox stub is not installed');
    // FNV-1a over the whole payload, which is cheap enough to run on a
    // few hundred kilobytes and is not fooled by a shared PNG header.
    const fingerprint = (lut: string): string => {
      let hash = 0x811c9dc5;
      for (let i = 0; i < lut.length; i += 1) {
        hash = Math.imul(hash ^ lut.charCodeAt(i), 0x01000193);
      }
      return `${lut.length}:${(hash >>> 0).toString(36)}`;
    };
    // Spelled out rather than spread, because `map` holds DOM nodes and
    // functions and neither of those survives the trip out of the page.
    return {
      constructed: record.constructed,
      colorTheme: record.colorTheme.map(fingerprint),
      config: record.config,
      fog: record.fog,
      bearings: record.bearings,
      terrain: record.terrain,
      easeTo: record.easeTo,
      layers: record.layers,
      sources: record.sources,
      disabled: record.disabled,
      styleLoaded: record.styleLoaded,
    };
  });

export type LutMeasurement = {
  bytes: number;
  /** buildLut emits bare base64; mapbox-gl is what adds the data: prefix. */
  prefixed: boolean;
  width: number;
  height: number;
};

/**
 * Decodes every distinct LUT the scene has sent, in the page, and reports
 * its dimensions -- which is the whole of the check mapbox-gl makes before
 * it will use one: height <= 32 and width === height * height. A LUT that
 * fails it is dropped silently and the basemap keeps Standard's colours.
 */
export const measureRecordedLuts = (
  page: Page,
): Promise<LutMeasurement[]> =>
  page.evaluate(() => {
    const luts = [
      ...new Set(window.__ONEGLOBE_STUB__?.colorTheme ?? []),
    ];
    return Promise.all(
      luts.map(
        (data) =>
          new Promise<LutMeasurement>((resolve) => {
            const prefixed = data.startsWith('data:');
            const done = (
              width: number,
              height: number,
            ): LutMeasurement => ({
              bytes: data.length,
              prefixed,
              width,
              height,
            });
            const image = new Image();
            image.onload = () =>
              resolve(done(image.naturalWidth, image.naturalHeight));
            image.onerror = () => resolve(done(0, 0));
            image.src = prefixed
              ? data
              : `data:image/png;base64,${data}`;
          }),
      ),
    );
  });

// A minimal style document, kept from the old smoke test. Nothing should
// ask for it while the stub is installed; if something does, this is a
// valid v8 style rather than a 403 from a blocked egress proxy.
const LOCAL_STYLE = {
  version: 8,
  name: 'e2e-style',
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

/*
 * Answers every Mapbox request from inside the browser context. Salvaged
 * from the old scripts/smoke.mts, which proved the three routes are the
 * complete set: telemetry, styles and glyph ranges. Later routes win in
 * Playwright, so the catch-all is registered first.
 */
export const stubMapboxNetwork = async (
  context: BrowserContext,
): Promise<void> => {
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
        body: JSON.stringify(LOCAL_STYLE),
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
};
