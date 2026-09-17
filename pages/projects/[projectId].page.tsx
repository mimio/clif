import { useMemo } from 'react';
import type { GetStaticPaths, GetStaticProps } from 'next';
import { cameraAtAnchor, cameras } from 'content/cameras';
import projects, { projectsList } from 'content/projects';
import { projectPath } from 'content/routes';
import ProjectDetailPage from 'pagesComponents/projectDetail';
import { useSceneCamera } from 'scene/useSceneCamera';

type ProjectPageProps = {
  projectId: string;
};

const Project = ({ projectId }: ProjectPageProps) => {
  const project = projects[projectId];
  // The detail camera is the client city, so it is derived per project and
  // has to be memoised: useSceneCamera compares the spec by reference.
  const camera = useMemo(
    () => cameraAtAnchor(cameras.projectDetail, project.anchor),
    [project.anchor],
  );
  useSceneCamera(camera);

  return <ProjectDetailPage project={project} />;
};

export default Project;

export const getStaticProps: GetStaticProps<
  ProjectPageProps,
  { projectId: string }
> = async ({ params }) => {
  if (!params) return { notFound: true };
  return { props: { projectId: params.projectId } };
};

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: projectsList.map((project) => projectPath(project.id)),
  fallback: false,
});
