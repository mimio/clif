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
  WORK_PATH_DASH,
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
  CONFIG_FRAGMENT,
  FakeMap,
  installMapboxStub,
  STANDARD_CONFIG_SCHEMA,
  STYLE_DEFERRED,
  STYLE_GUARDED,
  STYLE_NOT_LOADED,
  stubThemedStyles,
  styleMethodsGuardedInMapboxGl,
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

/** One animation frame, which is a 16ms timer in jsdom. */
const frame = (): Promise<void> =>
  new Promise((done) => {
    requestAnimationFrame(() => done());
  });

/**
 * jsdom has no matchMedia. `truthy` is the set of queries that match to
 * begin with -- and, unlike the stub this replaces, the listeners it hands
 * out can be counted and fired.
 *
 * That second half is not decoration. A media query is a live subscription
 * in the browser: rotating a phone and toggling the OS reduced-motion
 * switch both arrive as `change` events on an existing MediaQueryList,
 * long after mount. A stub that records listeners and never calls one can
 * only ever test the mount-time read, which leaves the whole subscription
 * -- and its teardown -- unexercised.
 */
const matchMediaStub = (truthy: string[]) => {
  const live = new Set(truthy);
  const listeners = new Map<string, Set<(event: unknown) => void>>();
  const forQuery = (query: string) => {
    const found = listeners.get(query);
    if (found) return found;
    const made = new Set<(event: unknown) => void>();
    listeners.set(query, made);
    return made;
  };

  const stub = vi.fn((query: string) => ({
    // A getter, so a snapshot read after a change sees the new answer.
    get matches() {
      return live.has(query);
    },
    media: query,
    onchange: null,
    addEventListener: (_: string, fn: (event: unknown) => void) =>
      forQuery(query).add(fn),
    removeEventListener: (_: string, fn: (event: unknown) => void) =>
      forQuery(query).delete(fn),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));

  return Object.assign(stub, {
    /** How many live `change` listeners a query is carrying. */
    listeners: (query: string): number => forQuery(query).size,
    /** Flips a query and dispatches `change`, as the browser does. */
    fire: (query: string, matches: boolean): void => {
      if (matches) live.add(query);
      else live.delete(query);
      for (const fn of [...forQuery(query)])
        fn({ matches, media: query });
    },
  });
};

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

  /*
   * The change half. Both reads are live subscriptions, and the events
   * that drive them -- a phone rotating past the tablet breakpoint, the OS
   * reduced-motion switch being thrown -- arrive long after mount. The
   * suite used to populate the stub's listener set and never call one, so
   * a `watch` that subscribed to nothing read exactly the same.
   */
  it('follows a query that changes after it was first read', async () => {
    const stub = matchMediaStub([]);
    vi.stubGlobal('matchMedia', stub);
    render(<Viewport />);
    expect(screen.getByText('desktop/full')).toBeVisible();

    await act(async () => {
      stub.fire(MOBILE_QUERY, true);
    });
    expect(screen.getByText('mobile/full')).toBeVisible();

    await act(async () => {
      stub.fire(REDUCED_MOTION_QUERY, true);
    });
    expect(screen.getByText('mobile/reduced')).toBeVisible();

    // And back: a rotation is not a one-way door.
    await act(async () => {
      stub.fire(MOBILE_QUERY, false);
    });
    expect(screen.getByText('desktop/reduced')).toBeVisible();
  });

  it('removes both listeners on unmount, and leaks none per mount', () => {
    const stub = matchMediaStub([]);
    vi.stubGlobal('matchMedia', stub);
    const { unmount } = render(<Viewport />);
    expect(stub.listeners(MOBILE_QUERY)).toBe(1);
    expect(stub.listeners(REDUCED_MOTION_QUERY)).toBe(1);

    unmount();
    expect(stub.listeners(MOBILE_QUERY)).toBe(0);
    expect(stub.listeners(REDUCED_MOTION_QUERY)).toBe(0);

    // SceneRoot is mounted once per tab, but useIsMobile is not: a
    // teardown that forgets one listener per mount is a leak that grows
    // with the session rather than a bug that shows up at once.
    for (let mounted = 0; mounted < 4; mounted += 1) {
      render(<Viewport />).unmount();
    }
    expect(stub.listeners(MOBILE_QUERY)).toBe(0);
    expect(stub.listeners(REDUCED_MOTION_QUERY)).toBe(0);
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

  /*
   * The container's box is a precondition of constructing the map, not
   * styling: mapbox-gl measures clientWidth/clientHeight at construction,
   * and a box of zero height gets a 300px canvas and a strip rather than a
   * globe -- which is exactly what shipped, for months, because
   * .clif-scene was referenced and never defined.
   *
   * SceneRoot's comment says inline style "makes it the one form a jsdom
   * test can actually read back, so the precondition is asserted rather
   * than assumed". jsdom computes no layout, so this is that assertion:
   * the element's own style attribute, read back. The real geometry is the
   * e2e suite's job; this is the claim in the comment being true.
   */
  it('gives the map a full-viewport box to measure', async () => {
    await act(async () => {
      render(
        <MapProvider>
          <SceneRoot />
        </MapProvider>,
      );
    });
    const box = screen.getByTestId('scene-root').style;
    expect(box.position).toBe('fixed');
    expect(box.inset).toBe('0px');
    expect(box.zIndex).toBe('0');
    expect(box.overflow).toBe('hidden');
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

    /*
     * And nothing was unbound twice. Real mapbox-gl ignores an `off` with
     * no matching `on`, so this fake does too -- but it counts them, and a
     * registry that has lost track of what it bound shows up here rather
     * than nowhere. test/scene-layers.test.ts's local map throws on one;
     * this is the same regression caught through the forgiving fake, which
     * is the one that behaves like the library.
     */
    expect(FakeMap.last.calls.strayOff).toEqual([]);
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

  /*
   * The two environment reads again, but as CHANGES.
   *
   * Every test above this point sets a media query before mounting, which
   * only ever exercises the mount-time read. The scene is mounted once per
   * tab and never unmounted, so the mount-time read is the least
   * interesting of the two: a phone rotating, a tablet being turned, an OS
   * reduced-motion switch thrown mid-session all arrive as `change` on a
   * MediaQueryList that already exists. A subscription that is never
   * called leaves the camera, the terrain, the labels and the rotation
   * stale for the rest of the session, and nothing remounts to correct it.
   */
  it('re-frames when the viewport crosses the breakpoint mid-session', async () => {
    const media = matchMediaStub([]);
    vi.stubGlobal('matchMedia', media);
    await mount();
    const map = FakeMap.last;
    expect(map.calls.easeTo.at(-1)?.zoom).toBe(cameras.hello.zoom);

    await act(async () => {
      media.fire(MOBILE_QUERY, true);
    });
    // The mobile artboard, on the same map: a rotation is not a remount.
    expect(map.calls.easeTo.at(-1)?.zoom).toBe(1.4);
    expect(FakeMap.instances).toHaveLength(1);

    await act(async () => {
      media.fire(MOBILE_QUERY, false);
    });
    expect(map.calls.easeTo.at(-1)?.zoom).toBe(cameras.hello.zoom);
  });

  it('stops the globe when reduced motion is turned on mid-session', async () => {
    const media = matchMediaStub([]);
    vi.stubGlobal('matchMedia', media);
    await mount();
    const map = FakeMap.last;
    await act(async () => {
      await frame();
    });
    expect(map.calls.bearing.length).toBeGreaterThan(0);

    await act(async () => {
      media.fire(REDUCED_MOTION_QUERY, true);
    });
    const spun = map.calls.bearing.length;
    await act(async () => {
      await frame();
      await frame();
    });
    // The rotation stopped, and the travelling dash with it.
    expect(map.calls.bearing).toHaveLength(spun);
    const dashOpacity = map.calls.paint
      .filter(
        ([layer, property]) =>
          layer === WORK_PATH_DASH && property === 'line-opacity',
      )
      .at(-1)?.[2];
    expect(dashOpacity).toBe(0);
  });

  /*
   * The dash loop itself, driven to completion rather than left to
   * whichever frame happens to land inside an `act`. It is also the one
   * branch in scene/mapbox/instance.ts whose coverage moved between two
   * identical runs, because nothing forced a frame while the style was
   * ready and the dash layer mounted.
   */
  it('walks the dash along the work path, three steps and no more', async () => {
    await mount();
    const map = FakeMap.last;
    const dashes = () =>
      map.calls.paint.filter(
        ([layer, property]) =>
          layer === WORK_PATH_DASH && property === 'line-dasharray',
      );

    await act(async () => {
      for (
        let spent = 0;
        spent < 20 && dashes().length === 0;
        spent += 1
      ) {
        await frame();
      }
    });

    expect(dashes().length).toBeGreaterThan(0);
    for (const [, , value] of dashes()) {
      expect([
        [0, 4, 3],
        [0, 3, 4],
        [0, 2, 5],
      ]).toContainEqual(value);
    }
  });

  it('skips a dash layer the style dropped underneath the loop', async () => {
    await mount();
    const map = FakeMap.last;
    const dashes = () =>
      map.calls.paint.filter(
        ([layer, property]) =>
          layer === WORK_PATH_DASH && property === 'line-dasharray',
      );
    await act(async () => {
      for (
        let spent = 0;
        spent < 20 && dashes().length === 0;
        spent += 1
      ) {
        await frame();
      }
    });
    expect(dashes().length).toBeGreaterThan(0);

    // A style reload drops our layers; the loop outlives them, because it
    // is owned by the route rather than by the style.
    map.removeLayer(WORK_PATH_DASH);
    const painted = map.calls.paint.length;
    const spun = map.calls.bearing.length;
    await act(async () => {
      await frame();
      await frame();
    });

    // Still turning, and not writing a paint property to a layer that is
    // not there -- which is the call that throws in real mapbox-gl.
    expect(map.calls.bearing.length).toBeGreaterThan(spun);
    expect(map.calls.paint).toHaveLength(painted);
  });

  /*
   * The hazard setConfigProperty actually carries.
   *
   * It is not the style lifecycle -- mapbox does not guard that call at
   * all. It is that `Style.setConfigProperty` looks its fragment up by id
   * and returns if there is none, then looks the key up in the import's
   * schema and returns if there is none: an unknown fragment or a
   * mistyped knob is discarded with no throw, no error event and no
   * console line. The LUT and these keys are the two things nobody can
   * verify without a real Mapbox account, so they are the two that most
   * need a test.
   */
  it('drops an unknown config key or fragment in silence, as mapbox does', async () => {
    await mount();
    const map = FakeMap.last;
    expect(() =>
      map.setConfigProperty('basemap', 'showPoiLabels', false),
    ).not.toThrow();
    expect(() =>
      map.setConfigProperty('basemaps', 'lightPreset', 'dawn'),
    ).not.toThrow();

    expect(map.calls.configDiscarded).toEqual([
      ['basemap', 'showPoiLabels', false],
      ['basemaps', 'lightPreset', 'dawn'],
    ]);
    expect(map.calls.config).not.toContainEqual([
      'basemap',
      'showPoiLabels',
      false,
    ]);
  });

  it('sends no config key Standard would discard, on any route', async () => {
    await mount();
    const map = FakeMap.last;
    for (const path of [
      '/projects',
      '/about',
      '/projects/[projectId]',
      '/',
    ]) {
      await navigate(path);
    }

    expect(map.calls.configDiscarded).toEqual([]);
    // Not vacuous: it did hold a conversation.
    expect(map.calls.config.length).toBeGreaterThan(0);
    for (const [fragment, key] of map.calls.config) {
      expect(fragment).toBe(CONFIG_FRAGMENT);
      expect([...STANDARD_CONFIG_SCHEMA]).toContain(key);
    }
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
    /*
     * The whole expression, not a substring of it.
     *
     * `JSON.stringify(...).toContain('5')` was true for every selection
     * and for none: the '5' it found came out of the literal 4.5. Reading
     * the parsed expression is what makes this see a re-selection at all,
     * and it pins which arm carries the live radius -- swapping 4.5 and 3
     * shrinks the selected stop and passes any substring check.
     */
    expect(radius()).toEqual([
      'case',
      ['==', ['get', 'id'], 2],
      4.5,
      3,
    ]);

    await act(async () => {
      view.rerender(
        <MapProvider>
          <SceneRoot />
          <Selecting stop={5} />
        </MapProvider>,
      );
    });
    expect(radius()).toEqual([
      'case',
      ['==', ['get', 'id'], 5],
      4.5,
      3,
    ]);
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

  it('the fake refuses every deferred call before style.load', () => {
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
    expect(Object.keys(calls).sort()).toEqual(
      [...STYLE_DEFERRED].sort(),
    );
    for (const [name, call] of Object.entries(calls)) {
      expect(() => call(), name).toThrow(STYLE_NOT_LOADED);
    }
    // The camera is not guarded, in the fake or in mapbox-gl.
    expect(() => map.easeTo({ zoom: 2 })).not.toThrow();
    expect(() => map.setBearing(4)).not.toThrow();
  });

  /*
   * ...and the list itself, checked against the library rather than
   * against a copy of itself.
   *
   * Nothing in this repo imports mapbox-gl -- scene/mapbox/loader.ts
   * loads it dynamically and every test resolves the stub instead -- so
   * "the methods mapbox-gl guards" was, until now, a claim no test could
   * fail. The installed dev bundle is unminified, so the Style class body
   * can simply be read.
   */
  it('names the Style methods mapbox-gl really guards', () => {
    const guarded = styleMethodsGuardedInMapboxGl();
    // The extraction found a class, not an empty file it could not parse.
    expect(guarded.size).toBeGreaterThan(20);
    expect(guarded).toContain('addLayer');

    // Everything the list claims mapbox guards, mapbox guards.
    for (const name of STYLE_GUARDED) {
      expect(guarded.has(name), name).toBe(true);
    }

    /*
     * And the gap between the two lists is exactly one name, for exactly
     * one reason. Style.setConfigProperty opens with
     * getFragmentStyle(fragmentId) and returns when there is no fragment
     * -- neither it nor getFragmentStyle calls _checkLoaded -- so before
     * style.load the real call is a silent no-op, not a throw. The fake
     * defers it anyway, which costs nothing and is documented on
     * STYLE_DEFERRED. What must not happen is STYLE_GUARDED quietly
     * growing it back, so that the list claims mapbox throws where it
     * silently does nothing.
     */
    const onlyDeferred = STYLE_DEFERRED.filter(
      (name) => !(STYLE_GUARDED as readonly string[]).includes(name),
    );
    expect(onlyDeferred).toEqual(['setConfigProperty']);
    expect(guarded.has('setConfigProperty')).toBe(false);
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
