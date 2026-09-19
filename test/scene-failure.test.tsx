import { act, render, screen } from '@testing-library/react';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { cameras, SPIN_DEG_PER_SECOND } from 'content/cameras';
import { watchCamera } from 'scene/liveCamera';
import MapProvider from 'scene/MapProvider';
import {
  applyCamera,
  applyInteractivity,
  getMap,
  getStyleStatus,
  resetMapForTests,
  setAnimation,
} from 'scene/mapbox/instance';
import SceneRoot from 'scene/SceneRoot';
import { DEFAULT_STYLE } from 'scene/mapbox/loader';
import { BASEMAP_IMPORT } from 'scene/theme';
import { FakeMap, installMapboxStub } from 'test/fake-mapbox';

vi.mock('next/router', () => ({
  useRouter: () => ({ pathname: '/' }),
}));

/*
 * The scene's failure modes, which is the half of it a user only ever
 * sees when something is already wrong.
 *
 * A dynamic import can reject -- a chunk 404 against a stale deploy, a
 * flaky network -- and mapbox's constructor throws outright where there
 * is no WebGL context. Neither used to reach the fallback: the promise
 * was unhandled, so the scene sat at 'pending' for ever with no map and
 * no plate, which is the one failure the plate exists for.
 */
beforeEach(() => {
  resetMapForTests();
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
});

afterEach(() => {
  resetMapForTests();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  vi.doUnmock('scene/mapbox/loader');
  vi.doUnmock('mapbox-gl');
  vi.resetModules();
});

/*
 * The branch production actually takes.
 *
 * Every other test in the suite resolves loadMapboxGl through the injected
 * stub or through the no-token early return, so `pending = import(
 * 'mapbox-gl')` -- the one line that loads the library in a real browser
 * -- had never run. scene/mapbox is excluded from the coverage report, so
 * it could not even show up as a gap: it was simply untested.
 *
 * The memoisation is the part worth pinning. mapbox-gl is a dynamic chunk
 * and the promise, not the resolved module, is what is cached: React 19
 * double-invokes effects, so the second call lands while the first import
 * is still in flight, and caching only the result would fetch the chunk
 * twice and build two libraries.
 */
describe('loading mapbox-gl for real', () => {
  const withToken = async () => {
    const mapboxgl = { Map: class Fake {} };
    const imported = vi.fn(() => ({ default: mapboxgl }));
    vi.doMock('mapbox-gl', imported);
    vi.stubEnv('NEXT_PUBLIC_MAPBOX_TOKEN', 'pk.test');
    vi.resetModules();
    const loader = await import('scene/mapbox/loader');
    return { imported, loader, mapboxgl };
  };

  it('imports the library once and hands the same promise back', async () => {
    const { imported, loader, mapboxgl } = await withToken();
    delete window.__MAPBOX_STUB__;

    // Concurrent, as StrictMode's double-invoked effects are.
    const [first, second] = await Promise.all([
      loader.loadMapboxGl(),
      loader.loadMapboxGl(),
    ]);
    const third = await loader.loadMapboxGl();

    expect(first).toBe(mapboxgl);
    expect(second).toBe(first);
    expect(third).toBe(first);
    // One chunk, not three.
    expect(imported).toHaveBeenCalledTimes(1);
  });

  it('prefers an injected stub over the library, token or not', async () => {
    const { imported, loader } = await withToken();
    const stub = { Map: class Stubbed {} };
    window.__MAPBOX_STUB__ = stub as never;

    await expect(loader.loadMapboxGl()).resolves.toBe(stub);
    expect(imported).not.toHaveBeenCalled();
    delete window.__MAPBOX_STUB__;
  });

  it('never imports it at all without a token', async () => {
    const imported = vi.fn(() => ({ default: {} }));
    vi.doMock('mapbox-gl', imported);
    vi.stubEnv('NEXT_PUBLIC_MAPBOX_TOKEN', '');
    vi.resetModules();
    const loader = await import('scene/mapbox/loader');
    delete window.__MAPBOX_STUB__;

    await expect(loader.loadMapboxGl()).resolves.toBeNull();
    expect(imported).not.toHaveBeenCalled();
  });
});

