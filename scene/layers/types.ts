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
   * Theming tier 3: our own layers, repainted straight from the palette.
   * The same patches build the layers' initial paint, so there is one
   * source of truth for a colour rather than two that can drift.
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
