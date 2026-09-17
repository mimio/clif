import type { Map as MapboxMap } from 'mapbox-gl';
import {
  type CameraSpec,
  fogPresets,
  SCENE_EASE,
} from 'content/cameras';
import { cubicBezier } from 'scene/ease';
import { createLayerRegistry } from 'scene/layers/registry';
import type { LayerSet, SceneMap } from 'scene/layers/types';
import {
  getMapboxStyle,
  getMapboxToken,
  loadMapboxGl,
} from 'scene/mapbox/loader';
import type { BasemapConfig } from 'scene/theme';
import type { Palette } from 'styles/tokens/palette';

/*
 * The single Map instance, held for the life of the tab, and every
 * imperative call the scene makes on it.
 *
 * The old history page built a map on mount and called remove() on
 * unmount, because skipping it stranded one WebGL context per visit. The
 * instance is never destroyed now, so that whole lifecycle is gone and its
 * hazard with it: there is exactly one context, ever. Route changes are
 * camera moves.
 *
 *
 * THE STYLE LIFECYCLE, AND WHY IT LIVES HERE
 *
 * `new mapboxgl.Map()` returns before the style exists. Almost everything
 * worth doing to a map goes through Style._checkLoaded(), which throws
 * "Style is not done loading" until the stylesheet has been fetched and
 * parsed: setColorTheme, setConfigProperty (via setImportConfig), setFog,
 * setTerrain, setPaintProperty, addSource, addLayer, removeLayer. So a
 * scene that talks to the map the moment it is constructed takes the whole
 * app down, which is what it did.
 *
 * SceneRoot must not have to know which of those methods carry the
 * precondition -- that is precisely the knowledge this seam exists to
 * hold. So every style-dependent call records what it *wants* and then
 * asks for a flush. Before the style is ready a flush is a no-op and the
 * wants simply sit there; when style.load arrives everything still wanted
 * is applied at once.
 *
 * This is a record of desired state, not a queue of callbacks, and the
 * difference is the point. Four route changes during load leave one
 * camera, one layer set and one config to apply, not four of each -- and
 * a theme change during load is never lost, because the newest LUT
 * overwrites the slot rather than joining a line behind an obsolete one.
 *
 * Readiness is the `style.load` event and nothing else. isStyleLoaded()
 * looks like the right test and is not: Style.loaded() additionally
 * requires every source cache, image and model to be loaded and the
 * colour-theme LUT not to be decoding, so it stays false forever behind a
 * token that cannot fetch tiles, and it flaps back to false after each
 * setColorTheme. _checkLoaded() tests _loaded alone, and `style.load` is
 * the event for exactly that flag.
 *
 * If the stylesheet itself fails -- a bad token 401s it -- `style.load`
 * never fires, so the wants are never applied and the scene stays blank
 * rather than throwing. The status goes to 'failed' and SceneRoot shows
 * the same static plate it shows with no token at all.
 */
let instance: MapboxMap | null = null;
let creating: Promise<MapboxMap | null> | null = null;
let registry = createLayerRegistry();

const ease = cubicBezier(...SCENE_EASE);

/** The DEM the terrain routes drape over. */
const DEM_SOURCE = 'mapbox-dem';
const DEM_SPEC = {
  type: 'raster-dem' as const,
  url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
  tileSize: 512,
  maxzoom: 14,
};

export const getMap = (): MapboxMap | null => instance;

/* ---- reading the camera back ----------------------------------------- */

export type CameraListener = (center: [number, number]) => void;

type CameraSub = { listener: CameraListener; detach: () => void };

const cameraSubs = new Set<CameraSub>();

const noop = (): void => {};

const attachCamera = (map: MapboxMap, sub: CameraSub): void => {
  const onMove = (): void => {
    const { lng, lat } = map.getCenter();
    sub.listener([lng, lat]);
  };
  map.on('move', onMove);
  sub.detach = () => map.off('move', onMove);
  // The current transform, not the next move: a subscriber that arrives
  // mid-flight still needs somewhere to start.
  onMove();
};

