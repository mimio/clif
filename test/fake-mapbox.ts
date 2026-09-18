import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
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
 * same methods, and test/scene.test.tsx checks that list against the
 * installed library rather than against itself. A test that wants a
 * usable map has to let the style load, exactly as the app does.
 *
 * Two methods are refused here that mapbox does not refuse --
 * setConfigProperty and setImportColorTheme, which silently do nothing
 * instead. See STYLE_DEFERRED for why the fake is the stricter of the
 * two.
 *
 * The style loads on a microtask by default, which is the shape of the
 * real thing -- construct, then a round trip -- without the wait. Pass
 * { style: 'manual' } to drive it by hand and write the races, or
 * { style: 'fail' } for the stylesheet a bad token cannot fetch.
 */

/**
 * The methods mapbox-gl really guards with `Style._checkLoaded()`.
 *
 * This list is not written from memory and is not checked against itself:
 * `styleMethodsGuardedInMapboxGl()` below reads the installed library and
 * test/scene.test.tsx asserts that every name here is one the library
 * actually guards. A list a test compares to the same list is a fact
 * about the test.
 *
 * NOTE `setConfigProperty` and `setImportColorTheme` are deliberately
 * NOT here, though the fake refuses both -- see STYLE_DEFERRED.
 */
export const STYLE_GUARDED = [
  'setColorTheme',
  'setPaintProperty',
  'setFog',
  'setTerrain',
  'addSource',
  'addLayer',
  'removeSource',
  'removeLayer',
] as const;

/**
 * What the FAKE refuses before style.load, which is one entry longer.
 *
 * `Style.setConfigProperty` carries no `_checkLoaded()` in mapbox-gl v3:
 * it opens `const fragmentStyle = this.getFragmentStyle(fragmentId); if
 * (!fragmentStyle) return;`, and `getFragmentStyle` has no check either,
 * so before style.load the real call is a SILENT NO-OP rather than a
 * throw. Silently doing nothing is the worse of the two failures -- the
 * config would simply never arrive -- so the fake is stricter than the
 * library here on purpose. Being stricter than the thing you stand for
 * only costs a deferral, and scene/mapbox/instance.ts defers the config
 * with everything else anyway; being more forgiving is what hid the
 * outage this whole file was rewritten for.
 *
 * The real hazard of setConfigProperty is not the lifecycle. It is that
 * an unknown fragment id or a key Standard's schema does not declare is
 * discarded without a word -- which is what `configDiscarded` models.
 *
 * `setImportColorTheme` is the same shape and the same hazard, and it is
 * the one that shipped: `Style.setImportColorTheme(importId, theme)`
 * opens `const fragmentStyle = this.getFragmentStyle(importId); if
 * (!fragmentStyle) return;` and nothing else. A theme addressed to an
 * import that is not there is dropped in silence, which is what
 * `colorThemeDiscarded` models -- and the root-style `setColorTheme`,
 * which succeeds and re-tints the wrong scope, is recorded separately as
 * `rootColorTheme` so that calling it is a visible fact rather than an
 * indistinguishable one.
 */
export const STYLE_DEFERRED = [
  ...STYLE_GUARDED,
  'setConfigProperty',
  'setImportColorTheme',
] as const;

export const STYLE_NOT_LOADED = 'Style is not done loading';

/**
 * Reads the installed mapbox-gl and returns the names of every `Style`
 * method whose body calls `this._checkLoaded()`.
 *
 * The dev bundle is unminified and one method per `  name(...) {` at two
 * spaces of indent, so the class body can be walked directly. If a future
 * mapbox-gl ships in a shape this cannot parse, the empty set it returns
 * fails the test that uses it rather than passing quietly.
 */
