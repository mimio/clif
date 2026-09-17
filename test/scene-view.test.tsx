import { useEffect } from 'react';
import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { historyStops } from 'content/history';
import {
  HISTORY_LABELS,
  HISTORY_POINTS,
  HISTORY_RING,
  HISTORY_SET,
  layerSetsFor,
  type LayerSetOptions,
} from 'scene/layers/sets';
import MapProvider, {
  SceneContext,
  useSceneView,
  useSceneViewValue,
} from 'scene/MapProvider';
import {
  DEFAULT_VIEW,
  mergeView,
  sameView,
  type SceneView,
  showLabels,
} from 'scene/view';
import { FALLBACK_PALETTE } from 'styles/tokens/palette';

afterEach(() => {
  vi.restoreAllMocks();
});

const options = (
  overrides: Partial<LayerSetOptions> = {},
): LayerSetOptions => ({
  palette: FALLBACK_PALETTE,
  hover: null,
  labels: true,
  selectedStop: null,
  onHoverAnchor: vi.fn(),
  onSelectAnchor: vi.fn(),
  ...overrides,
});

/* ---- the record ------------------------------------------------------- */

describe('the scene view', () => {
  it('fills in whatever a route did not mention', () => {
    expect(mergeView({ labels: false })).toEqual({
      labels: false,
      selectedStop: null,
    });
    expect(mergeView({ selectedStop: 4 })).toEqual({
      labels: true,
      selectedStop: 4,
    });
    expect(mergeView(null)).toEqual(DEFAULT_VIEW);
    expect(mergeView(undefined)).toEqual(DEFAULT_VIEW);
  });

  it('compares by value, so a route can declare it inline', () => {
    expect(sameView(mergeView({}), mergeView({}))).toBe(true);
    expect(
      sameView(mergeView({ labels: false }), mergeView({})),
    ).toBe(false);
    expect(
      sameView(mergeView({ selectedStop: 1 }), mergeView({})),
    ).toBe(false);
  });

  /*
   * The composition rule: either input can veto map type, and neither
   * outranks the other. Below the tablet breakpoint there is no band
   * where the table and the labels can both be read (1g); in browse-all
   * the table is full bleed over the map (1c).
   */
  it.each([
    [true, false, true],
    [true, true, false],
    [false, false, false],
    [false, true, false],
  ])(
    'labels=%s mobile=%s draws map type: %s',
    (labels, isMobile, expected) => {
      expect(
        showLabels({ labels, selectedStop: null }, isMobile),
      ).toBe(expected);
    },
  );
});

/* ---- the channel ------------------------------------------------------ */

const Probe = () => {
  const view = useSceneViewValue();
  return <p>{`${view.labels}/${view.selectedStop ?? 'none'}`}</p>;
};

const Declaring = ({ patch }: { patch: Partial<SceneView> }) => {
  useSceneView(patch);
  return null;
};

