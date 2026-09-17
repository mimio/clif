import { StrictMode } from 'react';
import {
  act,
  render,
  type RenderResult,
  screen,
} from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { anchors } from 'content/anchors';
import {
  cameras,
  SCENE_MOVE_LONG_MS,
  SCENE_MOVE_MS,
} from 'content/cameras';
import {
  clampDpr,
  DPR_CLAMP,
  MAX_FRAME_BUDGET_MS,
  MIN_FRAME_BUDGET_MS,
  nextFrameBudget,
  prefersReducedMotion,
  terrainExaggeration,
} from 'scene/budget';
import {
  cameraAt,
  REDUCED_MOVE_MS,
  SCENE_REFRAME_MS,
} from 'scene/camera';
import {
  HISTORY_POINTS,
  HISTORY_RING,
  SITE_LABELS,
  SITE_POINTS,
  WORK_PATH_LINE,
} from 'scene/layers/sets';
import MapProvider, {
  SceneContext,
  useScene,
  useSceneHover,
  useSceneView,
} from 'scene/MapProvider';
import {
  ensureMap,
  getMap,
  resetMapForTests,
} from 'scene/mapbox/instance';
import { loadMapboxGl } from 'scene/mapbox/loader';
import SceneRoot from 'scene/SceneRoot';
import { resetLutCacheForTests, THEME_EVENT } from 'scene/theme';
import useSceneCamera from 'scene/useSceneCamera';
import {
  MOBILE_QUERY,
  REDUCED_MOTION_QUERY,
  useIsMobile,
  useReducedMotion,
} from 'scene/useViewport';
import { applyTheme, THEME_IDS } from 'styles/theme-bootstrap';
import {
  FakeMap,
  installMapboxStub,
  STYLE_GUARDED,
  STYLE_NOT_LOADED,
  stubThemedStyles,
} from 'test/fake-mapbox';
import { themeBlock } from 'test/theme-css';

const pathname = vi.hoisted(() => ({ current: '/' }));

vi.mock('next/router', () => ({
  useRouter: () => ({ pathname: pathname.current }),
}));

const THEME_BLOCKS = new Map<string, Record<string, string>>(
  THEME_IDS.map((id) => [
    id,
    themeBlock(id === 'yellow' ? ':root' : `[data-theme='${id}']`),
  ]),
);

const settle = async (ms = 200): Promise<void> => {
  await new Promise((done) => {
    setTimeout(done, ms);
  });
};

/** jsdom has no matchMedia; `truthy` is the set of queries that match. */
const matchMediaStub = (truthy: string[]) =>
  vi.fn((query: string) => {
    const listeners = new Set<() => void>();
    return {
      matches: truthy.includes(query),
      media: query,
      onchange: null,
      addEventListener: (_: string, fn: () => void) =>
        listeners.add(fn),
      removeEventListener: (_: string, fn: () => void) =>
        listeners.delete(fn),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    };
  });

beforeEach(() => {
  pathname.current = '/';
  resetMapForTests();
  resetLutCacheForTests();
  applyTheme('yellow');
  // Restored per test, because unstubAllGlobals below would otherwise
  // drop the one test/setup.ts installs for the whole file.
  vi.stubGlobal('matchMedia', matchMediaStub([]));
});