export const styleMethodsGuardedInMapboxGl = (): Set<string> => {
  const require_ = createRequire(import.meta.url);
  const source = readFileSync(
    require_.resolve('mapbox-gl/dist/mapbox-gl-dev.js'),
    'utf8',
  ).split('\n');

  const opens = source.findIndex((line) =>
    line.startsWith('class Style extends'),
  );
  if (opens < 0) throw new Error('mapbox-gl: no Style class found');
  let closes = opens + 1;
  while (closes < source.length && !source[closes].startsWith('}')) {
    closes += 1;
  }

  const body = source.slice(opens + 1, closes);
  const guarded = new Set<string>();
  for (let at = 0; at < body.length; at += 1) {
    const named = /^ {2}([A-Za-z_$][\w$]*)\(/.exec(body[at]);
    if (!named) continue;
    let end = at + 1;
    while (end < body.length && !/^ {2}\}/.test(body[end])) end += 1;
    const method = body.slice(at + 1, end).join('\n');
    if (method.includes('this._checkLoaded()')) guarded.add(named[1]);
  }
  return guarded;
};

/**
 * The `basemap` import is the only fragment the Standard style declares,
 * and `setConfigProperty` resolves its fragment by id before anything
 * else. Any other id gets `undefined` back and the call returns.
 */
export const CONFIG_FRAGMENT = 'basemap';

/**
 * The Standard config keys this scene is allowed to send.
 *
 * `Style.setConfigProperty` reads `fragmentStyle.stylesheet.schema` and
 * returns -- silently, with no error event -- when the key is not in it.
 * The schema lives in the style JSON on Mapbox's servers, so there is
 * nothing in the package to derive this from, and it is here so that a
 * typo in scene/theme.ts is a test failure rather than a knob that stops
 * working in production with nothing said.
 *
 * THIS IS NOW A RECORDING RATHER THAN A RECOLLECTION. It used to be
 * written from the documented configuration surface, which is how it
 * came to carry `showRoadsAndTransit` -- a key Standard does not have --
 * and to be missing eight of the colour keys the cartography needs. It
 * is `Object.keys(map.getSchema('basemap')).sort()` read off the real
 * style by e2e/review/cartography.spec.ts, which is the one tier that
 * loads Standard with a real token. 46 keys, verbatim.
 *
 * Re-record it from a CARTO `schema` annotation when Mapbox ships a new
 * Standard, rather than adding a key by hand: a guessed key here is a
 * guard that passes while production silently drops the call.
 */
export const STANDARD_CONFIG_SCHEMA = new Set([
  'backgroundPointOfInterestLabels',
  'colorAdminBoundaries',
  'colorBuildingHighlight',
  'colorBuildingSelect',
  'colorBuildings',
  'colorCommercial',
  'colorEducation',
  'colorGreenspace',
  'colorHdRoads',
  'colorIndoorLabelHighlight',
  'colorIndoorLabelSelect',
  'colorIndustrial',
  'colorLand',
  'colorMedical',
  'colorModePointOfInterestLabels',
  'colorMotorways',
  'colorPlaceLabelHighlight',
  'colorPlaceLabelSelect',
  'colorPlaceLabels',
  'colorPointOfInterestLabels',
  'colorRoadLabels',
  'colorRoads',
  'colorTrunks',
  'colorWater',
  'densityPointOfInterestLabels',
  'font',
  'fuelingStationModePointOfInterestLabels',
  'lightPreset',
  'roadsBrightness',
  'show3dBuildings',
  'show3dFacades',
  'show3dLandmarks',
  'show3dObjects',
  'show3dTrees',
  'showAdminBoundaries',
  'showHdRoads',
  'showIndoor',
  'showIndoorLabels',
  'showLandmarkIconLabels',
  'showLandmarkIcons',
  'showPedestrianRoads',
  'showPlaceLabels',
  'showPointOfInterestLabels',
  'showRoadLabels',
  'showTransitLabels',
  'theme',
  'theme-data',
]);

