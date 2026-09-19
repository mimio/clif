import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PRESS_NOW, PRESS_WASH } from 'components/primitives/press';
import Rule from 'components/primitives/Rule';
import Text from 'components/primitives/Text';
import { cn } from 'utils/cn';

/*
 * The project index. There are no cards and no filmstrip, and there is no
 * longer a second state either: the projects route is ONE table carrying
 * every project, lying directly on the bare map. It has no surface, no
 * border and no shadow of its own -- the stage's wash is its only
 * protection, and the moment it grows a background it has become a card
 * again.
 *
 * WHAT WENT, AND WHY THE SHAPE IS SIMPLER FOR IT. The table used to have two
 * column sets: a four-column `featured` set for the six-row landing state
 * and a six-column `all` set for BROWSE ALL. Browse-all is gone -- the index
 * shows the whole catalogue on arrival -- so `featured` had no consumer left
 * and the table has one set, one row box and one scrolling tbody rather than
 * a record keyed by a state that no longer exists.
 *
 * The ## ordinal went with it, at the owner's word: the number was an index
 * into content/projects.ts and said nothing a reader wanted. Its 30px track
 * and its gap went back to the title.
 *
 *   project  client  city  year  users     (1fr 170px 130px 54px 88px)
 *
 * Mobile (1g) folds the client under the title so two columns -- project and
 * year -- still fit 390px; city and users drop first, at tablet. The year is
 * NOT folded: it keeps its own track, which is what the 42px is for. It used
 * to be printed in both places at once.
 *
 * Row states, from the 1c annotation: rest is body ink on bare wash over a
 * hairline; hover is accent-07 with the row sliding 3px right toward its own
 * detail on 120ms ease-out; press is "the row takes the push before the
 * camera moves". The board writes that push as accent-12 and a 0.997 scale,
 * and this renders it as accent-20 with the slide settling back and no
 * scale: against accent-07 a step to accent-12 is 5% of alpha, and 0.997 on
 * a 40px row is a tenth of a pixel of height -- neither is a state anybody
 * saw. See components/primitives/press.ts. Every row is a link to a detail;
 * there is no intermediate city or regional stop.
 *
 * Hovering a row also lights that city point, nudges the camera 8% toward it
 * and flies that project's capture into the stage's rail, all of which is
 * what onHoverRow is for.
 *
 * WHO COUNTS AS HOVERING, and why it is not simply `:hover`. The site
 * redefines Tailwind's `hover` variant to bare `:hover`, with no
 * `(hover: hover)` guard, so on a touch screen the tap that opens a project
 * LEAVES the row washed and shifted until the next tap lands elsewhere --
 * indistinguishable from `data-[active=true]`, which paints the same
 * accent-07. Worse, the JS side latched with it: pointerenter fires on tap
 * and the matching leave may never come, so the lit city point and the 8%
 * camera nudge stayed put too. So both channels are gated on a fine
 * pointer: the wash and the slide behind `pointer-fine:`, and onHoverRow
 * behind the event's own pointerType.
 *
 * KEYBOARD GETS THE SAME CHANNEL. The row's feedback loop is the whole
 * point of the route, and it used to be withheld from anyone who tabbed:
 * focus and blur drive onHoverRow beside the pointer (the altimeter's
 * notches already do this), and `focus-within` paints the same wash and
 * slide, so the lit point and the camera answer a keyboard exactly as they
 * answer a mouse.
 */
export type ProjectColumnKey =
  'title' | 'client' | 'city' | 'year' | 'users';

export type ProjectColumn = {
  key: ProjectColumnKey;
  heading: string;
};

/** The column model. Order is DOM order, which is also grid order. */
export const PROJECT_TABLE_MODEL: ProjectColumn[] = [
  { key: 'title', heading: 'project' },
  { key: 'client', heading: 'client' },
  { key: 'city', heading: 'city' },
  { key: 'year', heading: 'year' },
  { key: 'users', heading: 'users' },
];

/** Just the headings, in order. */
export const PROJECT_TABLE_COLUMNS: string[] =
  PROJECT_TABLE_MODEL.map((column) => column.heading);

/*
 * Which widths each cell survives to. The folded mobile row is the title
 * and the year, so client goes at tablet and city/users at desktop.
 */
const CELL_VISIBILITY: Record<ProjectColumnKey, string> = {
  title: '',
  client: 'hidden tablet:block',
  city: 'hidden desktop:block',
  year: '',
  users: 'hidden desktop:block',
};

/*
 * Which cells can plausibly lose their tail to the ellipsis, and so carry
 * the whole value in a `title` for a pointer to recover. The clipped text is
 * still text, so a screen reader was never the one losing it -- this is for
 * the reader who can see the ellipsis and cannot see past it. The year and
 * the bucketed user count are four to ten characters in tracks measured for
 * them; a tooltip on `2017` is noise, not help.
 */