describe('useSceneView', () => {
  it('defaults to showing labels and lighting nothing', () => {
    render(
      <MapProvider>
        <Probe />
      </MapProvider>,
    );
    expect(screen.getByText('true/none')).toBeVisible();
  });

  it('lets a route declare labels off and a stop live', async () => {
    await act(async () => {
      render(
        <MapProvider>
          <Declaring patch={{ labels: false, selectedStop: 4 }} />
          <Probe />
        </MapProvider>,
      );
    });
    expect(screen.getByText('false/4')).toBeVisible();
  });

  it('settles rather than looping on an inline patch', async () => {
    /*
     * The hazard this closes: a route writes the patch inline, so the
     * object is new on every render. If the provider stored it by
     * identity, storing it would re-render, which would build another new
     * object, which would store again -- for ever. Watching the stored
     * value's identity is how you see that it settled.
     */
    const seen: SceneView[] = [];
    const Watching = () => {
      const live = useSceneViewValue();
      useEffect(() => {
        seen.push(live);
      }, [live]);
      return null;
    };
    await act(async () => {
      render(
        <MapProvider>
          <Declaring patch={{ labels: false }} />
          <Watching />
        </MapProvider>,
      );
    });
    // The default, then the route's declaration, and then it stops.
    expect(seen).toHaveLength(2);
    expect(seen[1]).toEqual({ labels: false, selectedStop: null });
  });

  it('takes the declaration back when the route unmounts', async () => {
    const view = render(
      <MapProvider>
        <Declaring patch={{ labels: false }} />
        <Probe />
      </MapProvider>,
    );
    await act(async () => {});
    expect(screen.getByText('false/none')).toBeVisible();

    await act(async () => {
      view.rerender(
        <MapProvider>
          <Probe />
        </MapProvider>,
      );
    });
    expect(screen.getByText('true/none')).toBeVisible();
  });

  it('follows a route that changes its mind', async () => {
    const view = render(
      <MapProvider>
        <Declaring patch={{ selectedStop: 1 }} />
        <Probe />
      </MapProvider>,
    );
    await act(async () => {});
    expect(screen.getByText('true/1')).toBeVisible();

    await act(async () => {
      view.rerender(
        <MapProvider>
          <Declaring patch={{ selectedStop: 5 }} />
          <Probe />
        </MapProvider>,
      );
    });
    expect(screen.getByText('true/5')).toBeVisible();
  });

  it('is a no-op outside a provider', async () => {
    await act(async () => {
      render(
        <>
          <Declaring patch={{ labels: false }} />
          <Probe />
        </>,
      );
    });
    expect(screen.getByText('true/none')).toBeVisible();
  });

  it('still reads a context value of camera and setCamera alone', () => {
    render(
      <SceneContext.Provider
        value={{ camera: null, setCamera: vi.fn() }}
      >
        <Probe />
      </SceneContext.Provider>,
    );
    expect(screen.getByText('true/none')).toBeVisible();
  });
});

/* ---- what it reaches -------------------------------------------------- */

const historyPaint = (selectedStop: number | null) =>
  layerSetsFor('about', options({ selectedStop }))[0].paint(
    FALLBACK_PALETTE,
  );

const patchFor = (
  patches: ReturnType<typeof historyPaint>,
  layer: string,
  property: string,
) =>
  patches.find(
    (one) => one.layer === layer && one.property === property,
  )?.value;

