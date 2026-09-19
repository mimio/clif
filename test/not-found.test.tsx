import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  cameras,
  SCENE_HANDOFF,
  SCENE_MOVE_MS,
} from 'content/cameras';
import { sceneIdForPath } from 'scene/camera';
import { FG_STAGGER_CARD_MS, foregroundHandoffMs } from 'scene/enter';
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

/** 60% of the 800ms flight out to zoom 0.8, where step 0 starts. */
const HANDOFF_MS = foregroundHandoffMs('notFound');

const stepDelay = (step: number) =>
  `animation: clif-slidein var(--fg-enter) var(--fg-ease) ${
    HANDOFF_MS + step * FG_STAGGER_CARD_MS
  }ms both;`;

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

  /*
   * The entry this route did not have. Every other route waits out 60% of
   * the move it arrives on before its type lands; the 404 got the stage's
   * blanket column class with no delay at all, so its copy was fully
   * landed at ~600ms while the camera was still flying out to zoom 0.8 --
   * the one route whose type did not wait for the scene, and the one the
   * camera layer special-cases in both directions.
   */
  it('waits out the camera, then lands 1a’s three steps', () => {
    const { container } = render(<NotFoundPage />);
    const steps = [
      ...container.querySelectorAll('[style*="clif-slidein"]'),
    ];

    expect(steps).toHaveLength(3);
    expect(steps.map((step) => step.getAttribute('style'))).toEqual([
      stepDelay(0),
      stepDelay(1),
      stepDelay(2),
    ]);

    // 1a's order on 1a's stagger: the word, the body, the keycap.
    expect(steps[0].textContent).toBe('404');
    expect(steps[1].textContent).toContain(
      'It Looks Like You Are Lost',
    );
    expect(steps[2].querySelector('a')).toHaveAttribute('href', '/');

    // The wait is the camera's own number rather than one transcribed
    // here, and the last step still starts before the camera lands.
    expect(HANDOFF_MS).toBe(SCENE_MOVE_MS * SCENE_HANDOFF);
    expect(HANDOFF_MS + 2 * FG_STAGGER_CARD_MS).toBeLessThan(
      SCENE_MOVE_MS,
    );
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

    expect(screen.getByTestId('camera')).toHaveTextContent(
      String(cameras.notFound.zoom),
    );
    // Eight tenths of a zoom step behind hello, which is all 1a says.
    expect(cameras.notFound.frame?.zoomOffset).toBe(-0.8);
    expect(cameras.notFound.zoom).toBeCloseTo(
      cameras.hello.zoom - 0.8,
      12,
    );
    // Anything unmapped lands here, not only /404 itself.
    expect(sceneIdForPath('/nope')).toBe('notFound');
  });
});