const CELL_CAN_TRUNCATE: Record<ProjectColumnKey, boolean> = {
  title: true,
  client: true,
  city: true,
  year: false,
  users: false,
};

/** Cell ink. The row is body ink; everything but the title steps back. */
const CELL_INK: Record<ProjectColumnKey, string> = {
  title: 'text-fg-2',
  client: 'text-fg-3',
  city: 'text-fg-4',
  year: 'text-fg-4',
  users: 'text-fg-4',
};

/*
 * WHAT THE FIXED TRACKS COST, WORKED OUT, because the flexible column can
 * shrink to nothing and still not save a row whose px tracks alone are wider
 * than the stage gives it. Each floor is the fixed tracks plus every gap plus
 * the row's own padding; each column width is what the stage leaves at that
 * step -- the SceneStage inset pair below the rail (16/52 mobile, 16/92
 * tablet, 112/120 desktop), and --reading-max above it:
 *
 *   <650    42  + 1x10 + 16 =  68px   at 320:  252px column
 *   650+    224 + 2x16 + 24 = 280px   at 650:  542px column
 *   1000+   458 + 4x16 + 24 = 546px   at 1000: 768px column
 *   1280+   458 + 4x16 + 24 = 546px   at 1280: 690px column (rail open)
 *
 * The 1280 row is the tight one and it is tight by design. --reading-min is
 * that row: the column's floor is the width at which `Ubiquiti Device Setup
 * Flow` and `Ubiquiti Device Portal` still abbreviate to different strings,
 * and the capture beside it takes whatever is left over. From about 1380
 * the column grows again -- 174px of title at 1440, 254px at 1600, 314px
 * from 1720 up, where --reading-column caps it and every further pixel of
 * window goes to the capture instead.
 *
 * The four fixed tracks are each the longest real value plus nothing:
 * `Deadlock Interactive` is 170px of Roboto Mono at the detail size,
 * `San Francisco CA` is 144 and `1,000,000+` is 90. They were measured in a
 * browser, not estimated: shaving 6px off the last one is what put an
 * ellipsis through `1,000,00…` at 1280. Rounding any of them down buys the
 * title ten pixels and costs a whole value its tail, which is the wrong
 * trade -- the title is the one cell a reader can still identify from its
 * first half.
 *
 * The set at 320 would need 546px of a 252px column; there is no truncation
 * rule that survives that, which is why the answer is dropping columns
 * rather than shrinking them.
 */
const GRID =
  'grid grid-cols-[minmax(0,1fr)_42px] gap-2.5 tablet:grid-cols-[minmax(0,1fr)_170px_54px] tablet:gap-4 desktop:grid-cols-[minmax(0,1fr)_170px_144px_54px_90px]';

/*
 * The row box, and the one place the artboards disagreed with each other.
 *
 * 1b and 1g gave the featured row `padding:11px 10px;margin:0 -10px` -- the
 * negative margin is what let the hover fill overhang the type on both
 * sides. 1c does NOT: its row is `padding:12px 12px` with no margin at all,
 * and that is not an oversight in the board, it is the only shape that can
 * work. This tbody scrolls, and `overflow-y: auto` computes overflow-x from
 * `visible` to `auto` -- so a row 24px wider than the box it sits in is not
 * an overhang, it is a horizontal scrollbar on the table. It measured +9px
 * at 1440/1280/1024/768/650 and +5px at 390/320, at every width there is,
 * which is exactly the sideways scroll this table is never allowed to have.
 *
 * So the 1c box is the box, and HEAD_BOX repeats its horizontal half so the
 * heading row sits in the same box as the rows under it -- they used to
 * differ, which put the headings 8-12px right of the column they name.
 */
const ROW_BOX = 'px-2 py-2.5 tablet:px-3 tablet:py-3';

const HEAD_BOX = 'px-2 pb-2.5 tablet:px-3';

/*
 * THE CLOSING RULE IS AN OVERFLOW MARK, not a border.
 *
 * It used to be unconditional -- "bounded top and bottom by the same stated
 * edge" -- which drew a line under a list that ended where you could see it
 * end, and said nothing. The owner's call: it shows only when the tbody has
 * something below the fold, so the one accent line under the table means
 * "there is more of this", and a table that fits carries no line to
 * misread.
 *
 * It is a measurement because nothing else can answer it. There is no CSS
 * selector for "this box is scrolling" that ships in every browser this
 * site runs in -- scroll-state container queries are one engine deep -- and
 * the answer depends on the viewport, on the column above the table and on
 * the row count at once.
 *
 * WHAT IS WATCHED, and why it is the window rather than the element. The
 * tbody is `flex-1` inside a bounded column, so its own box changes on a
 * resize and on nothing else; the content's height changes with `rows`,
 * which is a dependency of the same effect. A ResizeObserver would buy the
 * same two events at the price of a jsdom shim and a branch no test can
 * reach. The one case neither covers is a webfont swapping under a
 * laid-out table, which moves the content by a row at most and shows or
 * hides a hairline.
 *
 * A pixel of slack, because scrollHeight and clientHeight are integers
 * rounded from fractional layout and a table that fits exactly can measure
 * one pixel over.
 */
