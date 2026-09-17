import type { GetStaticProps } from 'next';
import { cameras } from 'content/cameras';
import { projectsList, type Project } from 'content/projects';
import ProjectsPage from 'pagesComponents/projects';
import { PageMeta } from 'pages/_app';
import { useSceneCamera } from 'scene/useSceneCamera';

type ProjectsProps = {
  projects: Project[];
};

/** The count is taken off the list, not written into the sentence. */
export const projectsDescription = (count: number): string =>
  `${count} projects by Clifton Campbell: event maps, mobile apps, device flows and data tools.`;

const Projects = ({ projects }: ProjectsProps) => {
  useSceneCamera(cameras.projects);

  return (
    <>
      <PageMeta
        description={projectsDescription(projects.length)}
        path="/projects"
        title="projects"
      />
      <ProjectsPage projects={projects} />
    </>
  );
};

export default Projects;

export const getStaticProps: GetStaticProps<
  ProjectsProps
> = async () => ({
  props: { projects: projectsList },
});
