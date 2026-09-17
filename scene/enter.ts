import type { CSSProperties } from 'react';
import { SCENE_HANDOFF, type SceneId } from 'content/cameras';
import { moveDurationFor, REDUCED_MOVE_MS } from 'scene/camera';

/*
 * The foreground handoff: when the type is allowed to arrive.
 *
 * Every board specifies the same choreography -- "the new foreground
 * starts at 60% of the scene move", per the motion card, then steps
 * staggered on --fg-enter / --fg-ease -- and three routes had
 * independently written their own copy of it, each with the delay
 * hard-coded from its own board. That is a number that has to agree with
 * the camera, in four places, for ever.
 *
 * So the delay is derived rather than transcribed. The wait is whatever
 * move this route's arrival actually takes, which is the same
 * moveDurationFor the camera uses: 800ms into hello, projects and about,
 * 900ms into the detail and out of the 404. Retiming a camera move retimes
 * the type with it, and the two cannot drift.
 *
 * Two things stay per-route, because the artboards genuinely differ:
 *
 *   scene     which move to wait on -- the arriving route.
 *   stagger   the gap between steps. The system has two: 40ms for rows,
 *             blocks and scrubber ticks (1b, 1d, 1e) and --stagger-card's
 *             80ms for hello's three foreground steps (1a).
 *
 * Reduced motion is the system's answer everywhere: a 200ms crossfade,
 * no travel and no wait -- there is no camera flight left to wait for.
 * It reuses the one enter keyframe with its distance set to zero, since
 * clif-slidein reads --slide-in-from, rather than a second keyframe
 * styles/ would have to declare.
 *
 * `both` is what holds a step at opacity 0 through its delay; without it
 * the word would paint, vanish and paint again.
 */

/** Rows, blocks and scrubber ticks (artboards 1b, 1d, 1e). */
export const FG_STAGGER_MS = 40;

/** --stagger-card, which 1a's three foreground steps use. */
export const FG_STAGGER_CARD_MS = 80;

/** The crossfade that replaces the whole choreography under reduced motion. */
export const FG_REDUCED_MS = REDUCED_MOVE_MS;

export type EnterStyle = CSSProperties &
  Record<`--${string}`, string>;

/**
 * How long the foreground waits before its first step: 60% of the camera
 * move this route arrives on.
 */
export const foregroundHandoffMs = (
  scene: SceneId,
  from: SceneId | null = null,
): number =>
  Math.round(moveDurationFor(from, scene, false) * SCENE_HANDOFF);

export type ForegroundEnterOptions = {
  /** The route being arrived at, which decides the move to wait on. */
  scene: SceneId;
  reduced: boolean;
  /** Where the camera is coming from, where the route knows it. */
  from?: SceneId | null;
  /** Between steps; defaults to the system's 40ms. */
  stagger?: number;
};

/**
 * The inline animation for foreground step `step`, 0-based, in the order
 * the artboard lists them.
 */
export const foregroundEnter = (
  step: number,
  {
    scene,
    reduced,
    from = null,
    stagger = FG_STAGGER_MS,
  }: ForegroundEnterOptions,
): EnterStyle =>
  reduced
    ? {
        '--slide-in-from': '0px',
        animation: `clif-slidein ${FG_REDUCED_MS}ms linear both`,
      }
    : {
        animation: `clif-slidein var(--fg-enter) var(--fg-ease) ${
          foregroundHandoffMs(scene, from) + step * stagger
        }ms both`,
      };

export default foregroundEnter;
