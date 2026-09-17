import { useMemo } from 'react';
import Button from 'components/primitives/Button';
import PageWord from 'components/primitives/PageWord';
import Text from 'components/primitives/Text';
import ProjectTable, {
  type ProjectRow,
} from 'components/composed/ProjectTable';
import { anchors } from 'content/anchors';
import type { Project } from 'content/projects';

/*
 * 1b / 1c / 1g. Six "selected work" rows over the world globe; "browse all"
 * widens the same table to all fourteen rather than opening a new screen, so
 * `all` is a view of this page, not a route.
 */
export const FEATURED_IDS = [
  'gopro',
  'winter',
  '970',
  'harvard',
  'developers',
  'haikumi',
];

export const toRow = (
  project: Project,
  index: number,
): ProjectRow => ({
  id: project.id,
  index,
  title: project.title,
  client: project.client,
  city: anchors[project.anchor].name,
  year: project.year,
  users: project.usersApproximate,
});

export type ProjectsPageProps = {
  projects: Project[];
  /** True for the browse-all view: same table, every row, full bleed. */
  all?: boolean;
  onHoverProject?: (id: string | null) => void;
};

export const ProjectsPage = ({
  projects,
  all = false,
  onHoverProject,
}: ProjectsPageProps) => {
  const rows = useMemo(
    () =>
      projects
        .map(toRow)
        .filter((row) => all || FEATURED_IDS.includes(row.id)),
    [projects, all],
  );

  return (
    <main className="clif-projects">
      <PageWord size="md">projects</PageWord>
      <Text variant="body">
        Fourteen projects, placed where they were built.
      </Text>
      <ProjectTable
        columns={all ? 'all' : 'featured'}
        count={`${String(rows.length).padStart(2, '0')} of ${projects.length}`}
        eyebrow={all ? 'all projects' : 'selected work'}
        onHoverRow={onHoverProject}
        rows={rows}
      />
      <Button expand size="sm">
        browse all
      </Button>
    </main>
  );
};

export default ProjectsPage;
