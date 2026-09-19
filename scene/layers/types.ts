import type { Palette } from 'styles/tokens/palette';

/*
 * The layer-set model.
 *
 * The old map added its three layers once, on the map's 'load' event, and
 * registered every mousemove/mouseleave/click in the same function. That
 * worked only because the map was destroyed on every route change. A
 * persistent map needs the opposite: layers that come and go with the
 * route, and a teardown that is total -- because a handler left behind is
 * a hover effect firing on a route that has no hover.
 *
 * So a route does not "add layers". It names a list of LayerSets, and
 * SceneRoot diffs that list against what is mounted. Everything a set
 * owns -- its sources, its layers, its handlers -- is declared in one
 * object, which is what makes `offAll(setId)` able to be total.
 */

/** A mapbox-gl event listener, from this module's point of view. */
export type SceneListener = (event: unknown) => void;

/**
 * One map event a set listens for.
 *
 * DYNAMIC, like `paint` and unlike `layers`. The registry binds a stable
 * forwarder once and re-points it at the newest `handler` on every sync,
 * so a handler that closes over route state -- a selected stop, a
 * hovered anchor -- is refreshed rather than frozen at mount. Without
 * that indirection this would be a third place for the bug that put the
 * about route's ring selection in a layer `filter`: correct in the
 * declaration, ignored by the map, and invisible to any test that
 * compares the declaration rather than calling what is bound.
 *
 * The (type, layer) pair identifies the binding across syncs. Changing
 * it is allowed and rebinds; changing only the handler does not.
 */
export type LayerInteraction = {
  /** 'mousemove', 'mouseleave', 'click', ... */
  type: string;
  /** Scopes the listener to one layer; omitted binds it map-wide. */
  layer?: string;
  handler: SceneListener;
};

export type SourceEntry = {
  id: string;
  spec: Record<string, unknown>;
};

/**
 * A layer, as it is handed to addLayer.
 *
 * This is STRUCTURE, and it is read exactly once -- at mount. `sync`
 * skips the sources and layers of a set whose id is already mounted, so
 * nothing here is ever re-applied while the route lives. A `filter` is
 * therefore only allowed to express something permanent about a layer
 * (the work path's home point is always Portland); anything that varies
 * with route state -- a selection, a hover, a viewport -- belongs in
 * `paint`, which repaint re-applies. Putting selection in a filter is
 * silently a no-op after the first mount, which is exactly how the about
 * route's ring came to be stuck on whichever stop was selected when the
 * route was entered.
 *
 * `sources` and `layers` are the whole of the static half. `paint` and
 * `interactions` are both refreshed on every sync, so a handler may
 * close over route state as freely as a paint expression may name it.
 */
export type LayerEntry = { id: string } & Record<string, unknown>;

/** One setPaintProperty call, as data. */
export type PaintPatch = {
  layer: string;
  property: string;
  value: unknown;
};

export type LayerSet = {
  /** Unique across every set. The diff key, and the handler-registry key. */
  id: string;
  sources: SourceEntry[];
  layers: LayerEntry[];
  interactions: LayerInteraction[];
  /**
   * Theming tier 3, and the set's only dynamic half: our own layers
   * repainted straight from the palette, and re-applied on every route,
   * hover, selection and theme change. The same patches build each
   * layer's initial paint, so there is one source of truth for a value
   * rather than two that can drift.
   */
  paint: (palette: Palette) => PaintPatch[];
};

/**
 * The slice of mapbox-gl's Map the layer code uses.
 *
 * It exists so the registry can be unit-tested against a plain object.
 * mapbox-gl's own Map satisfies it structurally; nothing here imports
 * mapbox-gl, which is also what keeps scene/layers out of the
 * coverage-excluded scene/mapbox tree.
 */
export type SceneMap = {
  getLayer: (id: string) => unknown;
  getSource: (id: string) => unknown;
  addSource: (id: string, spec: unknown) => unknown;
  addLayer: (layer: LayerEntry) => unknown;
  removeLayer: (id: string) => unknown;
  removeSource: (id: string) => unknown;
  setPaintProperty: (
    layer: string,
    property: string,
    value: unknown,
  ) => unknown;
  on: (...args: unknown[]) => unknown;
  off: (...args: unknown[]) => unknown;
};
