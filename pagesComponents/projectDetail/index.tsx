import Button from 'components/primitives/Button';
import Chip from 'components/primitives/Chip';
import PageWord from 'components/primitives/PageWord';
import Text from 'components/primitives/Text';
import MetaGrid from 'components/composed/MetaGrid';
import Pager from 'components/composed/Pager';
import ScreenshotPlane from 'components/composed/ScreenshotPlane';
import type { Project, RichText } from 'content/projects';
import { projectPath, PROJECTS } from 'content/routes';

/*
 * 1d. The map is held here: one column of type on the left, the capture
 * tilted on the right, and "ascend to map" top-left as the only exit.
 */

/** Flattens the rich-text description for a plain-text consumer. */
export const richTextToString = (text: RichText): string =>
  text
    .map((paragraph) =>
      paragraph
        .map((span) => (typeof span === 'string' ? span : span.text))
        .join(''),
    )
    .join('\n\n');

export type ProjectDetailPageProps = {
  project: Project;
};

export const ProjectDetailPage = ({
  project,
}: ProjectDetailPageProps) => (
  <main className="clif-detail">
    <Button href={`/${PROJECTS}`} lead="↑" size="sm">
      ascend to map
    </Button>
    <PageWord size="lg">{project.id}</PageWord>
    <Text as="h1" variant="heading2">
      {project.title}
    </Text>
    <div className="clif-detail-roles">
      {project.roles.map((role) => (
        <Chip key={role}>{role}</Chip>
      ))}
    </div>
    {project.description.map((paragraph, index) => (
      // Paragraphs have no id and never reorder; the index is the key.

      <Text key={index} variant="body">
        {paragraph.map((span) =>
          typeof span === 'string' ? (
            span
          ) : (
            <a
              href={span.href}
              key={span.href}
              rel="noopener noreferrer"
              target="_blank"
            >
              {span.text}
            </a>
          ),
        )}
      </Text>
    ))}
    <MetaGrid
      items={[
        { label: 'client', value: project.client },
        { label: 'year', value: project.year },
        { label: 'product', value: project.product },
      ]}
    />
    <ScreenshotPlane
      alt={project.title}
      caption={project.product}
      src={project.imgSrc}
    />
    <Pager
      next={{
        href: projectPath(project.nextId),
        label: project.nextId,
      }}
      prev={{
        href: projectPath(project.prevId),
        label: project.prevId,
      }}
    />
  </main>
);

export default ProjectDetailPage;
