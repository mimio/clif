import type { ReactNode } from 'react';
import { cn } from 'utils/cn';

/*
 * A toggle lozenge: 8px 18px, fully rounded, 12px uppercase at .16em.
 * Selected is an accent-30 border over an accent-12 fill; chips never use
 * solid accent.
 *
 * Note for whoever uses this: the 1b annotation removes filter chips from the
 * projects route outright ("with only fourteen projects they cost a decision
 * without saving one"). The primitive stays because the detail route's role
 * marks are the same shape.
 */
export type ChipProps = {
  children?: ReactNode;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
};

export const Chip = ({
  children,
  selected = false,
  onClick,
  className,
}: ChipProps) => (
  <button
    aria-pressed={selected}
    className={cn('clif-chip', className)}
    data-selected={selected}
    onClick={onClick}
    type="button"
  >
    {children}
  </button>
);

export default Chip;
