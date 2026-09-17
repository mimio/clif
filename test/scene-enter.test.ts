import { describe, expect, it } from 'vitest';
import {
  SCENE_HANDOFF,
  SCENE_MOVE_LONG_MS,
  SCENE_MOVE_MS,
} from 'content/cameras';
import {
  type EnterStyle,
  FG_REDUCED_MS,
  FG_STAGGER_CARD_MS,
  FG_STAGGER_MS,
  foregroundEnter,
  foregroundHandoffMs,
} from 'scene/enter';

/** CSSProperties types `animation` as a union, so read it as text. */
const animationOf = (style: EnterStyle): string =>
  String(style.animation ?? '');

const delayOf = (style: EnterStyle): number => {
  const found = /(\d+)ms both$/.exec(animationOf(style));
  if (!found) throw new Error(`no delay in ${animationOf(style)}`);
  return Number(found[1]);
};

describe('the foreground handoff', () => {
  it('waits 60% of the move the route actually arrives on', () => {
    expect(foregroundHandoffMs('hello')).toBe(
      SCENE_MOVE_MS * SCENE_HANDOFF,
    );
    expect(foregroundHandoffMs('projects')).toBe(480);
    expect(foregroundHandoffMs('about')).toBe(480);
    // 1d flies 900ms, so its type waits proportionally longer.
    expect(foregroundHandoffMs('projectDetail')).toBe(
      SCENE_MOVE_LONG_MS * SCENE_HANDOFF,
    );
    expect(foregroundHandoffMs('projectDetail')).toBe(540);
  });

  /*
   * The point of deriving it: the delay cannot drift from the camera,
   * because it is the camera's own number.
   */
  it('is a function of the camera table, not a transcription of it', () => {
    for (const scene of ['hello', 'projects', 'about'] as const) {
      expect(foregroundHandoffMs(scene)).toBeLessThan(SCENE_MOVE_MS);
      expect(foregroundHandoffMs(scene)).toBeGreaterThan(0);
    }
  });
});

describe('foregroundEnter', () => {
  it('delays step 0 by the handoff and staggers from there', () => {
    const at = (step: number) =>
      delayOf(
        foregroundEnter(step, { scene: 'hello', reduced: false }),
      );
    expect(at(0)).toBe(480);
    expect(at(1)).toBe(480 + FG_STAGGER_MS);
    expect(at(2)).toBe(480 + 2 * FG_STAGGER_MS);
  });

  it('takes the card stagger where a board asks for it', () => {
    expect(
      delayOf(
        foregroundEnter(1, {
          scene: 'hello',
          reduced: false,
          stagger: FG_STAGGER_CARD_MS,
        }),
      ),
    ).toBe(480 + FG_STAGGER_CARD_MS);
  });

  it('runs the enter on the system tokens, never on literals', () => {
    const style = foregroundEnter(0, {
      scene: 'projects',
      reduced: false,
    });
    expect(animationOf(style)).toContain('var(--fg-enter)');
    expect(animationOf(style)).toContain('var(--fg-ease)');
    expect(animationOf(style)).toContain('clif-slidein');
    // `both` holds the step invisible through its delay.
    expect(animationOf(style).endsWith('both')).toBe(true);
  });

  it('is a crossfade with no travel and no wait under reduced motion', () => {
    for (const scene of ['hello', 'projectDetail'] as const) {
      const style = foregroundEnter(3, { scene, reduced: true });
      expect(style['--slide-in-from']).toBe('0px');
      expect(animationOf(style)).toBe(
        `clif-slidein ${FG_REDUCED_MS}ms linear both`,
      );
      // No delay at all: there is no camera flight left to wait for.
      expect(animationOf(style)).not.toContain('480');
      expect(animationOf(style)).not.toContain('540');
    }
  });

  it('does not claim to know where the camera came from', () => {
    // moveDurationFor does take a `from` and uses it; this does not, and
    // used to advertise a parameter no call site passed.
    expect(foregroundHandoffMs('hello')).toBe(480);
    expect(
      (
        foregroundEnter as unknown as {
          length: number;
        }
      ).length,
    ).toBe(2);
  });
});
