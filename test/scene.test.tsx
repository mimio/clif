import { act, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  clampDpr,
  DPR_CLAMP,
  MAX_FRAME_BUDGET_MS,
  MIN_FRAME_BUDGET_MS,
  nextFrameBudget,
  prefersReducedMotion,
  terrainExaggeration,
} from 'scene/budget';
import MapProvider, { useScene } from 'scene/MapProvider';
import SceneRoot from 'scene/SceneRoot';
import useSceneCamera from 'scene/useSceneCamera';
import { cameras } from 'content/cameras';

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

const Probe = () => {
  const { camera } = useScene();
  return <p>{camera === null ? 'none' : String(camera.zoom)}</p>;
};

const Page = () => {
  useSceneCamera(cameras.about);
  return null;
};

describe('MapProvider and useSceneCamera', () => {
  it('starts with no camera', () => {
    render(
      <MapProvider>
        <Probe />
      </MapProvider>,
    );
    expect(screen.getByText('none')).toBeVisible();
  });

  it("lets a page declare the scene's camera", () => {
    render(
      <MapProvider>
        <Page />
        <Probe />
      </MapProvider>,
    );
    expect(screen.getByText('10.5')).toBeVisible();
  });

  it('is a no-op outside a provider', () => {
    expect(() => render(<Page />)).not.toThrow();
  });
});

describe('SceneRoot', () => {
  it('renders an empty, decorative container without a token', async () => {
    await act(async () => {
      render(
        <MapProvider>
          <SceneRoot className="x" />
        </MapProvider>,
      );
    });
    const node = screen.getByTestId('scene-root');
    expect(node).toHaveAttribute('aria-hidden', 'true');
    expect(node).toBeEmptyDOMElement();
  });

  it('follows the camera a page declares', async () => {
    await act(async () => {
      render(
        <MapProvider>
          <SceneRoot />
          <Page />
        </MapProvider>,
      );
    });
    expect(screen.getByTestId('scene-root')).toBeInTheDocument();
  });
});

describe('the no-token fallback', () => {
  it('is the path unit tests take', async () => {
    const { loadMapboxGl } = await import('scene/mapbox/loader');
    await expect(loadMapboxGl()).resolves.toBeNull();
    expect(process.env.NEXT_PUBLIC_MAPBOX_TOKEN).toBeFalsy();
    vi.resetModules();
  });
});