afterEach(() => {
  resetMapForTests();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

/* ---- the budget ------------------------------------------------------- */

describe('budget', () => {
  it('clamps device pixel ratio to 1.5, or to a given ceiling', () => {
    expect(clampDpr(3)).toBe(DPR_CLAMP);
    expect(clampDpr(1)).toBe(1);
    expect(clampDpr(3, 2)).toBe(2);
  });

  it('self-tunes the repaint interval from the last paint', () => {
    expect(nextFrameBudget(1)).toBe(MIN_FRAME_BUDGET_MS);
    expect(nextFrameBudget(50)).toBe(150);
    expect(nextFrameBudget(1000)).toBe(MAX_FRAME_BUDGET_MS);
  });

  it('reads the reduced-motion preference', () => {
    expect(prefersReducedMotion()).toBe(false);
  });

  it('flattens terrain on small screens and leaves it off when off', () => {
    expect(terrainExaggeration(1.4, false)).toBe(1.4);
    expect(terrainExaggeration(1.4, true)).toBe(1);
    expect(terrainExaggeration(null, true)).toBeNull();
  });
});

/* ---- the React seam --------------------------------------------------- */

const Probe = () => {
  const { camera } = useScene();
  const { hover } = useSceneHover();
  const zoom = camera === null ? 'none' : String(camera.zoom);
  return <p>{`${zoom}/${hover ?? 'clear'}`}</p>;
};

const Page = () => {
  useSceneCamera(cameras.about);
  return null;
};

const Hoverer = ({ anchor }: { anchor: 'vail' | null }) => {
  const { setHover } = useSceneHover();
  return (
    <button onClick={() => setHover(anchor)} type="button">
      hover
    </button>
  );
};

describe('MapProvider and useSceneCamera', () => {
  it('starts with no camera and nothing hovered', () => {
    render(
      <MapProvider>
        <Probe />
      </MapProvider>,
    );
    expect(screen.getByText('none/clear')).toBeVisible();
  });

  it("lets a page declare the scene's camera", () => {
    render(
      <MapProvider>
        <Page />
        <Probe />
      </MapProvider>,
    );
    expect(screen.getByText('10.5/clear')).toBeVisible();
  });

  it('carries the hovered anchor both ways', async () => {
    render(
      <MapProvider>
        <Hoverer anchor="vail" />
        <Probe />
      </MapProvider>,
    );
    await act(async () => {
      screen.getByRole('button').click();
    });
    expect(screen.getByText('none/vail')).toBeVisible();
  });

  it('is a no-op outside a provider', async () => {
    expect(() => render(<Page />)).not.toThrow();
    render(
      <>
        <Hoverer anchor={null} />
        <Probe />
      </>,
    );
    await act(async () => {
      screen.getAllByRole('button')[0].click();
    });
    expect(screen.getByText('none/clear')).toBeVisible();
  });

  it('still accepts a context value of camera and setCamera alone', () => {
    render(
      <SceneContext.Provider
        value={{ camera: cameras.hello, setCamera: vi.fn() }}
      >
        <Probe />
      </SceneContext.Provider>,
    );
    expect(screen.getByText('1.6/clear')).toBeVisible();
  });
});

/* ---- the environment reads -------------------------------------------- */

const Viewport = () => (
  <p>{`${useIsMobile() ? 'mobile' : 'desktop'}/${
    useReducedMotion() ? 'reduced' : 'full'
  }`}</p>
);

describe('the viewport and motion reads', () => {
  it('reports desktop, full motion by default', () => {
    render(<Viewport />);
    expect(screen.getByText('desktop/full')).toBeVisible();
  });

  it('follows the two media queries', () => {
    vi.stubGlobal(
      'matchMedia',
      matchMediaStub([MOBILE_QUERY, REDUCED_MOTION_QUERY]),
    );
    render(<Viewport />);
    expect(screen.getByText('mobile/reduced')).toBeVisible();
  });

  it('answers desktop and full motion on the server', () => {
    expect(renderToStaticMarkup(<Viewport />)).toContain(
      'desktop/full',
    );
  });

  it('unsubscribes from both queries on unmount', () => {
    const stub = matchMediaStub([]);
    vi.stubGlobal('matchMedia', stub);
    const { unmount } = render(<Viewport />);
    expect(() => unmount()).not.toThrow();
    expect(stub).toHaveBeenCalled();
  });
});

/* ---- no token --------------------------------------------------------- */

describe('the no-token fallback', () => {
  it('is the path unit tests take', async () => {
    await expect(loadMapboxGl()).resolves.toBeNull();
    expect(process.env.NEXT_PUBLIC_MAPBOX_TOKEN).toBeFalsy();
  });

  it('renders a static plate and leaves the foreground alone', async () => {
    await act(async () => {
      render(
        <MapProvider>
          <SceneRoot className="x" />
        </MapProvider>,
      );
    });
    const node = screen.getByTestId('scene-root');
    expect(node).toHaveAttribute('aria-hidden', 'true');
    expect(node).toHaveAttribute('data-scene-state', 'fallback');
    expect(node).toHaveClass('clif-scene', 'x');
    expect(screen.getByTestId('scene-fallback')).toBeInTheDocument();
    expect(getMap()).toBeNull();
  });

  it('never resolves the container into a map', async () => {
    await expect(ensureMap(null)).resolves.toBeNull();
    await expect(
      ensureMap(document.createElement('div')),
    ).resolves.toBeNull();
  });

  it('does not set state for a scene that unmounted first', async () => {
    const { unmount } = render(
      <MapProvider>
        <SceneRoot />
      </MapProvider>,
    );
    unmount();
    await act(async () => {});
    expect(getMap()).toBeNull();
  });
});

/* ---- with a map ------------------------------------------------------- */

describe('the persistent map', () => {
  let uninstall: () => void;

  beforeEach(() => {
    uninstall = installMapboxStub();
    stubThemedStyles(THEME_BLOCKS);
  });

  afterEach(() => {
    uninstall();
  });

  /*
   * SceneRoot is mounted once in _app.tsx and never unmounts, so a route
   * change has to be a re-render of the same component -- a fresh mount
   * would hand it fresh refs and hide exactly the bugs these tests are
   * for.
   */
  let view: RenderResult;

  const mount = async (node = <SceneRoot />) => {
    await act(async () => {
      view = render(<MapProvider>{node}</MapProvider>);
    });
  };

  const navigate = async (path: string, node = <SceneRoot />) => {
    pathname.current = path;
    await act(async () => {
      view.rerender(<MapProvider>{node}</MapProvider>);
    });
  };

  it('builds one map, on a globe, unpinned at the bottom', async () => {
    await mount();
    expect(FakeMap.instances).toHaveLength(1);
    expect(FakeMap.last.options.projection).toEqual({
      name: 'globe',
    });
    // The old style pinned minZoom at 7, which no globe can live with.
    expect(FakeMap.last.options.minZoom).toBe(0);
    expect(screen.getByTestId('scene-root')).toHaveAttribute(
      'data-scene-state',
      'live',
    );
    expect(
      screen.queryByTestId('scene-fallback'),
    ).not.toBeInTheDocument();
  });

  it('is idempotent however many times ensureMap is called', async () => {
    const container = document.createElement('div');
    // Concurrent: the second call lands while the first is in flight,
    // which is exactly what React 19's double-invoked effects do.
    const [first, second] = await Promise.all([
      ensureMap(container),
      ensureMap(container),
    ]);
    const third = await ensureMap(container);
    expect(first).toBe(second);
    expect(second).toBe(third);
    expect(third).toBe(getMap());
    expect(FakeMap.instances).toHaveLength(1);
  });

  it('builds one map under StrictMode, not two', async () => {
    await act(async () => {
      render(
        <StrictMode>
          <MapProvider>
            <SceneRoot />
          </MapProvider>
        </StrictMode>,
      );
    });
    expect(FakeMap.instances).toHaveLength(1);
  });

  it('eases to the route camera rather than rebuilding anything', async () => {
    await mount();
    const [move] = FakeMap.last.calls.easeTo;
    expect(move.center).toEqual(cameras.hello.center);
    expect(move.zoom).toBe(cameras.hello.zoom);
    expect(move.duration).toBe(SCENE_MOVE_MS);
    expect(typeof move.easing).toBe('function');
  });

  it('flies 900ms into the detail and keeps the page centre', async () => {
    pathname.current = '/projects/[projectId]';
    const cambridge = cameraAt(
      cameras.projectDetail,
      [-71.11, 42.37],
    );
    const Detail = () => {
      useSceneCamera(cambridge);
      return null;
    };
    await mount(
      <>
        <SceneRoot />
        <Detail />
      </>,
    );
    const last = FakeMap.last.calls.easeTo.at(-1);
    expect(last?.center).toEqual(cambridge.center);
    expect(FakeMap.last.calls.easeTo[0].duration).toBe(
      SCENE_MOVE_LONG_MS,
    );
  });

  it('holds the map on the detail route and hands it back after', async () => {
    pathname.current = '/projects/[projectId]';
    await mount();
    expect([...FakeMap.last.enabled.values()]).not.toContain(true);

    await navigate('/projects');
    expect([...FakeMap.last.enabled.values()]).not.toContain(false);
  });

  it('turns terrain on for the close routes and off for the far ones', async () => {
    await mount();
    expect(FakeMap.last.calls.terrain.at(-1)).toBeNull();

    await navigate('/about');
    expect(FakeMap.last.getSource('mapbox-dem')).toBeDefined();
    await act(async () => {
      FakeMap.last.loadSource('mapbox-dem');
    });
    expect(FakeMap.last.calls.terrain.at(-1)).toEqual({
      source: 'mapbox-dem',
      exaggeration: 1.4,
    });
  });

  /*
   * Adding a raster-dem source and draping on it in the same tick works
   * on a fresh style and not on a map that has been rendering for a
   * while: mapbox reaches into the DEM's tile cache on the next frame
   * and throws. That is a navigation from hello into about, and it took
   * the whole tree down on every attempt.
   */
  it('waits for the DEM before draping terrain on it', async () => {
    await mount();
    const map = FakeMap.last;
    await navigate('/about');

    // The source is there, and terrain has NOT been switched on yet.
    expect(map.getSource('mapbox-dem')).toBeDefined();
    expect(map.isSourceLoaded('mapbox-dem')).toBe(false);
    expect(map.calls.terrain.filter(Boolean)).toEqual([]);

    await act(async () => {
      map.loadSource('mapbox-dem');
    });
    expect(map.calls.terrain.at(-1)).toEqual({
      source: 'mapbox-dem',
      exaggeration: 1.4,
    });
  });

  it('drops a parked terrain want when the route leaves terrain', async () => {
    await mount();
    const map = FakeMap.last;
    await navigate('/about');
    expect(map.calls.terrain.filter(Boolean)).toEqual([]);

    // Away again before the DEM ever resolves.
    await navigate('/projects');
    await act(async () => {
      map.loadSource('mapbox-dem');
    });
    // The stale want was overwritten by "terrain off", so nothing drapes.
    expect(map.calls.terrain.filter(Boolean)).toEqual([]);
    expect(map.calls.terrain.at(-1)).toBeNull();
  });

  it('nudges 8% toward a hovered city over 600ms', async () => {
    pathname.current = '/projects';
    await mount(
      <>
        <SceneRoot />
        <Hoverer anchor="vail" />
      </>,
    );
    const before = FakeMap.last.calls.easeTo.length;
    await act(async () => {
      screen.getByRole('button').click();
    });
    const nudge = FakeMap.last.calls.easeTo[before];
    expect(nudge.duration).toBe(SCENE_REFRAME_MS);
    // Vail is west of the projects centre, so the nudge moves west.
    expect((nudge.center as number[])[0]).toBeLessThan(
      cameras.projects.center[0],
    );
    expect((nudge.center as number[])[0]).toBeGreaterThan(
      anchors.vail.center[0],
    );
  });

  it('mounts a route s layer sets and unmounts the last route s', async () => {
    pathname.current = '/projects';
    await mount();
    expect(FakeMap.last.getLayer(SITE_POINTS)).toBeDefined();
    expect(FakeMap.last.handlers.length).toBeGreaterThan(0);

    await navigate('/about');
    expect(FakeMap.last.getLayer(SITE_POINTS)).toBeUndefined();
    expect(FakeMap.last.getLayer(HISTORY_POINTS)).toBeDefined();
    // Total teardown: the projects hover handlers are gone.
    expect(FakeMap.last.handlers).toEqual([]);

    await navigate('/');
    expect(FakeMap.last.getLayer(HISTORY_POINTS)).toBeUndefined();
    expect(FakeMap.last.getLayer(WORK_PATH_LINE)).toBeDefined();
  });

  it('sends the basemap config, and only what changed after that', async () => {
    await mount();
    const first = FakeMap.last.calls.config.length;
    expect(first).toBeGreaterThan(0);
    expect(FakeMap.last.calls.config).toContainEqual([
      'basemap',
      'lightPreset',
      'dawn',
    ]);
    // Deep space is a world-zoom camera: no roads, no labels.
    expect(FakeMap.last.calls.config).toContainEqual([
      'basemap',
      'showPlaceLabels',
      false,
    ]);

    await navigate('/about');
    const after = FakeMap.last.calls.config.slice(first);
    expect(after).toContainEqual(['basemap', 'lightPreset', 'night']);
    expect(after).toContainEqual([
      'basemap',
      'showPlaceLabels',
      true,
    ]);
    expect(after.length).toBeLessThan(first);
  });

  it('paints our own layers straight from the palette', async () => {
    await mount();
    const colors = FakeMap.last.calls.paint.filter(
      ([layer, property]) =>
        layer === WORK_PATH_LINE && property === 'line-color',
    );
    expect(colors.length).toBeGreaterThan(0);
    expect(String(colors[0][2])).toMatch(/^rgba\(255, 229, 32/);
  });

  it('sets the colour theme once, and again only on a real change', async () => {
    await mount();
    const map = FakeMap.last;
    expect(map.calls.colorTheme).toHaveLength(1);
    const yellow = map.calls.colorTheme[0];
    expect(yellow).toMatch(/^[A-Za-z0-9+/]+={0,2}$/);

    const moves = map.calls.easeTo.length;

    // Re-announcing the live theme must not reload every tile.
    await act(async () => {
      window.dispatchEvent(new Event(THEME_EVENT));
      await settle();
    });
    expect(map.calls.colorTheme).toHaveLength(1);

    await act(async () => {
      applyTheme('paper');
      await settle();
    });
    expect(map.calls.colorTheme).toHaveLength(2);
    expect(map.calls.colorTheme[1]).not.toBe(yellow);
    // The camera holds through a theme change -- it is the one scene
    // change with no camera move, so any move it does provoke is a
    // reframe of where it already is, not a route change.
    for (const move of map.calls.easeTo.slice(moves)) {
      expect(move.duration).toBe(SCENE_REFRAME_MS);
      expect(move.center).toEqual(cameras.hello.center);
    }
  });

  it('follows the attribute even when no event is dispatched', async () => {
    await mount();
    const map = FakeMap.last;
    await act(async () => {
      document.documentElement.dataset.theme = 'teal';
      await settle();
    });
    expect(map.calls.colorTheme).toHaveLength(2);
  });

  it('rotates the hello globe', async () => {
    await mount();
    await act(async () => {
      await new Promise((done) => {
        requestAnimationFrame(() => done(null));
      });
    });
    expect(FakeMap.last.calls.bearing.length).toBeGreaterThan(0);
  });

  it('is static under reduced motion: 200ms, no rotation', async () => {
    vi.stubGlobal(
      'matchMedia',
      matchMediaStub([REDUCED_MOTION_QUERY]),
    );
    await mount();
    expect(FakeMap.last.calls.easeTo[0].duration).toBe(
      REDUCED_MOVE_MS,
    );
    await act(async () => {
      await new Promise((done) => {
        requestAnimationFrame(() => done(null));
      });
    });
    expect(FakeMap.last.calls.bearing).toEqual([]);
  });

  it('applies the mobile artboard camera below the breakpoint', async () => {
    vi.stubGlobal('matchMedia', matchMediaStub([MOBILE_QUERY]));
    await mount();
    expect(FakeMap.last.calls.easeTo[0].zoom).toBe(1.4);
  });

  it('changes what the scene shows without moving the camera', async () => {
    pathname.current = '/projects';
    const Browsing = ({ open }: { open: boolean }) => {
      useSceneView({ labels: !open });
      return null;
    };
    await mount(
      <>
        <SceneRoot />
        <Browsing open={false} />
      </>,
    );
    const map = FakeMap.last;
    const moves = map.calls.easeTo.length;
    const labelOpacity = () =>
      map.calls.paint
        .filter(
          ([layer, property]) =>
            layer === SITE_LABELS && property === 'text-opacity',
        )
        .at(-1)?.[2];
    expect(labelOpacity()).toBe(1);

    // Opening browse-all is a state of the page, not a camera move: the
    // artboard says "browsing is not travelling, so the camera holds".
    await act(async () => {
      view.rerender(
        <MapProvider>
          <SceneRoot />
          <Browsing open />
        </MapProvider>,
      );
    });
    expect(labelOpacity()).toBe(0);
    expect(map.calls.easeTo).toHaveLength(moves);
  });

  it('lights the history stop the route selected', async () => {
    pathname.current = '/about';
    const Selecting = ({ stop }: { stop: number }) => {
      useSceneView({ selectedStop: stop });
      return null;
    };
    await mount(
      <>
        <SceneRoot />
        <Selecting stop={2} />
      </>,
    );
    const map = FakeMap.last;
    const moves = map.calls.easeTo.length;
    const radius = () =>
      map.calls.paint
        .filter(
          ([layer, property]) =>
            layer === HISTORY_POINTS && property === 'circle-radius',
        )
        .at(-1)?.[2];
    expect(JSON.stringify(radius())).toContain('2');

    await act(async () => {
      view.rerender(
        <MapProvider>
          <SceneRoot />
          <Selecting stop={5} />
        </MapProvider>,
      );
    });
    expect(JSON.stringify(radius())).toContain('5');
    // Selecting a stop repaints; the camera move to that stop is the
    // about route's own business, through useSceneCamera.
    expect(map.calls.easeTo).toHaveLength(moves);
  });

  /*
   * The ring used to carry the selection in its layer `filter`. A filter
   * is read once, at addLayer time, and sync() skips a set that is
   * already mounted -- so the ring stayed on whichever stop was selected
   * when the route was entered while the point beside it moved
   * correctly, because the point's colour and radius are paint patches.
   *
   * Asserting the set definition cannot see that: the definition was
   * always right and the mounted layer never heard about it. So this
   * reads what actually reached the map.
   */
  it('moves the ring on the map itself, not just in the set', async () => {
    pathname.current = '/about';
    const Selecting = ({ stop }: { stop: number }) => {
      useSceneView({ selectedStop: stop });
      return null;
    };
    await mount(
      <>
        <SceneRoot />
        <Selecting stop={4} />
      </>,
    );
    const map = FakeMap.last;

    // What the map is actually drawing, from the calls it received.
    const ringOnMap = (property: string) =>
      JSON.stringify(
        map.calls.paint
          .filter(
            ([layer, name]) =>
              layer === HISTORY_RING && name === property,
          )
          .at(-1)?.[2],
      );

    expect(ringOnMap('circle-radius')).toContain('4');
    expect(ringOnMap('circle-stroke-width')).toContain('4');

    await act(async () => {
      view.rerender(
        <MapProvider>
          <SceneRoot />
          <Selecting stop={2} />
        </MapProvider>,
      );
    });

    expect(ringOnMap('circle-radius')).toContain('2');
    expect(ringOnMap('circle-radius')).not.toContain('4');
    expect(ringOnMap('circle-stroke-width')).toContain('2');

    // And the mounted layer carries no filter that could pin it.
    const mounted = map.getLayer(HISTORY_RING) as {
      filter?: unknown;
    };
    expect(mounted.filter).toBeUndefined();
  });

  it('fogs the scene from the route preset', async () => {
    await mount();
    const fog = FakeMap.last.calls.fog.at(-1);
    expect(fog?.range).toEqual([0.6, 12]);
    expect(fog?.color).toBe('#161616');
  });
});

/* ---- the style lifecycle ---------------------------------------------- */

/*
 * The regression block for the outage: with a token present, every route
 * threw "Style is not done loading" because SceneRoot flushed the theme
 * painter the moment the map object existed, and a map object is not a
 * loaded style.
 *
 * The unit suite could not see it -- there is no token here, so the path
 * never ran, and the fake map answered every call whatever its state. The
 * fake enforces the precondition now, so these tests fail loudly against
 * the code that shipped the bug.
 */
describe('the style lifecycle', () => {
  let uninstall: () => void;

  beforeEach(() => {
    uninstall = installMapboxStub({ style: 'manual' });
    stubThemedStyles(THEME_BLOCKS);
  });

  afterEach(() => {
    uninstall();
  });

  const mount = async (node = <SceneRoot />) => {
    let view: RenderResult;
    await act(async () => {
      view = render(<MapProvider>{node}</MapProvider>);
    });
    return view!;
  };

  it('the fake refuses every guarded call before style.load', () => {
    const map = new FakeMap({});
    const calls: Record<string, () => void> = {
      setColorTheme: () => map.setColorTheme({ data: 'x' }),
      setConfigProperty: () =>
        map.setConfigProperty('basemap', 'theme', 'faded'),
      setPaintProperty: () => map.setPaintProperty('l', 'p', 1),
      setFog: () => map.setFog({}),
      setTerrain: () => map.setTerrain(null),
      addSource: () => map.addSource('s', {}),
      addLayer: () => map.addLayer({ id: 'l' }),
      removeSource: () => map.removeSource('s'),
      removeLayer: () => map.removeLayer('l'),
    };
    // Every method mapbox-gl guards, and no others.
    expect(Object.keys(calls).sort()).toEqual(
      [...STYLE_GUARDED].sort(),
    );
    for (const [name, call] of Object.entries(calls)) {
      expect(() => call(), name).toThrow(STYLE_NOT_LOADED);
    }
    // The camera is not guarded, in the fake or in mapbox-gl.
    expect(() => map.easeTo({ zoom: 2 })).not.toThrow();
    expect(() => map.setBearing(4)).not.toThrow();
  });

  it('drives the camera but touches nothing else before style.load', async () => {
    await mount();
    const map = FakeMap.last;
    expect(map.styleLoaded).toBe(false);
    // The camera has no style precondition and is applied at once, so the
    // map never sits at its constructed [0, 0] waiting for a stylesheet.
    expect(map.calls.easeTo).toHaveLength(1);
    expect(map.calls.easeTo[0].center).toEqual(cameras.hello.center);
    // Everything that would have thrown.
    expect(map.calls.colorTheme).toEqual([]);
    expect(map.calls.config).toEqual([]);
    expect(map.calls.fog).toEqual([]);
    expect(map.calls.terrain).toEqual([]);
    expect(map.layers.size).toBe(0);
  });

  it('applies everything it was asked for once the style loads', async () => {
    await mount();
    const map = FakeMap.last;
    await act(async () => {
      map.loadStyle();
    });
    expect(map.calls.colorTheme).toHaveLength(1);
    expect(map.calls.fog).toHaveLength(1);
    expect(map.calls.terrain).toEqual([null]);
    expect(map.calls.config).toContainEqual([
      'basemap',
      'lightPreset',
      'dawn',
    ]);
    expect(map.getLayer(WORK_PATH_LINE)).toBeDefined();
  });

  it('keeps a theme change that arrives mid-load, and applies it once', async () => {
    await mount();
    const map = FakeMap.last;

    await act(async () => {
      applyTheme('paper');
      await settle();
    });
    // Still nothing on the map: the style is not there to take it.
    expect(map.calls.colorTheme).toEqual([]);

    await act(async () => {
      map.loadStyle();
    });
    // Exactly one, and it is the theme that was asked for last -- not the
    // yellow one the first paint requested, and not both in sequence.
    expect(map.calls.colorTheme).toHaveLength(1);
    const paper = map.calls.colorTheme[0];

    applyTheme('yellow');
    await act(async () => {
      await settle();
    });
    expect(map.calls.colorTheme).toHaveLength(2);
    expect(map.calls.colorTheme[1]).not.toBe(paper);
  });

  it('never sends the same LUT twice, across painter rebuilds', async () => {
    await mount();
    const map = FakeMap.last;
    await act(async () => {
      map.loadStyle();
    });
    expect(map.calls.colorTheme).toHaveLength(1);

    // The state flip from pending to live rebuilds the theme painter, and
    // a rebuilt painter has no memory of what it painted. The dedupe that
    // matters lives on the map side, so this must not reload every tile.
    await act(async () => {
      window.dispatchEvent(new Event(THEME_EVENT));
      await settle();
    });
    expect(map.calls.colorTheme).toHaveLength(1);
  });

  it('collapses route changes made during load into the final route', async () => {
    pathname.current = '/projects';
    const view = await mount();
    const map = FakeMap.last;

    pathname.current = '/about';
    await act(async () => {
      view.rerender(
        <MapProvider>
          <SceneRoot />
        </MapProvider>,
      );
    });
    expect(map.layers.size).toBe(0);

    await act(async () => {
      map.loadStyle();
    });
    // Only the route the app actually ended on is mounted: the projects
    // layers were never added, so they never had to be removed.
    expect(map.getLayer(SITE_POINTS)).toBeUndefined();
    expect(map.getLayer(HISTORY_POINTS)).toBeDefined();

    // And the config diffs merged rather than the earlier one being lost:
    // /projects asked for dusk, /about for night, and only night is live.
    const presets = map.calls.config.filter(
      ([, key]) => key === 'lightPreset',
    );
    expect(presets).toHaveLength(1);
    expect(presets[0][2]).toBe('night');
    expect(map.calls.config).toContainEqual([
      'basemap',
      'showPlaceLabels',
      true,
    ]);
  });

  it('falls back to the plate when the stylesheet itself fails', async () => {
    await mount();
    const map = FakeMap.last;
    await act(async () => {
      map.failStyle('Unauthorized');
    });
    expect(screen.getByTestId('scene-root')).toHaveAttribute(
      'data-scene-state',
      'fallback',
    );
    expect(screen.getByTestId('scene-fallback')).toBeInTheDocument();
    // Degraded, not crashed: nothing was forced onto a map that has no
    // style, so nothing threw.
    expect(map.calls.colorTheme).toEqual([]);
  });

  it('survives tile errors after the style loaded', async () => {
    await mount();
    const map = FakeMap.last;
    await act(async () => {
      map.loadStyle();
    });
    // A token with no tile scope 401s every tile. That is a map missing
    // its imagery, not a scene that should tear itself down.
    await act(async () => {
      map.tileError('Unauthorized');
      map.tileError('Unauthorized');
    });
    expect(screen.getByTestId('scene-root')).toHaveAttribute(
      'data-scene-state',
      'live',
    );
    expect(
      screen.queryByTestId('scene-fallback'),
    ).not.toBeInTheDocument();
    expect(map.calls.colorTheme).toHaveLength(1);
  });

  it('falls back when the style fails before the map even resolves', async () => {
    // A token that cannot fetch the stylesheet 401s it immediately, so
    // the failure can land before ensureMap's promise does -- which is a
    // different path into the plate than the watcher above.
    uninstall();
    uninstall = installMapboxStub({ style: 'fail' });
    await mount();
    expect(screen.getByTestId('scene-root')).toHaveAttribute(
      'data-scene-state',
      'fallback',
    );
    expect(FakeMap.last.calls.colorTheme).toEqual([]);
    expect(FakeMap.last.calls.fog).toEqual([]);
  });

  it('holds the dash still until the style can take a paint property', async () => {
    await mount();
    const map = FakeMap.last;
    await act(async () => {
      await new Promise((done) => {
        requestAnimationFrame(() => done(null));
      });
    });
    // The globe is already turning -- setBearing has no precondition --
    // but the dash is a paint property and must not have been written.
    expect(map.calls.bearing.length).toBeGreaterThan(0);
    expect(map.calls.paint).toEqual([]);
  });
});