const mount = async () => {
  await act(async () => {
    render(
      <MapProvider>
        <SceneRoot />
      </MapProvider>,
    );
  });
};

const expectFallback = () => {
  const node = screen.getByTestId('scene-root');
  expect(node).toHaveAttribute('data-scene-state', 'fallback');
  expect(screen.getByTestId('scene-fallback')).toBeInTheDocument();
};

describe('when mapbox-gl cannot be loaded at all', () => {
  it('falls back rather than stranding the scene at pending', async () => {
    const warn = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => {});
    const rejection = vi.fn();
    process.on('unhandledRejection', rejection);

    vi.doMock('scene/mapbox/loader', () => ({
      DEFAULT_STYLE: 'mapbox://styles/mapbox/standard',
      getMapboxToken: () => 'pk.test',
      getMapboxStyle: () => 'mapbox://styles/mapbox/standard',
      loadMapboxGl: () =>
        Promise.reject(new Error('Loading chunk mapbox-gl failed')),
    }));
    vi.resetModules();

    const instance = await import('scene/mapbox/instance');
    const Root = (await import('scene/SceneRoot')).default;
    const Provider = (await import('scene/MapProvider')).default;

    await act(async () => {
      render(
        <Provider>
          <Root />
        </Provider>,
      );
    });

    const node = screen.getByTestId('scene-root');
    expect(node).toHaveAttribute('data-scene-state', 'fallback');
    expect(screen.getByTestId('scene-fallback')).toBeInTheDocument();
    expect(instance.getMap()).toBeNull();
    expect(instance.getStyleStatus()).toBe('failed');

    // It said so, rather than failing mutely. A warning rather than an
    // error, because the plate is up: handled, not silent.
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('mapbox failed to load'),
    );
    // And nothing was left unhandled.
    await act(async () => {});
    expect(rejection).not.toHaveBeenCalled();
    process.off('unhandledRejection', rejection);

    instance.resetMapForTests();
  });

  it('falls back when the constructor throws, as a dead GL context does', async () => {
    const warn = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => {});
    window.__MAPBOX_STUB__ = {
      Map: class {
        constructor() {
          throw new Error('Failed to initialize WebGL');
        }
      },
    } as never;

    await mount();

    expectFallback();
    expect(getMap()).toBeNull();
    expect(getStyleStatus()).toBe('failed');
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('Failed to initialize WebGL'),
    );
    delete window.__MAPBOX_STUB__;
  });
});

describe('mapbox failures after the style has loaded', () => {
  let uninstall: () => void;

  beforeEach(() => {
    uninstall = installMapboxStub();
  });

  afterEach(() => {
    uninstall();
  });

  it('reports a style-level failure as an error', async () => {
    const error = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    await mount();

    // No sourceId: this is the shape a rejected colour-theme LUT or an
    // unknown config key arrives in, and nobody should ever see one.
    await act(async () => {
      FakeMap.last.tileError('Invalid color theme');
    });

    expect(error).toHaveBeenCalledWith(
      expect.stringContaining('Invalid color theme'),
    );
    // Named so the message says which call it followed.
    expect(error).toHaveBeenCalledWith(
      expect.stringContaining('after='),
    );
    // And it contains "mapbox", which is what the e2e failure collector
    // greps console errors for.
    expect(error).toHaveBeenCalledWith(
      expect.stringContaining('mapbox'),
    );
  });

  it('reports a tile failure as a warning, and survives it', async () => {
    const warn = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => {});
    const error = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    await mount();

    await act(async () => {
      FakeMap.last.fire('error', {
        error: new Error('Unauthorized'),
        sourceId: 'mapbox-dem',
      });
    });

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('source=mapbox-dem'),
    );
    // A tile at the edge of coverage is not a defect.
    expect(error).not.toHaveBeenCalled();
    expect(screen.getByTestId('scene-root')).toHaveAttribute(
      'data-scene-state',
      'live',
    );
  });
});