/**
 * Follows the map's actual centre, for anything that has to agree with
 * the globe rather than predict it.
 *
 * The coordinate pill can derive where the camera is *going* -- it
 * applies resolveCamera, forViewport and cameraForHover to the same
 * inputs SceneRoot does, all of them pure. What it cannot derive is
 * where the camera *is* during the 800-900ms flight, because easeTo does
 * not interpolate lng/lat linearly and a second implementation of the
 * ease would be wrong in a new way. So it reads the transform instead.
 *
 * Fires immediately when there is a map, on every `move`, and once when
 * the map is first created -- that last clause is the one getMap()
 * cannot serve, because the chrome mounts before ensureMap resolves and
 * nothing else announces the creation. watchStyleStatus does not cover
 * it either: with no token the status stays 'loading' for ever.
 *
 * Subscribing before the map exists is normal and costs nothing; the
 * subscription simply attaches when the map arrives. Callers that never
 * get a map -- no token, the fallback plate, unit tests -- never hear
 * anything and fall back to their derived value.
 */
export const watchCamera = (
  listener: CameraListener,
): (() => void) => {
  const sub: CameraSub = { listener, detach: noop };
  cameraSubs.add(sub);
  if (instance) attachCamera(instance, sub);
  return () => {
    sub.detach();
    cameraSubs.delete(sub);
  };
};

/* ---- the style lifecycle --------------------------------------------- */

export type StyleStatus = 'loading' | 'ready' | 'failed';

let status: StyleStatus = 'loading';
const watchers = new Set<(next: StyleStatus) => void>();

export const getStyleStatus = (): StyleStatus => status;

/** Notifies on every status change, and returns an unsubscribe. */
export const watchStyleStatus = (
  listener: (next: StyleStatus) => void,
): (() => void) => {
  watchers.add(listener);
  return () => {
    watchers.delete(listener);
  };
};

const setStatus = (next: StyleStatus): void => {
  if (next === status) return;
  status = next;
  for (const listener of [...watchers]) listener(next);
};

/*
 * What the scene wants the map to be. Every slot is "the latest value
 * asked for, or nothing asked for", so re-asking overwrites rather than
 * accumulating. `undefined` is "nothing asked for" throughout, which is
 * why terrain -- whose real values include null, meaning off -- is held
 * as `number | null | undefined`.
 */
type Desired = {
  fog: { spec: CameraSpec; palette: Palette } | undefined;
  config: Map<string, unknown>;
  lut: string | undefined;
  layers: { sets: LayerSet[]; palette: Palette } | undefined;
};

const emptyDesired = (): Desired => ({
  fog: undefined,
  config: new Map(),
  lut: undefined,
  layers: undefined,
});

let desired: Desired = emptyDesired();

/*
 * Terrain is the one thing held as want-versus-applied rather than as a
 * one-shot want, because the scene has to be able to take it off the map
 * without forgetting that the route still wants it.
 *
 * mapbox's Map.removeSource re-runs the whole terrain evaluation, and
 * Terrain.update reads style.terrain.properties -- which does not exist
 * between setTerrain() and mapbox's next recalculate. So setTerrain
 * followed by removeSource in the same tick throws "Cannot read
 * properties of undefined (reading 'get')" from inside mapbox and takes
 * the tree with it.
 *
 * That is exactly a navigation into a detail route from projects: attach
 * terrain, then unmount the projects layer set. It needed a SECOND visit
 * to show up, because on the first the DEM has not loaded yet, terrain
 * parks itself, and nothing is attached when the sources go. Every
 * single-navigation test we had therefore passed.
 *
 * So: terrain comes off before any source is removed, and goes back on
 * afterwards from `wantedTerrain`. One frame of flat ground in the
 * middle of an 800ms camera move is not perceptible, and it is not worth
 * trading for a rule like "only detach when mapbox has not recalculated
 * yet", which is unobservable from out here and would rot.
 */
let wantedTerrain: number | null = null;
let appliedTerrain: number | null = null;

