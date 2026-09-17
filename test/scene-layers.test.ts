import { describe, expect, it, vi } from 'vitest';
import { anchors } from 'content/anchors';
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
  HISTORY_POINTS,
  HISTORY_SET,
  layerSetsFor,
  type LayerSetOptions,
  PROJECT_SITES_SET,
  projectSites,
  SITE_LABELS,
  SITE_POINTS,
  WORK_PATH_DASH,
  WORK_PATH_SET,
} from 'scene/layers/sets';
import type {
  LayerSet,
  SceneListener,
  SceneMap,
} from 'scene/layers/types';
import { FALLBACK_PALETTE } from 'styles/tokens/palette';

/* ---- a map that is only a record of what was asked of it -------------- */

type FakeMap = SceneMap & {
  sources: Map<string, unknown>;
  layers: Map<string, unknown>;
  /** Every live (type, layer, handler) triple. */
  bound: string[];
  paints: [string, string, unknown][];
};

const key = (args: unknown[]): string =>
  args.map((arg) => String(arg)).join('|');

const fakeMap = (): FakeMap => {
  const sources = new Map<string, unknown>();
  const layers = new Map<string, unknown>();
  const bound: string[] = [];
  const paints: [string, string, unknown][] = [];

  return {
    sources,
    layers,
    bound,
    paints,
    getSource: (id) => sources.get(id),
    getLayer: (id) => layers.get(id),
    addSource: (id, spec) => sources.set(id, spec),
    addLayer: (entry) => layers.set(entry.id, entry),
    removeSource: (id) => sources.delete(id),
    removeLayer: (id) => layers.delete(id),
    setPaintProperty: (layer, property, value) =>
      paints.push([layer, property, value]),
    on: (...args) => bound.push(key(args)),
    off: (...args) => {
      const at = bound.indexOf(key(args));
      // -1 would mean an off with no matching on: the registry must never
      // produce one, and splice(-1) would silently drop the wrong entry.
      expect(at).toBeGreaterThanOrEqual(0);
      bound.splice(at, 1);
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

  it('lights the hovered anchor and nothing else', () => {
    const rest = layerSetsFor('projects', options())[0];
    const lit = layerSetsFor(
      'projects',
      options({ hover: 'cambridge' }),
    )[0];
    const colorOf = (one: typeof rest) =>
      one
        .paint(FALLBACK_PALETTE)
        .find(
          (patch) =>
            patch.layer === SITE_POINTS &&
            patch.property === 'circle-color',
        )?.value;
    expect(colorOf(rest)).not.toEqual(colorOf(lit));
    expect(JSON.stringify(colorOf(lit))).toContain('cambridge');
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
      for (const patch of patches.filter(
        (one) => one.layer === entry.id,
      )) {
        expect(paint[patch.property]).toEqual(patch.value);
      }
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
