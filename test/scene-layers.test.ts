import { describe, expect, it, vi } from 'vitest';
import { type AnchorId, anchors } from 'content/anchors';
import { historyStops } from 'content/history';
import { projectsList } from 'content/projects';
import {
  greatCircle,
  lineString,
  type Point,
  pointCollection,
  WORK_PATH_BOW,
  WORK_PATH_SEGMENTS,
} from 'scene/layers/geo';
import { createLayerRegistry } from 'scene/layers/registry';
import {
  ALBANY,
  anchorFromEvent,
  HISTORY_LABELS,
  HISTORY_LINE,
  HISTORY_POINTS,
  HISTORY_RING,
  HISTORY_SET,
  layerSetsFor,
  type LayerSetOptions,
  PROJECT_SITES_SET,
  projectSites,
  SITE_COUNTS,
  SITE_LABELS,
  SITE_POINTS,
  WORK_CITY_POINTS,
  WORK_HOME_POINT,
  WORK_PATH_DASH,
  WORK_PATH_LINE,
  WORK_PATH_SET,
} from 'scene/layers/sets';
import type {
  LayerSet,
  PaintPatch,
  SceneListener,
  SceneMap,
} from 'scene/layers/types';
import { FALLBACK_PALETTE, makePalette } from 'styles/tokens/palette';

/* ---- a map that is only a record of what was asked of it -------------- */

type FakeMap = SceneMap & {
  sources: Map<string, unknown>;
  layers: Map<string, unknown>;
  /** Every live (type, layer, handler) triple. */
  bound: string[];
  paints: [string, string, unknown][];
  /** Dispatches to whatever is bound for (type, layer) right now. */
  fire: (type: string, layer?: string) => void;
};

const key = (args: unknown[]): string =>
  args.map((arg) => String(arg)).join('|');

const fakeMap = (): FakeMap => {
  const sources = new Map<string, unknown>();
  const layers = new Map<string, unknown>();
  const bound: string[] = [];
  const paints: [string, string, unknown][] = [];
  // Recording a binding is not enough to see a stale handler: the map has
  // to be able to call the one it is actually holding.
  const live: { type: string; layer?: string; fn: SceneListener }[] =
    [];

  return {
    sources,
    layers,
    bound,
    paints,
    fire: (type, layer) => {
      for (const entry of [...live]) {
        if (entry.type !== type || entry.layer !== layer) continue;
        entry.fn(undefined);
      }
    },
    getSource: (id) => sources.get(id),
    getLayer: (id) => layers.get(id),
    addSource: (id, spec) => sources.set(id, spec),
    addLayer: (entry) => layers.set(entry.id, entry),
    removeSource: (id) => sources.delete(id),
    removeLayer: (id) => layers.delete(id),
    setPaintProperty: (layer, property, value) =>
      paints.push([layer, property, value]),
    on: (...args) => {
      bound.push(key(args));
      live.push({
        type: args[0] as string,
        layer: args.length > 2 ? (args[1] as string) : undefined,
        fn: args[args.length - 1] as SceneListener,
      });
    },
    off: (...args) => {
      const at = bound.indexOf(key(args));
      // -1 would mean an off with no matching on: the registry must never
      // produce one, and splice(-1) would silently drop the wrong entry.
      expect(at).toBeGreaterThanOrEqual(0);
      bound.splice(at, 1);
      const fn = args[args.length - 1] as SceneListener;
      const found = live.findIndex((entry) => entry.fn === fn);
      if (found >= 0) live.splice(found, 1);
    },
  };
};

const options = (
  overrides: Partial<LayerSetOptions> = {},
): LayerSetOptions => ({
  palette: FALLBACK_PALETTE,
  hover: null,
  labels: true,
  selectedStop: null,
  dash: true,
  onHoverAnchor: vi.fn(),
  onSelectAnchor: vi.fn(),
  ...overrides,
});

const set = (
  id: string,
  interactions: LayerSet['interactions'] = [],
): LayerSet => ({
  id,
  sources: [{ id: `${id}-src`, spec: { type: 'geojson' } }],
  layers: [
    { id: `${id}-a`, type: 'circle', source: `${id}-src` },
    { id: `${id}-b`, type: 'symbol', source: `${id}-src` },
  ],
  interactions,
  paint: () => [
    { layer: `${id}-a`, property: 'circle-color', value: '#fff' },
  ],
});

/* ---- geometry --------------------------------------------------------- */

