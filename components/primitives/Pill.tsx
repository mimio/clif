import type { ReactNode } from 'react';
import { cn } from 'utils/cn';

/*
 * The outlined lozenge: role chips on the detail route, the scrubber's
 * fit/prev/next controls, the contact panel's mailto and copy actions, the
 * coordinate readout's own shell. Pills never use solid accent; the accent
 * tone is a 1px accent border over a 12% accent fill.
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
  const shared = {
    className: cn('clif-pill', className),
    'data-tone': tone,
    'data-size': size,
    'data-vertical': vertical,
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
