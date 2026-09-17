import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { cameras } from 'content/cameras';
import { sceneIdForPath } from 'scene/camera';
import MapProvider, { useScene } from 'scene/MapProvider';
import NotFoundPage from 'pagesComponents/notFound';

/*
 * There is no 404 artboard (design inventory 8, gap 16), so what can be
 * tested is what the system does specify: the camera, the copy, the UFO and
 * one way back.
 */

vi.mock('next/router', () => ({
  useRouter: () => ({ pathname: '/404', query: {} }),
}));

describe('the 404, interpolated from the system', () => {
  it('is the UFO, the readme’s line and one way home', () => {
    render(<NotFoundPage />);

    expect(screen.getByText('404')).toBeVisible();
    expect(screen.getByRole('img', { name: 'UFO' })).toBeVisible();
    expect(
      screen.getByText('It Looks Like You Are Lost'),
    ).toBeVisible();
    expect(
      screen.getByRole('link', { name: /take me home/ }),
    ).toHaveAttribute('href', '/');
  });

  it('sits on 1a’s stage, so the small globe keeps the frame', () => {
    const { container } = render(<NotFoundPage />);
    const stage = container.querySelector('main');
    expect(stage).toHaveAttribute('data-vignette', 'left');
    expect(stage).toHaveAttribute('data-align', 'center');
  });

  it('declares the furthest camera there is', async () => {
    const Camera = () => {
      const { camera } = useScene();
      return <span data-testid="camera">{camera?.zoom}</span>;
    };
    const { default: NotFound } = await import('pages/404.page');
    render(
      <MapProvider>
        <NotFound />
        <Camera />
      </MapProvider>,
    );

    expect(screen.getByTestId('camera')).toHaveTextContent('0.8');
    expect(cameras.notFound.zoom).toBe(0.8);
    // Anything unmapped lands here, not only /404 itself.
    expect(sceneIdForPath('/nope')).toBe('notFound');
  });
});