/*
 * THE FAILURE THE USER SAW AND NO TEST COULD.
 *
 * Every tier of the theming is addressed to one import id, and mapbox-gl
 * answers a call for an import that is not there by returning -- no
 * throw, no warning, no error event. So a build pointed at any style
 * that is not Standard-shaped (the site's own old
 * `mapbox://styles/chiefkleef/...`, left behind in
 * NEXT_PUBLIC_MAPBOX_STYLE on a deployment, is the concrete case) came up
 * looking entirely healthy: the scene sent its LUT, mapbox decoded and
 * accepted it, window.__SCENE__.errors() was empty, and the globe wore
 * none of the eight themes.
 *
 * It is a configuration mistake rather than a broken map, so it must not
 * take the scene down -- and it must not be quiet either.
 */
describe('a style that cannot be colour-themed', () => {
  let uninstall: () => void;

  beforeEach(() => {
    uninstall = installMapboxStub({ basemap: false });
  });

  afterEach(() => {
    uninstall();
    delete window.__SCENE_DEBUG__;
  });

  it('names the style and the consequence, and keeps the scene up', async () => {
    vi.stubEnv(
      'NEXT_PUBLIC_MAPBOX_STYLE',
      'mapbox://styles/chiefkleef/legacy',
    );
    const error = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    window.__SCENE_DEBUG__ = true;

    await mount();

    // The style by name, what it cannot do, and the one thing the owner
    // can act on -- all three, because two of them are useless alone.
    expect(error).toHaveBeenCalledWith(
      expect.stringContaining('mapbox://styles/chiefkleef/legacy'),
    );
    expect(error).toHaveBeenCalledWith(
      expect.stringContaining(`has no "${BASEMAP_IMPORT}" import`),
    );
    expect(error).toHaveBeenCalledWith(
      expect.stringContaining('NEXT_PUBLIC_MAPBOX_STYLE'),
    );
    expect(error).toHaveBeenCalledWith(
      expect.stringContaining(DEFAULT_STYLE),
    );

    // Readable from the outside, which is what lets the review tier fail
    // on it instead of photographing a grey globe and calling it green.
    const handle = window.__SCENE__;
    expect(handle?.colorThemeSupported()).toBe(false);
    expect(handle?.styleUrl()).toBe(
      'mapbox://styles/chiefkleef/legacy',
    );
    expect(handle?.errors().join('\n')).toContain(
      `has no "${BASEMAP_IMPORT}" import`,
    );

    // Degraded, not crashed: a basemap wearing the wrong colours is
    // still a basemap, and the rest of the site is untouched.
    expect(screen.getByTestId('scene-root')).toHaveAttribute(
      'data-scene-state',
      'live',
    );
    /*
     * And the theming went nowhere, which is the fact the message
     * asserts. It used to be the colour LUT that vanished; it is the
     * cartography now, which makes the failure bigger rather than
     * smaller -- twelve colours dropped instead of one cube, every one
     * of them silently.
     */
    const map = FakeMap.last;
    expect(map.calls.config).toEqual([]);
    expect(map.calls.configDiscarded.length).toBeGreaterThan(0);
    expect(map.calls.configDiscarded.map(([, key]) => key)).toContain(
      'colorWater',
    );
  });

  it('treats a style that cannot answer the probe as unthemeable', async () => {
    const error = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    window.__SCENE_DEBUG__ = true;
    // A style object old enough, or foreign enough, not to implement
    // getConfigProperty at all. It is still a style this scene cannot
    // theme, and still not a reason to take the tab down.
    window.__MAPBOX_STUB__ = {
      Map: class extends FakeMap {
        getConfigProperty(): unknown {
          throw new TypeError('getConfigProperty is not a function');
        }
      },
    } as unknown as NonNullable<Window['__MAPBOX_STUB__']>;

    await mount();

    expect(window.__SCENE__?.colorThemeSupported()).toBe(false);
    expect(error).toHaveBeenCalledWith(
      expect.stringContaining(`has no "${BASEMAP_IMPORT}" import`),
    );
    expect(screen.getByTestId('scene-root')).toHaveAttribute(
      'data-scene-state',
      'live',
    );
  });
});

