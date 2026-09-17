import type { GetStaticPaths, GetStaticProps } from 'next';
import projects, { projectsList } from 'constants/projects';

type ProjectPageProps = {
  projectId: string;
};

const Project = ({ projectId }: ProjectPageProps) => (
  <main data-route="project-detail">{projects[projectId].title}</main>
);

export default Project;

export const getStaticProps: GetStaticProps<
  ProjectPageProps,
  { projectId: string }
> = async ({ params }) => {
  if (!params) return { notFound: true };
  return { props: { projectId: params.projectId } };
};

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: projectsList.map((project) => `/projects/${project.id}`),
  fallback: false,
});
