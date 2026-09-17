import Text from 'components/primitives/Text';
import { cn } from 'utils/cn';

/*
 * The project index. There are no cards and no filmstrip: the projects route
 * is a six-row "selected work" table on the bare map, and "browse all" widens
 * the same table to full bleed rather than opening a new screen.
 *
 * Two column sets, both from the artboards:
 *   featured  ##  project  client  year                 (1b, 28px 1fr 170px 52px)
 *   all       ##  project  client  city  year  users    (1c, 30px 1fr 180px 150px 54px 96px)
 *
 * Hovering a row lights that city point and nudges the camera 8% toward it;
 * clicking skips the city view and flies straight to the detail.
 */
export type ProjectTableColumns = 'featured' | 'all';

export const PROJECT_TABLE_COLUMNS: Record<
  ProjectTableColumns,
  string[]
> = {
  featured: ['##', 'project', 'client', 'year'],
  all: ['##', 'project', 'client', 'city', 'year', 'users'],
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

export const ProjectTable = ({
  rows,
  columns = 'featured',
  eyebrow,
  count,
  activeId = null,
  onHoverRow,
  onSelectRow,
  className,
}: ProjectTableProps) => (
  <div
    className={cn('clif-project-table', className)}
    data-columns={columns}
  >
    <div className="clif-project-table-eyebrow">
      <Text variant="readout">{eyebrow}</Text>
      <Text variant="readout">{count}</Text>
    </div>
    <table>
      <thead>
        <tr>
          {PROJECT_TABLE_COLUMNS[columns].map((heading) => (
            <th key={heading} scope="col">
              {heading}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr
            data-active={row.id === activeId}
            key={row.id}
            onClick={() => onSelectRow?.(row.id)}
            onMouseEnter={() => onHoverRow?.(row.id)}
            onMouseLeave={() => onHoverRow?.(null)}
          >
            <td>{String(row.index).padStart(2, '0')}</td>
            <td>{row.title}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default ProjectTable;
