import type { Map as MapboxMap, PaddingOptions } from 'mapbox-gl';
import {
  type CameraPadding,
  type CameraSpec,
  SCENE_EASE,
  type Viewport,
} from 'content/cameras';
import { cubicBezier } from 'scene/ease';
import type { GlobeGeometry } from 'scene/globe';
import { createLayerRegistry } from 'scene/layers/registry';
import type { LayerSet, SceneMap } from 'scene/layers/types';
import {
  DEFAULT_STYLE,
  getMapboxStyle,
  getMapboxToken,
  loadMapboxGl,
} from 'scene/mapbox/loader';
import {
  BASEMAP_IMPORT,
  BASEMAP_PROBE_KEY,
  type BasemapConfig,
  fogFor,
} from 'scene/theme';
import { CARTOGRAPHY_MAX_ZOOM } from 'styles/tokens/cartography';
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
 * parsed: setColorTheme, setFog, setTerrain, setPaintProperty, addSource,
 * addLayer, removeSource, removeLayer. So a scene that talks to the map
 * the moment it is constructed takes the whole app down, which is what it
 * did.
 *
 * setConfigProperty is deferred with them and is NOT among them. It is
 * unguarded, for a related reason: it opens with `const fragmentStyle =
 * this.getFragmentStyle(id); if (!fragmentStyle) return;` and there is no
 * _checkLoaded anywhere in it. Called before the style loads it does
 * nothing at all, quietly -- which is every colour the basemap wears.
 * That is a worse failure than throwing, not a better one -- a light
 * preset that never arrives leaves the basemap looking merely wrong, and
 * a colour theme that never arrives leaves it wearing none of the eight
 * -- so they wait with the rest rather than being allowed through.
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
 * a theme change during load is never lost, because the newest value for
 * a key overwrites the slot rather than joining a line behind an obsolete
 * one.
 *
 * Readiness is the `style.load` event and nothing else. isStyleLoaded()
 * looks like the right test and is not: Style.loaded() additionally
 * requires every source cache, image and model to be loaded and any
 * colour theme not to be decoding, so it stays false forever behind a
 * token that cannot fetch tiles. _checkLoaded() tests _loaded alone, and
 * `style.load` is the event for exactly that flag.
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

/**
 * Longitude folded back into [-180, 180).
 *
 * A camera that keeps turning east runs off the end of the range
 * otherwise: mapbox constrains the LATITUDE of a centre it is given and
 * leaves the longitude alone, so after an hour the transform would be
 * reporting 5,000 degrees east. Both ends of the rotation go through
 * here -- what the spin WRITES below, and what the subscription READS
 * back -- because a readout is a coordinate and not an odometer, and
 * because a pan the visitor drove past the antimeridian accumulates the
 * same way without ever touching the spin.
 *
 * A longitude already in range is handed back UNCHANGED rather than run
 * through the arithmetic, which is not an optimisation: `(-122.7 + 180) %
 * 360 + 360) % 360 - 180` is -122.69999999999999, so folding a value that
 * did not need folding puts a rounding error into every camera the route
 * table declares -- including the ones tests compare by equality.
 */
const wrapLng = (lng: number): number =>
  lng >= -180 && lng < 180
    ? lng
    : ((((lng + 180) % 360) + 360) % 360) - 180;

export type CameraListener = (center: [number, number]) => void;

type CameraSub = { listener: CameraListener; detach: () => void };

const cameraSubs = new Set<CameraSub>();

const noop = (): void => {};

