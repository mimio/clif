import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Button from 'components/primitives/Button';
import PageWord from 'components/primitives/PageWord';
import Pill from 'components/primitives/Pill';
import Text from 'components/primitives/Text';
import MetaGrid from 'components/composed/MetaGrid';
import Pager from 'components/composed/Pager';
import SceneStage from 'components/composed/SceneStage';
import ScreenshotPlane from 'components/composed/ScreenshotPlane';
import projectsById, {
  type Project,
  type RichText,
} from 'content/projects';
import { projectPath, PROJECTS } from 'content/routes';
import { foregroundEnter } from 'scene/enter';
import { useReducedMotion } from 'scene/useViewport';

/*
 * 1d. The map is HELD here -- the one route where the camera is not the
 * visitor's -- so the screen is a column of type on the left over the wash,
 * the capture tilted on the right, and "ascend to map" top-left as the only
 * exit. The camera is declared by the route (pages/projects/[projectId].page.tsx)
 * and the chrome is mounted once by _app; neither is this component's.
 *
 * THE COLUMN'S WIDTH IS NOT THIS ROUTE'S EITHER, and that is the change the
 * owner asked for: "the left column is way too compressed, it can also be
 * moved over quite a lot farther -- they can pretty much exactly match."
 * The `they` is /projects, so the two cannot be two numbers. The capture
 * goes in SceneStage's `plane` slot, the stage reserves the rail it needs
 * and caps the column at --reading-max, and BOTH project routes get the
 * same answer by construction. The artboard's 560px and 470px blocks are
 * gone with the hand-held version of that: a block inside the column is now
 * as wide as the column.
 *
 * THE ASCEND CAP IS PINNED RATHER THAN IN THE COLUMN, and uses `fixed`
 * rather than `absolute` on purpose: SceneStage's column scrolls, and an
 * absolutely-positioned child of a scroll container is clipped by it. A
 * fixed box is laid out against the viewport instead, which is exactly what
 * the artboard measures -- ascend at left 112 / top 56 -- and a
 * viewport-anchored box is not clipped by an overflow ancestor at all. The
 * two things that used to have to be true for that, the stage's own travel
 * being off (a filled `forwards` transform makes the column the containing
 * block) and the column centring safely, are SceneStage's now: it turns its
 * travel off for any stage carrying a rail, and `safe center` is what every
 * centred stage does.
 */

/*
 * The one correction left, and it is about this board alone: `safe center`
 * falls back to the START of the column when the content is taller than the
 * stage, and the start is underneath the ascend cap. This pushes it clear.
 * It costs the centred case 16px of drift, which is less than the
 * artboard's own rounding. Written out as one literal string because
 * Tailwind reads source text: a class assembled from a variable is never
 * scanned, and the rule silently does not exist.
 */
const COLUMN_FIT =
  '[&_.clif-stage-column]:pt-[72px] desktop:[&_.clif-stage-column]:pt-[112px]';

/*
 * The caps are named for their project, and a real title can run to
 * "3D Asset Searching and Viewing Tool (Augmented Reality)". The artboard
 * shortened the label; this shortens the LINE instead, so the full name is
 * still the cap's accessible name and the reader who cannot see the
 * ellipsis is not the one who loses the word. min-w-0 is what lets the
 * label shrink at all inside the cap's own flex row.
 */
const PAGER_FIT =
  'flex-wrap [&>*]:max-w-[268px] [&_.clif-button-inner]:min-w-0 [&_[data-slot=label]]:truncate max-tablet:[&>*]:max-w-full';

/** Flattens the rich-text description for a plain-text consumer. */
export const richTextToString = (text: RichText): string =>
  text
    .map((paragraph) =>
      paragraph
        .map((span) => (typeof span === 'string' ? span : span.text))
        .join(''),
    )
    .join('\n\n');