describe('watching the camera without a map', () => {
  it('never fires, and unsubscribing is still safe', async () => {
    const seen: [number, number][] = [];
    const stop = watchCamera((center) => seen.push(center));
    await mount();
    // No token means no map, so there is no transform to report. The
    // chrome falls back to the camera it derives for itself.
    expect(screen.getByTestId('scene-root')).toHaveAttribute(
      'data-scene-state',
      'fallback',
    );
    expect(seen).toEqual([]);
    expect(() => stop()).not.toThrow();
  });
});

/*
 * The imperative seam with no map behind it.
 *
 * These guards were read as unreachable from a unit test, which would
 * have meant a test-only export to cover them if scene/mapbox/** were
 * ever folded into coverage. They are not: every one of them is on an
 * exported function, and setAnimation schedules its frame without
 * checking for a map at all, so the loop reaches tick() with nothing to
 * drive. Worth having anyway -- "does nothing, quietly" is the contract
 * the whole no-token path rests on.
 */
describe('driving the scene before there is a map', () => {
  it('moves no camera and enables no handler', () => {
    expect(getMap()).toBeNull();
    expect(() => applyCamera(cameras.hello, 800)).not.toThrow();
    expect(() => applyInteractivity(true)).not.toThrow();
    expect(() => applyInteractivity(false)).not.toThrow();
  });

  it('runs the animation loop without one and stops', async () => {
    // setAnimation arms the frame whatever the map is doing, so this is
    // the path where tick() finds nothing to drive.
    setAnimation(SPIN_DEG_PER_SECOND);
    await act(async () => {
      await new Promise((done) => {
        requestAnimationFrame(() => done(null));
      });
    });
    expect(getMap()).toBeNull();
    // Nothing was built, and nothing threw.
    expect(FakeMap.instances).toHaveLength(0);
  });
});

describe('the debug handle', () => {
  let uninstall: () => void;

  beforeEach(() => {
    uninstall = installMapboxStub();
  });

  afterEach(() => {
    uninstall();
    delete window.__SCENE_DEBUG__;
  });

  it('is absent unless something asked for it before boot', async () => {
    await mount();
    expect(window.__SCENE__).toBeUndefined();
  });

  it('publishes what the map is actually wearing', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    window.__SCENE_DEBUG__ = true;
    await mount();

    const handle = window.__SCENE__;
    expect(handle).toBeDefined();
    expect(handle?.map).toBe(getMap());
    expect(handle?.styleStatus()).toBe('ready');
    /*
     * NEXT_PUBLIC_MAPBOX_STYLE is inlined at build time, so on a deployed
     * preview this handle is the only way to find out which style the
     * build is actually running -- and "which style" is the difference
     * between a themeable globe and a silently un-themeable one.
     */
    expect(handle?.styleUrl()).toBe(DEFAULT_STYLE);
    expect(handle?.colorThemeSupported()).toBe(true);
    /*
     * The handle used to also report the colour LUT the scene had sent.
     * There is no LUT: the cartography is setConfigProperty now, and
     * what the map is wearing is the config record, which the e2e tier
     * reads back off the real style rather than off this handle.
     */
    expect(handle?.lastAction()).not.toBe('none');
    expect(handle?.errors()).toEqual([]);

    await act(async () => {
      FakeMap.last.tileError('Invalid color theme');
    });
    expect(handle?.errors()).toHaveLength(1);
    expect(handle?.errors()[0]).toContain('Invalid color theme');
  });
});
