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
import type { Project, RichText } from 'content/projects';
import { projectsList } from 'content/projects';
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
 * TWO BOXES ARE PINNED RATHER THAN IN THE COLUMN, and both use `fixed`
 * rather than `absolute` on purpose: SceneStage's column scrolls, and an
 * absolutely-positioned child of a scroll container is clipped by it. A
 * fixed box is laid out against the viewport instead, which is exactly what
 * the artboard measures -- ascend at left 112 / top 56, the plane at
 * right 80 / top 230 -- and a viewport-anchored box is not clipped by an
 * overflow ancestor at all -- as long as nothing in between carries a
 * transform, which is the first of the three column corrections below.
 */

/*
 * Three corrections to the stage's column, all of them about this one board,
 * and all of them reaching the column through the utility class it already
 * carries. They are written out as one literal string because Tailwind reads
 * source text: a class assembled from a variable is never scanned, and the
 * rule silently does not exist.
 *
 * ENTER OFF, and not as a preference: `--enter-page` fills `forwards`, so
 * the column keeps `transform: translateY(0)` for good once it lands, and
 * any transform other than `none` makes an element the containing block for
 * its fixed descendants. With it on, `fixed` quietly means "relative to the
 * column" -- the cap lands at x224 instead of x112 and the plane is clipped
 * at the column's right edge. The stagger below replaces that one blanket
 * fade with the per-block enter 1d asks for, so nothing is lost.
 *
 * SAFE CENTRING, because 1d's column is centred and a real description runs
 * longer than the artboard's. Plain `center` overflows a scroll container at
 * BOTH ends and the top end cannot be scrolled back to, which on gopro ate
 * the page word. `safe center` centres while it fits and falls back to the
 * start when it does not, so the long projects scroll instead of losing
 * their first line.
 *
 * TOP PADDING, so that fallback starts below the ascend cap rather than
 * underneath it. It costs the centred case 16px of drift, which is less than
 * the artboard's own rounding.
 */
const COLUMN_FIT =
  '[&_.animate-slide-in]:animate-none [&_.animate-slide-in]:[justify-content:safe_center] [&_.animate-slide-in]:pt-[72px] desktop:[&_.animate-slide-in]:pt-[112px]';

/*
 * The caps are named for their project, and a real title can run to
 * "3D Asset Searching and Viewing Tool (Augmented Reality)" -- six times the
 * width of 1d's `11 3d asset viewer`. The artboard shortened the label; this
 * shortens the LINE instead, so the full name is still the cap's accessible
 * name and the reader who cannot see the ellipsis is not the one who loses
 * the word. min-w-0 is what lets the label shrink at all inside the cap's
 * own flex row.
 */
const PAGER_FIT =
  'max-w-[560px] flex-wrap [&>*]:max-w-[268px] [&_.clif-button-inner]:min-w-0 [&_[data-slot=label]]:truncate max-tablet:[&>*]:max-w-full';

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
 * The pager caps read `09 sports events finder`, so a neighbour is named by
 * its place in the catalogue and its own title rather than by its id --
 * `winter` and `970` tell a reader nothing. The number is the row number the
 * projects table shows, which is the order of content/projects.ts.
 */
export const pagerLabel = (projectId: string): string => {
  const index = projectsList.findIndex(
    (project) => project.id === projectId,
  );
  return `${String(index).padStart(2, '0')} ${projectsList[
    index
  ].title.toLowerCase()}`;
};

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
    <SceneStage className={COLUMN_FIT} vignette="left">
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
        className="max-w-[560px] [text-wrap:balance]"
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
        className="flex max-w-[470px] flex-col gap-4 link-underline [text-wrap:pretty]"
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
          className="max-w-[560px]"
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
      {/* One wrapper, one plane, whatever the viewport: the breakpoints move
          the same box rather than rendering a second one, because a second
          one is a remount and surviving the transition into this route is
          the plane's whole job. */}
      <div className="z-10 max-desktop:mt-2 desktop:fixed desktop:top-[230px] desktop:right-20 desktop:w-[600px]">
        <ScreenshotPlane
          alt={project.title}
          caption={project.product}
          className="max-desktop:h-[260px]! max-tablet:h-[200px]!"
          src={project.imgSrc}
        />
      </div>
    </SceneStage>
  );
};

export default ProjectDetailPage;
