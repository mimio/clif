import { vi } from 'vitest';
import type { MapboxModule } from 'scene/mapbox/loader';

/*
 * A mapbox-gl stand-in for the unit tests, injected through the same
 * window.__MAPBOX_STUB__ seam Playwright uses.
 *
 * There is no Mapbox token in this environment and jsdom has no WebGL, so
 * without this the scene could only ever be tested down to "it did not
 * crash". With it, every imperative call the scene makes is a recorded
 * fact: which camera it eased to and over how long, which config
 * properties it sent, whether setColorTheme was reached, what is on the
 * map and what handlers are bound.
 *
 * It records; it does not simulate. Nothing here pretends to render.
 *
 *
 * IT DOES, HOWEVER, MODEL THE STYLE LIFECYCLE
 *
 * The first version of this file did not, and that cost the branch an
 * outage: every route threw "Style is not done loading" as soon as a
 * token was present, and the unit suite stayed green throughout, because
 * the fake answered setColorTheme cheerfully at a point where the real
 * library throws.
 *
 * So the rule here is the one that already governs off(): a stub more
 * forgiving than the thing it stands for is not a test double, it is a
 * way of not finding out. `new mapboxgl.Map()` returns before the style
 * exists, and everything behind Style._checkLoaded() throws until
 * style.load -- so it throws here too, with the same message, from the
 * same methods. A test that wants a usable map has to let the style load,
 * exactly as the app does.
 *
 * The style loads on a microtask by default, which is the shape of the
 * real thing -- construct, then a round trip -- without the wait. Pass
 * { style: 'manual' } to drive it by hand and write the races, or
 * { style: 'fail' } for the stylesheet a bad token cannot fetch.
 */

/** The methods mapbox-gl guards with Style._checkLoaded(). */
export const STYLE_GUARDED = [
  'setColorTheme',
  'setConfigProperty',
  'setPaintProperty',
  'setFog',
  'setTerrain',
  'addSource',
  'addLayer',
  'removeSource',
  'removeLayer',
] as const;

export const STYLE_NOT_LOADED = 'Style is not done loading';

/** Events the scene's own lifecycle owns, rather than a layer set. */
const LIFECYCLE_EVENTS = ['style.load', 'error', 'sourcedata'];

export type Recorded = {
  easeTo: Record<string, unknown>[];
  fog: Record<string, unknown>[];
  terrain: (Record<string, unknown> | null)[];
  colorTheme: string[];
  config: [string, string, unknown][];
  paint: [string, string, unknown][];
  bearing: number[];
};

type Listener = (payload?: unknown) => void;

export type FakeMapOptions = {
  /**
   * How the stylesheet request resolves.
   *
   *   'auto'   loads on a microtask -- the shape of the real thing
   *            (construct, then a round trip) without the wait.
   *   'manual' never resolves on its own; the test calls loadStyle() or
   *            failStyle() and writes the race itself.
   *   'fail'   401s on a microtask, which is what a token that cannot
   *            fetch the style does.
   */
  style?: 'auto' | 'manual' | 'fail';
};

let installed: FakeMapOptions = {};

export class FakeMap {
  static instances: FakeMap[] = [];

  static reset(): void {
    FakeMap.instances = [];
  }

  static get last(): FakeMap {
    const map = FakeMap.instances[FakeMap.instances.length - 1];
    if (!map) throw new Error('no map was constructed');
    return map;
  }

  readonly options: Record<string, unknown>;

  readonly calls: Recorded = {
    easeTo: [],
    fog: [],
    terrain: [],
    colorTheme: [],
    config: [],
    paint: [],
    bearing: [],
  };

  readonly sources = new Map<string, unknown>();

  readonly layers = new Map<string, unknown>();

  /** Every live binding, as a joined (type, layer?, handler) key. */
  readonly bound: string[] = [];

  /** Which gesture handlers are currently enabled. */
  readonly enabled = new Map<string, boolean>();

  /** False until style.load, exactly as Style._loaded is. */
  styleLoaded = false;

  /**
   * Which sources have resolved their TileJSON.
   *
   * A source is NOT loaded the moment it is added -- that is a network
   * round trip -- and pretending otherwise is how the terrain race hid.
   * Call loadSource(id) to resolve one.
   */
  readonly loadedSources = new Set<string>();

  private listeners = new Map<string, Listener[]>();

  private bearing = 0;

  constructor(options: Record<string, unknown>) {
    this.options = options;
    FakeMap.instances.push(this);
    for (const name of [
      'dragPan',
      'dragRotate',
      'scrollZoom',
      'boxZoom',
      'keyboard',
      'doubleClickZoom',
      'touchZoomRotate',
      'touchPitch',
    ]) {
      this.enabled.set(name, true);
      Object.defineProperty(this, name, {
        value: {
          enable: () => this.enabled.set(name, true),
          disable: () => this.enabled.set(name, false),
        },
      });
    }
    const outcome = installed.style ?? 'auto';
    if (outcome !== 'manual') {
      queueMicrotask(() => {
        if (this.styleLoaded) return;
        if (outcome === 'fail') this.failStyle();
        else this.loadStyle();
      });
    }
  }

