import { useLayoutEffect, useRef, type ReactNode } from 'react';
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

/*
 * THE SHEET IS REMOUNTED, WHATEVER THE PARAGRAPH ABOVE WOULD PREFER.
 *
 * The about route gives this a `key={stop.id}`, deliberately: a new key is
 * a new element, and only a new element runs an entry animation, which is
 * how the 160ms crossfade between stops is bought. What that did not pay
 * for is the pager cap the visitor just activated: it lives inside the
 * keyed subtree. Activating "next" deletes the focused element, and the
 * browser's answer to that is document.body -- so a keyboard visitor
 * presses Enter, hears nothing, and is standing at the top of the
 * document. (The scrubber ticks are not keyed, and do keep focus.)
 *
 * The key belongs to the route, so the repair belongs here. A sheet on its
 * way out that still holds focus leaves a note saying WHICH END of its
 * pager had it; the sheet that replaces it reads the note and focuses the
 * same end of its own pager.
 *
 * The end, rather than the direction, because the end is all a sheet can
 * honestly know. Pager renders prev first and next last, so the last cap
 * is "forward" -- and at the ends of the timeline the replacing sheet has
 * only one cap, which is then the right place for focus whichever end it
 * is. Reading the direction off the cap itself would want a data attribute
 * on it, and components/primitives/Button takes none; the layer rule
 * (eslint.config.mjs) also forbids this file from importing Pager, so a
 * shared marker would have to move somewhere neither file is. Position is
 * a contract both ends of that gap can keep.
 *
 * The note is module state because the two sheets never overlap: React
 * runs the outgoing sheet's layout cleanup in the mutation phase and the
 * incoming sheet's layout effect in the layout phase of the same, single,
 * synchronous commit -- in that order. The microtask is the expiry: it
 * cannot run until that commit is over, so if nothing took the note by
 * then nothing is going to, and a note left lying about would steal focus
 * from wherever the page went next.
 */

/** Marks the pager's own box, so the caps are found inside it and nowhere else. */
export const PAGER_BOX = 'data-sheet-pager';

/** The caps of a sheet's pager, in DOM order: prev first, next last. */
export const pagerCaps = (root: HTMLElement): HTMLElement[] => [
  ...root.querySelectorAll<HTMLElement>(
    `[${PAGER_BOX}] a, [${PAGER_BOX}] button`,
  ),
];

/**
 * Whether the vanishing sheet held focus on the LAST cap of its pager --
 * `undefined` when no sheet is handing anything over.
 */
let handoff: boolean | undefined;

/**
 * Where focus lands in the sheet that replaces one that held it: the same
 * end of the new pager, or the sheet itself when it has no pager at all.
 * The sheet is named and focusable, so that fallback still announces.
 */
export const focusTarget = (
  root: HTMLElement,
  end: boolean,
): HTMLElement => {
  const caps = pagerCaps(root);
  if (caps.length === 0) return root;
  return end ? caps[caps.length - 1] : caps[0];
};

/**
 * Hands focus back, unless it is not ours to move: anything other than the
 * body means the removal did not take it, or the visitor has already put
 * it somewhere of their own choosing.
 */
export const restoreFocus = (
  root: HTMLElement,
  end: boolean,
): void => {
  if (document.activeElement !== document.body) return;
  focusTarget(root, end).focus();
};

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
}: SheetProps) => {
  const rootRef = useRef<HTMLElement>(null);

  /*
   * A LAYOUT effect, and it has to be one. A passive cleanup runs in the
   * passive flush, which is after the mutation phase has already taken the
   * node out of the document -- by then focus has fallen to the body and
   * the sheet cannot tell that it was ever holding it. The layout cleanup
   * runs while the node is still attached and still focused.
   */
  useLayoutEffect(() => {
    const root = rootRef.current as HTMLElement;
    const note = handoff;
    handoff = undefined;
    if (note !== undefined) restoreFocus(root, note);
    return () => {
      const active = document.activeElement;
      if (!root.contains(active)) return;
      // An empty pager indexes to undefined, which is not the active
      // element either -- so "no caps" and "not the last cap" are one case.
      const caps = pagerCaps(root);
      handoff = caps[caps.length - 1] === active;
      queueMicrotask(() => {
        handoff = undefined;
      });
    };
  }, []);

  return (
    <aside
      // An <aside> is a landmark, and a landmark with no name is one more
      // unlabelled "complementary" in the rotor. The company is the name;
      // aria-labelledby would be truer to the heading, but components/
      // primitives/Text takes no id and that file is not this lane's.
      aria-label={title}
      className={cn(
        'relative flex animate-slide-in-sheet flex-col border-surface-3 bg-sheet backdrop-blur-[3px] motion-reduce:animate-none',
        SHELL[placement],
        className,
      )}
      data-placement={placement}
      ref={rootRef}
      // Focus has to be able to land on the sheet itself: it is the last
      // resort of the handoff above, and the one target that always exists.
      tabIndex={-1}
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
        className="text-[length:var(--type-heading2-size-mobile)] leading-[1.14] font-[number:var(--weight-light)] text-fg-2 tablet:text-[length:var(--type-heading2-size)]"
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
        <div
          className="flex gap-2.5 border-t border-surface-3 pt-2"
          data-sheet-pager=""
        >
          {pager}
        </div>
      )}
    </aside>
  );
};

export default Sheet;
