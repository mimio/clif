import Link from 'next/link';
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
 * Mobile (1g) folds client and year under the title so three columns still
 * fit 390px; the six-column set drops city and users first, at tablet.
 *
 * Row states, from the 1c annotation: rest is body ink on bare wash over a
 * hairline; hover is accent-07 with the row sliding 3px right toward its own
 * detail on 120ms ease-out; press is accent-12 with a 0.997 scale -- "the row
 * takes the push before the camera moves". Every row is a link to a detail;
 * there is no intermediate city or regional stop.
 *
 * Hovering a row also lights that city point and nudges the camera 8% toward
 * it, which is what onHoverRow is for.
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

/** Cell ink. The row is body ink; everything but the title steps back. */
const CELL_INK: Record<ProjectColumnKey, string> = {
  index: 'text-fg-5',
  title: 'text-fg-2',
  client: 'text-fg-3',
  city: 'text-fg-4',
  year: 'text-fg-4',
  users: 'text-fg-4',
};

const GRID: Record<ProjectTableColumns, string> = {
  featured:
    'grid grid-cols-[24px_minmax(0,1fr)_42px] gap-2.5 tablet:grid-cols-[28px_minmax(0,1fr)_170px_52px] tablet:gap-3.5',
  all: 'grid grid-cols-[24px_minmax(0,1fr)_42px] gap-2.5 tablet:grid-cols-[30px_minmax(0,1fr)_180px_54px] tablet:gap-4 desktop:grid-cols-[30px_minmax(0,1fr)_180px_150px_54px_96px]',
};

/** Row padding, with the negative margin that lets the fill overhang. */
const ROW_BOX: Record<ProjectTableColumns, string> = {
  featured:
    '-mx-2 px-2 py-2.5 tablet:-mx-2.5 tablet:px-2.5 tablet:py-[11px]',
  all: '-mx-2 px-2 py-2.5 tablet:-mx-3 tablet:px-3 tablet:py-3',
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
              'border-b px-2 pb-2.5 tablet:px-3',
              scrolls ? 'border-accent-30' : 'border-surface-3',
            )}
            role="row"
          >
            {model.map((column) => (
              <th
                className={cn(
                  'text-left text-[length:var(--type-caption-size)] font-normal [letter-spacing:var(--type-label-tracking)] text-fg-5 uppercase',
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
            scrolls && 'min-h-0 flex-1 overflow-y-auto pr-1.5',
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
                'hover:translate-x-[3px] hover:bg-accent-07',
                'active:translate-x-px active:scale-[0.997] active:bg-accent-12',
                'data-[active=true]:bg-accent-07',
              )}
              data-active={row.id === activeId}
              key={row.id}
              onClick={() => onSelectRow?.(row.id)}
              onMouseEnter={() => onHoverRow?.(row.id)}
              onMouseLeave={() => onHoverRow?.(null)}
              role="row"
            >
              {model.map((column) => (
                <td
                  className={cn(
                    CELL_INK[column.key],
                    CELL_VISIBILITY[column.key],
                    column.key === 'title' && 'min-w-0',
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
                    >
                      {row.title}
                    </Link>
                  ) : (
                    <span className="block truncate">
                      {cellValue(row, column.key)}
                    </span>
                  )}
                  {column.key === 'title' ? (
                    <span className="block truncate text-[length:var(--type-readout-size)] text-fg-4 tablet:hidden">
                      {row.client} · {row.year}
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
