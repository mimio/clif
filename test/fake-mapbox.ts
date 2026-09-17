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
 */
export type Recorded = {
  easeTo: Record<string, unknown>[];
  fog: Record<string, unknown>[];
  terrain: (Record<string, unknown> | null)[];
  colorTheme: string[];
  config: [string, string, unknown][];
  paint: [string, string, unknown][];
  bearing: number[];
};

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

  /** Live (type, layer, handler) bindings, as joined keys. */
  readonly bound: string[] = [];

  /** Which gesture handlers are currently enabled. */
  readonly enabled = new Map<string, boolean>();

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
  }

  isStyleLoaded(): boolean {
    return true;
  }

  once(_type: string, run: () => void): void {
    run();
  }

  easeTo(options: Record<string, unknown>): void {
    this.calls.easeTo.push(options);
  }

  setFog(options: Record<string, unknown>): void {
    this.calls.fog.push(options);
  }

  setTerrain(options: Record<string, unknown> | null): void {
    this.calls.terrain.push(options);
  }

  setColorTheme(theme: { data: string }): void {
    this.calls.colorTheme.push(theme.data);
  }

  setConfigProperty(
    fragment: string,
    key: string,
    value: unknown,
  ): void {
    this.calls.config.push([fragment, key, value]);
  }

  setPaintProperty(
    layer: string,
    property: string,
    value: unknown,
  ): void {
    this.calls.paint.push([layer, property, value]);
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

  addSource(id: string, spec: unknown): void {
    this.sources.set(id, spec);
  }

  addLayer(entry: { id: string }): void {
    this.layers.set(entry.id, entry);
  }

  removeSource(id: string): void {
    this.sources.delete(id);
  }

  removeLayer(id: string): void {
    this.layers.delete(id);
  }

  on(...args: unknown[]): void {
    this.bound.push(args.map(String).join('|'));
  }

  off(...args: unknown[]): void {
    const at = this.bound.indexOf(args.map(String).join('|'));
    if (at >= 0) this.bound.splice(at, 1);
  }
}

/** Installs the stub and hands back a teardown. */
export const installMapboxStub = (): (() => void) => {
  FakeMap.reset();
  window.__MAPBOX_STUB__ = {
    Map: FakeMap,
  } as unknown as MapboxModule;
  return () => {
    delete window.__MAPBOX_STUB__;
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
