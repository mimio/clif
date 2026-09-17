import type { CSSProperties } from 'react';
import { SCENE_HANDOFF, SCENE_MOVE_MS } from 'content/cameras';
import { REDUCED_MOVE_MS } from 'scene/camera';

/*
 * The 1a/1f foreground handoff, in one place.
 *
 * The board's MOTION note: "Foreground staggers once scene is 60% through:
 * page word 240ms, body 240ms, meta 240ms, ease-out-quart. Reduced motion:
 * 200ms crossfade." So the three steps are not a page enter -- SceneStage's
 * own --enter-page runs the column in -- they are three delayed steps that
 * wait on the camera. The delay is derived from the scene's own numbers
 * (SCENE_MOVE_MS x SCENE_HANDOFF) rather than written as 480, so a change to
 * the camera move moves the type with it.
 *
 * Both branches reuse the design system's one enter keyframe. clif-slidein
 * reads its travel from --slide-in-from, so the reduced-motion branch sets
 * that to 0 and gets the specified crossfade out of the same animation
 * instead of needing a second keyframe: same length as the scene's own
 * REDUCED_MOVE_MS, since under reduced motion the camera no longer flies and
 * there is nothing left to wait for.
 *
 * `both` is what holds a step at opacity 0 through its delay; without it the
 * word would paint, vanish and paint again.
 */

/** 60% of the way through the camera move, where the type starts. */
export const FG_HANDOFF_MS = Math.round(
  SCENE_MOVE_MS * SCENE_HANDOFF,
);

/** Between steps. The system names one stagger, --stagger-card, and this is it. */
export const FG_STAGGER_MS = 80;

export type EnterStyle = CSSProperties &
  Record<`--${string}`, string>;

/**
 * The inline animation for foreground step `step` (0-based, in the order the
 * artboard lists them).
 */
export const foregroundEnter = (
  step: number,
  reduced: boolean,
): EnterStyle =>
  reduced
    ? {
        '--slide-in-from': '0px',
        animation: `clif-slidein ${REDUCED_MOVE_MS}ms linear both`,
      }
    : {
        animation: `clif-slidein var(--fg-enter) var(--fg-ease) ${
          FG_HANDOFF_MS + step * FG_STAGGER_MS
        }ms both`,
      };

export default foregroundEnter;