describe('great-circle geometry', () => {
  const path = greatCircle(ALBANY, anchors.portland.center);

  it('samples the arc at the artboard resolution', () => {
    expect(path).toHaveLength(WORK_PATH_SEGMENTS + 1);
  });

  it('starts and ends exactly on its endpoints', () => {
    expect(path[0]).toEqual(ALBANY);
    expect(path[path.length - 1]).toEqual(anchors.portland.center);
  });

  it('bows the arc a further 3.5 degrees at the midpoint', () => {
    const at = WORK_PATH_SEGMENTS / 2;
    const flat = greatCircle(
      ALBANY,
      anchors.portland.center,
      WORK_PATH_SEGMENTS,
      0,
    );
    // The great circle already rides north of the chord; the bow is the
    // design's extra lift on top of it.
    const chord = (ALBANY[1] + anchors.portland.center[1]) / 2;
    expect(flat[at][1]).toBeGreaterThan(chord);
    expect(path[at][1] - flat[at][1]).toBeCloseTo(WORK_PATH_BOW, 6);
  });

  it('stays on the sphere rather than cutting across it', () => {
    // A great circle between two mid-latitude points is north of the
    // straight interpolation everywhere, bow aside.
    const flat = (k: number): number =>
      ALBANY[1] + (anchors.portland.center[1] - ALBANY[1]) * k;
    for (let i = 1; i < WORK_PATH_SEGMENTS; i += 1) {
      expect(path[i][1]).toBeGreaterThan(
        flat(i / WORK_PATH_SEGMENTS),
      );
    }
  });

  it('degenerates linearly when both ends are the same point', () => {
    const none = greatCircle(ALBANY, ALBANY, 4, 0);
    expect(none).toHaveLength(5);
    for (const point of none) {
      expect(point[0]).toBeCloseTo(ALBANY[0], 6);
      expect(point[1]).toBeCloseTo(ALBANY[1], 6);
    }
  });

  it('wraps coordinates into GeoJSON', () => {
    const coordinates: Point[] = [
      [0, 0],
      [1, 1],
    ];
    expect(lineString(coordinates)).toEqual({
      type: 'Feature',
      properties: {},
      geometry: { type: 'LineString', coordinates },
    });
    expect(
      pointCollection([{ center: [2, 3], properties: { a: 1 } }]),
    ).toEqual({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { a: 1 },
          geometry: { type: 'Point', coordinates: [2, 3] },
        },
      ],
    });
  });
});

/* ---- the registry ----------------------------------------------------- */

describe('the layer registry', () => {
  it('mounts a set once, with its sources and layers', () => {
    const map = fakeMap();
    const registry = createLayerRegistry();
    registry.sync(map, [set('one')]);

    expect(registry.mountedIds()).toEqual(['one']);
    expect(registry.isMounted('one')).toBe(true);
    expect([...map.sources.keys()]).toEqual(['one-src']);
    expect([...map.layers.keys()]).toEqual(['one-a', 'one-b']);
  });

  it('does not add a layer twice when the same set is synced again', () => {
    const map = fakeMap();
    const registry = createLayerRegistry();
    const added = vi.spyOn(map, 'addLayer');
    registry.sync(map, [set('one')]);
    registry.sync(map, [set('one')]);
    registry.sync(map, [set('one')]);
    expect(added).toHaveBeenCalledTimes(2);
  });

  it('adds what the route wants and removes what it does not', () => {
    const map = fakeMap();
    const registry = createLayerRegistry();
    registry.sync(map, [set('one')]);
    registry.sync(map, [set('two'), set('three')]);

    expect(registry.mountedIds()).toEqual(['two', 'three']);
    expect(registry.isMounted('one')).toBe(false);
    expect([...map.layers.keys()]).toEqual([
      'two-a',
      'two-b',
      'three-a',
      'three-b',
    ]);
    expect([...map.sources.keys()]).toEqual(['two-src', 'three-src']);
  });

  it('skips a source or layer something else already owns', () => {
    const map = fakeMap();
    const registry = createLayerRegistry();
    map.addSource('one-src', { type: 'geojson' });
    map.addLayer({ id: 'one-a', type: 'circle' });
    const addSource = vi.spyOn(map, 'addSource');
    const addLayer = vi.spyOn(map, 'addLayer');
    registry.sync(map, [set('one')]);
    expect(addSource).not.toHaveBeenCalled();
    expect(addLayer).toHaveBeenCalledTimes(1);

    /*
     * And does not take them away again on the way out. Skipping the add
     * while recording the id anyway made unmount remove whatever the
     * other owner had put there -- the guard was asserted, the removal
     * never was.
     */
    registry.sync(map, []);
    expect(map.sources.has('one-src')).toBe(true);
    expect(map.layers.has('one-a')).toBe(true);
    // Its own layer is gone, though.
    expect(map.layers.has('one-b')).toBe(false);
  });

  it('leaves a shared source alone until its last owner goes', () => {
    const map = fakeMap();
    const registry = createLayerRegistry();
    const shared = (id: string): LayerSet => ({
      ...set(id),
      sources: [{ id: 'shared-src', spec: { type: 'geojson' } }],
      layers: [
        { id: `${id}-a`, type: 'circle', source: 'shared-src' },
      ],
    });

    registry.sync(map, [shared('one'), shared('two')]);
    expect(map.sources.has('shared-src')).toBe(true);

    // 'two' never added it, so unmounting 'two' must not remove it --
    // real mapbox refuses anyway, with "cannot be removed while layer
    // ... is using it", and the registry would have deleted its record.
    registry.sync(map, [shared('one')]);
    expect(map.sources.has('shared-src')).toBe(true);
    expect(map.layers.has('one-a')).toBe(true);

    registry.sync(map, []);
    expect(map.sources.has('shared-src')).toBe(false);
  });

  it('survives a layer the style dropped underneath it', () => {
    const map = fakeMap();
    const registry = createLayerRegistry();
    registry.sync(map, [set('one')]);
    map.removeLayer('one-a');
    map.removeSource('one-src');
    expect(() => registry.sync(map, [])).not.toThrow();
    expect(registry.mountedIds()).toEqual([]);
  });

  it('ignores an unmount or an offAll for a set it never had', () => {
    const map = fakeMap();
    const registry = createLayerRegistry();
    registry.unmount(map, 'ghost');
    registry.offAll(map, 'ghost');
    expect(registry.mountedIds()).toEqual([]);
  });
});

