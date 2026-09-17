import { cn } from 'utils/cn';

/*
 * The three 3D glyphs: a house for home, a brain for projects, a book with a
 * face for about. Each is pure CSS sculpture -- stacked absolutely positioned
 * divs with clip-path, border-radius and layered gradients -- in a 34x34 box,
 * reading the theme through --clif-accent / --clif-accent-2 / --iris-rim.
 * No SVG, no images. Layer-by-layer geometry is in design inventory §3.
 *
 * Every consumer scales the same box. Rest/hover/press scalars live with the
 * consumer (Button's SIZES, the altimeter's notch states); the easing is
 * always cubic-bezier(.34, 1.56, .64, 1) over 240ms.
 */
export type GlyphKind = 'home' | 'projects' | 'about';

export const GLYPH_BOX = 34;

export type GlyphProps = {
  kind: GlyphKind;
  /** Box size in px. The sculpture is drawn for 34 and scales from there. */
  size?: number;
  /** Multiplier on top of the box, for hover growth. */
  scale?: number;
  className?: string;
};

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
    style={{
      width: size,
      height: size,
      transform: `scale(${scale})`,
    }}
  />
);

export default Glyph;
