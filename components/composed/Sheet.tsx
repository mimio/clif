import type { ReactNode } from 'react';
import Text from 'components/primitives/Text';
import { cn } from 'utils/cn';

/*
 * The panel that replaces the Mapbox popup -- the map never draws a bubble.
 * On desktop it is a 380px card pinned right with a left-pointing tail; on
 * mobile it is a bottom sheet with a grab handle and an up-pointing tail, and
 * the scrubber folds inside it.
 *
 * The tail is two stacked triangles: an accent-30 one a pixel out from a
 * --surface-sheet one, so the bubble reads as a hairline-edged speech tail
 * rather than a solid wedge. Its fill is --surface-sheet, matching the
 * translucent panel it grows out of, not --surface-raised.
 *
 * It enters 240ms ease-out-quart from a 40px offset, once the scene is 60%
 * through its move (280ms on mobile). Swapping stops crossfades the copy in
 * 160ms rather than re-entering the sheet, so the route keeps this mounted
 * and changes its children.
 *
 * Placement is the shape only. Where the sheet sits in the stage belongs to
 * the route, because the desktop offset (right 220px) is set by the stop it
 * points at.
 */
export type SheetPlacement = 'right' | 'bottom';

const SHELL: Record<SheetPlacement, string> = {
  right:
    'w-[380px] max-w-full gap-4 rounded-[var(--radius-xs)_var(--radius-card)_var(--radius-card)_var(--radius-card)] border p-7',
  bottom:
    'w-full gap-3.5 rounded-t-[var(--radius-card)] border-t px-6 pt-[22px] pb-[26px]',
};

/** Outer (accent-30) then inner (--surface-sheet) triangle, per placement. */
const TAIL: Record<SheetPlacement, [string, string]> = {
  right: [
    'absolute top-[34px] -left-[11px] h-0 w-0 border-y-[7px] border-r-[11px] border-y-transparent border-r-accent-30',
    'absolute top-[35px] -left-[9px] h-0 w-0 border-y-[6px] border-r-[10px] border-y-transparent border-r-sheet',
  ],
  bottom: [
    'absolute -top-[11px] left-1/2 -ml-[7px] h-0 w-0 border-x-[7px] border-b-[11px] border-x-transparent border-b-accent-30',
    'absolute -top-[9px] left-1/2 -ml-[6px] h-0 w-0 border-x-[6px] border-b-[10px] border-x-transparent border-b-sheet',
  ],
};

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
    className={cn(
      'relative flex animate-slide-in-sheet flex-col border-surface-3 bg-sheet backdrop-blur-[3px]',
      SHELL[placement],
      className,
    )}
    data-placement={placement}
  >
    <span aria-hidden="true" className={TAIL[placement][0]} />
    <span aria-hidden="true" className={TAIL[placement][1]} />
    {placement === 'bottom' ? (
      <span
        aria-hidden="true"
        className="h-1 w-11 self-center rounded-[var(--radius-pill)] bg-fg-5"
      />
    ) : null}
    <Text
      className="[letter-spacing:var(--type-readout-tracking)] text-fg-4 uppercase"
      variant="readout"
    >
      {eyebrow}
    </Text>
    <Text
      className="[letter-spacing:var(--type-label-tracking)] text-fg-4 uppercase"
      variant="label"
    >
      {label}
    </Text>
    <Text
      as="h2"
      className="text-[length:var(--type-heading2-size-mobile)] leading-[1.14] font-[200] text-fg-2 tablet:text-[length:var(--type-heading2-size)]"
      variant="heading3"
    >
      {title}
    </Text>
    <Text
      className="text-[length:var(--type-detail-size)] leading-[var(--type-detail-line)] text-fg-3"
      variant="detail"
    >
      {meta}
    </Text>
    <div className="link-underline text-[length:var(--type-body-size-mobile)] leading-[var(--type-body-line-mobile)] text-fg-3 tablet:text-[length:var(--type-body-size)] tablet:leading-[var(--type-body-line)]">
      {children}
    </div>
    {pager === undefined ? null : (
      <div className="flex gap-2.5 border-t border-surface-3 pt-2">
        {pager}
      </div>
    )}
  </aside>
);

export default Sheet;
