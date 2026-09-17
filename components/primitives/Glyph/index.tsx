import type { CSSProperties } from 'react';
import { cn } from 'utils/cn';
import {
  EYE_SHADOW,
  GLYPH_LAYERS,
  type GlyphKind,
  type GlyphLayer,
} from 'components/primitives/Glyph/layers';

/*
 * The three 3D glyphs: a house for home, a brain for projects, a book with
 * a face for about. Each is pure CSS sculpture -- stacked absolutely
 * positioned spans with clip-path, border-radius and layered gradients --
 * drawn once in a 34x34 box and scaled from there. No SVG, no images, so
 * there are no gradient ids to collide between two glyphs on a page.
 * Layer-by-layer geometry lives in ./layers.ts (design inventory 3).
 *
 * Colour comes entirely from --clif-accent / --clif-accent-2 / --iris-rim
 * and the cast shadow from --eye-shadow, all of which the theme scope
 * redefines, so switching the eye relights all three objects at once.
 *
 * Growth is two multipliers on ONE transform, on ONE element -- this root.
 * --g-base is this instance's rest scale (the `scale` prop: Button hands
 * down its size table's glyph scale) and --g-mul is whatever an ancestor
 * sets on hover or press. The glyph never sets --g-mul itself, so a
 * consumer driving it from its own :hover composes rather than competes.
 * The easing is always the design system's back-out overshoot over 240ms
 * (inventory 3.5).
 *
 * A CONSUMER MUST NOT SCALE A WRAPPER AS WELL. Both transforms would see
 * the same inherited --g-mul and multiply by it, so a 1.30 hover would
 * render as 1.69. The keycap did exactly that and grew the glyph by half
 * again as much as the design asks; its slot is layout only now. A
 * consumer that wants its own resting size passes `scale` (or `size`) --
 * the altimeter is the other case, and it drives its notch states from a
 * wrapper that --g-mul never reaches.
 *
 * will-change is here rather than on any wrapper for the same reason: this
 * is the element that moves.
 */
export type { GlyphKind } from 'components/primitives/Glyph/layers';

export const GLYPH_BOX = 34;

export const GLYPH_EASE = 'cubic-bezier(0.34, 1.56, 0.64, 1)';

export type GlyphProps = {
  kind: GlyphKind;
  /** Box size in px. The sculpture is drawn for 34 and scales from there. */
  size?: number;
  /** Rest multiplier on the box, the base of the hover growth. */
  scale?: number;
  className?: string;
};

const Layers = ({ layers }: { layers: GlyphLayer[] }) => (
  <>
    {layers.map((layer, index) => (
      <span
        // Position is the one property every layer shares; the rest of the
        // stack is data, and the index is its stable identity.
        key={index}
        style={{ position: 'absolute', ...layer.style }}
      >
        <Layers layers={layer.children} />
      </span>
    ))}
  </>
);

export const Glyph = ({
  kind,
  size = GLYPH_BOX,
  scale = 1,
  className,
}: GlyphProps) => (
  <span
    aria-hidden="true"
    className={cn('clif-glyph', className)}
    data-glyph={kind}
    style={
      {
        position: 'relative',
        display: 'inline-block',
        flex: 'none',
        width: size,
        height: size,
        '--g-base': scale,
        transform: 'scale(calc(var(--g-base) * var(--g-mul, 1)))',
        transformOrigin: 'center',
        transition: `transform 240ms ${GLYPH_EASE}`,
        willChange: 'transform',
      } as CSSProperties
    }
  >
    <span
      data-glyph-box=""
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: GLYPH_BOX,
        height: GLYPH_BOX,
        transformOrigin: '0 0',
        transform: `scale(${size / GLYPH_BOX})`,
        // On the root rather than on each face, so the silhouette casts
        // -- roof, spine and brain folds -- the way the eye's does.
        filter: `drop-shadow(${EYE_SHADOW})`,
      }}
    >
      <Layers layers={GLYPH_LAYERS[kind]} />
    </span>
  </span>
);

export default Glyph;
