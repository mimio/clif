import type { GetStaticProps } from 'next';
import { cameras } from 'content/cameras';
import { projectsList, type Project } from 'content/projects';
import ProjectsPage from 'pagesComponents/projects';
import { useSceneCamera } from 'scene/useSceneCamera';

type ProjectsProps = {
  projects: Project[];
};

const Projects = ({ projects }: ProjectsProps) => {
  useSceneCamera(cameras.projects);
  return <ProjectsPage projects={projects} />;
};

export default Projects;

export const getStaticProps: GetStaticProps<
  ProjectsProps
> = async () => ({
  props: { projects: projectsList },
});