/**
 * The LUT currently on the map.
 *
 * The dedupe has to live here rather than in the theme painter's closure.
 * setColorTheme reloads every tile, the painter is rebuilt whenever
 * SceneRoot's effect re-runs, and a rebuilt painter has no memory of what
 * it painted -- so this is the only place that knows what the map is
 * actually wearing.
 */
let appliedLut: string | null = null;

/** True while a terrain want is parked waiting for the DEM to resolve. */
let waitingForDem = false;

/*
 * True from a setTerrain() until mapbox has next rendered.
 *
 * This is the window in which style.terrain exists but its `properties`
 * do not: they are populated during the render that follows. A
 * removeSource inside it re-runs the terrain evaluation and throws
 * "Cannot read properties of undefined (reading 'get')" from inside
 * Terrain.update, taking the tree with it.
 *
 * Ordering within a pass is not enough to avoid it, because a later pass
 * in the SAME frame can still remove a source after an earlier pass set
 * terrain. `render` is the exact signal that mapbox has recalculated, so
 * that is what clears it -- and setTerrain always schedules a repaint,
 * so the event is guaranteed to come.
 */
let terrainDirty = false;

const markTerrainDirty = (map: MapboxMap): void => {
  terrainDirty = true;
  map.once('render', () => {
    terrainDirty = false;
    // Whatever was held back is now safe to apply.
    flush();
  });
};

/*
 * WHY THIS FILE TALKS.
 *
 * Registering an `error` listener on a Map switches mapbox-gl's own
 * console reporting off: it assumes whoever listened will handle it. The
 * listener here existed only to notice a stylesheet that never arrived,
 * and dropped everything after that on the floor -- so a 401 on tiles, a
 * colour-theme LUT mapbox refused and a `setConfigProperty` key it did
 * not recognise all produced nothing, anywhere. No console, no state, no
 * signal of any kind.
 *
 * That is the worst possible shape for this subsystem in particular,
 * because the LUT and the basemap config keys are the two things that
 * cannot be verified without a real Mapbox account: if the owner deploys
 * and the LUT is rejected, the globe quietly wears the wrong colours and
 * nothing says so.
 *
 * So nothing is swallowed, and severity means one specific thing:
 *
 *   console.error  wrong, and NOTHING ELSE SAYS SO. A style-level
 *                  failure after load carries no sourceId, which is the
 *                  shape a rejected colour theme and an unknown config
 *                  key arrive in, and the app carries on looking fine.
 *                  Nobody should ever see one.
 *   console.warn   wrong, and already visible some other way. A tile,
 *                  sprite or glyph is routine at the edge of coverage
 *                  and a map is expected to survive it; a stylesheet
 *                  that never arrives has already put the scene into
 *                  'failed' and drawn the fallback plate.
 *
 * That split is what lets the e2e suite keep treating any console error
 * as a defect. A failure the app handles and shows is not a defect, and
 * logging it at error level would train everyone to ignore the channel.
 *
 * Both carry the last thing the scene asked the map to do, because
 * mapbox reports its failures asynchronously and the message alone does
 * not say which call provoked it.
 */
const SCENE_ERROR_LIMIT = 20;

/** The last thing flush() asked of the map; context for a failure. */
let lastAction = 'none';

/** Completed scene passes. Read by the debug handle; see SceneDebug. */
let passes = 0;

/** Recent failures, newest last. Read by the debug handle. */
const sceneErrors: string[] = [];

const record = (line: string): void => {
  sceneErrors.push(line);
  if (sceneErrors.length > SCENE_ERROR_LIMIT) sceneErrors.shift();
};

type MapboxErrorEvent = {
  error?: { message?: string };
  sourceId?: string;
};

const reportMapboxError = (event: unknown): void => {
  const { error, sourceId } = (event ?? {}) as MapboxErrorEvent;
  const message = error?.message ?? String(error ?? 'unknown error');
  const where = sourceId ? ` source=${sourceId}` : '';
  const line = `mapbox error${where} after=${lastAction}: ${message}`;
  record(line);
  // A tile can fail; the style itself failing is a defect.
  if (sourceId) console.warn(`[scene] ${line}`);
  else console.error(`[scene] ${line}`);
};