/*
 * AN UNCHANGED TRANSFORM IS NOT AN EVENT, and saying it is cost the app
 * a permanent re-render loop.
 *
 * `move` is fired by every camera write, and the spin writes one per
 * animation frame for the life of the tab -- `setCenter` is `jumpTo`, and
 * `jumpTo` fires `move`. This used to hand every one of them a FRESHLY
 * ALLOCATED pair, so a subscriber holding the value in React state was
 * handed a new reference sixty times a second whether or not the camera
 * had actually moved, and re-rendered on every one of them. Measured on
 * the hermetic runner: 15 re-renders a second of the whole chrome
 * subtree, for ever, on `/` and on the 404.
 *
 * So the last pair is kept and an identical one is not announced. That is
 * the discipline scene/SceneRoot.tsx already keeps around setPalette --
 * it hands back the CURRENT palette when the key is unchanged, rather
 * than an equal-but-new object, precisely because a new reference re-runs
 * everything downstream of it -- and it is worth as much here: `move`
 * fires for a drag, for an ease and for every frame of a flight that has
 * already arrived, and a great many of those carry a centre the map is
 * already at.
 *
 * It is not the whole fix, and it cannot be: on a rotating globe the
 * centre genuinely changes every frame. What it removes is the churn that
 * was never about movement at all -- the allocation, and every `move`
 * that reports the place the map is already sitting. The consumer's own
 * half, quantising to the precision it PRINTS and committing on a frame
 * rather than on an event, is in components/chrome/LiveCoordPill.tsx.
 */
