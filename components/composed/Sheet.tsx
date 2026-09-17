import type { ReactNode } from 'react';
import Text from 'components/primitives/Text';
import { cn } from 'utils/cn';

/*
 * The panel that replaces the Mapbox popup -- the map never draws a bubble.
 * On desktop it is a 380px card pinned right with a left-pointing tail; on
 * mobile it is a bottom sheet with a grab handle and an up-pointing tail, and
 * the scrubber folds inside it.
 *
 * It enters 240ms ease-out-quart from a 40px offset, once the scene is 60%
 * through its move (280ms on mobile). Swapping stops crossfades the copy in
 * 160ms rather than re-entering the sheet.
 */
export type SheetPlacement = 'right' | 'bottom';

export type SheetProps = {
  /** e.g. 'stop 04 / 06'. */
  eyebrow?: string;
  /** The role, uppercase. */
  label?: string;
  /** The company. */
  title: string;
  /** e.g. 'Portland OR · Dec 2018 — Jan 2020'. */
  meta?: string;
  children?: ReactNode;
  pager?: ReactNode;
  placement?: SheetPlacement;
  className?: string;
};

export const Sheet = ({
  eyebrow,
  label,
  title,
  meta,
  children,
  pager,
  placement = 'right',
  className,
}: SheetProps) => (
  <aside
    className={cn('clif-sheet', className)}
    data-placement={placement}
  >
    <span aria-hidden="true" className="clif-sheet-tail" />
    <Text variant="readout">{eyebrow}</Text>
    <Text variant="label">{label}</Text>
    <Text as="h2" variant="heading3">
      {title}
    </Text>
    <Text variant="detail">{meta}</Text>
    <div className="clif-sheet-body">{children}</div>
    {pager === undefined ? null : (
      <div className="clif-sheet-pager">{pager}</div>
    )}
  </aside>
);

export default Sheet;
