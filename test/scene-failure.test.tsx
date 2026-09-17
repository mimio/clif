import { act, render, screen } from '@testing-library/react';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import MapProvider from 'scene/MapProvider';
import {
  getMap,
  getStyleStatus,
  resetMapForTests,
} from 'scene/mapbox/instance';
import SceneRoot from 'scene/SceneRoot';
import { resetLutCacheForTests } from 'scene/theme';
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
  resetLutCacheForTests();
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
    // The LUT the style is wearing, without patching HTMLImageElement.
    expect(handle?.appliedLut()).toMatch(/^[A-Za-z0-9+/]+={0,2}$/);
    expect(handle?.lastAction()).not.toBe('none');
    expect(handle?.errors()).toEqual([]);

    await act(async () => {
      FakeMap.last.tileError('Invalid color theme');
    });
    expect(handle?.errors()).toHaveLength(1);
    expect(handle?.errors()[0]).toContain('Invalid color theme');
  });
});