const OVERFLOW_SLACK_PX = 1;

export type ProjectRow = {
  id: string;
  title: string;
  client: string;
  city?: string;
  year: number;
  /** Bucketed count, 'retired', or null for an em dash. */
  users?: string | null;
  /** The detail route. Set it and the row becomes a real link. */
  href?: string;
};

export type ProjectTableProps = {
  rows: ProjectRow[];
  /** e.g. 'all projects'. */
  eyebrow?: string;
  /** e.g. '14'. */
  count?: string;
  activeId?: string | null;
  onHoverRow?: (id: string | null) => void;
  onSelectRow?: (id: string) => void;
  className?: string;
};

/*
 * A pointerenter this row is willing to latch on. A finger fires
 * pointerenter on tap and frequently never fires the matching leave, which
 * is how a tapped row used to keep the camera nudged and its city point lit
 * for the rest of the visit. A mouse is the only pointer whose enter really
 * means "is over this now".
 */
export const isHoverPointer = (pointerType: string): boolean =>
  pointerType === 'mouse';

/** The em dash a missing city or user count falls back to. */
export const EM_DASH = '—';

export const cellValue = (
  row: ProjectRow,
  key: ProjectColumnKey,
): string => {
  if (key === 'title') return row.title;
  if (key === 'client') return row.client;
  if (key === 'city') return row.city ?? EM_DASH;
  if (key === 'year') return String(row.year);
  return row.users ?? EM_DASH;
};

