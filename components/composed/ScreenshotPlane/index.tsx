import type { CSSProperties } from 'react';
import { cn } from 'utils/cn';
import GlitchImage from './GlitchImage';

/*
 * The project capture, tilted in perspective over the held map. It is the one
 * place the system uses a shadow (--shadow-plane, themed), and since the
 * owner took the border and the caption plate off it, the shadow is the only
 * thing separating it from the ground: the capture is a screen floating over
 * the globe rather than a framed figure sitting on the page.
 *
 * WHAT WENT, AND WHAT CARRIES THE WORDS NOW. The artboard drew a hairline
 * border and a caption on its own backdrop plate, naming the product. Both
 * are gone at the owner's word -- "ditch the border, and ditch the image
 * label and its background" -- and nothing is lost by it that was not said
 * twice: on a detail the same string is already in the meta grid under
 * `product`, and on the index it is the row the pointer is on. The capture's
 * accessible name is `alt`, which was never the caption's job and still is
 * not: GlitchImage puts it on the canvas it appends, or on the next/image
 * fallback where there is no WebGL.
 *
 * The RGB-split wave shader lives in ./GlitchImage -- three.js against a real
 * GL context, amplitude ~0.6px -- and falls back to a plain next/image when
 * there is no WebGL. That file is coverage-excluded for exactly that reason;
 * the fallback is covered by e2e.
 *
 * Tilt is -16deg when it flies in on a projects hover and -18deg on a detail
 * route; moving to the detail route it does NOT re-enter -- the same plane
 * re-anchors right. So THIS COMPONENT MUST NOT REMOUNT across the
 * projects -> detail transition: keep it mounted above the route swap and
 * change `src`, which GlitchImage swaps as a texture rather than a mount.
 * Giving it a route-derived React key, or rendering it inside the page that
 * unmounts, breaks the one transition it exists for.
 */
export type ScreenshotPlaneProps = {
  src?: string;
  alt?: string;
  width?: number;
  height?: number;
  /** Degrees of rotateY. Negative tilts the right edge away. */
  tilt?: number;
  className?: string;
};

/*
 * GlitchImage sizes its own container to a 12:5 canvas, which is its job on
 * the old grid and wrong inside a fixed plane, so the wrapper overrides that
 * inline height and stretches the canvas to fill.
 */
const SHADER_FILL =
  'absolute inset-0 [&_canvas]:!h-full [&_canvas]:!w-full [&>div]:!h-full';

/** The placeholder weave, for a plane with no capture yet. */
const PLACEHOLDER =
  'absolute inset-0 bg-[repeating-linear-gradient(118deg,var(--map-land)_0_8px,var(--map-deep)_8px_16px)]';

export const ScreenshotPlane = ({
  src,
  alt = '',
  width = 600,
  height = 380,
  tilt = -18,
  className,
}: ScreenshotPlaneProps) => {
  const style: CSSProperties = {
    width,
    height,
    transform: `perspective(1200px) rotateY(${tilt}deg) rotateX(5deg)`,
  };

  return (
    <figure
      className={cn(
        'relative m-0 max-w-full overflow-hidden rounded-[var(--radius-control)] shadow-[var(--shadow-plane)]',
        className,
      )}
      data-src={src}
      style={style}
    >
      {src === undefined ? (
        <span aria-label={alt} className={PLACEHOLDER} role="img" />
      ) : (
        <div className={SHADER_FILL}>
          <GlitchImage alt={alt} src={src} />
        </div>
      )}
    </figure>
  );
};

export default ScreenshotPlane;
