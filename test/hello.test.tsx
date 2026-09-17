import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SCENE_HANDOFF, SCENE_MOVE_MS } from 'content/cameras';
import HelloPage, {
  HELLO_BODY,
  HELLO_BODY_WIDE,
} from 'pagesComponents/hello';
import { REDUCED_MOVE_MS } from 'scene/camera';
import {
  FG_STAGGER_CARD_MS,
  FG_STAGGER_MS,
  foregroundHandoffMs,
} from 'scene/enter';

/*
 * Lane 7 -- the hello route (artboards 1a and 1f). The shared route suite in
 * pages.test.tsx already asserts that the word and the two links exist, and
 * scene-enter.test.ts owns the handoff helper itself; what is here is this
 * route's own geometry and the arguments it hands that helper.
 */

/** 60% of hello's 800ms arrival, which is where step 0 starts. */
const HANDOFF_MS = foregroundHandoffMs('hello');

const stepDelay = (step: number) =>
  `animation: clif-slidein var(--fg-enter) var(--fg-ease) ${
    HANDOFF_MS + step * FG_STAGGER_CARD_MS
  }ms both;`;

const stubMotion = (reduce: boolean) => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches:
        reduce && query.includes('prefers-reduced-motion: reduce'),
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('the hello route', () => {
  it('is the word, the body and the two keycaps, in that order', () => {
    stubMotion(false);
    const { container } = render(<HelloPage />);

    const word = screen.getByText('hello.');
    expect(word.tagName).toBe('H1');
    // w-fit is what gives the clipped gradient its whole ramp.
    expect(word).toHaveClass('w-fit');

    const column = word.closest('div')?.parentElement;
    // 32px between steps on 1a, 20px on 1f, and 1f's lower half.
    expect(column).toHaveClass(
      'gap-8',
      'max-tablet:gap-5',
      'max-tablet:mt-auto',
    );

    const steps = [...(column?.children ?? [])];
    expect(steps).toHaveLength(3);
    expect(steps[1].textContent).toContain(HELLO_BODY);
    expect(steps[2].querySelectorAll('a')).toHaveLength(2);

    // 1a's insets and wash come from the stage, not from the page.
    expect(container.querySelector('main')).toHaveAttribute(
      'data-vignette',
      'left',
    );
  });

  it('runs the three steps on the card stagger, not the row default', () => {
    stubMotion(false);
    const { container } = render(<HelloPage />);
    const steps = [
      ...(container.querySelectorAll('main > div > div > *') ?? []),
    ];

    expect(steps.map((step) => step.getAttribute('style'))).toEqual([
      stepDelay(0),
      stepDelay(1),
      stepDelay(2),
    ]);

    // The handoff is the camera's own number, and 1a's step is 80ms.
    expect(HANDOFF_MS).toBe(SCENE_MOVE_MS * SCENE_HANDOFF);
    expect(FG_STAGGER_CARD_MS).not.toBe(FG_STAGGER_MS);
    // Taking scene/enter's default would silently retime this route.
    expect(steps[2].getAttribute('style')).not.toContain(
      `${HANDOFF_MS + 2 * FG_STAGGER_MS}ms`,
    );
  });

  it('honours prefers-reduced-motion', () => {
    stubMotion(true);
    const { container } = render(<HelloPage />);

    for (const step of container.querySelectorAll(
      'main > div > div > *',
    )) {
      expect(step.getAttribute('style')).toContain(
        `clif-slidein ${REDUCED_MOVE_MS}ms linear both`,
      );
      expect(step.getAttribute('style')).toContain(
        '--slide-in-from: 0px',
      );
    }
  });

  it('drops the third sentence on the narrow stage', () => {
    stubMotion(false);
    render(<HelloPage />);

    const tail = screen.getByText(HELLO_BODY_WIDE);
    expect(tail).toHaveClass('max-tablet:hidden');
    // Still one paragraph, measured to the board's 520px.
    expect(tail.parentElement).toHaveClass('max-w-[520px]');
  });
});
