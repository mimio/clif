import type {
  LayerInteraction,
  LayerSet,
  SceneListener,
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

/*
 * A bound interaction.
 *
 * `bound` is what the map holds, and it never changes for the life of
 * the mount. `current` is what it forwards to, and it is replaced on
 * every sync.
 *
 * That indirection is the point. Handlers are declared inside the set
 * builders, so they close over the route's options -- and mount() binds
 * once while sync() skips a set that is already mounted. A handler that
 * closed over route state would therefore go stale exactly the way the
 * about route's ring did when its selection lived in a layer `filter`:
 * correct in the declaration, ignored by the map. Refreshing the target
 * costs one indirection and makes that whole class unreachable, so
 * interactions are dynamic like paint rather than structure like layers.
 */
type MountedInteraction = {
  type: string;
  layer?: string;
  /** Held by the map; stable for the life of the mount. */
  bound: SceneListener;
  /** Where it forwards; replaced on every sync. */
  current: SceneListener;
};

type MountedSet = {
  sources: string[];
  layers: string[];
  interactions: MountedInteraction[];
};

const slotFor = (it: LayerInteraction): MountedInteraction => {
  const slot: MountedInteraction = {
    type: it.type,
    layer: it.layer,
    current: it.handler,
    bound: (event: unknown) => slot.current(event),
  };
  return slot;
};

const bind = (
  map: SceneMap,
  method: 'on' | 'off',
  slot: MountedInteraction,
): void => {
  if (slot.layer === undefined) map[method](slot.type, slot.bound);
  else map[method](slot.type, slot.layer, slot.bound);
};

/** What the map is listening for, as a comparable shape. */
const shapeOf = (slots: { type: string; layer?: string }[]): string =>
  slots.map((slot) => `${slot.type}|${slot.layer ?? ''}`).join();

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
    const interactions = set.interactions.map(slotFor);
    for (const slot of interactions) bind(map, 'on', slot);
    mounted.set(set.id, {
      sources: set.sources.map((source) => source.id),
      layers: set.layers.map((layer) => layer.id),
      interactions,
    });
  };

  /**
   * Points a mounted set's handlers at the incoming declaration, so a
   * handler can close over route state without going stale. Rebinds
   * outright if the set is listening for something different now, which
   * a set builder does not do today but is not forbidden from doing.
   */
  const refresh = (
    map: SceneMap,
    entry: MountedSet,
    set: LayerSet,
  ): void => {
    if (shapeOf(entry.interactions) === shapeOf(set.interactions)) {
      set.interactions.forEach((it, at) => {
        entry.interactions[at].current = it.handler;
      });
      return;
    }
    for (const slot of entry.interactions) bind(map, 'off', slot);
    entry.interactions = set.interactions.map(slotFor);
    for (const slot of entry.interactions) bind(map, 'on', slot);
  };

  const offAll = (map: SceneMap, setId: string): void => {
    const entry = mounted.get(setId);
    if (!entry) return;
    for (const slot of entry.interactions) bind(map, 'off', slot);
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
      const entry = mounted.get(set.id);
      if (entry) refresh(map, entry, set);
      else mount(map, set);
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