/*
 * The pager caps used to read `09 sports events finder`: the project's own
 * title behind its place in content/projects.ts. The ordinal is gone from
 * the whole route pair at the owner's word -- "remove all of the copy that
 * has the index of these projects, 00 01 02, I don't need any of that" --
 * so a neighbour is named by its title alone. Still the title rather than
 * the id, because `winter` and `970` tell a reader nothing.
 */
export const pagerLabel = (projectId: string): string =>
  projectsById[projectId].title.toLowerCase();

/*
 * The foreground choreography is the shared one in scene/enter.ts: the
 * column waits 60% of the move this route arrives on -- derived from the
 * camera's own moveDurationFor, which is 900ms into a detail -- and then
 * steps 40ms apart on --fg-enter / --fg-ease. 40ms is the default, and it
 * is what 1d asks for, so nothing here passes a stagger. Reduced motion
 * gets the system's 200ms crossfade in place, with no wait.
 *
 * The step order below is the artboard's reading order. THE PLANE IS NOT
 * IN IT: it does not re-enter on the way into a detail -- the same plane
 * re-anchors right -- and an animation on its wrapper would say otherwise
 * the moment it did survive a navigation.
 */
const enterStep = (step: number, reduced: boolean) =>
  foregroundEnter(step, { reduced, scene: 'projectDetail' });

export type ProjectDetailPageProps = {
  project: Project;
};

export const ProjectDetailPage = ({
  project,
}: ProjectDetailPageProps) => {
  const router = useRouter();
  const reduced = useReducedMotion();

  // Escape is the same exit as the cap and as browser-back. A held map has
  // nothing to dismiss, so the key is free to mean "ascend".
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      router.push(`/${PROJECTS}`);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [router]);

  return (
    <SceneStage
      className={COLUMN_FIT}
      plane={
        <ScreenshotPlane alt={project.title} src={project.imgSrc} />
      }
      vignette="sheet"
    >
      <Button
        className="fixed top-[var(--chrome-inset)] left-[var(--foreground-left-tablet)] z-20 desktop:top-14 desktop:left-[var(--foreground-left)]"
        href={`/${PROJECTS}`}
        lead="↑"
        size="sm"
      >
        ascend to map
      </Button>
      {/* The word rides the stagger with the rest of the column, so it is a
          child rather than SceneStage's `word` slot, whose wrapper this
          component cannot reach. */}
      <div style={enterStep(0, reduced)}>
        <PageWord size="lg">{project.id}</PageWord>
      </div>
      <Text
        as="h2"
        className="[text-wrap:balance]"
        style={enterStep(1, reduced)}
        variant="heading3"
      >
        {project.title}
      </Text>
      <div
        className="flex flex-wrap gap-2"
        style={enterStep(2, reduced)}
      >
        {project.roles.map((role, index) => (
          // The lead role takes the accent outline and the rest the neutral
          // one, which is the 1d pairing: one role is what the project was,
          // the others are what it also needed. Pill rather than Chip --
          // a role mark states, it does not toggle.
          <Pill key={role} tone={index === 0 ? 'accent' : 'neutral'}>
            {role}
          </Pill>
        ))}
      </div>
      <div
        className="flex flex-col gap-4 link-underline [text-wrap:pretty]"
        style={enterStep(3, reduced)}
      >
        {project.description.map((paragraph, index) => (
          // Paragraphs have no id and never reorder; the index is the key.

          <Text as="p" className="m-0 text-fg-3" key={index}>
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
      </div>
      <div style={enterStep(4, reduced)}>
        <MetaGrid
          items={[
            { label: 'client', value: project.client },
            { label: 'year', value: project.year },
            { label: 'product', value: project.product },
          ]}
        />
      </div>
      <div style={enterStep(5, reduced)}>
        <Pager
          className={PAGER_FIT}
          next={{
            href: projectPath(project.nextId),
            label: pagerLabel(project.nextId),
          }}
          prev={{
            href: projectPath(project.prevId),
            label: pagerLabel(project.prevId),
          }}
        />
      </div>
    </SceneStage>
  );
};

export default ProjectDetailPage;
