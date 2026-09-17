import type { CSSProperties, ReactNode } from 'react';
import { cn } from 'utils/cn';

/*
 * The outlined lozenge: role chips on the detail route (artboard 1d), the
 * scrubber's fit/prev/next controls (1e), the contact panel's mailto and
 * copy actions, the coordinate readout's own shell. Pills never use solid
 * accent; the accent tone is a 1px accent-30 border over an accent-07 wash,
 * and the fill only ever deepens one ladder step on hover.
 *
 * The two sizes are the artboards', verbatim: 1d's role chips are
 * `7px 16px / 12px / .14em`, 1e's controls `6px 14px / 11px / .16em`. The
 * two font sizes are exactly --type-label-size and --type-readout-size, so
 * the class table reads them from the tokens and PILL_SIZES keeps the
 * geometry the tokens have no name for. Padding and tracking are stamped
 * inline from that table rather than restated as classes, so the numbers
 * live in one place; a caller who needs other padding passes className and
 * gets it, since the utility beats the inline style only if it is
 * `!`-flagged -- reach for a different size first.
 */
export type PillTone = 'accent' | 'neutral';
export type PillSize = 'md' | 'sm';

export const PILL_SIZES: Record<
  PillSize,
  { padding: string; fontSize: number; tracking: string }
> = {
  md: { padding: '7px 16px', fontSize: 12, tracking: '.14em' },
  sm: { padding: '6px 14px', fontSize: 11, tracking: '.16em' },
};

const SIZE_CLASS: Record<PillSize, string> = {
  md: 'text-[length:var(--type-label-size)]',
  sm: 'text-[length:var(--type-readout-size)]',
};

const TONE_CLASS: Record<PillTone, string> = {
  accent:
    'border-accent-30 bg-accent-07 text-fg-2 hover:bg-accent-12',
  neutral: 'border-surface-3 text-fg-3 hover:bg-accent-07',
};

export type PillProps = {
  children?: ReactNode;
  tone?: PillTone;
  size?: PillSize;
  /** Stacks the label vertically, as the coordinate pill does. */
  vertical?: boolean;
  href?: string;
  onClick?: () => void;
  className?: string;
};

export const Pill = ({
  children,
  tone = 'neutral',
  size = 'md',
  vertical = false,
  href,
  onClick,
  className,
}: PillProps) => {
  const spec = PILL_SIZES[size];
  const shared = {
    className: cn(
      'inline-flex items-center justify-center gap-2 rounded-[var(--radius-pill)] border font-mono [font-weight:var(--weight-regular)] uppercase transition-hue',
      'flex-row data-[vertical=true]:flex-col',
      SIZE_CLASS[size],
      TONE_CLASS[tone],
      className,
    ),
    'data-tone': tone,
    'data-size': size,
    'data-vertical': vertical,
    style: {
      padding: spec.padding,
      letterSpacing: spec.tracking,
    } as CSSProperties,
  };

  if (href === undefined) {
    return (
      <button type="button" onClick={onClick} {...shared}>
        {children}
      </button>
    );
  }

  return (
    <a href={href} onClick={onClick} {...shared}>
      {children}
    </a>
  );
};

export default Pill;
