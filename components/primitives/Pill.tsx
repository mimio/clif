import type { CSSProperties, ReactNode } from 'react';
import { PRESS_NOW, PRESS_WASH } from 'components/primitives/press';
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
 * geometry the tokens have no name for.
 *
 * THE BOX IS OVERRIDABLE, and the mechanism is why the numbers can still
 * live in one place. Padding and tracking used to be stamped straight into
 * the inline `style`, which made a caller's `px-1` silently inert: an
 * inline declaration outranks any utility that is not `!`-flagged, so the
 * class was kept by the merge and then lost the cascade. They are now
 * handed to the element as two custom properties and READ BACK by real
 * utilities, so a caller's padding or tracking merges and wins like every
 * other class here. The values are still written once, in PILL_SIZES --
 * they have to be, because the scanner cannot see a class name that is
 * built at render time from a table.
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

/*
 * `not-active:` on the hover half: `pointer-fine:hover:` lands inside the
 * `@media (pointer: fine)` block, which Tailwind emits after every
 * unconditional rule, so at equal specificity it outranked the press wash
 * and a pressed pill did nothing at all. Rule 2 in
 * components/primitives/press.ts.
 *
 * EVERY pill takes the press, because every pill is already a control: this
 * component renders an <a> when it has an href and a <button> otherwise,
 * with no inert branch, so one given neither href nor onClick is still a
 * focusable, pressable button. That is the shape the component already had
 * and this is not the change that should narrow it -- but it does mean a
 * pill is never a place to put pure output. The coordinate readout does not
 * use this component; it is components/chrome/CoordPill.tsx, which paints
 * its own box for exactly that reason.
 */
const TONE_CLASS: Record<PillTone, string> = {
  accent:
    'border-accent-30 bg-accent-07 text-fg-2 pointer-fine:not-active:hover:bg-accent-12',
  neutral:
    'border-surface-3 text-fg-3 pointer-fine:not-active:hover:bg-accent-07',
};

/** The box, read back out of the two properties the element carries. */
const BOX_CLASS = 'p-(--pill-pad) tracking-(--pill-track)';

export type PillProps = {
  children?: ReactNode;
  tone?: PillTone;
  size?: PillSize;
  /** Stacks the label vertically, as the coordinate pill does. */
  vertical?: boolean;
  href?: string;
  onClick?: () => void;
  /**
   * Utilities layered over the pill's own. The box is included: padding,
   * tracking, radius and border all merge, so `px-1` or `rounded-none`
   * takes effect. Reach for the other size first.
   */
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
      'inline-flex items-center justify-center gap-2 rounded-[var(--radius-pill)] border font-mono font-[number:var(--weight-regular)] uppercase transition-hue',
      BOX_CLASS,
      'flex-row data-[vertical=true]:flex-col',
      SIZE_CLASS[size],
      TONE_CLASS[tone],
      PRESS_WASH,
      PRESS_NOW,
      className,
    ),
    'data-tone': tone,
    'data-size': size,
    'data-vertical': vertical,
    style: {
      '--pill-pad': spec.padding,
      '--pill-track': spec.tracking,
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
