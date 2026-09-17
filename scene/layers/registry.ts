import type {
  LayerInteraction,
  LayerSet,
  SceneMap,
} from 'scene/layers/types';
import type { Palette } from 'styles/tokens/palette';

/*
 * The diff, and the handler registry.
 *
 * Two hazards, both named in the codebase inventory's list of obstacles to
 * one persistent map:
 *
 *   - double-adding a layer, because the map outlives the route;
 *   - a handler registered twice, or never removed, because `map.on` has
 *     no record of who asked for it.
 *
 * Both are closed structurally rather than by care. `mount` is private and
 * is only ever reached from `sync`, which calls it only for a set id that
 * is not in `mounted` -- so a second add is not something to remember not
 * to do, it is unreachable. And every `map.on` goes through this file,
 * which records the exact (type, layer, handler) triple it passed, so
 * `offAll` can pass the same triple back. A handler that is not in the
 * record was never registered.
 */

type MountedSet = {
  sources: string[];
  layers: string[];
  interactions: LayerInteraction[];
};

const bind = (
  map: SceneMap,
  method: 'on' | 'off',
  it: LayerInteraction,
): void => {
  if (it.layer === undefined) map[method](it.type, it.handler);
  else map[method](it.type, it.layer, it.handler);
};

export type LayerRegistry = {
  /** Mounts every set in `sets` that is not mounted, unmounts the rest. */
  sync: (map: SceneMap, sets: LayerSet[]) => void;
  /** Theming tier 3, over the mounted sets only. */
  repaint: (
    map: SceneMap,
    sets: LayerSet[],
    palette: Palette,
  ) => void;
  /** Removes one set's handlers, layers and sources. */
  unmount: (map: SceneMap, setId: string) => void;
  /** Removes one set's handlers and nothing else. */
  offAll: (map: SceneMap, setId: string) => void;
  mountedIds: () => string[];
  isMounted: (setId: string) => boolean;
};

export const createLayerRegistry = (): LayerRegistry => {
  const mounted = new Map<string, MountedSet>();

  const mount = (map: SceneMap, set: LayerSet): void => {
    for (const source of set.sources) {
      if (!map.getSource(source.id)) {
        map.addSource(source.id, source.spec);
      }
    }
    for (const layer of set.layers) {
      if (!map.getLayer(layer.id)) map.addLayer(layer);
    }
    for (const interaction of set.interactions) {
      bind(map, 'on', interaction);
    }
    mounted.set(set.id, {
      sources: set.sources.map((source) => source.id),
      layers: set.layers.map((layer) => layer.id),
      interactions: [...set.interactions],
    });
  };

  const offAll = (map: SceneMap, setId: string): void => {
    const entry = mounted.get(setId);
    if (!entry) return;
    for (const interaction of entry.interactions) {
      bind(map, 'off', interaction);
    }
    // Emptied rather than kept: a second offAll must not double-off, and
    // an unmount that follows must not either.
    entry.interactions = [];
  };

  const unmount = (map: SceneMap, setId: string): void => {
    const entry = mounted.get(setId);
    if (!entry) return;
    offAll(map, setId);
    // Layers go before their sources, and in reverse so a layer drawn
    // above another is removed first.
    for (const id of [...entry.layers].reverse()) {
      if (map.getLayer(id)) map.removeLayer(id);
    }
    for (const id of entry.sources) {
      if (map.getSource(id)) map.removeSource(id);
    }
    mounted.delete(setId);
  };

  const sync = (map: SceneMap, sets: LayerSet[]): void => {
    const wanted = new Set(sets.map((set) => set.id));
    for (const id of [...mounted.keys()]) {
      if (!wanted.has(id)) unmount(map, id);
    }
    for (const set of sets) {
      if (!mounted.has(set.id)) mount(map, set);
    }
  };

  const repaint = (
    map: SceneMap,
    sets: LayerSet[],
    palette: Palette,
  ): void => {
    for (const set of sets) {
      if (!mounted.has(set.id)) continue;
      for (const patch of set.paint(palette)) {
        if (!map.getLayer(patch.layer)) continue;
        map.setPaintProperty(
          patch.layer,
          patch.property,
          patch.value,
        );
      }
    }
  };

  return {
    sync,
    repaint,
    unmount,
    offAll,
    mountedIds: () => [...mounted.keys()],
    isMounted: (setId) => mounted.has(setId),
  };
};
