import {
  FG_STAGGER_CARD_MS,
  foregroundEnter as sceneEnter,
  foregroundHandoffMs,
  type EnterStyle,
} from 'scene/enter';

/*
 * 1a/1f's foreground handoff, which is now the shared one in scene/enter.ts.
 *
 * The choreography lived here only because this lane could not write to
 * scene/, and the projects, about and detail boards all specify the same
 * behaviour. The delay is no longer a number written down next to the
 * camera's: it is derived from the move this route actually arrives on.
 *
 * This file is a two-line shim so pagesComponents/hello/index.tsx did not
 * have to change in a lane that does not own it. Inlining
 * `foregroundEnter(step, { scene: 'hello', reduced, stagger:
 * FG_STAGGER_CARD_MS })` at the call sites and deleting this is a tidy-up
 * the hello lane can make whenever it likes.
 */

/** 60% of the way through hello's 800ms move, where the type starts. */
export const FG_HANDOFF_MS = foregroundHandoffMs('hello');

/** 1a staggers its three steps on --stagger-card, not the 40ms row step. */
export const FG_STAGGER_MS = FG_STAGGER_CARD_MS;

export type { EnterStyle };

export const foregroundEnter = (
  step: number,
  reduced: boolean,
): EnterStyle =>
  sceneEnter(step, {
    scene: 'hello',
    reduced,
    stagger: FG_STAGGER_CARD_MS,
  });

export default foregroundEnter;