const asSceneMap = (map: MapboxMap): SceneMap =>
  map as unknown as SceneMap;

/* ---- the debug handle ------------------------------------------------ */

/**
 * What `window.__SCENE__` offers a test that asked for it.
 *
 * It exists because the visual suite had to patch the src setter on
 * HTMLImageElement to find out whether mapbox accepted the colour-theme
 * LUT -- a clever probe, but one that asserts an implementation detail
 * of how mapbox decodes a LUT rather than what the style ended up
 * wearing. The two things nobody can verify without a real Mapbox
 * account are the LUT and the config keys, so those are exactly the two
 * that deserve a seam rather than a workaround.
 */
export type SceneDebug = {
  map: MapboxMap;
  styleStatus: () => StyleStatus;
  /** The LUT the map is currently wearing, as handed to setColorTheme. */
  appliedLut: () => string | null;
  /** Recent mapbox failures, newest last. Empty is the healthy state. */
  errors: () => string[];
  /** The last thing the scene asked the map to do. */
  lastAction: () => string;
  /**
   * How many scene passes have completed.
   *
   * The honest signal for "the scene has finished reacting to the route
   * change". A test that navigates and then sleeps is guessing; one that
   * waits for this to move is not. It only advances on a pass that ran
   * to the end, so a pass that throws never counts.
   */
  passes: () => number;
};

/*
 * Opt-in, and off unless something asked for it before the app booted --
 * the same shape as __MAPBOX_STUB__, and for the same reason: a handle
 * that is always there is a handle application code starts using. A test
 * sets window.__SCENE_DEBUG__ = true through addInitScript; nothing in a
 * normal session ever does, so a production build carries one unread
 * boolean and no live reference to the map.
 */
const publishDebugHandle = (map: MapboxMap): void => {
  if (typeof window === 'undefined') return;
  if (!window.__SCENE_DEBUG__) return;
  window.__SCENE__ = {
    map,
    styleStatus: () => status,
    appliedLut: () => appliedLut,
    errors: () => [...sceneErrors],
    lastAction: () => lastAction,
    passes: () => passes,
  };
};

/*
 * FLUSH IS NOT RE-ENTRANT, and enforcing that is load-bearing.
 *
 * mapbox fires events synchronously from inside its own operations --
 * `sourcedata` arrives during addSource and removeSource, among others.
 * The scene listens for one of those to know when the DEM has resolved,
 * so a flush could re-enter itself from the middle of registry.sync:
 * the outer pass took terrain off before removing sources, the nested
 * pass saw terrain missing and dutifully put it back, and the outer pass
 * then carried on removing sources with terrain attached -- which is the
 * crash this guard exists to prevent. It survived five navigations and
 * died on the sixth.
 *
 * A re-entrant call therefore asks for another pass instead of running
 * one. The loop converges because every pass either applies a want and
 * clears it, or finds nothing to do.
 */
let flushing = false;
let flushAgain = false;

/*
 * While a batch is open the apply* calls only record. One scene pass is
 * one flush, which is what keeps every removal ahead of every
 * setTerrain in a given tick.
 */
let batching = false;

/** Records every want in `run`, then applies them in one ordered pass. */
export const batchScene = (run: () => void): void => {
  if (batching) {
    run();
    return;
  }
  batching = true;
  try {
    run();
  } finally {
    batching = false;
  }
  flush();
};

const requestFlush = (): void => {
  if (batching) return;
  flush();
};

/** Enough for a pass to settle; more would mean a want that re-arms. */
const MAX_FLUSH_PASSES = 5;

const flush = (): void => {
  if (flushing) {
    flushAgain = true;
    return;
  }
  flushing = true;
  try {
    let pass = 0;
    do {
      flushAgain = false;
      flushOnce();
      pass += 1;
    } while (flushAgain && pass < MAX_FLUSH_PASSES);
  } finally {
    flushing = false;
  }
};

