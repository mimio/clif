import { useMemo } from 'react';
import type { GetStaticPaths, GetStaticProps } from 'next';
import { cameraAtAnchor, cameras } from 'content/cameras';
import projects, {
  type Project as ProjectContent,
  projectsList,
} from 'content/projects';
import { projectPath } from 'content/routes';
import ProjectDetailPage, {
  richTextToString,
} from 'pagesComponents/projectDetail';
import { metaDescription, PageMeta } from 'pages/_app';
import { useSceneCamera } from 'scene/useSceneCamera';

type ProjectPageProps = {
  projectId: string;
};

/*
 * The prose is already a typed rich-text shape, so the unfurl's sentence
 * is the project's own opening rather than a second deck kept in step with
 * it by hand. The screenshot the detail route draws is the card image.
 */
export const projectDescription = (project: ProjectContent): string =>
  metaDescription(
    `${project.product} for ${project.client}. ${richTextToString(
      project.description,
    )}`,
  );

const Project = ({ projectId }: ProjectPageProps) => {
  const project = projects[projectId];
  // The detail camera is the client city, so it is derived per project and
  // has to be memoised: useSceneCamera compares the spec by reference.
  const camera = useMemo(
    () => cameraAtAnchor(cameras.projectDetail, project.anchor),
    [project.anchor],
  );
  useSceneCamera(camera);

  return (
    <>
      <PageMeta
        description={projectDescription(project)}
        image={{ alt: project.title, src: project.imgSrc }}
        path={projectPath(project.id)}
        title={project.title}
      />
      <ProjectDetailPage project={project} />
    </>
  );
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