describe('the live history stop', () => {
  const current = historyStops.find((stop) => stop.end === null);

  /*
   * `toContain(String(selected.id))` could not see this at all.
   *
   * The selected id here is 2, and '2' is in `255`, `229` and `32`, which
   * every colour in the set is made of -- so the assertion held for every
   * selection and for none, which is the opposite of what a test named
   * "is the selected stop, not the current job" is for. The expression is
   * read whole instead, arms and all: which id the test names, and which
   * arm carries the live value. Swapping the ring's 11 and 0 hides the
   * ring on the selected stop and draws it on the other five, and a
   * substring check cannot tell the two apart.
   */
  it('is the selected stop, not the current job', () => {
    const selected = historyStops[1];
    expect(current).toBeDefined();
    expect(selected.id).not.toBe(current?.id);

    const patches = historyPaint(selected.id);
    const live = ['==', ['get', 'id'], selected.id];

    expect(patchFor(patches, HISTORY_RING, 'circle-radius')).toEqual([
      'case',
      live,
      11,
      0,
    ]);
    expect(
      patchFor(patches, HISTORY_RING, 'circle-stroke-width'),
    ).toEqual(['case', live, 1, 0]);
    expect(
      patchFor(patches, HISTORY_POINTS, 'circle-radius'),
    ).toEqual(['case', live, 4.5, 3]);
    expect(patchFor(patches, HISTORY_POINTS, 'circle-color')).toEqual(
      ['case', live, FALLBACK_PALETTE.a(1), FALLBACK_PALETTE.a(0.6)],
    );

    // And nothing in the set names the current job.
    const named = new Set<unknown>();
    for (const patch of patches) {
      const found = /\["get","id"\],(-?\d+)\]/.exec(
        JSON.stringify(patch.value),
      );
      if (found) named.add(Number(found[1]));
    }
    expect([...named]).toEqual([selected.id]);
    expect(named.has(current?.id)).toBe(false);
  });

  /*
   * The invariant, rather than the one symptom of it that shipped.
   *
   * scene/layers/types.ts states it for the whole LayerEntry: "This is
   * STRUCTURE, and it is read exactly once -- at mount. `sync` skips a set
   * whose id is already mounted, so nothing here is ever re-applied while
   * the route lives." A `filter` is the slot the ring bug used, but
   * `layout`, `minzoom`, `maxzoom` and `source` are read once too, and the
   * sources are added once as well. Putting the selection in
   * HISTORY_LABELS's layout['text-field'] makes a stop's label read "LIVE"
   * for ever -- the same bug, in a slot a filter-shaped assertion cannot
   * see.
   *
   * So: build every route's sets under a spread of route states, and
   * assert the static half is byte-for-byte the same object every time.
   * Only `paint` -- which `repaint` re-applies on every route, hover,
   * selection and theme change -- is allowed to move.
   */
  const STATES: Partial<LayerSetOptions>[] = [
    {},
    { selectedStop: 1 },
    { selectedStop: 4, labels: false },
    { hover: 'cambridge' },
    { hover: 'vail', labels: false },
    { selectedStop: 2, hover: 'portland', labels: false },
  ];

  const SCENES = [
    'hello',
    'notFound',
    'projects',
    'about',
    'projectDetail',
  ] as const;

  /**
   * Everything mount() reads once: the sources it adds, each layer minus
   * its paint, and the shape of each binding. The handlers themselves are
   * closures over the callbacks a route hands in, so only their (type,
   * layer) is structure.
   */
  const staticHalf = (sets: ReturnType<typeof layerSetsFor>) =>
    sets.map((set) => ({
      id: set.id,
      sources: set.sources,
      layers: set.layers.map((entry) =>
        Object.fromEntries(
          Object.entries(entry).filter(([key]) => key !== 'paint'),
        ),
      ),
      interactions: set.interactions.map(({ type, layer }) => ({
        type,
        layer,
      })),
    }));

  it.each(SCENES)(
    'keeps every route-varying value out of %s s static half',
    (scene) => {
      const first = staticHalf(
        layerSetsFor(scene, options(STATES[0])),
      );
      for (const state of STATES.slice(1)) {
        expect(
          staticHalf(layerSetsFor(scene, options(state))),
          JSON.stringify(state),
        ).toEqual(first);
      }
    },
  );

  it('still has a static half worth comparing', () => {
    // Not vacuous: /about declares four layers, one of them with a layout
    // block, and two sources -- so the comparison above has something to
    // compare. A set that stopped declaring layers would pass it silently.
    const [stops] = layerSetsFor('about', options());
    expect(stops.layers).toHaveLength(4);
    expect(stops.sources).toHaveLength(2);
    expect(
      stops.layers.find((one) => one.id === HISTORY_LABELS)?.layout,
    ).toMatchObject({ 'text-field': ['get', 'company'] });
  });

  it('carries a stop id on every point, so the paint can find it', () => {
    const source = layerSetsFor('about', options())[0].sources.find(
      (one) => one.id === HISTORY_SET,
    );
    const data = source?.spec.data as {
      features: { properties: { id: number; live?: boolean } }[];
    };
    expect(data.features.map((f) => f.properties.id)).toEqual(
      historyStops.map((stop) => stop.id),
    );
    // The old derived flag is gone; nothing may still key off it.
    expect(
      data.features.every((f) => f.properties.live === undefined),
    ).toBe(true);
  });

  it('lights nothing when the route has selected nothing', () => {
    const patches = historyPaint(null);
    // A stop id is never -1, so the expression matches no feature and
    // the ring collapses to nothing on every one of them.
    const radius = JSON.stringify(
      patchFor(patches, HISTORY_RING, 'circle-radius'),
    );
    expect(radius).toContain('-1');
    for (const stop of historyStops) {
      expect(radius).not.toContain(`,${stop.id}]`);
    }
  });

  it('changes the point and ring paint with the selection', () => {
    const one = historyPaint(1);
    const two = historyPaint(2);
    expect(patchFor(one, HISTORY_POINTS, 'circle-color')).not.toEqual(
      patchFor(two, HISTORY_POINTS, 'circle-color'),
    );
    expect(
      patchFor(one, HISTORY_POINTS, 'circle-radius'),
    ).not.toEqual(patchFor(two, HISTORY_POINTS, 'circle-radius'));
  });

  it('hides map type when the route or the viewport says so', () => {
    expect(
      patchFor(
        layerSetsFor('about', options({ labels: false }))[0].paint(
          FALLBACK_PALETTE,
        ),
        HISTORY_LABELS,
        'text-opacity',
      ),
    ).toBe(0);
  });
});
