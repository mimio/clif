/*
 * The device-pixel-ratio clamp, and why it lives in utils/.
 *
 * It is a design-system budget constraint, not a scene one: the token
 * --dpr-clamp in styles/tokens/scene.css is its declaration, and every
 * surface that rasterises per pixel is supposed to honour it. Two do so
 * far, and they sit on opposite sides of the layer rule -- the scene and
 * the screenshot plane's shader -- so a home inside scene/ would have
 * put the number in two places, which is the drift this project keeps
 * being bitten by.
 *
 * WHAT CANNOT HONOUR IT, recorded so nobody looks again: the map. Nothing
 * in mapbox-gl 3.30 exposes a pixel-ratio dial -- there is no such Map
 * option and no setter, and internally it reads window.devicePixelRatio
 * through a getter on its own `exported` object. The only lever would be
 * overwriting that global, which would silently retune every other
 * surface on the page.
 */

/** The ceiling the design sets: --dpr-clamp in styles/tokens/scene.css. */
export const DPR_CLAMP = 1.5;

/**
 * A device pixel ratio, clamped. Fragment cost is the square of this, so
 * a 3x phone asks for nine times the work of a 1x one -- which is the
 * whole reason the ceiling exists.
 */
export const clampDpr = (dpr: number, max = DPR_CLAMP): number =>
  Math.min(dpr, max);