const flushOnce = (): void => {
  const map = instance;
  if (!map || status !== 'ready') return;

  // Config first: the light preset decides how the fog reads.
  if (desired.config.size > 0) {
    for (const [key, value] of desired.config) {
      lastAction = `setConfigProperty(${key})`;
      map.setConfigProperty('basemap', key, value);
    }
    desired.config.clear();
  }

  if (desired.lut !== undefined) {
    const lut = desired.lut;
    desired.lut = undefined;
    if (lut !== appliedLut) {
      appliedLut = lut;
      lastAction = `setColorTheme(${lut.length}b)`;
      map.setColorTheme({ data: lut });
    }
  }

  if (desired.fog !== undefined) {
    const { spec, palette } = desired.fog;
    desired.fog = undefined;
    const fog = fogPresets[spec.fog];
    lastAction = `setFog(${spec.fog})`;
    map.setFog({
      range: fog.range,
      color: fog.color,
      'high-color': fog.highColor,
      'horizon-blend': 0.04,
      'space-color': shade(palette, 0.9),
      // Stars would be noise over a bright ground.
      'star-intensity': palette.light ? 0 : 0.15,
    });
  }

  /*
   * LAYERS BEFORE TERRAIN, ALWAYS, AND NEVER BOTH OUT OF ORDER.
   *
   * Map.removeSource re-runs the terrain evaluation, and Terrain.update
   * reads style.terrain.properties -- which does not exist between a
   * setTerrain() and mapbox's next recalculate. So a setTerrain followed
   * by a removeSource in the same tick throws from inside mapbox and
   * takes the tree down.
   *
   * The trap is that you cannot avoid it by turning terrain off first.
   * On a globe, Style.setTerrain(null) does NOT clear terrain: the
   * projection requiresDraping, so mapbox immediately calls
   * setTerrainForDraping() and installs a fresh draping-only terrain --
   * equally un-recalculated, and equally fatal to the next removeSource.
   * Detaching first makes it worse, not better.
   *
   * What works is order: remove first, set terrain afterwards. That is
   * why syncLayers runs here and reconcileTerrain runs last, and why the
   * whole scene pass is coalesced into a single flush -- six separate
   * apply calls each flushing would put applyTerrain's setTerrain before
   * syncLayers' removals, which is exactly the crash.
   */
  if (desired.layers !== undefined && !terrainDirty) {
    const { sets, palette } = desired.layers;
    desired.layers = undefined;
    lastAction = `syncLayers(${sets.map((set) => set.id).join()})`;
    registry.sync(asSceneMap(map), sets);
    registry.repaint(asSceneMap(map), sets, palette);
  }

  reconcileTerrain(map);
  passes += 1;
};

/**
 * Brings what the map is wearing back in line with what the route wants.
 *
 * The DEM is added once and never removed -- it is the same source on
 * every terrain route, so re-adding it per route would buy nothing and
 * would put another removeSource on the hazardous path.
 */
const reconcileTerrain = (map: MapboxMap): void => {
  if (wantedTerrain === appliedTerrain) return;
  if (wantedTerrain === null) {
    lastAction = 'setTerrain(off)';
    appliedTerrain = null;
    map.setTerrain(null);
    markTerrainDirty(map);
    return;
  }

  if (!map.getSource(DEM_SOURCE)) {
    map.addSource(DEM_SOURCE, DEM_SPEC);
  }

  /*
   * Terrain waits for its own source. Adding a raster-dem source and
   * draping on it in the same tick works on a fresh style and not on a
   * map that has been rendering for a while: mapbox reaches into the
   * DEM's tile cache on the next frame and throws. So the want stays on
   * the record and the sourcedata handler reconciles again when the DEM
   * is ready; leaving the terrain view meanwhile just makes that a
   * no-op.
   */
  if (!map.isSourceLoaded(DEM_SOURCE)) {
    if (waitingForDem) return;
    waitingForDem = true;
    const onData = (event: { sourceId?: string }): void => {
      if (event.sourceId !== DEM_SOURCE) return;
      if (!map.isSourceLoaded(DEM_SOURCE)) return;
      map.off('sourcedata', onData);
      waitingForDem = false;
      // Off the mapbox call stack entirely. The re-entrancy guard above
      // already makes this safe, but scene work has no business running
      // inside whatever mapbox operation happened to emit the event.
      queueMicrotask(flush);
    };
    map.on('sourcedata', onData);
    return;
  }

  lastAction = `setTerrain(${wantedTerrain})`;
  appliedTerrain = wantedTerrain;
  map.setTerrain({
    source: DEM_SOURCE,
    exaggeration: wantedTerrain,
  });
  markTerrainDirty(map);
};

