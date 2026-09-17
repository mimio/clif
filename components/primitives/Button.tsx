import type { ReactNode } from 'react';
import Link from 'next/link';
import Glyph, { type GlyphKind } from 'components/primitives/Glyph';
import { cn } from 'utils/cn';

/*
 * The keycap. Every CTA on every artboard is this component: a single glass
 * plate that lifts 1px on hover and, on press, travels exactly its own skirt
 * height so it bottoms out on its plate. `flat` is the escape hatch for the
 * places a cap would be too loud (inline links inside prose, the panel
 * actions); it is the same geometry with no skirt.
 *
 * Sizes are the design system's, verbatim (design inventory §2.1). `pad` is
 * used whenever there is a glyph, an expand mark or a lead -- note that a
 * trail alone does NOT trigger the asymmetric padding. `reserve` is padding
 * on the wrapper that absorbs the hover lift so layout never shifts, and
 * `glyph` is the rest scale of the 34px glyph box.
 */
export type ButtonVariant = 'keycap' | 'flat';
export type ButtonSize = 'md' | 'sm' | 'xs';
export type ButtonTone = 'primary' | 'secondary';

export type ButtonSizeSpec = {
  pad: string;
  padPlain: string;
  radius: number;
  gap: number;
  fontSize: number;
  lineHeight: number;
  tracking: string;
  textTransform: 'none' | 'uppercase';
  reserve: number;
  skirt: number;
  edge: number;
  amb: number;
  ambBlur: number;
  glyph: number;
  glyphMargin: number;
  expand: number;
};

export const BUTTON_SIZES: Record<ButtonSize, ButtonSizeSpec> = {
  md: {
    pad: '14px 26px 14px 17px',
    padPlain: '14px 26px',
    radius: 7,
    gap: 10,
    fontSize: 14,
    lineHeight: 18,
    tracking: '.02em',
    textTransform: 'none',
    reserve: 4,
    skirt: 3.5,
    edge: 4.5,
    amb: 6,
    ambBlur: 9,
    glyph: 0.62,
    glyphMargin: -8,
    expand: 13,
  },
  sm: {
    pad: '10px 20px 10px 14px',
    padPlain: '10px 20px',
    radius: 7,
    gap: 9,
    fontSize: 12,
    lineHeight: 16,
    tracking: '.16em',
    textTransform: 'uppercase',
    reserve: 3,
    skirt: 3,
    edge: 4,
    amb: 5,
    ambBlur: 8,
    glyph: 0.56,
    glyphMargin: -8,
    expand: 12,
  },
  xs: {
    pad: '8px 14px 8px 11px',
    padPlain: '8px 14px',
    radius: 6,
    gap: 8,
    fontSize: 10,
    lineHeight: 14,
    tracking: '.14em',
    textTransform: 'uppercase',
    reserve: 2,
    skirt: 2.5,
    edge: 3.5,
    amb: 4,
    ambBlur: 7,
    glyph: 0.5,
    glyphMargin: -10,
    expand: 11,
  },
};

export type ButtonProps = {
  children?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  tone?: ButtonTone;
  /** Renders the 3D glyph in the cap's left slot. */
  glyph?: GlyphKind;
  /** A mark before the label, e.g. the pager's arrows. */
  lead?: ReactNode;
  /** A mark after the label. Does not widen the left padding. */
  trail?: ReactNode;
  /** The four-corner registration mark, for "browse all" and "all 14". */
  expand?: boolean;
  /** Takes the full width of its row. */
  grow?: boolean;
  /** Centres the label even when the cap is not growing. */
  center?: boolean;
  disabled?: boolean;
  /** An internal path routes through next/link; an absolute URL does not. */
  href?: string;
  onClick?: () => void;
  ariaLabel?: string;
  className?: string;
};

const isExternal = (href: string): boolean =>
  href.startsWith('http') || href.startsWith('mailto:');

export const Button = ({
  children,
  variant = 'keycap',
  size = 'md',
  tone = 'primary',
  glyph,
  lead,
  trail,
  expand = false,
  grow = false,
  center = false,
  disabled = false,
  href,
  onClick,
  ariaLabel,
  className,
}: ButtonProps) => {
  const body = (
    <span className="clif-button-inner">
      {lead === undefined ? null : (
        <span data-slot="lead">{lead}</span>
      )}
      {glyph === undefined ? null : (
        <Glyph kind={glyph} scale={BUTTON_SIZES[size].glyph} />
      )}
      <span data-slot="label">{children}</span>
      {expand ? <span data-slot="expand" /> : null}
      {trail === undefined ? null : (
        <span data-slot="trail">{trail}</span>
      )}
    </span>
  );

  const shared = {
    'aria-label': ariaLabel,
    className: cn('clif-button', className),
    'data-variant': variant,
    'data-size': size,
    'data-tone': tone,
    'data-grow': grow,
    'data-center': center,
    'data-disabled': disabled,
  };

  if (href === undefined) {
    return (
      <button
        disabled={disabled}
        onClick={onClick}
        type="button"
        {...shared}
      >
        {body}
      </button>
    );
  }

  if (isExternal(href)) {
    return (
      <a
        href={href}
        onClick={onClick}
        rel="noopener noreferrer"
        target="_blank"
        {...shared}
      >
        {body}
      </a>
    );
  }

  return (
    <Link href={href} onClick={onClick} {...shared}>
      {body}
    </Link>
  );
};

export default Button;
