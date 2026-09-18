import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
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
import ChromeRoot from 'components/chrome/ChromeRoot';
import { formatCoordinates } from 'components/chrome/CoordPill';
import { anchors } from 'content/anchors';
import {
  ARTBOARD_DESKTOP,
  cameras,
  fogPresets,
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
  forViewport,
  REDUCED_MOVE_MS,
  SCENE_REFRAME_MS,
} from 'scene/camera';
import {
  HISTORY_POINTS,
  HISTORY_RING,
  layerSetsFor,
  SITE_LABELS,
  SITE_POINTS,
} from 'scene/layers/sets';
import MapProvider, {
  SceneContext,
  useScene,
  useSceneHover,
  useSceneView,
} from 'scene/MapProvider';
import {
  applyTerrain,
  ensureMap,
  getMap,
  getStyleStatus,
  resetMapForTests,
  syncLayers,
} from 'scene/mapbox/instance';
import { watchCamera } from 'scene/liveCamera';
import { loadMapboxGl } from 'scene/mapbox/loader';
import SceneRoot from 'scene/SceneRoot';
import { globeLimbAngle } from 'scene/globe';
import {
  horizonBlendFor,
  livePalette,
  resetLutCacheForTests,
  THEME_EVENT,
} from 'scene/theme';
import useSceneCamera from 'scene/useSceneCamera';
import {
  MOBILE_QUERY,
  readViewport,
  REDUCED_MOTION_QUERY,
  useIsMobile,
  useReducedMotion,
  useViewportSize,
} from 'scene/useViewport';
import { applyTheme, THEME_IDS } from 'styles/theme-bootstrap';
import { FALLBACK_PALETTE } from 'styles/tokens/palette';
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

  /*
   * The helper is only worth having if something calls it, and for a
   * while nothing did -- the file claimed "DPR is clamped to 1.5
   * everywhere" while the only production read of devicePixelRatio was
   * unclamped. It lives in utils/ so the screenshot plane's shader can
   * reach it across the layer rule, and that is the surface that applies
   * it.
   *
   * The map cannot: mapbox-gl 3.30 exposes no pixel-ratio option and no
   * setter, and reads window.devicePixelRatio through a getter of its
   * own. That is recorded rather than worked around.
   */
  it('is the dial the shader actually reaches for', async () => {
    const shader = await readFile(
      resolve(
        process.cwd(),
        'components/composed/ScreenshotPlane/GlitchImage.tsx',
      ),
      'utf8',
    );
    expect(shader).toContain(
      'setPixelRatio(clampDpr(window.devicePixelRatio))',
    );
    expect(shader).toContain("from 'utils/dpr'");
    // And nothing reads the raw value straight into a renderer.
    expect(shader).not.toContain(
      'setPixelRatio(window.devicePixelRatio)',
    );
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
    expect(
      screen.getByText(`${cameras.hello.zoom}/clear`),
    ).toBeVisible();
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

/* ---- the box the globe is framed in ------------------------------------ */

const Box = () => {
  const box = useViewportSize();
  return (
    <p>{box === null ? 'no layout' : `${box.width}x${box.height}`}</p>
  );
};

/** jsdom has no layout, so clientWidth/Height are set by hand here. */
const setLayout = (width: number, height: number): void => {
  const root = document.documentElement;
  Object.defineProperty(root, 'clientWidth', {
    configurable: true,
    value: width,
  });
  Object.defineProperty(root, 'clientHeight', {
    configurable: true,
    value: height,
  });
};

describe('the scene box', () => {
  afterEach(() => {
    setLayout(0, 0);
  });

  it('answers null where there is no layout to read', () => {
    // jsdom, and the server. frameCamera reads that as "leave the
    // table's artboard framing alone" rather than inventing a width.
    render(<Box />);
    expect(screen.getByText('no layout')).toBeVisible();
  });

  it('has no box on the server either', () => {
    // There is no layout there to have one, and the artboard camera in
    // the table is what a server render is describing.
    expect(renderToStaticMarkup(<Box />)).toContain('no layout');
  });

  it('reports the layout viewport, not the window', () => {
    setLayout(1440, 900);
    render(<Box />);
    expect(screen.getByText('1440x900')).toBeVisible();
  });

  it('follows a resize, and hands back the same object until it changes', () => {
    setLayout(1440, 900);
    render(<Box />);
    act(() => {
      setLayout(1280, 800);
      window.dispatchEvent(new Event('resize'));
    });
    expect(screen.getByText('1280x800')).toBeVisible();

    /*
     * useSyncExternalStore compares snapshots by identity, so a fresh
     * object per read would re-render for ever. This is the only place
     * that can say so: React throws "getSnapshot should be cached" only
     * after it has already looped.
     */
    expect(readViewport()).toBe(readViewport());

    act(() => {
      setLayout(0, 0);
      window.dispatchEvent(new Event('resize'));
    });
    expect(screen.getByText('no layout')).toBeVisible();
  });

  it('stops listening on unmount', () => {
    const add = vi.spyOn(window, 'addEventListener');
    const remove = vi.spyOn(window, 'removeEventListener');
    const { unmount } = render(<Box />);
    const resizes = add.mock.calls.filter(
      ([type]) => type === 'resize',
    );
    expect(resizes).toHaveLength(1);
    unmount();
    expect(
      remove.mock.calls.filter(([type]) => type === 'resize'),
    ).toHaveLength(1);
    add.mockRestore();
    remove.mockRestore();
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

  /*
   * NAVIGATED, not mounted. Mounting at the detail route cannot see this
   * at all: the scene is still 'pending' while the stale pass runs, so
   * only one move is ever issued and any assertion reading easeTo[0] and
   * easeTo.at(-1) passes on a two-move sequence too.
   *
   * On a real navigation SceneRoot's effect runs before the page's, so
   * the first pass sees the PREVIOUS route's camera. Rejecting it is not
   * the same as having the right one, and the table's detail entry is a
   * placeholder -- gopro's -- so every project used to fly 900ms to
   * Colorado and then re-aim over 600ms.
   */
  it('flies once into the detail, to the page s own centre', async () => {
    pathname.current = '/projects';
    await mount();
    const map = FakeMap.last;
    const before = map.calls.easeTo.length;

    const cambridge = cameraAt(
      cameras.projectDetail,
      [-71.11, 42.37],
    );
    const Detail = () => {
      useSceneCamera(cambridge);
      return null;
    };
    await navigate(
      '/projects/[projectId]',
      <>
        <SceneRoot />
        <Detail />
      </>,
    );

    const moves = map.calls.easeTo.slice(before);
    expect(moves).toHaveLength(1);
    expect(moves[0].center).toEqual(cambridge.center);
    expect(moves[0].duration).toBe(SCENE_MOVE_LONG_MS);
    // Never the table's placeholder, not even for gopro, whose real
    // anchor is a different coordinate from it.
    for (const move of moves) {
      expect(move.center).not.toEqual(cameras.projectDetail.center);
    }
  });

  it('waits rather than flying to a placeholder it will have to leave', async () => {
    pathname.current = '/projects';
    await mount();
    const map = FakeMap.last;
    const before = map.calls.easeTo.length;

    // A detail route that declares nothing: the scene holds where it is.
    await navigate('/projects/[projectId]');
    expect(map.calls.easeTo.slice(before)).toEqual([]);
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
    // Terrain is off and stays off: a route that does not want it does
    // not spend a setTerrain saying so.
    expect(FakeMap.last.calls.terrain).toEqual([]);

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

  /*
   * The removal counterpart of the DEM race above, and the one that took
   * the app down after a few navigations.
   *
   * Map.removeSource re-runs the terrain evaluation, and Terrain.update
   * reads style.terrain.properties, which does not exist between
   * setTerrain() and mapbox's next recalculate. Attaching terrain and
   * then unmounting a layer set in the same tick is therefore fatal --
   * and it is exactly what entering a detail route from projects does.
   *
   * It needed a SECOND visit to a terrain route to show up: on the first
   * the DEM has not loaded, terrain parks itself, and nothing is
   * attached when the sources go. Every single-navigation test passed.
   */
  it('never removes a source with terrain attached', async () => {
    pathname.current = '/projects';
    await mount();
    const map = FakeMap.last;

    // First visit: the DEM resolves, so terrain really is attached.
    await navigate('/projects/[projectId]');
    await act(async () => {
      map.loadSource('mapbox-dem');
    });
    expect(map.terrainSource).toBe('mapbox-dem');

    // Back out and in again. This is the navigation that died: the
    // projects layer set has to come off while terrain is already on.
    await navigate('/projects');
    await navigate('/projects/[projectId]');
    expect(map.terrainSource).toBe('mapbox-dem');
    expect(map.getLayer(SITE_POINTS)).toBeUndefined();
  });

  it('leaves terrain alone moving between two terrain routes', async () => {
    pathname.current = '/about';
    await mount();
    const map = FakeMap.last;
    await act(async () => {
      map.loadSource('mapbox-dem');
    });
    expect(map.terrainSource).toBe('mapbox-dem');
    expect(map.getLayer(HISTORY_POINTS)).toBeDefined();
    const settings = map.calls.terrain.length;

    /*
     * about and the detail route both want terrain at the same
     * exaggeration, so the right number of setTerrain calls is zero --
     * and taking it off first would be actively wrong, since on a globe
     * setTerrain(null) installs a fresh draping terrain that the very
     * next removeSource would throw on.
     */
    await navigate('/projects/[projectId]');
    expect(map.calls.terrain).toHaveLength(settings);
    expect(map.terrainSource).toBe('mapbox-dem');
    expect(map.getLayer(HISTORY_POINTS)).toBeUndefined();
  });

  /*
   * The hazard that ordering alone does not close.
   *
   * Within one pass the scene removes sources before it sets terrain, so
   * a single scene pass is safe. But a SECOND flush in the same frame --
   * and mapbox hands the scene plenty of those, through sourcedata while
   * a route's sources are being added -- can remove a source after the
   * earlier pass set terrain, which is the window where
   * style.terrain.properties does not exist yet. That is what survived
   * five navigations and killed the sixth.
   *
   * Driven straight at the seam here, because going through SceneRoot
   * batches the two into one pass and hides it.
   */
  it('holds a removal back until mapbox has recalculated terrain', async () => {
    pathname.current = '/about';
    await mount();
    const map = FakeMap.last;
    await act(async () => {
      map.loadSource('mapbox-dem');
    });
    expect(map.getLayer(HISTORY_POINTS)).toBeDefined();

    // Two flushes, one frame: a real terrain change, then a removal.
    applyTerrain(1);
    expect(map.calls.terrain.at(-1)).toEqual({
      source: 'mapbox-dem',
      exaggeration: 1,
    });
    const empty = layerSetsFor('projectDetail', {
      palette: FALLBACK_PALETTE,
      hover: null,
      labels: true,
      selectedStop: null,
      onHoverAnchor: vi.fn(),
      onSelectAnchor: vi.fn(),
    });
    expect(() => syncLayers(empty, FALLBACK_PALETTE)).not.toThrow();

    // Held back, not dropped: still mounted for now...
    expect(map.getLayer(HISTORY_POINTS)).toBeDefined();
    // ...and gone once mapbox has rendered.
    await act(async () => {});
    expect(map.getLayer(HISTORY_POINTS)).toBeUndefined();
  });

  /*
   * terrainExaggeration's mobile branch had no guarantee through the
   * hooks: the unit test called it directly, and nothing asserted that a
   * mobile /about actually drapes at 1.0 rather than the desktop 1.4.
   */
  it('flattens terrain to 1.0 below the breakpoint', async () => {
    vi.stubGlobal('matchMedia', matchMediaStub([MOBILE_QUERY]));
    pathname.current = '/about';
    await mount();
    const map = FakeMap.last;
    await act(async () => {
      map.loadSource('mapbox-dem');
    });
    expect(map.calls.terrain.at(-1)).toEqual({
      source: 'mapbox-dem',
      exaggeration: 1,
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

    /*
     * And `/` takes the last route's layers off and adds none of its
     * own: hello has no data to draw, so the registry's job there is
     * the removal and nothing else. Asserted on the map's whole layer
     * table rather than on one id, because "no layers" is the claim.
     */
    await navigate('/');
    expect([...FakeMap.last.layers.keys()]).toEqual([]);

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
    // A route that HAS layers: hello draws nothing of its own.
    pathname.current = '/projects';
    await mount();
    const colors = FakeMap.last.calls.paint.filter(
      ([layer, property]) =>
        layer === SITE_POINTS && property === 'circle-stroke-color',
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

  /*
   * THE CALL, not just the payload.
   *
   * `map.setColorTheme(lut)` and `map.setImportColorTheme('basemap', lut)`
   * are indistinguishable from every seam this project had: both succeed,
   * both decode, both leave appliedLut() reporting a LUT and errors()
   * empty. Only one of them re-tints the globe. Standard's layers live in
   * the `basemap` fragment and take their LUT from that scope
   * (scene/theme.ts's BASEMAP_IMPORT has mapbox-gl's side of it), so the
   * root call themes the layers WE added and nothing else -- which is
   * exactly the site the owner loaded and described as "not styled at all
   * with a theme".
   *
   * So the fake records the two separately, and this asserts which one
   * the scene makes.
   */
  it('themes the basemap import, and never the root style', async () => {
    await mount();
    const map = FakeMap.last;

    expect(map.calls.colorTheme).toHaveLength(1);
    expect(map.calls.colorThemeImports).toEqual([CONFIG_FRAGMENT]);
    // The root style's colour theme is the one that quietly does
    // nothing to the globe. Nothing in the app may reach for it.
    expect(map.calls.rootColorTheme).toEqual([]);
    // And nothing was addressed to an import the style does not have,
    // which mapbox drops without a word.
    expect(map.calls.colorThemeDiscarded).toEqual([]);

    await act(async () => {
      applyTheme('teal');
      await settle();
    });
    expect(map.calls.colorThemeImports).toEqual([
      CONFIG_FRAGMENT,
      CONFIG_FRAGMENT,
    ]);
    expect(map.calls.rootColorTheme).toEqual([]);
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

  it('rotates the hello globe, once it has arrived', async () => {
    await mount();
    const map = FakeMap.last;

    /*
     * Not while the route's flight is still in the air. setCenter is
     * jumpTo and jumpTo stops the flight, so a loop that turned during
     * one would cancel it a frame in -- which is what left the globe
     * short of every camera it was sent to.
     */
    await act(async () => {
      await new Promise((done) => {
        requestAnimationFrame(() => done(null));
      });
    });
    expect(map.calls.center).toEqual([]);

    map.endEase();
    await act(async () => {
      await new Promise((done) => {
        requestAnimationFrame(() => done(null));
      });
    });
    expect(map.calls.center.length).toBeGreaterThan(0);

    /*
     * And it turns the EARTH: the centre meridian walks east, which is
     * what carries the ground left across the screen, while the bearing
     * is never written at all. How far it gets in a frame is a wall-clock
     * question and belongs to e2e/hermetic/globe-spin.spec.ts; that it
     * moves the right axis the right way is answerable here.
     */
    const [lng, lat] = map.calls.center[0];
    expect(lng).toBeGreaterThan(cameras.hello.center[0]);
    expect(lat).toBe(cameras.hello.center[1]);
    expect(map.calls.bearing).toEqual([]);
  });

  it('does not rotate over a camera that is still flying', async () => {
    /*
     * mapbox's setCenter IS jumpTo, and jumpTo opens with `this.stop()`
     * -- so a rotation written during a flight cancels it. The hello
     * globe was stopped by its own spin about 8% into its 800ms move and
     * sat there, which is most of what "the globe is too small and in
     * the middle" was. Nothing but the rate is asserted anywhere else,
     * and a rate is not a rotation that happened at the right time.
     */
    await mount();
    const map = FakeMap.last;
    map.easing = true;
    const before = map.calls.center.length;
    await act(async () => {
      await new Promise((done) => {
        requestAnimationFrame(() => done(null));
      });
    });
    expect(map.calls.center).toHaveLength(before);

    map.easing = false;
    await act(async () => {
      await new Promise((done) => {
        requestAnimationFrame(() => done(null));
      });
    });
    expect(map.calls.center.length).toBeGreaterThan(before);
  });

  /*
   * A YIELD IS NOT A DEBT. The rotation is scaled by the milliseconds
   * since it last ran, so a loop that simply remembered the last time it
   * WROTE would come out of an 800ms flight and apply 800ms of rotation
   * in a single frame -- a globe that lurches on arrival. The clock moves
   * on every tick, written or not.
   */
  it('does not bank the rotation it held back', async () => {
    await mount();
    const map = FakeMap.last;
    map.easing = true;
    const frame = async (): Promise<void> => {
      await act(async () => {
        await new Promise((done) => {
          requestAnimationFrame(() => done(null));
        });
      });
    };
    // Several frames of flight, each one held back.
    await frame();
    await frame();
    await frame();
    await frame();
    expect(map.calls.center).toEqual([]);

    map.easing = false;
    await frame();
    const [lng] = map.calls.center[0];
    /*
     * One frame's worth, not four frames' plus the flight's. jsdom's rAF
     * runs at about 16ms, so a single step is well under a hundredth of a
     * degree; a banked one would be several hundredths at least. Half a
     * degree is far above either and far below anything visible, so this
     * fails on a lurch and cannot fail on timing.
     */
    expect(lng - cameras.hello.center[0]).toBeGreaterThan(0);
    expect(lng - cameras.hello.center[0]).toBeLessThan(0.5);
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
    expect(FakeMap.last.calls.center).toEqual([]);
  });

  it('applies the mobile artboard camera below the breakpoint', async () => {
    vi.stubGlobal('matchMedia', matchMediaStub([MOBILE_QUERY]));
    await mount();
    const mobileHello = forViewport(cameras.hello, 'hello', true);
    expect(FakeMap.last.calls.easeTo[0].zoom).toBe(mobileHello.zoom);
    expect(mobileHello.zoom).not.toBe(cameras.hello.zoom);
  });

  /*
   * forViewport builds a fresh object for every mobile camera, so the
   * identity guard saw two different cameras for one destination and
   * fired a second easeTo into the first one's flight. Desktop hid it,
   * because there forViewport hands back the same reference.
   */
  it('moves once per route change on mobile, not twice', async () => {
    vi.stubGlobal('matchMedia', matchMediaStub([MOBILE_QUERY]));
    await mount();
    const map = FakeMap.last;
    const before = map.calls.easeTo.length;

    await navigate('/projects');
    const moves = map.calls.easeTo.slice(before);
    expect(moves).toHaveLength(1);
    expect(moves[0].duration).toBe(SCENE_MOVE_MS);
    expect(moves[0].zoom).toBe(2.2);
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
    expect(map.calls.easeTo.at(-1)?.zoom).toBe(
      forViewport(cameras.hello, 'hello', true).zoom,
    );
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
    // The globe only turns once the route's flight has landed.
    map.endEase();
    await act(async () => {
      await frame();
    });
    expect(map.calls.center.length).toBeGreaterThan(0);

    await act(async () => {
      media.fire(REDUCED_MOTION_QUERY, true);
    });
    const spun = map.calls.center.length;
    await act(async () => {
      await frame();
      await frame();
    });
    // The rotation stopped.
    expect(map.calls.center).toHaveLength(spun);
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

  /*
   * The coordinate readout can derive where the camera is GOING, from
   * the same pure functions SceneRoot uses. What it cannot derive is
   * where the camera IS mid-flight, because easeTo does not interpolate
   * lng/lat linearly. So it reads the transform back instead.
   */
  it('reports the map s centre on every move', async () => {
    const seen: [number, number][] = [];
    const stop = watchCamera((center) => seen.push(center));
    await mount();

    // Fired once for the map's creation, with its current transform...
    expect(seen.length).toBeGreaterThan(0);
    // ...and again for the route's camera move.
    expect(seen.at(-1)).toEqual(cameras.hello.center);

    await navigate('/projects');
    expect(seen.at(-1)).toEqual(cameras.projects.center);

    const settled = seen.length;
    stop();
    await navigate('/about');
    expect(seen).toHaveLength(settled);
  });

  it('starts a subscriber that arrives after the map on the live value', async () => {
    await mount();
    const seen: [number, number][] = [];
    const stop = watchCamera((center) => seen.push(center));
    // Immediately, without waiting for a move: a pill that mounts
    // mid-flight still has somewhere to start.
    expect(seen).toEqual([cameras.hello.center]);
    stop();
  });

  /*
   * B2. And the chrome actually reads it.
   *
   * The subscription above existed and nothing subscribed, which was
   * harmless while the rotation rolled the BEARING -- nothing in the
   * chrome reads bearing. The rotation walks the CENTRE now, so a pill
   * fed from the route table starts lying the moment the globe starts
   * turning and is a hundred and eighty degrees out two minutes later.
   *
   * Rendered with SceneRoot rather than alone, because what is under
   * test is the two of them over ONE map: the scene drives it, the
   * chrome reads it back.
   */
  it('feeds the coordinate pill from the map, not from the route table', async () => {
    await mount(
      <>
        <SceneRoot />
        <ChromeRoot />
      </>,
    );
    const map = FakeMap.last;
    const readout = () =>
      screen.getByTestId('coord-readout').textContent;

    // At rest the two agree, which is why this was invisible.
    expect(readout()).toBe(
      formatCoordinates(...cameras.hello.center),
    );

    /*
     * The globe turns once the route's flight has landed.
     *
     * TWO FRAMES, and the centre is read BETWEEN them, which is the
     * shape of the readout rather than a convenience. The first frame is
     * the spin's own tick: it writes the centre and mapbox fires `move`.
     * The pill does not render on that event -- it holds the newest
     * value and commits it on the NEXT animation frame, which is what
     * bounds the chrome to one render per frame however fast the events
     * arrive (see components/chrome/LiveCoordPill.tsx). So the transform
     * is sampled where the pill was handed it, and the second frame is
     * the commit.
     *
     * The claim is unchanged and is the one that matters: the number on
     * screen is A CENTRE THE MAP ANNOUNCED, not the route table's. On a
     * globe that never stops turning the two can never be compared at
     * the same instant -- the transform has always moved on by a frame,
     * which is what e2e/hermetic/coord-pill.spec.ts bounds at half a
     * degree against the real library.
     */
    map.endEase();
    await act(async () => {
      await frame();
    });
    const { lng, lat } = map.getCenter();
    await act(async () => {
      await frame();
    });
    expect(lng).toBeGreaterThan(cameras.hello.center[0]);
    expect(readout()).toBe(formatCoordinates(lng, lat));
    expect(readout()).not.toBe(
      formatCoordinates(...cameras.hello.center),
    );
  });

  /*
   * ...and the caption does not follow it. `held` is a statement about
   * whose camera it is, which the DECLARED camera answers and a centre
   * cannot -- so the detail route still says so while the readout is
   * free to track the transform.
   */
  it('keeps the held caption on the detail route', async () => {
    pathname.current = '/projects/[projectId]';
    await mount(
      <>
        <SceneRoot />
        <ChromeRoot />
      </>,
    );
    expect(screen.getByTestId('coord-caption').textContent).toBe(
      'held',
    );
  });

  /*
   * The fog that reaches the map is THEME COLOUR at DESIGN ALPHA, not a
   * fixed hex. Every number here comes from somewhere: the alphas are
   * `paintSphere`'s two rim peaks, the colours are the palette's, and
   * horizon-blend is solved per camera -- see fogFor in scene/theme.ts.
   * The solve itself is pinned in test/scene-theme.test.ts; what this
   * asserts is that the scene sends the solved value rather than a
   * constant.
   */
  it('fogs the scene from the route preset, in the theme', async () => {
    await mount();
    const fog = FakeMap.last.calls.fog.at(-1);
    const palette = livePalette();
    expect(fog?.range).toEqual([0.6, 12]);
    expect(fog?.color).toBe(palette.a(0.2));
    expect(fog?.['high-color']).toBe(palette.b(0.13));
    expect(fog?.['space-color']).toBe(
      `rgb(${palette.space[0]}, ${palette.space[1]}, ${palette.space[2]})`,
    );
    // jsdom has no layout, so the viewport is null and the artboard is
    // what the atmosphere is solved against -- the same fallback
    // frameCamera takes for the camera itself.
    expect(fog?.['horizon-blend']).toBeCloseTo(
      horizonBlendFor(
        fogPresets.space,
        globeLimbAngle(cameras.hello.zoom, ARTBOARD_DESKTOP.height),
      ),
      12,
    );
    // And it is NOT the constant the scene used to send.
    expect(fog?.['horizon-blend']).not.toBeCloseTo(0.04, 3);
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
      setImportColorTheme: () =>
        map.setImportColorTheme('basemap', { data: 'x' }),
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
    /*
     * Neither is getConfigProperty, in either. It resolves the fragment
     * and reads its schema, so before style.load it answers null rather
     * than throwing -- which is what makes it usable as the scene's
     * "can this style be themed at all" probe.
     */
    expect(() =>
      map.getConfigProperty('basemap', 'lightPreset'),
    ).not.toThrow();
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
    /*
     * And the gap between the two lists is exactly two names, for
     * exactly one reason. Style.setConfigProperty and
     * Style.setImportColorTheme both open with
     * getFragmentStyle(fragmentId) and return when there is no fragment
     * -- neither they nor getFragmentStyle call _checkLoaded -- so
     * before style.load the real calls are silent no-ops, not throws.
     * The fake defers both, which costs nothing and is documented on
     * STYLE_DEFERRED. What must not happen is STYLE_GUARDED quietly
     * growing either back, so that the list claims mapbox throws where
     * it silently does nothing.
     *
     * setColorTheme IS guarded, and stays on the guarded list -- it is
     * the root style's, and the app must never call it. That is asserted
     * where the theme is, not here.
     */
    const onlyDeferred = STYLE_DEFERRED.filter(
      (name) => !(STYLE_GUARDED as readonly string[]).includes(name),
    );
    expect(onlyDeferred).toEqual([
      'setConfigProperty',
      'setImportColorTheme',
    ]);
    expect(guarded.has('setConfigProperty')).toBe(false);
    expect(guarded.has('setImportColorTheme')).toBe(false);
    expect(guarded.has('setColorTheme')).toBe(true);
  });

  it('touches nothing at all before style.load, the camera included', async () => {
    await mount();
    const map = FakeMap.last;
    expect(map.styleLoaded).toBe(false);
    /*
     * THE CAMERA WAITS TOO, and this assertion used to say the opposite.
     *
     * It was written on the grounds that easeTo has no style
     * precondition -- which is true of what it WRITES and false of what
     * it does. easeTo is an animation, and it advances only on the map's
     * render frames, of which a map with no stylesheet has none. The
     * move sat at t=0 until the style arrived and mapbox dropped it on
     * the way through, leaving the transform at its constructed [0, 0]
     * zoom 0 for the life of the tab.
     *
     * Nothing here could see that: the fake lands an easeTo in one step,
     * so "easeTo was called" and "the camera moved" are the same fact
     * against the stub and two very different facts against mapbox.
     * e2e/hermetic/globe-frame.spec.ts measures the second one.
     */
    expect(map.calls.easeTo).toEqual([]);
    // Everything that would have thrown.
    expect(map.calls.colorTheme).toEqual([]);
    expect(map.calls.config).toEqual([]);
    expect(map.calls.fog).toEqual([]);
    expect(map.calls.terrain).toEqual([]);
    expect(map.layers.size).toBe(0);
  });

  it('flies the route camera the moment the style arrives', async () => {
    await mount();
    const map = FakeMap.last;
    await act(async () => {
      map.loadStyle();
    });
    expect(map.calls.easeTo).toHaveLength(1);
    expect(map.calls.easeTo[0].center).toEqual(cameras.hello.center);
    expect(map.calls.easeTo[0].zoom).toBe(cameras.hello.zoom);
    expect(map.calls.easeTo[0].padding).toEqual(
      cameras.hello.padding,
    );
  });

  it('applies everything it was asked for once the style loads', async () => {
    await mount();
    const map = FakeMap.last;
    await act(async () => {
      map.loadStyle();
    });
    expect(map.calls.colorTheme).toHaveLength(1);
    expect(map.calls.fog).toHaveLength(1);
    // hello wants no terrain and none is attached, so nothing is sent.
    expect(map.calls.terrain).toEqual([]);
    expect(map.calls.config).toContainEqual([
      'basemap',
      'lightPreset',
      'dawn',
    ]);
    // And the layer diff ran: hello wants no sets, so the map carries
    // none -- which is a want that was applied, not one that was lost.
    expect([...map.layers.keys()]).toEqual([]);
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

  /*
   * 'failed' is provisional, and both stubs used to make that
   * unknowable by modelling the one shape the design assumed: an error
   * and no style.load.
   */
  it('comes back from the plate when the style loads after an error', async () => {
    const warn = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => {});
    await mount();
    const map = FakeMap.last;

    // mapbox fires the import failure and THEN style.load, in that
    // order, synchronously.
    await act(async () => {
      map.failImportThenLoad();
    });

    expect(getStyleStatus()).toBe('ready');
    // The plate must not sit over a globe that works.
    expect(screen.getByTestId('scene-root')).toHaveAttribute(
      'data-scene-state',
      'live',
    );
    expect(
      screen.queryByTestId('scene-fallback'),
    ).not.toBeInTheDocument();
    // And the scene really did apply itself to the map it now has.
    expect(map.calls.colorTheme).toHaveLength(1);
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('Failed to load imports'),
    );
  });

  it('does not plate the scene for a source that 401s while loading', async () => {
    const warn = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => {});
    const error = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    await mount();
    const map = FakeMap.last;

    // Sources begin fetching before style.load, so this is routine --
    // the same shape that is routine a moment later.
    await act(async () => {
      map.failSourceWhileLoading('mapbox-dem');
    });
    expect(getStyleStatus()).toBe('loading');

    await act(async () => {
      map.loadStyle();
    });
    expect(getStyleStatus()).toBe('ready');
    expect(screen.getByTestId('scene-root')).toHaveAttribute(
      'data-scene-state',
      'live',
    );
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('mapbox-dem'),
    );
    expect(error).not.toHaveBeenCalled();
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

  it('turns nothing until there is a style to turn', async () => {
    await mount();
    const map = FakeMap.last;
    const frame = async () => {
      await act(async () => {
        await new Promise((done) => {
          requestAnimationFrame(() => done(null));
        });
      });
    };
    await frame();

    /*
     * The rotation does not run. The camera setters have no style
     * precondition of their own, so a rotating route kept driving a dead
     * style for the life of the tab, behind the fallback plate where
     * nothing showed it.
     */
    expect(map.calls.center).toEqual([]);
    expect(map.calls.paint).toEqual([]);

    await act(async () => {
      map.loadStyle();
    });
    map.endEase();
    await frame();
    expect(map.calls.center.length).toBeGreaterThan(0);
  });
});