export const ProjectTable = ({
  rows,
  eyebrow,
  count,
  activeId = null,
  onHoverRow,
  onSelectRow,
  className,
}: ProjectTableProps) => {
  /*
   * The tbody as STATE rather than as a ref, because the effect below has
   * to run again once it exists: a ref's `.current` is filled during the
   * commit and does not re-run anything, so an effect reading it on the
   * first pass would be measuring a table that is not there yet.
   */
  const [body, setBody] = useState<HTMLTableSectionElement | null>(
    null,
  );
  const [overflowing, setOverflowing] = useState(false);

  useEffect(() => {
    if (body === null) return undefined;
    const read = () => {
      setOverflowing(
        body.scrollHeight - body.clientHeight > OVERFLOW_SLACK_PX,
      );
    };
    read();
    window.addEventListener('resize', read);
    return () => window.removeEventListener('resize', read);
  }, [body, rows]);

  return (
    <div
      className={cn('flex min-h-0 w-full flex-1 flex-col', className)}
      data-overflow={overflowing}
      data-slot="project-table"
    >
      {/* The second colour belongs to the table title, not to a page eyebrow. */}
      <div className="flex items-baseline gap-3.5 pb-3.5">
        <Text
          className="[letter-spacing:var(--type-caption-tracking)] text-accent2-text uppercase"
          variant="readout"
        >
          {eyebrow}
        </Text>
        <Text className="text-fg-5" variant="readout">
          {count}
        </Text>
      </div>
      <table
        className="flex min-h-0 w-full min-w-0 flex-1 border-collapse flex-col"
        role="table"
      >
        <thead className="block" role="rowgroup">
          <tr
            className={cn(
              GRID,
              HEAD_BOX,
              'border-b border-accent-30',
            )}
            role="row"
          >
            {PROJECT_TABLE_MODEL.map((column) => (
              <th
                className={cn(
                  'min-w-0 truncate text-left text-[length:var(--type-caption-size)] font-normal [letter-spacing:var(--type-label-tracking)] text-fg-5 uppercase',
                  CELL_VISIBILITY[column.key],
                )}
                key={column.key}
                role="columnheader"
                scope="col"
              >
                {column.heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody
          className={cn(
            'block min-h-0 flex-1 overflow-y-auto pr-1.5',
            /*
             * `overflow-x: clip` rather than the `auto` this would compute
             * to on its own. A scroll container whose other axis is
             * `visible` gets `auto` on this one, so the day something in a
             * row is one pixel wider than the box -- a padding change, a
             * cell that forgot to shrink -- the table answers with a
             * sideways scrollbar instead of a clipped cell. `clip` makes
             * that impossible to reintroduce, and the rows are sized to fit
             * so it has nothing to cut.
             */
            'overflow-x-clip',
          )}
          ref={setBody}
          role="rowgroup"
        >
          {rows.map((row) => (
            <tr
              className={cn(
                GRID,
                ROW_BOX,
                'relative cursor-pointer items-center rounded-[var(--radius-sm)] border-b border-surface-3 select-none',
                'text-[length:var(--type-detail-size-mobile)] leading-[var(--type-detail-line-mobile)] tablet:text-[length:var(--type-detail-size)] tablet:leading-[var(--type-detail-line)]',
                'transition-[background-color,transform] duration-[120ms] ease-out',
                /*
                 * EVERY ONE OF THESE THREE IS SCOPED `not-active:`, and the
                 * row is where that rule was learned the hard way.
                 *
                 * Hover was guarded first, because the fine-pointer block is
                 * emitted last and was beating the press. That fixed nothing
                 * a person could see, because the guard went on the wrong
                 * competitor: `data-[active=true]:bg-accent-07` is ALSO one
                 * class plus one simple selector, Tailwind emits the `data-*`
                 * group AFTER the `active:` group, and `data-active` follows
                 * the pointer -- the row's own pointerenter calls onHoverRow,
                 * the projects route stores it as activeId and hands it
                 * straight back here. So on every row a mouse can actually
                 * press, the press wash was overruled by the hover wash
                 * wearing a different hat. Measured: background-color was
                 * identical on the frame before the pointerdown and the frame
                 * after it, and what survived of the press was a 2px nudge
                 * and a 0.3% scale, which is 0.1px of row height.
                 *
                 * So the guard goes on ANYTHING that writes a property the
                 * press writes, per rule 2 in components/primitives/press.ts
                 * -- hover, the data attribute and focus-within alike. The
                 * scale is gone rather than guarded: 0.997 on a 40px row was
                 * never a state, and the wash is what reads.
                 */
                'pointer-fine:not-active:hover:translate-x-[3px] pointer-fine:not-active:hover:bg-accent-07',
                'not-active:focus-within:translate-x-[3px] not-active:focus-within:bg-accent-07',
                `active:translate-x-px ${PRESS_WASH} ${PRESS_NOW}`,
                'not-active:data-[active=true]:bg-accent-07',
              )}
              data-active={row.id === activeId}
              key={row.id}
              onBlur={() => onHoverRow?.(null)}
              onClick={() => onSelectRow?.(row.id)}
              onFocus={() => onHoverRow?.(row.id)}
              onPointerEnter={(event) => {
                if (isHoverPointer(event.pointerType))
                  onHoverRow?.(row.id);
              }}
              onPointerLeave={(event) => {
                if (isHoverPointer(event.pointerType))
                  onHoverRow?.(null);
              }}
              role="row"
            >
              {PROJECT_TABLE_MODEL.map((column) => (
                <td
                  className={cn(
                    /*
                     * EVERY cell, not just the flexible one. A grid item
                     * refuses to go under its own content width until its
                     * automatic minimum is zeroed, and the fixed tracks are
                     * only safe from that by accident -- widen one, or hand
                     * it a value longer than the number it was measured
                     * for, and the track stops honouring its px size. It is
                     * free here and it is the whole reason the flexible
                     * column already behaves.
                     */
                    'min-w-0',
                    CELL_INK[column.key],
                    CELL_VISIBILITY[column.key],
                  )}
                  key={column.key}
                  role="cell"
                >
                  {column.key === 'title' &&
                  row.href !== undefined ? (
                    // One link per row, stretched over the whole row, so the
                    // row is a link to a detail without five links inside it.
                    <Link
                      className="block truncate after:absolute after:inset-0 after:content-['']"
                      href={row.href}
                      title={row.title}
                    >
                      {row.title}
                    </Link>
                  ) : (
                    <span
                      className="block truncate"
                      title={
                        CELL_CAN_TRUNCATE[column.key]
                          ? cellValue(row, column.key)
                          : undefined
                      }
                    >
                      {cellValue(row, column.key)}
                    </span>
                  )}
                  {column.key === 'title' ? (
                    <span
                      className="block truncate text-[length:var(--type-readout-size)] text-fg-4 tablet:hidden"
                      title={row.client}
                    >
                      {row.client}
                    </span>
                  ) : null}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {/* Only where there is something below the fold: see the note on
          OVERFLOW_SLACK_PX. Never a fade, either way. */}
      {overflowing ? (
        <Rule
          className="m-0 mt-2 h-px border-0 bg-accent-30"
          tone="accent"
        />
      ) : null}
    </div>
  );
};

export default ProjectTable;
