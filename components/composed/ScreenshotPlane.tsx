import { cn } from 'utils/cn';

/*
 * The project capture, tilted in perspective over the held map. It is the one
 * place the system uses a shadow.
 *
 * The RGB-split wave shader from components/GlitchImage runs on it at
 * amplitude ~0.6px. Tilt is -16deg when it flies in on a projects hover and
 * -18deg on a detail route; moving to the detail route it does NOT re-enter,
 * the same plane re-anchors right, so this component must not remount across
 * that transition.
 */
export type ScreenshotPlaneProps = {
  src?: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
  /** Degrees of rotateY. Negative tilts the right edge away. */
  tilt?: number;
  className?: string;
};

export const ScreenshotPlane = ({
  src,
  alt = '',
  caption,
  width = 600,
  height = 380,
  tilt = -18,
  className,
}: ScreenshotPlaneProps) => (
  <figure
    className={cn('clif-plane', className)}
    data-src={src}
    style={{
      width,
      height,
      transform: `perspective(1200px) rotateY(${tilt}deg) rotateX(5deg)`,
    }}
  >
    <span
      aria-label={alt}
      className="clif-plane-surface"
      role="img"
    />
    {caption === undefined ? null : (
      <figcaption>{caption}</figcaption>
    )}
  </figure>
);

export default ScreenshotPlane;
