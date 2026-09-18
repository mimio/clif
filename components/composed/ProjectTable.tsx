import Link from 'next/link';
import { PRESS_NOW, PRESS_WASH } from 'components/primitives/press';
import Rule from 'components/primitives/Rule';
import Text from 'components/primitives/Text';
import { cn } from 'utils/cn';

/*
 * The project index. There are no cards and no filmstrip: the projects route
 * is a six-row "selected work" table lying directly on the bare map, and
 * "browse all" widens the same table to full bleed rather than opening a new
 * screen. The table has no surface, no border and no shadow of its own --
 * the stage's wash is its only protection, and the moment it grows a
 * background it has become a card again.
 *
 * Two column sets, both from the artboards:
 *   featured  ##  project  client  year                 (1b, 28px 1fr 170px 52px)
 *   all       ##  project  client  city  year  users    (1c, 30px 1fr 180px 150px 54px 96px)
 *
 * Mobile (1g) folds the client under the title so three columns -- ##,
 * project, year -- still fit 390px; the six-column set drops city and users
 * first, at tablet. The year is NOT folded: it keeps the third grid column,
 * which is what the 42px track at mobile is for. It used to be printed in
 * both places at once.
 *
 * Row states, from the 1c annotation: rest is body ink on bare wash over a
 * hairline; hover is accent-07 with the row sliding 3px right toward its own
 * detail on 120ms ease-out; press is accent-12 with a 0.997 scale -- "the row
 * takes the push before the camera moves". Every row is a link to a detail;
 * there is no intermediate city or regional stop.
 *
 * Hovering a row also lights that city point and nudges the camera 8% toward
 * it, which is what onHoverRow is for.
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
export type ProjectTableColumns = 'featured' | 'all';

export type ProjectColumnKey =
  'index' | 'title' | 'client' | 'city' | 'year' | 'users';

export type ProjectColumn = {
  key: ProjectColumnKey;
  heading: string;
};

/*
 * The column models. `featured` is the four-column 1b/1g set, `all` the
 * six-column 1c set. Order is DOM order, which is also grid order, so the
 * templates and the hide classes below have to agree cell for cell.
 */
export const PROJECT_TABLE_MODEL: Record<
  ProjectTableColumns,
  ProjectColumn[]
> = {
  featured: [
    { key: 'index', heading: '##' },
    { key: 'title', heading: 'project' },
    { key: 'client', heading: 'client' },
    { key: 'year', heading: 'year' },
  ],
  all: [
    { key: 'index', heading: '##' },
    { key: 'title', heading: 'project' },
    { key: 'client', heading: 'client' },
    { key: 'city', heading: 'city' },
    { key: 'year', heading: 'year' },
    { key: 'users', heading: 'users' },
  ],
};

/** Just the headings, in order. */
export const PROJECT_TABLE_COLUMNS: Record<
  ProjectTableColumns,
  string[]
> = {
  featured: PROJECT_TABLE_MODEL.featured.map(
    (column) => column.heading,
  ),
  all: PROJECT_TABLE_MODEL.all.map((column) => column.heading),
};

/*
 * Which widths each cell survives to. The folded mobile row is `##`, title
 * and year, so client goes at tablet and city/users at desktop.
 */