  /** The bindings a layer set made, without the scene's own lifecycle. */
  get handlers(): string[] {
    return this.bound.filter(
      (entry) =>
        !LIFECYCLE_EVENTS.some((type) =>
          entry.startsWith(`${type}|`),
        ),
    );
  }

  private requireStyle(): void {
    if (!this.styleLoaded) throw new Error(STYLE_NOT_LOADED);
  }

  /* ---- the lifecycle, driven by the test --------------------------- */

  loadStyle(): void {
    this.styleLoaded = true;
    this.fire('style.load');
  }

  /** A stylesheet that never arrives: a 401 on the style request. */
  failStyle(message = 'Unauthorized'): void {
    this.fire('error', { error: new Error(message) });
  }

  /** A tile, sprite or glyph failing AFTER the style loaded. */
  tileError(message = 'Unauthorized'): void {
    this.fire('error', { error: new Error(message) });
  }

  fire(type: string, payload?: unknown): void {
    for (const listener of [...(this.listeners.get(type) ?? [])]) {
      listener(payload);
    }
  }

  isStyleLoaded(): boolean {
    return this.styleLoaded;
  }

  isSourceLoaded(id: string): boolean {
    return this.loadedSources.has(id);
  }

  /** Resolves a source's TileJSON, as the network eventually would. */
  loadSource(id: string): void {
    this.loadedSources.add(id);
    this.fire('sourcedata', { sourceId: id, isSourceLoaded: true });
  }

  /* ---- events ------------------------------------------------------ */

  on(...args: unknown[]): void {
    const handler = args[args.length - 1] as Listener;
    const type = args[0] as string;
    this.listeners.set(type, [
      ...(this.listeners.get(type) ?? []),
      handler,
    ]);
    this.bound.push(args.map(String).join('|'));
  }

  once(type: string, handler: Listener): void {
    const wrapped: Listener = (payload) => {
      this.off(type, wrapped);
      handler(payload);
    };
    this.on(type, wrapped);
  }

  off(...args: unknown[]): void {
    const handler = args[args.length - 1] as Listener;
    const type = args[0] as string;
    const current = this.listeners.get(type) ?? [];
    const found = current.indexOf(handler);
    if (found >= 0) {
      this.listeners.set(type, [
        ...current.slice(0, found),
        ...current.slice(found + 1),
      ]);
    }
    const at = this.bound.indexOf(args.map(String).join('|'));
    if (at >= 0) this.bound.splice(at, 1);
  }

  /* ---- everything behind Style._checkLoaded() ---------------------- */

  setFog(options: Record<string, unknown>): void {
    this.requireStyle();
    this.calls.fog.push(options);
  }

  setTerrain(options: Record<string, unknown> | null): void {
    this.requireStyle();
    this.calls.terrain.push(options);
  }

  setColorTheme(theme: { data: string }): void {
    this.requireStyle();
    this.calls.colorTheme.push(theme.data);
  }

  setConfigProperty(
    fragment: string,
    key: string,
    value: unknown,
  ): void {
    this.requireStyle();
    this.calls.config.push([fragment, key, value]);
  }

  setPaintProperty(
    layer: string,
    property: string,
    value: unknown,
  ): void {
    this.requireStyle();
    this.calls.paint.push([layer, property, value]);
  }

  addSource(id: string, spec: unknown): void {
    this.requireStyle();
    this.sources.set(id, spec);
  }

  addLayer(entry: { id: string }): void {
    this.requireStyle();
    this.layers.set(entry.id, entry);
  }

  removeSource(id: string): void {
    this.requireStyle();
    this.sources.delete(id);
  }

  removeLayer(id: string): void {
    this.requireStyle();
    this.layers.delete(id);
  }

  /* ---- and everything that is not ---------------------------------- */

  easeTo(options: Record<string, unknown>): void {
    this.calls.easeTo.push(options);
  }

  getBearing(): number {
    return this.bearing;
  }

  setBearing(value: number): void {
    this.bearing = value;
    this.calls.bearing.push(value);
  }

  getSource(id: string): unknown {
    return this.sources.get(id);
  }

  getLayer(id: string): unknown {
    return this.layers.get(id);
  }
}

/** Installs the stub and hands back a teardown. */
export const installMapboxStub = (
  options: FakeMapOptions = {},
): (() => void) => {
  installed = options;
  FakeMap.reset();
  window.__MAPBOX_STUB__ = {
    Map: FakeMap,
  } as unknown as MapboxModule;
  return () => {
    delete window.__MAPBOX_STUB__;
    installed = {};
    FakeMap.reset();
  };
};

/** The theme-aware getComputedStyle the token reads need in jsdom. */
export const stubThemedStyles = (
  blocks: Map<string, Record<string, string>>,
): void => {
  const real = window.getComputedStyle.bind(window);
  vi.stubGlobal(
    'getComputedStyle',
    (element: Element, pseudo?: string | null) => {
      if (element !== document.documentElement) {
        return real(element as HTMLElement, pseudo);
      }
      const id = document.documentElement.dataset.theme ?? 'yellow';
      const block = blocks.get(id) ?? {};
      return {
        getPropertyValue: (name: string) => block[name] ?? '',
      };
    },
  );
};