/**
 * What the Standard import answers for the keys the scene reads back.
 *
 * Only the two non-boolean knobs need a value of their own; every other
 * key in the schema is a toggle, and `true` is as good an answer as
 * `false` for a caller that only asks whether the key exists. What
 * matters is that an unknown key answers null, because that is the
 * signal scene/mapbox/instance.ts uses to decide the style cannot be
 * themed.
 */
const CONFIG_DEFAULTS: Record<string, unknown> = {
  lightPreset: 'day',
  theme: 'default',
  font: 'DIN Pro',
};

/** Events the scene's own lifecycle owns, rather than a layer set. */
const LIFECYCLE_EVENTS = [
  'style.load',
  'error',
  'sourcedata',
  'render',
];

export type Recorded = {
  easeTo: Record<string, unknown>[];
  fog: Record<string, unknown>[];
  terrain: (Record<string, unknown> | null)[];
  /**
   * Every LUT handed to `setImportColorTheme` for the `basemap`
   * fragment -- which is the only call that reaches the globe. Parallel
   * to `colorThemeImports`, which carries the id each one went to.
   */
  colorTheme: string[];
  /** The import id each entry in `colorTheme` was addressed to. */
  colorThemeImports: string[];
  /**
   * LUTs sent to an import that does not exist, which mapbox drops
   * without a word. Empty is the healthy state.
   */
  colorThemeDiscarded: [string, string][];
  /**
   * LUTs sent to the ROOT style's colour theme.
   *
   * This must stay empty. `map.setColorTheme()` succeeds, decodes and
   * applies -- to the root style's own layers, which on Standard is only
   * what the scene added itself. The basemap lives in the `basemap`
   * import and takes its LUT from that scope, so the root call themes
   * everything except the globe and says nothing about it.
   */
  rootColorTheme: string[];
  config: [string, string, unknown][];
  /**
   * setConfigProperty calls the real library would have thrown away: an
   * unknown fragment id, or a key Standard's schema does not declare.
   * Empty is the healthy state, and it is the ONLY place such a call
   * shows up -- mapbox says nothing about one, and neither does this.
   */
  configDiscarded: [string, string, unknown][];
  paint: [string, string, unknown][];
  bearing: number[];
  /**
   * Every centre written by `setCenter` -- which is how the globe turns
   * on its axis, and the one camera write the scene makes outside a
   * flight. Like `bearing`, it is `jumpTo` underneath, so each entry here
   * is also a flight that would have been cancelled.
   */
  center: [number, number][];
  /**
   * `off` calls that matched no live binding.
   *
   * Real mapbox-gl ignores one, so this fake does too -- but it counts
   * them, because a double-off is the registry losing track of what it
   * bound, and a stub that both forgives and forgets cannot tell anyone.
   */
  strayOff: string[];
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
  /**
   * Whether the style has the `basemap` import.
   *
   * True is Mapbox Standard, and the default. False is every other
   * style: `getConfigProperty` answers null, `setConfigProperty` and
   * `setImportColorTheme` both drop what they are given, and the scene
   * is expected to say so rather than carry on looking healthy.
   */
  basemap?: boolean;
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
    colorThemeImports: [],
    colorThemeDiscarded: [],
    rootColorTheme: [],
    config: [],
    configDiscarded: [],
    paint: [],
    bearing: [],
    center: [],
    strayOff: [],
  };

  readonly sources = new Map<string, unknown>();

  readonly layers = new Map<string, unknown>();

  /** Every live binding, as a joined (type, layer?, handler) key. */
  readonly bound: string[] = [];

  /** Which gesture handlers are currently enabled. */
  readonly enabled = new Map<string, boolean>();

  /** False until style.load, exactly as Style._loaded is. */
  styleLoaded = false;

  /** Whether this style carries the `basemap` import. */
  readonly hasBasemap: boolean;

  /** The source terrain is draped on, or null when terrain is off. */
  terrainSource: string | null = null;

  /**
   * True from a setTerrain() until mapbox would next recalculate.
   *
   * This is the window in which style.terrain.properties does not exist
   * yet, and it is the whole hazard: a removeSource inside it re-runs
   * the terrain evaluation and throws. Cleared on a microtask, which is
   * the closest thing here to "the next frame".
   */
  terrainDirty = false;

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

  /** The transform's centre, as easeTo leaves it. */
  private center: [number, number] = [0, 0];

  /*
   * WHETHER A CAMERA FLIGHT OWNS THE TRANSFORM, which is the one thing
   * about easeTo the scene's animation loop has to respect.
   *
   * The fake lands the transform in one step -- interpolating it would
   * buy nothing a unit test can read -- but the flight WINDOW is not a
   * detail: in real mapbox-gl, `setBearing` is `jumpTo({bearing})` and
   * jumpTo opens with `_stop()`, so anything that writes a bearing
   * during a flight cancels it wherever it had got to. That is not
   * observable on a fake whose easeTo has already finished, so the
   * window is modelled explicitly: easeTo opens it, endEase() closes it,
   * and setBearing stops it exactly as jumpTo would.
   */
  easing = false;

  constructor(options: Record<string, unknown>) {
    this.options = options;
    this.hasBasemap = installed.basemap ?? true;
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

  /*
   * The orderings this stub used to make unreachable, and which the
   * whole design rested on not existing. Both are quoted from mapbox
   * 3.30 and both are ordinary.
   */

  /**
   * An import that failed. Style._load does
   * `_loadImports(...).catch(e => { fire ErrorEvent; fire style.load; })`
   * -- the error and THEN the style, synchronously. The app's style
   * always has an import, because setConfigProperty('basemap', ...)
   * resolves through it.
   */
  failImportThenLoad(message = 'Failed to load imports'): void {
    this.fire('error', { error: new Error(message) });
    this.loadStyle();
  }

  /**
   * A source that 401s before style.load. _loaded is set and every
   * source starts fetching its TileJSON first, so this arrives during
   * 'loading' carrying a sourceId -- the same shape that is routine a
   * moment later.
   */
  failSourceWhileLoading(
    sourceId: string,
    message = 'Unauthorized',
  ): void {
    this.fire('error', { error: new Error(message), sourceId });
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
    const entry = args.map(String).join('|');
    const at = this.bound.indexOf(entry);
    // Real mapbox-gl ignores an off with no matching on; so do we, but
    // it is recorded rather than swallowed.
    if (at >= 0) this.bound.splice(at, 1);
    else this.calls.strayOff.push(entry);
  }

  /* ---- everything the fake defers until style.load ----------------- */

  setFog(options: Record<string, unknown>): void {
    this.requireStyle();
    this.calls.fog.push(options);
  }

  setTerrain(options: Record<string, unknown> | null): void {
    this.requireStyle();
    this.terrainSource =
      options === null ? null : String(options.source ?? '');
    /*
     * Null dirties it too. On a globe, Style.setTerrain(null) does not
     * clear terrain -- the projection requiresDraping, so mapbox swaps
     * in a fresh draping-only terrain, which is just as un-recalculated
     * as an elevated one.
     */
    this.terrainDirty = true;
    // mapbox populates style.terrain.properties during the render that
    // follows, and setTerrain always schedules one.
    queueMicrotask(() => {
      this.terrainDirty = false;
      this.fire('render');
    });
    this.calls.terrain.push(options);
  }

  /**
   * The ROOT style's colour theme. Recorded apart from the import's,
   * and nothing in the app may call it -- see `rootColorTheme`.
   */
  setColorTheme(theme: { data: string }): void {
    this.requireStyle();
    this.calls.rootColorTheme.push(theme.data);
  }

  /**
   * The import's colour theme, which is the call that re-tints the
   * basemap. As unforgiving as mapbox on the payload: an import id the
   * style does not have is dropped on the floor with no error event, no
   * console line and no return value.
   */
  setImportColorTheme(
    importId: string,
    theme: { data: string },
  ): void {
    this.requireStyle();
    if (importId !== CONFIG_FRAGMENT || !this.hasBasemap) {
      this.calls.colorThemeDiscarded.push([importId, theme.data]);
      return;
    }
    this.calls.colorTheme.push(theme.data);
    this.calls.colorThemeImports.push(importId);
  }

  /**
   * What the Standard import reports for a config key, and null for
   * everything else.
   *
   * Not deferred, because `Style.getConfigProperty` carries no
   * `_checkLoaded` either -- it resolves the fragment and reads its
   * schema, so before style.load it simply answers null. The scene uses
   * exactly that to find out whether the configured style is one it can
   * theme at all.
   */
  getConfigProperty(fragment: string, key: string): unknown {
    if (
      !this.hasBasemap ||
      fragment !== CONFIG_FRAGMENT ||
      !STANDARD_CONFIG_SCHEMA.has(key)
    ) {
      return null;
    }
    return CONFIG_DEFAULTS[key] ?? true;
  }

  /**
   * Stricter than mapbox on the lifecycle and exactly as unforgiving as
   * mapbox on the payload: a fragment that is not `basemap`, or a key
   * outside Standard's schema, is dropped on the floor without an error
   * event, a console line or a return value. See STYLE_DEFERRED.
   */
  setConfigProperty(
    fragment: string,
    key: string,
    value: unknown,
  ): void {
    this.requireStyle();
    if (
      !this.hasBasemap ||
      fragment !== CONFIG_FRAGMENT ||
      !STANDARD_CONFIG_SCHEMA.has(key)
    ) {
      this.calls.configDiscarded.push([fragment, key, value]);
      return;
    }
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

  /*
   * Map.removeSource re-runs the whole terrain evaluation, and
   * Terrain.update reads style.terrain.properties -- which does not
   * exist between setTerrain() and mapbox's next recalculate. So a
   * removeSource in that window throws "Cannot read properties of
   * undefined (reading 'get')" from inside mapbox and takes the tree
   * down.
   *
   * This stub used to let every removal through, which is a large part
   * of why it shipped: the unit suite could not see the ordering at all.
   */
  removeSource(id: string): void {
    this.requireStyle();
    if (this.terrainDirty) {
      throw new Error(
        `removeSource(${id}) in the same tick as setTerrain`,
      );
    }
    this.sources.delete(id);
  }

  removeLayer(id: string): void {
    this.requireStyle();
    this.layers.delete(id);
  }

  /* ---- and everything that is not ---------------------------------- */

  easeTo(options: Record<string, unknown>): void {
    this.calls.easeTo.push(options);
    // Real mapbox fires `move` throughout the flight; landing on the
    // destination in one step is enough to prove the seam is wired.
    if (Array.isArray(options.center)) {
      this.center = [...options.center] as [number, number];
    }
    // A zero-duration ease is a jump: real mapbox runs the frame and
    // finishes inside the call rather than scheduling one.
    this.easing = options.duration !== 0;
    this.fire('move');
  }

  isEasing(): boolean {
    return this.easing;
  }

  /** Test-only: the flight opened by easeTo reaches its destination. */
  endEase(): void {
    this.easing = false;
  }

  getCenter(): { lng: number; lat: number } {
    return { lng: this.center[0], lat: this.center[1] };
  }

  getBearing(): number {
    return this.bearing;
  }

  setBearing(value: number): void {
    // setBearing is jumpTo, and jumpTo stops whatever is in flight. The
    // fake cancels the same way so a caller that writes a bearing over a
    // flight loses the flight here too, rather than only in a browser.
    this.easing = false;
    this.bearing = value;
    this.calls.bearing.push(value);
  }

  setCenter(value: [number, number]): void {
    // And so is setCenter, for the same reason and with the same teeth:
    // the globe's rotation writes THIS one, so a rotation that ran during
    // a route's flight would kill it here exactly as it does in mapbox.
    this.easing = false;
    this.center = [...value];
    this.calls.center.push([...value]);
    this.fire('move');
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