const CELL_VISIBILITY: Record<ProjectColumnKey, string> = {
  index: '',
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
 * the reader who can see the ellipsis and cannot see past it. The ordinal,
 * the year and the bucketed user count are two to ten characters in tracks
 * measured for them; a tooltip on `2017` is noise, not help.
 */
const CELL_CAN_TRUNCATE: Record<ProjectColumnKey, boolean> = {
  index: false,
  title: true,
  client: true,
  city: true,
  year: false,
  users: false,
};

/** Cell ink. The row is body ink; everything but the title steps back. */
const CELL_INK: Record<ProjectColumnKey, string> = {
  index: 'text-fg-5',
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
 * the row's own padding; each column width is the SceneStage inset pair at
 * that step (16/52 mobile, 16/92 tablet, 112/120 desktop):
 *
 *   <650   all+featured  24+42 + 2x10 + 16   = 102px   at 320: 252px column
 *   650+   all           264   + 3x16 + 24   = 336px   at 650: 542px column
 *   650+   featured      250   + 3x14 + 20   = 312px   at 650: 542px column
 *   1000+  all           510   + 5x16 + 24   = 614px   at 1000: 768px column
 *
 * So every set clears its narrowest viewport with 150px or more left for the
 * title, and the reason it does is the column drops themselves -- six tracks
 * become four below 1000 and three below 650, exactly as 1c becomes 1g. The
 * six-track set at 320 would need 614px of a 252px column; there is no
 * truncation rule that survives that, which is why the answer is dropping
 * columns rather than shrinking them.
 */
const GRID: Record<ProjectTableColumns, string> = {
  featured:
    'grid grid-cols-[24px_minmax(0,1fr)_42px] gap-2.5 tablet:grid-cols-[28px_minmax(0,1fr)_170px_52px] tablet:gap-3.5',
  all: 'grid grid-cols-[24px_minmax(0,1fr)_42px] gap-2.5 tablet:grid-cols-[30px_minmax(0,1fr)_180px_54px] tablet:gap-4 desktop:grid-cols-[30px_minmax(0,1fr)_180px_150px_54px_96px]',
};

/*
 * The row box, and the one place the artboards disagree with each other.
 *
 * 1b and 1g give the featured row `padding:11px 10px;margin:0 -10px` and
 * `padding:10px 8px;margin:0 -8px` -- the negative margin is what lets the
 * hover fill overhang the type on both sides. 1c does NOT: the browse-all
 * row is `padding:12px 12px` with no margin at all, and that is not an
 * oversight in the board, it is the only shape that can work. Browse-all is
 * the state whose tbody scrolls, and `overflow-y: auto` computes overflow-x
 * from `visible` to `auto` -- so in that state a row 24px wider than the box
 * it sits in is not an overhang, it is a horizontal scrollbar on the table.
 * It measured +9px at 1440/1280/1024/768/650 and +5px at 390/320, at every
 * width there is, which is exactly the sideways scroll this table is never
 * allowed to have.
 *
 * So `all` carries the 1c box at every width, not just at tablet, because
 * its tbody scrolls at every width. HEAD_BOX repeats the horizontal half of
 * each so the heading row sits in the same box as the rows under it -- they
 * used to differ, which put the headings 8-12px right of the column they
 * name.
 */
const ROW_BOX: Record<ProjectTableColumns, string> = {
  featured:
    '-mx-2 px-2 py-2.5 tablet:-mx-2.5 tablet:px-2.5 tablet:py-[11px]',
  all: 'px-2 py-2.5 tablet:px-3 tablet:py-3',
};

const HEAD_BOX: Record<ProjectTableColumns, string> = {
  featured: '-mx-2 px-2 pb-2.5 tablet:-mx-2.5 tablet:px-2.5',
  all: 'px-2 pb-2.5 tablet:px-3',
};

export type ProjectRow = {
  id: string;
  /** Zero-padded on render; this is the project's ordinal, not the row's. */
  index: number;
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
  columns?: ProjectTableColumns;
  /** e.g. 'selected work'. */
  eyebrow?: string;
  /** e.g. '06 of 14'. */
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
  if (key === 'index') return String(row.index).padStart(2, '0');
  if (key === 'title') return row.title;
  if (key === 'client') return row.client;
  if (key === 'city') return row.city ?? EM_DASH;
  if (key === 'year') return String(row.year);
  return row.users ?? EM_DASH;
};

export const ProjectTable = ({
  rows,
  columns = 'featured',
  eyebrow,
  count,
  activeId = null,
  onHoverRow,
  onSelectRow,
  className,
}: ProjectTableProps) => {
  const model = PROJECT_TABLE_MODEL[columns];
  const scrolls = columns === 'all';

  return (
    <div
      className={cn(
        'flex min-h-0 w-full flex-col',
        scrolls && 'flex-1',
        className,
      )}
      data-columns={columns}
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
        className={cn(
          'flex w-full min-w-0 border-collapse flex-col',
          scrolls && 'min-h-0 flex-1',
        )}
        role="table"
      >
        <thead className="block" role="rowgroup">
          <tr
            className={cn(
              GRID[columns],
              HEAD_BOX[columns],
              'border-b',
              scrolls ? 'border-accent-30' : 'border-surface-3',
            )}
            role="row"
          >
            {model.map((column) => (
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
            'block',
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
            scrolls &&
              'min-h-0 flex-1 overflow-x-clip overflow-y-auto pr-1.5',
          )}
          role="rowgroup"
        >
          {rows.map((row) => (
            <tr
              className={cn(
                GRID[columns],
                ROW_BOX[columns],
                'relative cursor-pointer items-center rounded-[var(--radius-sm)] border-b border-surface-3 select-none',
                'text-[length:var(--type-detail-size-mobile)] leading-[var(--type-detail-line-mobile)] tablet:text-[length:var(--type-detail-size)] tablet:leading-[var(--type-detail-line)]',
                'transition-[background-color,transform] duration-[120ms] ease-out',
                /*
                 * EVERY ONE OF THESE THREE IS SCOPED `not-active:`, and the
                 * row is where that rule was learned the hard way.
                 *
                 * Hover was guarded first, because the fine-pointer block
                 * is emitted last and was beating the press. That fixed
                 * nothing a person could see, because the guard was put on
                 * the wrong competitor: `data-[active=true]:bg-accent-07`
                 * is ALSO one class plus one simple selector, Tailwind
                 * emits the `data-*` group AFTER the `active:` group, and
                 * `data-active` follows the pointer: the row's own
                 * pointerenter calls onHoverRow, the projects route stores
                 * that as activeId and hands it straight back here. So on
                 * every row a mouse can actually press, the press wash was
                 * overruled by the hover wash wearing a different hat --
                 * which is why guarding `hover:` alone changed nothing a
                 * person could see. Measured: background-color was identical
                 * on the frame before the pointerdown and the frame after
                 * it, and what survived of the press was a 2px nudge and a
                 * 0.3% scale, which is 0.1px of row height.
                 *
                 * So the guard goes on ANYTHING that writes a property the
                 * press writes, per rule 2 in components/primitives/press.ts
                 * -- hover, the data attribute and focus-within alike. The
                 * scale is gone rather than guarded: 0.997 on a 40px row
                 * was never a state, and the wash is what reads.
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
              {model.map((column) => (
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
                    // row is a link to a detail without six links inside it.
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
      {/* Bounded top and bottom by the same stated edge, never a fade. */}
      <Rule
        className="m-0 mt-2 h-px border-0 bg-accent-30"
        tone="accent"
      />
    </div>
  );
};

export default ProjectTable;
