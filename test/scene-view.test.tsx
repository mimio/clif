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
  dash: true,
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

  it('is the selected stop, not the current job', () => {
    const selected = historyStops[1];
    expect(current).toBeDefined();
    expect(selected.id).not.toBe(current?.id);

    const patches = historyPaint(selected.id);
    // Both the point and the ring name the selected id, and nothing in
    // the set names the current job.
    for (const property of ['circle-radius', 'circle-stroke-width']) {
      expect(
        JSON.stringify(patchFor(patches, HISTORY_RING, property)),
      ).toContain(String(selected.id));
    }
    expect(
      JSON.stringify(
        patchFor(patches, HISTORY_POINTS, 'circle-color'),
      ),
    ).toContain(String(selected.id));
  });

  /*
   * The selection may not live in a layer `filter`. A filter is read once,
   * at addLayer time, and sync() never remounts a set that is already
   * mounted -- so a filter that names the selection is a no-op from the
   * second selection onwards. That is the shape of the bug that left the
   * ring stuck on whichever stop the route was entered on.
   */
  it('keeps the selection out of every layer filter', () => {
    for (const selectedStop of [null, 1, 4]) {
      for (const set of layerSetsFor(
        'about',
        options({ selectedStop }),
      )) {
        for (const entry of set.layers) {
          expect(JSON.stringify(entry.filter ?? null)).not.toContain(
            '"id"',
          );
        }
      }
    }
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