describe('the handler registry', () => {
  const handler: SceneListener = vi.fn();
  const scoped = { type: 'mousemove', layer: 'one-a', handler };
  const global = { type: 'click', handler };

  it('binds layer-scoped and map-wide handlers', () => {
    const map = fakeMap();
    const registry = createLayerRegistry();
    registry.sync(map, [set('one', [scoped, global])]);
    expect(map.bound).toHaveLength(2);
  });

  it('removes every handler it registered, and only those', () => {
    const map = fakeMap();
    const registry = createLayerRegistry();
    map.on('zoom', handler);
    registry.sync(map, [set('one', [scoped, global])]);
    registry.sync(map, []);
    // The one binding left is the one the registry never made.
    expect(map.bound).toHaveLength(1);
  });

  it('is total: teardown is idempotent and never double-offs', () => {
    const map = fakeMap();
    const registry = createLayerRegistry();
    registry.sync(map, [set('one', [scoped, global])]);
    registry.offAll(map, 'one');
    // A second offAll would throw inside the fake map if the registry
    // still believed it had handlers to remove.
    registry.offAll(map, 'one');
    registry.unmount(map, 'one');
    expect(map.bound).toEqual([]);
  });

  it('re-binds after a remount rather than losing the handlers', () => {
    const map = fakeMap();
    const registry = createLayerRegistry();
    registry.sync(map, [set('one', [scoped])]);
    registry.sync(map, []);
    registry.sync(map, [set('one', [scoped])]);
    expect(map.bound).toHaveLength(1);
  });
});

/*
 * The third slot the ring bug could have moved into.
 *
 * mount() binds handlers once and sync() skips a mounted set, so a
 * handler closing over route state would go stale exactly the way a
 * selection in a layer `filter` did: right in the declaration, ignored
 * by the map. Comparing (type, layer) between syncs cannot see that --
 * the shape is identical and the closure is wrong -- so the registry
 * points the binding at the newest handler instead.
 */
