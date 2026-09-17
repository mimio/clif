import { act, render, screen } from '@testing-library/react';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { watchCamera } from 'scene/liveCamera';
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
  vi.restoreAllMocks();
  vi.doUnmock('scene/mapbox/loader');
  vi.resetModules();
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
