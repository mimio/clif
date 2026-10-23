/*
 * The frame budget. The scene is the most expensive thing on the page and it
 * is on every route, so it self-tunes rather than assuming a machine:
 * measured cost per route runs from ~4ms/frame on hello to ~26ms on the
 * mobile about view.
 *
 * Two dials, per the design system: terrain exaggeration and device
 * pixel ratio.
 *
 * Terrain exaggeration is applied by the scene. DPR is NOT clamped
 * everywhere, and saying so was wrong: mapbox-gl 3.30 exposes no
 * pixel-ratio dial at all, so the map -- the largest consumer, and the
 * reason the constraint exists -- runs at whatever the device reports.
 * See utils/dpr.ts. The clamp is honoured by the screenshot plane's
 * shader, which is the other WebGL surface in the same frame and the one
 * where the cost is quadratic.
 */
export const DPR_CLAMP = 1.5;

export const MIN_FRAME_BUDGET_MS = 90;
export const MAX_FRAME_BUDGET_MS = 600;

export const clampDpr = (dpr: number, max = DPR_CLAMP): number =>
  Math.min(dpr, max);

/**
 * The next repaint interval, from the last paint's cost. Three times the
 * measured cost keeps the scene under a third of the frame, clamped so a
 * single slow paint cannot stall it for a second.
 */
export const nextFrameBudget = (lastPaintMs: number): number =>
  Math.min(
    MAX_FRAME_BUDGET_MS,
    Math.max(MIN_FRAME_BUDGET_MS, lastPaintMs * 3),
  );

/** Reduced motion turns the whole animation loop off, not just its speed. */
export const prefersReducedMotion = (): boolean =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Terrain is flattened on small screens; the exaggeration dial goes to 1. */
export const terrainExaggeration = (
  exaggeration: number | null,
  isMobile: boolean,
): number | null => {
  if (exaggeration === null) return null;
  return isMobile ? 1 : exaggeration;
};
