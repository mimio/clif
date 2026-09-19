import type { ReactNode } from 'react';
import { PRESS_NOW, PRESS_WASH } from 'components/primitives/press';
import { cn } from 'utils/cn';

/*
 * A toggle lozenge (design inventory 2.16): 8px 18px, fully rounded, the
 * 12px label size uppercase at .16em. Rest is a neutral hairline over
 * nothing; hover washes in accent-12; selected is an accent-30 border over
 * that same accent-12 fill with body ink. Chips never use solid accent, and
 * the selected and hover fills are deliberately the same step so a selected
 * chip does not flinch under the cursor.
 *
 * Both states are driven off `data-selected` rather than a branch in the
 * class list: one code path, and the DOM says which state it is in.
 *
 * Note for whoever uses this: the 1b annotation removes filter chips from
 * the projects route outright ("with only fourteen projects they cost a
 * decision without saving one"). The primitive stays because the detail
 * route's role marks are the same shape -- though a role mark that does not
 * toggle wants Pill, which is not a button.
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
    className={cn(
      'inline-flex items-center justify-center rounded-[var(--radius-pill)] border px-[18px] py-2',
      'font-mono text-[length:var(--type-label-size)] [font-weight:var(--weight-regular)] tracking-[.16em] uppercase transition-hue',
      'border-surface-3 text-fg-4 not-active:hover:bg-accent-12',
      /*
       * `not-active:` on the two FILLS and on nothing else. A chip you press
       * is very often a chip that is already selected,
       * `data-[selected=true]:bg-accent-12` is one class plus one attribute
       * selector -- the same specificity as `active:` -- and Tailwind emits
       * the `data-*` group after the `active:` group, so the selected wash
       * silently outranked the press wash on exactly the chips a person
       * presses most. Rule 2 in components/primitives/press.ts; the project
       * rows had it too.
       *
       * The border and the ink are NOT guarded, because the press does not
       * write them. Guarding a property the press has nothing to say about
       * would drop a selected chip back to its neutral hairline for the
       * length of the press, which is a flicker, not a state.
       */
      'data-[selected=true]:border-accent-30 data-[selected=true]:text-fg-2 not-active:data-[selected=true]:bg-accent-12',
      PRESS_WASH,
      PRESS_NOW,
      className,
    )}
    data-selected={selected}
    onClick={onClick}
    type="button"
  >
    {children}
  </button>
);

export default Chip;
