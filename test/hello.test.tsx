import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SCENE_HANDOFF, SCENE_MOVE_MS } from 'content/cameras';
import HelloPage, {
  HELLO_BODY,
  HELLO_BODY_WIDE,
} from 'pagesComponents/hello';
import {
  FG_HANDOFF_MS,
  FG_STAGGER_MS,
  foregroundEnter,
} from 'pagesComponents/hello/enter';
import { REDUCED_MOVE_MS } from 'scene/camera';

/*
 * Lane 7 -- the hello route (artboards 1a and 1f). The shared route suite in
 * pages.test.tsx already asserts that the word and the two links exist; what
 * is here is this route's own geometry and its share of the scene handoff.
 */

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

describe('the foreground handoff', () => {
  it('waits for the camera to be 60% through, then staggers', () => {
    expect(FG_HANDOFF_MS).toBe(SCENE_MOVE_MS * SCENE_HANDOFF);

    expect(foregroundEnter(0, false).animation).toBe(
      `clif-slidein var(--fg-enter) var(--fg-ease) ${FG_HANDOFF_MS}ms both`,
    );
    expect(foregroundEnter(2, false).animation).toBe(
      `clif-slidein var(--fg-enter) var(--fg-ease) ${
        FG_HANDOFF_MS + 2 * FG_STAGGER_MS
      }ms both`,
    );
  });

  it('collapses to the specified crossfade under reduced motion', () => {
    const style = foregroundEnter(2, true);

    // No delay, no travel: the same keyframe with --slide-in-from zeroed.
    expect(style.animation).toBe(
      `clif-slidein ${REDUCED_MOVE_MS}ms linear both`,
    );
    expect(style['--slide-in-from']).toBe('0px');
  });
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

  it('runs the three steps on the scene-handoff stagger', () => {
    stubMotion(false);
    const { container } = render(<HelloPage />);
    const steps = [
      ...(container.querySelectorAll('main > div > div > *') ?? []),
    ];

    expect(steps.map((step) => step.getAttribute('style'))).toEqual([
      `animation: clif-slidein var(--fg-enter) var(--fg-ease) ${FG_HANDOFF_MS}ms both;`,
      `animation: clif-slidein var(--fg-enter) var(--fg-ease) ${FG_HANDOFF_MS + FG_STAGGER_MS}ms both;`,
      `animation: clif-slidein var(--fg-enter) var(--fg-ease) ${FG_HANDOFF_MS + 2 * FG_STAGGER_MS}ms both;`,
    ]);
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