const attachCamera = (map: MapboxMap, sub: CameraSub): void => {
  let last: [number, number] | null = null;
  const onMove = (): void => {
    const { lng, lat } = map.getCenter();
    const next: [number, number] = [wrapLng(lng), lat];
    if (last !== null && last[0] === next[0] && last[1] === next[1]) {
      return;
    }
    last = next;
    sub.listener(next);
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

/* ---- reading the globe's placement back ------------------------------ */

export type GlobeListener = (geometry: GlobeGeometry) => void;

type GlobeSub = { listener: GlobeListener; detach: () => void };

const globeSubs = new Set<GlobeSub>();

/** mapbox's PaddingOptions, with every side present. */
const sides = (padding: PaddingOptions): CameraPadding => ({
  top: padding.top ?? 0,
  right: padding.right ?? 0,
  bottom: padding.bottom ?? 0,
  left: padding.left ?? 0,
});

const samePadding = (a: CameraPadding, b: CameraPadding): boolean =>
  a.top === b.top &&
  a.right === b.right &&
  a.bottom === b.bottom &&
  a.left === b.left;

/*
 * The same discipline attachCamera argues for above, over a different
 * pair of fields: an unchanged transform is not an event, and the
 * listener is handed a fresh object only when one of the two numbers it
 * carries has actually moved.
 *
 * It matters more here, not less. The centre genuinely changes on every
 * frame of the hello route's rotation, so watchCamera announces one per
 * frame for the life of the tab and its consumer quantises. THESE two do
 * not: a spin turns the planet inside a disc that does not move, so this
 * subscription is silent for every frame of it and speaks only while a
 * route's flight is actually resizing or re-centring the globe. Which is
 * what makes it safe for a consumer to hold in React state.
 */
const attachGlobe = (map: MapboxMap, sub: GlobeSub): void => {
  let last: GlobeGeometry | null = null;
  const onMove = (): void => {
    const zoom = map.getZoom();
    const padding = sides(map.getPadding());
    if (
      last !== null &&
      last.zoom === zoom &&
      samePadding(last.padding, padding)
    ) {
      return;
    }
    // Copied rather than held: mapbox hands back its own transform's
    // padding, and a snapshot that the map can edit under the consumer
    // is not a snapshot. Its four sides are optional on mapbox's type
    // and never absent on the transform, so an absent one is zero --
    // which is also what mapbox's own default padding is.
    const next: GlobeGeometry = { zoom, padding };
    last = next;
    sub.listener(next);
  };
  map.on('move', onMove);
  sub.detach = () => map.off('move', onMove);
  // The current transform, not the next move -- a subscriber that
  // arrives mid-flight still needs somewhere to start.
  onMove();
};

/**
 * Follows the disc the globe is painted as: how big it is, and where its
 * centre sits.
 *
 * Both are derivable from the route's camera, and scene/SceneRoot.tsx
 * does derive them -- right up until the camera is in flight, where the
 * zoom is whatever mapbox's ease has reached and the padding is
 * interpolated alongside it. The star field has to agree with the globe
 * frame by frame rather than at the ends of the move, because the sky it
 * is cut out of is defined by the globe's edge. So it reads the
 * transform, for the reason watchCamera gives above and with the same
 * lifecycle: subscribe before the map exists and the subscription simply
 * attaches when it arrives.
 */
export const watchGlobe = (listener: GlobeListener): (() => void) => {
  const sub: GlobeSub = { listener, detach: noop };
  globeSubs.add(sub);
  if (instance) attachGlobe(instance, sub);
  return () => {
    sub.detach();
    globeSubs.delete(sub);
  };
};

/* ---- the style lifecycle --------------------------------------------- */

export type StyleStatus = 'loading' | 'ready' | 'failed';

let status: StyleStatus = 'loading';
const watchers = new Set<(next: StyleStatus) => void>();

/**
 * The style URL the map was CONSTRUCTED with, kept because nothing else
 * can answer "which style is this build actually running?" after the
 * fact: mapbox's getStyle() returns the resolved stylesheet, which
 * carries no trace of the mapbox:// URL it was fetched from.
 *
 * It is an empty string until a map is constructed. NEXT_PUBLIC_MAPBOX_STYLE
 * is inlined at build time, so on a deployed site this is the only place
 * the value is visible at all.
 */
let styleUrl = '';

/**
 * Whether the loaded style can be colour-themed at runtime, or null
 * before the style has loaded and the question can be asked.
 *
 * See BASEMAP_IMPORT in scene/theme.ts: the whole of tier 1 and tier 2
 * is addressed to one import, and a style that does not have it takes
 * every call and does nothing with any of them.
 */
let colorThemeSupported: boolean | null = null;

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
  camera: { spec: CameraSpec; durationMs: number } | undefined;
  fog:
    | {
        spec: CameraSpec;
        palette: Palette;
        viewport: Viewport | null;
      }
    | undefined;
  config: Map<string, unknown>;
  layers: { sets: LayerSet[]; palette: Palette } | undefined;
};

const emptyDesired = (): Desired => ({
  camera: undefined,
  fog: undefined,
  config: new Map(),
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
 * and dropped everything after that on the floor -- so a 401 on tiles and
 * a `setConfigProperty` key mapbox did not recognise both produced
 * nothing, anywhere. No console, no state, no signal of any kind.
 *
 * That is the worst possible shape for this subsystem in particular,
 * because the basemap config keys are the one thing that cannot be
 * verified without a real Mapbox account: if the owner deploys and a
 * colour key is dropped, the globe quietly wears the wrong colours and
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

/**
 * Completed SCENE passes -- one per batchScene, not one per flush.
 *
 * Counting flushes let a leftover flush from the previous route satisfy
 * a waiter, which is a timing dependency wearing a signal's clothes. A
 * scene pass is what a route change produces exactly one of.
 */
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

/*
 * An asset that failed to fetch, rather than the style being wrong.
 *
 * sourceId alone is not the discriminator it looks like: mapbox grafts
 * one onto source events, but sprites, iconsets and glyph ranges fire on
 * the Style and carry none, so classifying by its absence sent every
 * sprite 404 to console.error -- the exact class this calls routine.
 */
const ASSET_FAILURE =
  /\b(sprite|glyph|font|tile|image|icon|model)\b/i;

const reportMapboxError = (event: unknown): void => {
  const { error, sourceId } = (event ?? {}) as MapboxErrorEvent;
  const message = error?.message ?? String(error ?? 'unknown error');
  const where = sourceId ? ` source=${sourceId}` : '';
  const line = `mapbox error${where} after=${lastAction}: ${message}`;
  record(line);

  /*
   * console.error means "wrong, and NOTHING ELSE SAYS SO". That is a
   * style-level failure on a style that loaded: a rejected config key,
   * a basemap that came back wrong. Everything else warns --
   *
   *   an asset fetch, which a map is expected to survive;
   *   anything carrying a sourceId, same reason;
   *   anything at all once the scene is already showing its plate,
   *   because it is then reporting a failure the user can see. Without
   *   that last clause a failed style produced one warning and then a
   *   run of console.errors as its sources gave up in turn, every one
   *   of which the e2e suite counts as a defect.
   */
  const handled =
    status !== 'ready' ||
    sourceId !== undefined ||
    ASSET_FAILURE.test(message);
  if (handled) console.warn(`[scene] ${line}`);
  else console.error(`[scene] ${line}`);
};

/*
 * THE CHECK THAT WOULD HAVE CAUGHT A STYLE THAT CANNOT BE THEMED.
 *
 * Every tier of the theming reaches the basemap through one import id
 * (scene/theme.ts's BASEMAP_IMPORT), and mapbox-gl answers a call
 * addressed to an import that is not there by returning. Not throwing,
 * not warning, not firing an error event: returning.
 *
 *   Style.setConfigProperty    `const fragmentStyle =
 *                              this.getFragmentStyle(importId); if
 *                              (!fragmentStyle) return;` and then
 *                              `if (!schema || !schema[key]) return;`
 *
 * So pointing this app at any style that is not Standard-shaped -- the
 * site's own old `mapbox://styles/chiefkleef/...`, say, left behind in
 * NEXT_PUBLIC_MAPBOX_STYLE on a deployment -- produces a globe that
 * silently wears none of the eight themes and reports a clean run from
 * every seam that exists: every colour key was sent, mapbox accepted
 * each call, and there are no errors anywhere. That is precisely the
 * shape of failure this file's header says must not be allowed to stay
 * quiet, and the cartography made it worse rather than better -- there
 * are twelve colours to lose now, not one cube.
 *
 * getConfigProperty is the honest probe, because it resolves the
 * fragment and then its schema -- the exact precondition every setter
 * needs -- and it is public API. A style that answers it is one this
 * scene can theme; a style that does not is one where nothing the theme
 * lens does will ever be visible, and this says so, loudly, once, and
 * carries on: a basemap wearing the wrong colours is still a basemap.
 */
const checkColorTheme = (map: MapboxMap): void => {
  let known = false;
  try {
    const answer: unknown = map.getConfigProperty(
      BASEMAP_IMPORT,
      BASEMAP_PROBE_KEY,
    );
    known = answer !== null && answer !== undefined;
  } catch {
    // A style object that does not implement it at all is simply a
    // style that cannot be themed; it is not a reason to take the
    // scene down.
    known = false;
  }
  colorThemeSupported = known;
  if (known) return;

  const line =
    `style ${styleUrl} has no "${BASEMAP_IMPORT}" import, so runtime ` +
    'colour theming does nothing: setConfigProperty returns without a ' +
    'word, and the basemap will keep its own colours under every ' +
    `theme. Use ${DEFAULT_STYLE} -- if this is a deployment, ` +
    'NEXT_PUBLIC_MAPBOX_STYLE is set and should be removed.';
  record(line);
  // console.error, by this file's own rule: wrong, and NOTHING ELSE
  // SAYS SO. There is no mapbox event, no warning and no return value
  // behind this one.
  console.error(`[scene] ${line}`);
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
  /**
   * The style URL this build is running, which is
   * NEXT_PUBLIC_MAPBOX_STYLE when it is set and DEFAULT_STYLE when it
   * is not. Inlined at build time, so on a deployed preview this handle
   * is the only way to read it.
   */
  styleUrl: () => string;
  /**
   * Whether that style has the import the colour theme is addressed to,
   * or null before the style has loaded. False means every theme change
   * is a no-op on the basemap -- see checkColorTheme above.
   */
  colorThemeSupported: () => boolean | null;
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
  /**
   * The layer sets the registry currently holds mounted, by id.
   *
   * The registry's own record rather than the set table's opinion: it
   * lists what `mount` actually added to THIS map, so a route that is
   * supposed to carry no data of its own can be asserted against the
   * bookkeeping as well as against the style. See
   * e2e/hermetic/globe-clean.spec.ts, which reads both and requires
   * them to agree.
   */
  mountedSets: () => string[];
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
    styleUrl: () => styleUrl,
    colorThemeSupported: () => colorThemeSupported,
    errors: () => [...sceneErrors],
    lastAction: () => lastAction,
    passes: () => passes,
    mountedSets: () => registry.mountedIds(),
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
  passes += 1;
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
    if (flushAgain) {
      // Giving up quietly is how a scene ends up half-applied with
      // nothing to show for it.
      const line = `scene flush did not settle in ${MAX_FLUSH_PASSES} passes, after=${lastAction}`;
      record(line);
      console.warn(`[scene] ${line}`);
    }
  } catch (error) {
    /*
     * A throw from inside mapbox must not escape. The flush is reached
     * from a React effect, from a setTimeout in the theme painter and
     * from mapbox's own event handlers, and in two of those an
     * exception is an uncaught one -- a pageerror, with the scene left
     * wherever it stopped. Reporting it and carrying on degrades; not
     * catching it takes the tab down.
     */
    const message =
      error instanceof Error ? error.message : String(error);
    const line = `scene flush threw after=${lastAction}: ${message}`;
    record(line);
    console.error(`[scene] ${line}`);
  } finally {
    flushing = false;
  }
};

const flushOnce = (): void => {
  const map = instance;
  if (!map || status !== 'ready') return;

  // The camera first, so the flight starts on the frame the route
  // changed rather than behind a style operation that might stall.
  if (desired.camera !== undefined) {
    const { spec, durationMs } = desired.camera;
    lastAction = `easeTo(z${spec.zoom.toFixed(3)})`;
    map.easeTo({
      center: spec.center,
      zoom: spec.zoom,
      pitch: spec.pitch,
      bearing: spec.bearing,
      // Sent on EVERY move, including the ones that want none. Padding
      // is camera state: mapbox keeps whatever the last move set, so a
      // route that left it out would inherit the previous route's
      // offset and draw its globe off to one side.
      padding: spec.padding,
      duration: durationMs,
      easing: ease,
    });
    // Cleared once it is on the map, like the fog below.
    desired.camera = undefined;
  }

  // Config next: the light preset decides how the fog reads, and the
  // colour keys are the basemap's own cartography.
  if (desired.config.size > 0) {
    for (const [key, value] of desired.config) {
      lastAction = `setConfigProperty(${key})`;
      map.setConfigProperty(BASEMAP_IMPORT, key, value);
    }
    desired.config.clear();
  }

  if (desired.fog !== undefined) {
    const { spec, palette, viewport } = desired.fog;
    lastAction = `setFog(${spec.fog})`;
    // Every number in it is derived: the colours from the palette, the
    // alphas from the prototype's two rims, and horizon-blend solved
    // against this camera's globe. See fogFor in scene/theme.ts.
    map.setFog(fogFor(spec, palette, viewport));
    // Cleared only once it is actually on the map: clearing first loses
    // the want outright if the call throws, with nothing to retry from.
    desired.fog = undefined;
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
    lastAction = `syncLayers(${sets.map((set) => set.id).join()})`;
    registry.sync(asSceneMap(map), sets);
    registry.repaint(asSceneMap(map), sets, palette);
    desired.layers = undefined;
  }

  reconcileTerrain(map);
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

/*
 * THE MAP IS BORN SOMEWHERE ON PURPOSE, and saying so is what keeps the
 * stylesheet from taking the camera off the route.
 *
 * mapbox-gl's Map constructor records whether the CALLER named a centre
 * or a zoom:
 *
 *   if (initialOptions.center != null || initialOptions.zoom != null) {
 *     this.transform._unmodified = false;
 *   }
 *   ...
 *   this.on('style.load', () => {
 *     if (this.transform.unmodified) this.jumpTo(this.style.stylesheet);
 *   });
 *
 * Constructed without them, the transform stays "unmodified" and mapbox
 * jumps the camera to the STYLESHEET's own centre and zoom the moment the
 * style arrives -- and jumpTo, as ever, stops whatever flight is in the
 * air. The scene issues the route's flight as soon as the map object
 * exists, which is well before a style round trip, so the two collide by
 * default and the stylesheet wins.
 *
 * It did not lose every time, which is why this read as flaky rather than
 * as a rule: any ease frame that ran first sets _unmodified false through
 * the transform's own setters, so whether the route survived depended on
 * whether one rAF beat the style over the network. Three cold loads in
 * six came up at the stylesheet's camera rather than the route's.
 *
 * Naming the values mapbox would have defaulted to costs nothing visible
 * -- the map still starts on a whole globe at [0, 0] and still flies to
 * the route from there -- and settles the ownership question for good:
 * the camera comes from the route table, never from the basemap.
 */
const START = { center: [0, 0] as [number, number], zoom: 0 };

const create = async (
  container: HTMLElement,
): Promise<MapboxMap | null> => {
  let map: MapboxMap;
  try {
    const mapboxgl = await loadMapboxGl();
    if (!mapboxgl) return null;

    styleUrl = getMapboxStyle();
    map = new mapboxgl.Map({
      container,
      accessToken: getMapboxToken(),
      style: styleUrl,
      // Stated rather than defaulted, so the stylesheet does not get to
      // move the camera when it loads -- see START above.
      ...START,
      // Set at construction: changing projection later restyles the
      // whole map, and the globe is never not the projection.
      projection: { name: 'globe' },
      attributionControl: false,
      // A globe needs to zoom out past the old style's minZoom: 7.
      minZoom: 0,
      /*
       * And it must not zoom IN past the point where Standard stops
       * painting water in the colour this theme asked for. That is a
       * measured property of the style rather than a preference, so the
       * number and its derivation live with the rest of the cartography
       * -- see CARTOGRAPHY_MAX_ZOOM.
       */
      maxZoom: CARTOGRAPHY_MAX_ZOOM,
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
  for (const sub of [...globeSubs]) attachGlobe(map, sub);

  map.once('style.load', () => {
    setStatus('ready');
    // Before the first flush, so the report names the style rather than
    // whichever call happened to be the last one to do nothing.
    checkColorTheme(map);
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
  /*
   * FAILURE BEFORE style.load IS PROVISIONAL, NOT TERMINAL.
   *
   * Two orderings in mapbox 3.30 make that necessary, and the design
   * used to assume neither could happen:
   *
   *   Imports. Style._load does `_loadImports(...).catch(e => { fire
   *   ErrorEvent; fire style.load; })` -- error and THEN style.load,
   *   synchronously. The app's style always has an import, because
   *   setConfigProperty('basemap', ...) resolves through it.
   *
   *   Sources. _loaded is set and every source begins fetching its
   *   TileJSON before style.load fires, so one 401 on one tileset
   *   arrives during 'loading' carrying a sourceId -- the very shape
   *   that is routine a moment later.
   *
   * So a source-level failure here is not fatal at all, and even a
   * style-level one only means "no style YET". style.load still decides,
   * and it sets 'ready' whatever came before -- which is why SceneRoot
   * must be able to come back from its plate rather than treating
   * 'failed' as the end.
   */
  map.on('error', (event: unknown) => {
    if (status !== 'loading') {
      reportMapboxError(event);
      return;
    }
    const { error, sourceId } = (event ?? {}) as MapboxErrorEvent;
    const message = error?.message ?? 'unknown error';
    if (sourceId !== undefined) {
      const line = `mapbox source ${sourceId} failed while loading: ${message}`;
      record(line);
      console.warn(`[scene] ${line}`);
      return;
    }
    setStatus('failed');
    const line = `mapbox style failed: ${message}`;
    record(line);
    // Warn, not error: the scene has gone to 'failed' and the plate is
    // up, so this is handled rather than silent -- and style.load may
    // still arrive and take it back.
    console.warn(`[scene] ${line}`);
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
 * THE CAMERA WAITS FOR THE STYLE, like everything else, and the reason is
 * not the one the rest of this module has.
 *
 * easeTo is not guarded by Style._checkLoaded, so it does not throw on a
 * map that has no style yet. It does something worse: nothing, silently.
 * An easeTo is not a write, it is an ANIMATION, and it advances only on
 * the map's render frames -- of which a map with no stylesheet has none.
 * The move sits at t=0 until the style arrives, and mapbox drops it on
 * the way through: `isEasing()` goes false with the transform still at
 * its constructed default.
 *
 * SceneRoot sets its state to 'live' when the map OBJECT exists, not when
 * the style has loaded -- deliberately, so the scene is not gated on a
 * network round trip -- so the first camera of the session races the
 * stylesheet. Whichever way that race went decided whether the globe was
 * where the route asked or sitting at [0, 0] zoom 0 for the life of the
 * tab, and it went the wrong way often. Measured: an easeTo issued at
 * 18ms against a style that arrived at 380ms ended with the zoom
 * unchanged at 0 and nothing reported anywhere.
 *
 * This is the second of two independent ways the hello camera was being
 * thrown away -- see the rotation loop's note below for the first -- and
 * between them they are most of what "the map is too small and in the
 * middle" was, underneath the framing this lane came to fix. Neither was
 * visible to any check that read the CAMERA TABLE rather than the painted
 * pixels, and every check there was read the table.
 *
 * Deferring costs nothing: flushOnce runs the move the instant the style
 * reports ready, in the same tick, and the route's own easing carries it
 * from the default the way it was always going to.
 */
export const applyCamera = (
  spec: CameraSpec,
  durationMs: number,
): void => {
  desired.camera = { spec, durationMs };
  requestFlush();
};

/**
 * The viewport is part of the want because the atmosphere is: the
 * design states its halo in globe RADII and mapbox decays its glow with
 * an ANGLE, so the conversion needs the sphere's angular radius, which
 * is a function of the zoom AND the height. See fogFor in scene/theme.ts.
 */
export const applyFog = (
  spec: CameraSpec,
  palette: Palette,
  viewport: Viewport | null,
): void => {
  desired.fog = { spec, palette, viewport };
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
 * Tier 1: the Standard import's own knobs, structural and cartographic.
 * No tile reload -- which is the whole reason the cartography lives here
 * rather than in a colour theme. See scene/theme.ts.
 */
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
/** Degrees of centre longitude per second, or null for a still globe. */
let spin: number | null = null;
/** When the spin last advanced, on performance.now()'s clock. */
let spinAt = 0;

/*
 * ONE DIAL, WHERE THERE USED TO BE TWO.
 *
 * This loop also walked a three-step `line-dasharray` along whatever
 * layers setAnimation was handed, which read as a dash travelling up the
 * work path. That path was the prototype's illustration of a mid band
 * rather than content (see the note at the top of scene/layers/sets.ts),
 * WORK_PATH_DASH was the only dash layer the app ever had, and the list
 * SceneRoot passed was literally `[WORK_PATH_DASH]` -- so with the layer
 * set gone the whole mechanism had no layer to write to and no caller to
 * turn it on. It is out rather than idling: `dash`, `dashLayers`,
 * `dashStep`, the branch here, the two extra parameters on setAnimation,
 * and `dashRuns` in scene/camera.ts, which existed only to fill one of
 * them.
 */

/*
 * A frame that arrives late must turn the globe further, not slower.
 *
 * The rotation used to be a fixed step per rAF callback, which makes the
 * rate a property of the DISPLAY: 60Hz and 120Hz turned at different
 * speeds, and a loaded frame simply lost its share of the turn. The
 * headless runner this suite uses renders the globe at 6-11fps, and
 * measured there, "one revolution per four minutes" was turning at one
 * revolution per SIX HOURS.
 *
 * So the step is the rate times the ELAPSED MILLISECONDS, and `spinAt`
 * is moved forward on every tick whether or not the tick wrote anything.
 * That second half is what keeps the yield below from becoming a debt: a
 * flight that owns the transform for 800ms must not be followed by 800ms
 * of rotation applied in one jump.
 *
 * A tab in the background stops getting frames altogether, so the first
 * tick after it comes back can be minutes late. SPIN_MAX_STEP_MS bounds
 * that to a step nobody can see -- it is far longer than any real frame,
 * so it never throttles a slow display, it only refuses an absurd one.
 */
const SPIN_MAX_STEP_MS = 1_000;

/*
 * THE SPIN MUST NOT WRITE WHILE THE CAMERA IS FLYING, and this is the
 * whole reason a route change never arrived anywhere.
 *
 * `map.setCenter(c)` is not a centre setter, any more than
 * `map.setBearing(b)` was a bearing setter. It is `jumpTo({ center: c })`,
 * and jumpTo opens with `this._stop(...)` -- which cancels whatever
 * easeTo is in flight, wherever it had got to.
 * So on every route whose resting camera spins (hello, and the 404), the
 * scene issued its 800ms flight, this loop took the very next frame, and
 * the flight died about one frame in. The map then sat at the previous
 * route's camera for the life of the tab, because nothing ever asked
 * again: SceneRoot had recorded the move as made.
 *
 * That is exactly what going back to `/` looked like -- the globe stayed
 * wherever /projects or /about had left it -- and it is also why a cold
 * load of `/` came up near [0, 0] at zoom 0.1 instead of Portland: the
 * flight from the map's constructed default was stopped the same way.
 *
 * The fix is not to move the camera harder. `isEasing()` is true for
 * exactly as long as a camera animation owns the transform, so the spin
 * simply yields to it and picks up from wherever the flight landed. The
 * loop keeps ticking throughout -- it is rearmed below regardless of
 * whether it wrote -- so nothing has to rearm it when the flight ends.
 */
const tick = (): void => {
  frame = 0;
  if (!instance) return;
  const now = performance.now();
  const since = Math.min(now - spinAt, SPIN_MAX_STEP_MS);
  spinAt = now;
  /*
   * THE EARTH TURNS ON ITS AXIS, which is a walk of the CENTRE MERIDIAN
   * and not a roll of the bearing.
   *
   * The prototype's `orbit()` is the spec and it is unambiguous: `rot`
   * enters the projection as `a = (lon - centerLon - rot)`, so the centre
   * meridian advances EAST and a fixed place slides toward smaller screen
   * x -- left. mapbox's globe draws a place east of the centre to its
   * right, so adding to `center.lng` reproduces exactly that. The bearing
   * this used to turn does something else entirely: at pitch 0 it rotates
   * the sphere about the screen's view axis, poles and all, and a place
   * at the projection centre does not move at all.
   * e2e/hermetic/globe-spin.spec.ts measures both the rate and where a
   * fixed lat/lng lands, because a sign in the camera table is not the
   * same claim and stayed green through all of this.
   *
   * Both dials wait for a style. Spin did not, so a route with a rotating
   * globe kept writing the camera of a dead one for the life of the tab
   * -- behind the fallback plate, where nothing showed it.
   *
   * AND SPIN WAITS FOR THE FLIGHT, which is the second half of the same
   * mistake and by far the worse one. Every camera setter on a Map is
   * `jumpTo` underneath -- `setCenter` as much as `setBearing` -- and
   * mapbox's `jumpTo` OPENS WITH `this.stop()`, so every frame of the
   * rotation cancelled whatever easeTo was in progress. On the two routes
   * that spin, that is the route's own camera move: the hello globe was
   * stopped about 8% into its 800ms flight by the first spin frame after
   * it started, and sat for the life of the tab at zoom 0.18 of the 2.2
   * it was flying to, drawn around a projection centre 38px into a 461px
   * offset. Measured, either way, in e2e/hermetic/globe-frame.spec.ts.
   *
   * Nothing showed it because every local check falls through to the
   * fallback plate, and because a globe stopped at the wrong zoom is
   * still a globe. It reads as "the map is too small and in the middle",
   * which is exactly what it was.
   *
   * Holding off while the camera is easing costs nothing: easeTo is
   * carrying the centre to the route's own resting value anyway, so a
   * rotation applied during the flight has no meaning. It also leaves a
   * user's inertial pan alone, which went the same way for the same
   * reason.
   */
  if (spin !== null && status === 'ready' && !instance.isEasing()) {
    const { lng, lat } = instance.getCenter();
    instance.setCenter([wrapLng(lng + (spin * since) / 1_000), lat]);
  }
  if (spin !== null) frame = requestAnimationFrame(tick);
};

/**
 * One loop for the whole scene, started and stopped by what the route
 * asks for. Reduced motion resolves the rotation to null in
 * scene/camera.ts, so under it this never starts.
 */
export const setAnimation = (spinRate: number | null): void => {
  spin = spinRate;
  /*
   * The clock restarts here rather than carrying on from whenever the
   * loop last ran. A scene that has been still for a minute -- reduced
   * motion, or a route that does not turn -- must not open with a minute
   * of rotation the moment one does.
   */
  spinAt = performance.now();
  if (frame !== 0) return;
  if (spin === null) return;
  frame = requestAnimationFrame(tick);
};

/** Test-only: forgets the instance so a fresh one can be built. */
export const resetMapForTests = (): void => {
  if (frame !== 0) cancelAnimationFrame(frame);
  frame = 0;
  spin = null;
  spinAt = 0;
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
  for (const sub of [...globeSubs]) sub.detach();
  globeSubs.clear();
  styleUrl = '';
  colorThemeSupported = null;
  wantedTerrain = null;
  appliedTerrain = null;
  waitingForDem = false;
  lastAction = 'none';
  passes = 0;
  sceneErrors.length = 0;
  if (typeof window !== 'undefined') delete window.__SCENE__;
};