const create = async (
  container: HTMLElement,
): Promise<MapboxMap | null> => {
  let map: MapboxMap;
  try {
    const mapboxgl = await loadMapboxGl();
    if (!mapboxgl) return null;

    map = new mapboxgl.Map({
      container,
      accessToken: getMapboxToken(),
      style: getMapboxStyle(),
      // Set at construction: changing projection later restyles the
      // whole map, and the globe is never not the projection.
      projection: { name: 'globe' },
      attributionControl: false,
      // A globe needs to zoom out past the old style's minZoom: 7.
      minZoom: 0,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : String(error);
    const line = `mapbox failed to load: ${message}`;
    record(line);
    // Handled: the caller gets null and the fallback plate goes up.
    console.warn(`[scene] ${line}`);
    setStatus('failed');
    return null;
  }

  instance = map;
  // Everything that subscribed before the map existed, including the
  // first read of the transform.
  for (const sub of [...cameraSubs]) attachCamera(map, sub);

  map.once('style.load', () => {
    setStatus('ready');
    flush();
  });

  /*
   * Only a failure BEFORE style.load is fatal to the scene: after it,
   * error events are individual tiles, sprites and fonts, which a map is
   * expected to survive and which a token without tile scope produces by
   * the hundred. Surviving them is the difference between degrading and
   * crashing -- but surviving is not the same as saying nothing, so
   * every one of them is reported.
   */
  map.on('error', (event: unknown) => {
    if (status === 'loading') {
      setStatus('failed');
      const { error } = (event ?? {}) as {
        error?: { message?: string };
      };
      const message = error?.message ?? 'unknown error';
      const line = `mapbox style failed: ${message}`;
      record(line);
      // Warn, not error: the scene has already gone to 'failed' and the
      // plate is up, so this is handled rather than silent.
      console.warn(`[scene] ${line}`);
      return;
    }
    reportMapboxError(event);
  });

  publishDebugHandle(map);

  return map;
};

/**
 * Creates the map on first call, and hands back the same one after that.
 *
 * React 19 double-invokes effects under StrictMode, so this is called at
 * least twice on the first mount with the same container. The second call
 * lands while `create` is still in flight and gets the same promise --
 * which is why the in-flight promise is memoised and not only the
 * resolved instance. Two maps in one container would be two WebGL
 * contexts and two sets of tiles.
 */
export const ensureMap = async (
  container: HTMLElement | null,
): Promise<MapboxMap | null> => {
  if (!container) return null;
  if (instance) return instance;
  if (!creating) creating = create(container);
  return creating;
};

/* ---- camera ---------------------------------------------------------- */

/*
 * The camera is the one part of the scene with no style precondition:
 * easeTo only touches the transform. It is applied immediately and on
 * purpose -- deferring it would leave the map at its constructed default
 * of [0, 0] zoom 0 until the stylesheet arrived, and then swing visibly
 * to the route's camera as the first tiles painted.
 */
export const applyCamera = (
  spec: CameraSpec,
  durationMs: number,
): void => {
  if (!instance) return;
  instance.easeTo({
    center: spec.center,
    zoom: spec.zoom,
    pitch: spec.pitch,
    bearing: spec.bearing,
    duration: durationMs,
    easing: ease,
  });
};

const shade = (palette: Palette, k: number): string =>
  `rgb(${palette.sh(palette.space[0], 0, k)}, ${palette.sh(
    palette.space[1],
    1,
    k,
  )}, ${palette.sh(palette.space[2], 2, k)})`;

export const applyFog = (
  spec: CameraSpec,
  palette: Palette,
): void => {
  desired.fog = { spec, palette };
  requestFlush();
};

export const applyTerrain = (exaggeration: number | null): void => {
  wantedTerrain = exaggeration;
  requestFlush();
};

/*
 * The detail route holds the map. Every gesture goes off, not just drag:
 * a scroll-zoom on a held map is the same bug as a drag on one. Handlers
 * are not style-dependent either.
 */
const HANDLERS = [
  'dragPan',
  'dragRotate',
  'scrollZoom',
  'boxZoom',
  'keyboard',
  'doubleClickZoom',
  'touchZoomRotate',
  'touchPitch',
] as const;

export const applyInteractivity = (interactive: boolean): void => {
  if (!instance) return;
  for (const name of HANDLERS) {
    const handler = instance[name];
    if (!handler) continue;
    if (interactive) handler.enable();
    else handler.disable();
  }
};

/* ---- theming --------------------------------------------------------- */

/**
 * Tier 1: the colour LUT. Reloads every tile by design, so it is skipped
 * when the map already wears this LUT -- see `appliedLut`.
 */
export const applyColorTheme = (lut: string): void => {
  desired.lut = lut;
  requestFlush();
};

/** Tier 2: the Standard import's own knobs. No tile reload. */
export const applyBasemapConfig = (
  changes: [keyof BasemapConfig, unknown][],
): void => {
  // Merged, never replaced: `changes` is a diff against the last config
  // SceneRoot computed, so a diff that arrives while an earlier one is
  // still waiting carries only what changed since it. Dropping the
  // earlier one would lose those keys for good.
  for (const [key, value] of changes) desired.config.set(key, value);
  requestFlush();
};

/* ---- layers ---------------------------------------------------------- */

/**
 * Tier 3 lives here too: `sync` mounts what the route wants and unmounts
 * what it does not, `repaint` pushes the palette into whatever is
 * mounted.
 */
export const syncLayers = (
  sets: LayerSet[],
  palette: Palette,
): void => {
  desired.layers = { sets, palette };
  requestFlush();
};

/* ---- the animation loop ---------------------------------------------- */

let frame = 0;
let spin: number | null = null;
let dash = false;
let dashLayers: string[] = [];

const tick = (): void => {
  frame = 0;
  if (!instance) return;
  if (spin !== null) {
    instance.setBearing(instance.getBearing() + spin);
  }
  // The dash is a paint property, so it waits for the style like every
  // other paint property does.
  if (dash && status === 'ready') {
    // A three-step dash walked one step at a time reads as travel without
    // writing a paint property every frame on every layer.
    const step = Math.floor(Date.now() / 90) % 3;
    for (const id of dashLayers) {
      if (!instance.getLayer(id)) continue;
      instance.setPaintProperty(id, 'line-dasharray', [
        0,
        4 - step,
        3 + step,
      ]);
    }
  }
  if (spin !== null || dash) frame = requestAnimationFrame(tick);
};

/**
 * One loop for the whole scene, started and stopped by what the route
 * asks for. Reduced motion resolves both dials to off in
 * scene/camera.ts, so under it this never starts.
 */
export const setAnimation = (
  spinRate: number | null,
  dashRunning: boolean,
  layers: string[],
): void => {
  spin = spinRate;
  dash = dashRunning;
  dashLayers = layers;
  if (frame !== 0) return;
  if (spin === null && !dash) return;
  frame = requestAnimationFrame(tick);
};

/** Test-only: forgets the instance so a fresh one can be built. */
export const resetMapForTests = (): void => {
  if (frame !== 0) cancelAnimationFrame(frame);
  frame = 0;
  spin = null;
  dash = false;
  dashLayers = [];
  instance = null;
  creating = null;
  registry = createLayerRegistry();
  status = 'loading';
  watchers.clear();
  desired = emptyDesired();
  flushing = false;
  flushAgain = false;
  terrainDirty = false;
  for (const sub of [...cameraSubs]) sub.detach();
  cameraSubs.clear();
  appliedLut = null;
  wantedTerrain = null;
  appliedTerrain = null;
  waitingForDem = false;
  lastAction = 'none';
  passes = 0;
  sceneErrors.length = 0;
  if (typeof window !== 'undefined') delete window.__SCENE__;
};