describe('interactions follow the newest declaration', () => {
  const withHandler = (
    id: string,
    handler: SceneListener,
  ): LayerSet =>
    set(id, [{ type: 'click', layer: `${id}-a`, handler }]);

  it('calls the handler the latest sync declared, not the first', () => {
    const map = fakeMap();
    const registry = createLayerRegistry();
    const first = vi.fn();
    const second = vi.fn();

    registry.sync(map, [withHandler('one', first)]);
    registry.sync(map, [withHandler('one', second)]);

    // One binding still, pointed somewhere new.
    expect(map.bound).toHaveLength(1);
    map.fire('click', 'one-a');
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('refreshes a map-wide handler too, not just a scoped one', () => {
    const map = fakeMap();
    const registry = createLayerRegistry();
    const first = vi.fn();
    const second = vi.fn();
    const mapWide = (handler: SceneListener): LayerSet =>
      set('one', [{ type: 'click', handler }]);

    registry.sync(map, [mapWide(first)]);
    registry.sync(map, [mapWide(second)]);

    expect(map.bound).toHaveLength(1);
    map.fire('click');
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('survives a set that starts listening for something else', () => {
    const map = fakeMap();
    const registry = createLayerRegistry();
    const clicked = vi.fn();
    const hovered = vi.fn();

    registry.sync(map, [withHandler('one', clicked)]);
    registry.sync(map, [
      set('one', [
        { type: 'mousemove', layer: 'one-a', handler: hovered },
      ]),
    ]);

    expect(map.bound).toHaveLength(1);
    map.fire('click', 'one-a');
    expect(clicked).not.toHaveBeenCalled();
    map.fire('mousemove', 'one-a');
    expect(hovered).toHaveBeenCalledTimes(1);
  });

  it('still tears every binding down, refreshed or not', () => {
    const map = fakeMap();
    const registry = createLayerRegistry();
    registry.sync(map, [withHandler('one', vi.fn())]);
    registry.sync(map, [withHandler('one', vi.fn())]);
    registry.sync(map, []);
    expect(map.bound).toEqual([]);
  });
});

describe('repaint', () => {
  it('pushes the palette into the mounted sets', () => {
    const map = fakeMap();
    const registry = createLayerRegistry();
    const one = set('one');
    registry.sync(map, [one]);
    map.paints.length = 0;
    registry.repaint(map, [one], FALLBACK_PALETTE);
    expect(map.paints).toEqual([['one-a', 'circle-color', '#fff']]);
  });

  it('skips a set that is not mounted', () => {
    const map = fakeMap();
    const registry = createLayerRegistry();
    registry.repaint(map, [set('one')], FALLBACK_PALETTE);
    expect(map.paints).toEqual([]);
  });

  it('skips a layer that is no longer on the map', () => {
    const map = fakeMap();
    const registry = createLayerRegistry();
    const one = set('one');
    registry.sync(map, [one]);
    map.removeLayer('one-a');
    map.paints.length = 0;
    registry.repaint(map, [one], FALLBACK_PALETTE);
    expect(map.paints).toEqual([]);
  });
});

/* ---- the concrete sets ------------------------------------------------ */

describe('the route layer sets', () => {
  it('gives hello and 404 the work path', () => {
    for (const scene of ['hello', 'notFound'] as const) {
      expect(
        layerSetsFor(scene, options()).map((one) => one.id),
      ).toEqual([WORK_PATH_SET]);
    }
  });

  it('gives projects the site points and about the stops', () => {
    expect(
      layerSetsFor('projects', options()).map((one) => one.id),
    ).toEqual([PROJECT_SITES_SET]);
    expect(
      layerSetsFor('about', options()).map((one) => one.id),
    ).toEqual([HISTORY_SET]);
  });

  it('gives the held detail route nothing of its own', () => {
    expect(layerSetsFor('projectDetail', options())).toEqual([]);
  });

  it('mounts cleanly on a real diff between two routes', () => {
    const map = fakeMap();
    const registry = createLayerRegistry();
    registry.sync(map, layerSetsFor('hello', options()));
    registry.sync(map, layerSetsFor('projects', options()));
    registry.sync(map, layerSetsFor('projectDetail', options()));
    expect(map.layers.size).toBe(0);
    expect(map.sources.size).toBe(0);
    expect(map.bound).toEqual([]);
  });
});

/*
 * A tiny evaluator for the handful of mapbox expression forms the sets
 * use. String-matching an expression proves it mentions an id; running
 * it against the features the source actually carries proves the point
 * lights up -- which is the difference that let two of the six featured
 * rows hover dead for as long as they did.
 */
type Feature = {
  properties: Record<string, unknown>;
  geometry: { coordinates: [number, number] };
};

const evaluate = (expr: unknown, feature: Feature): unknown => {
  if (!Array.isArray(expr)) return expr;
  const [op, ...args] = expr as [string, ...unknown[]];
  switch (op) {
    case 'get':
      return feature.properties[args[0] as string];
    case '==':
      return (
        evaluate(args[0], feature) === evaluate(args[1], feature)
      );
    case 'case': {
      for (let at = 0; at + 1 < args.length; at += 2) {
        if (evaluate(args[at], feature)) {
          return evaluate(args[at + 1], feature);
        }
      }
      return evaluate(args[args.length - 1], feature);
    }
    case 'min':
      return Math.min(
        ...args.map((arg) => evaluate(arg, feature) as number),
      );
    case '+':
      return args.reduce<number>(
        (sum, arg) => sum + (evaluate(arg, feature) as number),
        0,
      );
    case '*':
      return args.reduce<number>(
        (product, arg) =>
          product * (evaluate(arg, feature) as number),
        1,
      );
    default:
      throw new Error(`no evaluator for ${op}`);
  }
};

const siteFeatures = (): Feature[] => {
  const source = layerSetsFor('projects', options())[0].sources.find(
    (one) => one.id === PROJECT_SITES_SET,
  );
  return (source?.spec.data as { features: Feature[] }).features;
};

const litFor = (
  hover: AnchorId | null,
  feature: Feature,
): unknown => {
  const patch = layerSetsFor('projects', options({ hover }))[0]
    .paint(FALLBACK_PALETTE)
    .find(
      (one) =>
        one.layer === SITE_POINTS && one.property === 'circle-color',
    );
  return evaluate(patch?.value, feature);
};

describe('the project sites', () => {
  it('collapses the three Colorado anchors into one point', () => {
    const sites = projectSites();
    const byName = Object.fromEntries(
      sites.map((site) => [site.name, site.count]),
    );
    expect(byName).toEqual({
      'Portland OR': 6,
      'San Francisco CA': 3,
      'Vail Valley CO': 3,
      'Cambridge MA': 1,
      'New York NY': 1,
    });
  });

  it('accounts for every project exactly once', () => {
    const total = projectSites().reduce(
      (sum, site) => sum + site.count,
      0,
    );
    expect(total).toBe(projectsList.length);
  });

  /*
   * Hover lighting is fully invertible, and "they differ" cannot see it.
   *
   * The previous version of this checked that the rest and lit colours
   * were not equal and that the lit expression mentioned the anchor. Both
   * stay true if the `case` arms are swapped -- hovering then DIMS the
   * city under the pointer and lights all the others -- and both stay true
   * if the 8px halo is inverted onto every city except the hovered one.
   * So the whole expression is read, arms and all.
   */
  it('lights the hovered anchor and dims nothing else', () => {
    const paintOf = (
      hover: LayerSetOptions['hover'],
      property: string,
    ) =>
      layerSetsFor('projects', options({ hover }))[0]
        .paint(FALLBACK_PALETTE)
        .find(
          (patch) =>
            patch.layer === SITE_POINTS &&
            patch.property === property,
        )?.value;

    // The lit arm is first, and it is the BRIGHTER of the two.
    expect(paintOf('cambridge', 'circle-color')).toEqual([
      'case',
      ['==', ['get', 'anchor'], 'cambridge'],
      'rgba(255, 229, 32, 1)',
      'rgba(255, 229, 32, 0.6)',
    ]);
    // The halo lands ON the hovered city, not on all the others.
    expect(paintOf('cambridge', 'circle-stroke-width')).toEqual([
      'case',
      ['==', ['get', 'anchor'], 'cambridge'],
      8,
      0,
    ]);

    // With nothing hovered the test matches no feature, so every city
    // takes the resting arm and no city wears a halo.
    expect(paintOf(null, 'circle-color')).toEqual([
      'case',
      ['==', ['get', 'anchor'], ''],
      'rgba(255, 229, 32, 1)',
      'rgba(255, 229, 32, 0.6)',
    ]);
    expect(paintOf(null, 'circle-stroke-width')).toEqual([
      'case',
      ['==', ['get', 'anchor'], ''],
      8,
      0,
    ]);
  });

  /*
   * The expression above is asserted literally, which proves what it
   * says but not that anything answers to it. Collapsing means a
   * project's anchor and the feature id it is drawn as differ for three
   * of the fourteen rows, and reading the expression cannot see that.
   * So these two run it against the features the source really carries.
   */
  it('lights one point, over the project, for every project', () => {
    const features = siteFeatures();
    expect(features).not.toHaveLength(0);

    for (const project of projectsList) {
      const home = anchors[project.anchor].center;
      // Which points change colour when this project is hovered, and
      // how far each one sits from where the project actually is. A
      // collapsed anchor still lights a point within a fifth of a
      // degree of itself; a missed one lights nothing at all.
      const lit = features
        .filter(
          (feature) =>
            litFor(project.anchor, feature) !== litFor(null, feature),
        )
        .map((feature) => [
          Math.abs(feature.geometry.coordinates[0] - home[0]) < 1 &&
            Math.abs(feature.geometry.coordinates[1] - home[1]) < 1,
        ]);
      expect({ anchor: project.anchor, lit }).toEqual({
        anchor: project.anchor,
        lit: [[true]],
      });
    }
  });

  it('draws the three Colorado anchors as the one valley point', () => {
    const features = siteFeatures();
    // Only one point stands in the valley, whatever its id is.
    const valleys = features.filter(
      (feature) =>
        feature.geometry.coordinates[0] > -108 &&
        feature.geometry.coordinates[0] < -105,
    );
    expect(valleys).toHaveLength(1);
    const valley = valleys[0];

    for (const anchor of [
      'vail',
      'beaverCreek',
      'wolcott',
    ] as const) {
      expect(litFor(anchor, valley)).toBe(
        litFor('beaverCreek', valley),
      );
      expect(litFor(anchor, valley)).not.toBe(litFor(null, valley));
    }
  });

  it('drops the labels below the tablet breakpoint', () => {
    const opacity = (labels: boolean) =>
      layerSetsFor('projects', options({ labels }))[0]
        .paint(FALLBACK_PALETTE)
        .find(
          (patch) =>
            patch.layer === SITE_LABELS &&
            patch.property === 'text-opacity',
        )?.value;
    expect(opacity(true)).toBe(1);
    expect(opacity(false)).toBe(0);
  });

  it('reads the anchor off a map event, and refuses a bad one', () => {
    expect(
      anchorFromEvent({
        features: [{ properties: { anchor: 'portland' } }],
      }),
    ).toBe('portland');
    expect(
      anchorFromEvent({
        features: [{ properties: { anchor: 'atlantis' } }],
      }),
    ).toBeNull();
    expect(anchorFromEvent({ features: [{}] })).toBeNull();
    expect(anchorFromEvent({ features: [] })).toBeNull();
    expect(anchorFromEvent({})).toBeNull();
    expect(anchorFromEvent(undefined)).toBeNull();
  });

  it('calls back with the anchor under the pointer', () => {
    const onHoverAnchor = vi.fn();
    const onSelectAnchor = vi.fn();
    const sites = layerSetsFor(
      'projects',
      options({ onHoverAnchor, onSelectAnchor }),
    )[0];
    const event = {
      features: [{ properties: { anchor: 'vail' } }],
    };
    const fire = (type: string, payload: unknown) =>
      sites.interactions
        .filter((one) => one.type === type)
        .forEach((one) => one.handler(payload));

    fire('mousemove', event);
    expect(onHoverAnchor).toHaveBeenCalledWith('vail');
    fire('mouseleave', {});
    expect(onHoverAnchor).toHaveBeenLastCalledWith(null);
    fire('click', event);
    expect(onSelectAnchor).toHaveBeenCalledWith('vail');
    // A click on nothing identifiable navigates nowhere.
    fire('click', {});
    expect(onSelectAnchor).toHaveBeenCalledTimes(1);
  });
});

describe('the work path and the history stops', () => {
  it('fades the dash out rather than removing the layer', () => {
    const opacity = (dash: boolean) =>
      layerSetsFor('hello', options({ dash }))[0]
        .paint(FALLBACK_PALETTE)
        .find(
          (patch) =>
            patch.layer === WORK_PATH_DASH &&
            patch.property === 'line-opacity',
        )?.value;
    expect(opacity(true)).toBe(1);
    expect(opacity(false)).toBe(0);
  });

  it('builds each layer with the paint its own patches describe', () => {
    const work = layerSetsFor('hello', options())[0];
    const patches = work.paint(FALLBACK_PALETTE);
    for (const entry of work.layers) {
      const paint = entry.paint as Record<string, unknown>;
      // Both directions. Deriving the expectation from the same array the
      // layer was built from can only fail if `layer()` drops something,
      // and its loop body is skipped entirely for a layer with no patches
      // at all -- which is exactly what a patch aimed at the wrong id
      // leaves behind. See "every patch lands on a layer that exists".
      expect(paint).toEqual(
        Object.fromEntries(
          patches
            .filter((one) => one.layer === entry.id)
            .map((one) => [one.property, one.value]),
        ),
      );
      expect(Object.keys(paint).length).toBeGreaterThan(0);
    }
  });

  /*
   * This used to derive the live stop from the data -- `end === null`,
   * the current job -- which lit Salesforce for ever and made the map the
   * one part of /about that ignored the selection. The live element is
   * whatever the route selected; see test/scene-view.test.tsx.
   */
  it('draws every stop, and derives no live one from the data', () => {
    const stops = layerSetsFor('about', options())[0];
    const source = stops.sources.find(
      (one) => one.id === HISTORY_SET,
    );
    const data = source?.spec.data as {
      features: { properties: Record<string, unknown> }[];
    };
    expect(data.features).toHaveLength(historyStops.length);
    expect(
      data.features.some((feature) => 'live' in feature.properties),
    ).toBe(false);
    expect(stops.layers.map((one) => one.id)).toContain(
      HISTORY_POINTS,
    );
  });

  it('hides the stop labels with the rest of the map type', () => {
    const opacity = (labels: boolean) =>
      layerSetsFor('about', options({ labels }))[0]
        .paint(FALLBACK_PALETTE)
        .find(
          (patch) =>
            patch.layer === HISTORY_LABELS &&
            patch.property === 'text-opacity',
        )?.value;
    expect(opacity(true)).toBe(1);
    expect(opacity(false)).toBe(0);
  });
});

/* ---- what the layers are actually painted with ------------------------ */

/*
 * A PaintPatch aimed at a layer that is not in the set is invisible.
 *
 * `repaint` skips a patch whose layer the map does not have, and `layer()`
 * builds a layer's initial paint by filtering the same array -- so a patch
 * retargeted at a typo'd id does not throw, does not warn and does not
 * show up in any diff of one against the other. The line mounts with
 * `paint: {}` and renders for ever as mapbox's default black hairline.
 *
 * Nor is "there is a patch for it" enough: dropping the city points'
 * circle-radius leaves circle-color behind, and the points render at
 * mapbox's default 5 instead of the artboard's 2. So the values are
 * pinned, as values. These are the numbers the design carries, and they
 * are the one thing about the scene no unit test could see -- a colour was
 * only ever checked for having come out of palette.a or palette.b, never
 * for what it came out as. `palette.a(0.6)` dropped to `palette.a(0.05)`
 * is still "from palette.a", and is also an invisible line.
 */
const RESTING = {
  work: [
    {
      layer: WORK_PATH_LINE,
      property: 'line-color',
      value: 'rgba(255, 229, 32, 0.6)',
    },
    { layer: WORK_PATH_LINE, property: 'line-width', value: 1 },
    {
      layer: WORK_PATH_DASH,
      property: 'line-color',
      value: 'rgba(255, 138, 43, 1)',
    },
    { layer: WORK_PATH_DASH, property: 'line-width', value: 1.5 },
    { layer: WORK_PATH_DASH, property: 'line-opacity', value: 1 },
    {
      layer: WORK_PATH_DASH,
      property: 'line-dasharray',
      value: [0, 4, 3],
    },
    {
      layer: WORK_CITY_POINTS,
      property: 'circle-color',
      value: 'rgba(255, 229, 32, 0.6)',
    },
    { layer: WORK_CITY_POINTS, property: 'circle-radius', value: 2 },
    {
      layer: WORK_HOME_POINT,
      property: 'circle-color',
      value: 'rgba(255, 229, 32, 1)',
    },
    { layer: WORK_HOME_POINT, property: 'circle-radius', value: 3.2 },
    {
      layer: WORK_HOME_POINT,
      property: 'circle-stroke-color',
      value: 'rgba(255, 229, 32, 0.35)',
    },
    {
      layer: WORK_HOME_POINT,
      property: 'circle-stroke-width',
      value: 9,
    },
  ],
  projects: [
    {
      layer: SITE_POINTS,
      property: 'circle-radius',
      value: ['min', 7, ['+', 2.6, ['*', ['get', 'count'], 0.7]]],
    },
    {
      layer: SITE_POINTS,
      property: 'circle-color',
      value: [
        'case',
        ['==', ['get', 'anchor'], ''],
        'rgba(255, 229, 32, 1)',
        'rgba(255, 229, 32, 0.6)',
      ],
    },
    {
      layer: SITE_POINTS,
      property: 'circle-stroke-color',
      value: 'rgba(255, 229, 32, 0.35)',
    },
    {
      layer: SITE_POINTS,
      property: 'circle-stroke-width',
      value: ['case', ['==', ['get', 'anchor'], ''], 8, 0],
    },
    {
      layer: SITE_LABELS,
      property: 'text-color',
      value: 'rgb(193, 193, 193)',
    },
    { layer: SITE_LABELS, property: 'text-opacity', value: 1 },
    {
      layer: SITE_LABELS,
      property: 'text-halo-color',
      value: 'rgb(15.84, 15.84, 15.84)',
    },
    { layer: SITE_LABELS, property: 'text-halo-width', value: 1 },
    {
      layer: SITE_COUNTS,
      property: 'text-color',
      value: 'rgb(193, 193, 193)',
    },
    { layer: SITE_COUNTS, property: 'text-opacity', value: 1 },
    {
      layer: SITE_COUNTS,
      property: 'text-halo-color',
      value: 'rgb(15.84, 15.84, 15.84)',
    },
    { layer: SITE_COUNTS, property: 'text-halo-width', value: 1 },
  ],
  about: [
    {
      layer: HISTORY_LINE,
      property: 'line-color',
      value: 'rgba(255, 138, 43, 0.6)',
    },
    { layer: HISTORY_LINE, property: 'line-width', value: 1 },
    {
      layer: HISTORY_POINTS,
      property: 'circle-radius',
      value: ['case', ['==', ['get', 'id'], -1], 4.5, 3],
    },
    {
      layer: HISTORY_POINTS,
      property: 'circle-color',
      value: [
        'case',
        ['==', ['get', 'id'], -1],
        'rgba(255, 229, 32, 1)',
        'rgba(255, 229, 32, 0.6)',
      ],
    },
    {
      layer: HISTORY_RING,
      property: 'circle-radius',
      value: ['case', ['==', ['get', 'id'], -1], 11, 0],
    },
    { layer: HISTORY_RING, property: 'circle-opacity', value: 0 },
    {
      layer: HISTORY_RING,
      property: 'circle-stroke-color',
      value: 'rgba(255, 229, 32, 0.6)',
    },
    {
      layer: HISTORY_RING,
      property: 'circle-stroke-width',
      value: ['case', ['==', ['get', 'id'], -1], 1, 0],
    },
    {
      layer: HISTORY_LABELS,
      property: 'text-color',
      value: 'rgb(193, 193, 193)',
    },
    { layer: HISTORY_LABELS, property: 'text-opacity', value: 1 },
    {
      layer: HISTORY_LABELS,
      property: 'text-halo-color',
      value: 'rgb(15.84, 15.84, 15.84)',
    },
    { layer: HISTORY_LABELS, property: 'text-halo-width', value: 1 },
  ],
} satisfies Record<string, PaintPatch[]>;

/** The route states a set is built under, beyond the resting one. */
const STATES: Partial<LayerSetOptions>[] = [
  {},
  { hover: 'cambridge' },
  { hover: 'vail', labels: false },
  { labels: false, dash: false },
  { selectedStop: 1 },
  { selectedStop: 4, labels: false, dash: false },
];

/*
 * A light ground, which is the other half of the palette contract: sh()
 * washes toward white rather than multiplying toward black, and `ink`
 * and `light` both flip. Running the structural guards under only the
 * dark fallback left every light-theme branch of paint() unwalked, so
 * a patch aimed at a layer that only exists on dark would have passed.
 */
const PAPER = makePalette({
  accent: [138, 92, 0],
  accent2: [156, 58, 0],
  space: [242, 240, 236],
  land: [205, 196, 184],
  deep: [176, 168, 157],
  body: [26, 26, 26],
  accentSmall: [102, 68, 0],
  sub: [74, 74, 74],
  muted: [110, 110, 110],
});

const PALETTES = [FALLBACK_PALETTE, PAPER];

const SCENES = [
  'hello',
  'notFound',
  'projects',
  'about',
  'projectDetail',
] as const;

describe('the paint the design actually asks for', () => {
  it.each([
    ['hello', RESTING.work],
    ['projects', RESTING.projects],
    ['about', RESTING.about],
  ] as const)(
    'pins every %s value, not just its source',
    (scene, expected) => {
      expect(
        layerSetsFor(scene, options())[0].paint(FALLBACK_PALETTE),
      ).toEqual(expected);
    },
  );

  it('gives 404 the same work path hello has', () => {
    expect(
      layerSetsFor('notFound', options())[0].paint(FALLBACK_PALETTE),
    ).toEqual(RESTING.work);
  });

  it('every patch lands on a layer that exists in its set', () => {
    for (const palette of PALETTES) {
      for (const scene of SCENES) {
        for (const state of STATES) {
          const built = layerSetsFor(
            scene,
            options({ ...state, palette }),
          );
          for (const set of built) {
            const ids = new Set(set.layers.map((one) => one.id));
            for (const patch of set.paint(palette)) {
              expect(
                ids.has(patch.layer),
                `${scene}/${palette.light ? 'paper' : 'space'}: ` +
                  `${patch.layer}/${patch.property}`,
              ).toBe(true);
            }
          }
        }
      }
    }
  });

  it('leaves no mounted layer with an empty paint', () => {
    for (const palette of PALETTES) {
      for (const scene of SCENES) {
        for (const state of STATES) {
          const built = layerSetsFor(
            scene,
            options({ ...state, palette }),
          );
          for (const set of built) {
            for (const entry of set.layers) {
              const paint = (entry.paint ?? {}) as Record<
                string,
                unknown
              >;
              expect(
                Object.keys(paint),
                `${scene}/${palette.light ? 'paper' : 'space'}: ` +
                  `${entry.id}`,
              ).not.toHaveLength(0);
            }
          }
        }
      }
    }
  });

  /*
   * And the second palette must actually be a second palette: if PAPER
   * produced the same strings as the fallback, both guards above would
   * be running the same pass twice and reporting it as two.
   */
  it('paints a light ground differently from a dark one', () => {
    const under = (palette: typeof FALLBACK_PALETTE) =>
      layerSetsFor('about', options({ palette })).flatMap((one) =>
        one.paint(palette).map((patch) => patch.value),
      );
    expect(PAPER.light).toBe(true);
    expect(FALLBACK_PALETTE.light).toBe(false);
    expect(under(PAPER)).not.toEqual(under(FALLBACK_PALETTE));
  });
});
