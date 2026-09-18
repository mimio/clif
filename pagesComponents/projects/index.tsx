import { useCallback, useEffect, useMemo, useState } from 'react';
import PageWord from 'components/primitives/PageWord';
import Text from 'components/primitives/Text';
import ProjectTable, {
  type ProjectRow,
} from 'components/composed/ProjectTable';
import SceneStage from 'components/composed/SceneStage';
import ScreenshotPlane from 'components/composed/ScreenshotPlane';
import { anchors, type AnchorId } from 'content/anchors';
import type { Project } from 'content/projects';
import { projectPath } from 'content/routes';
import { foregroundEnter } from 'scene/enter';
import { useSceneHover, useSceneView } from 'scene/MapProvider';
import { useReducedMotion } from 'scene/useViewport';
import { cn } from 'utils/cn';

/*
 * 1b / 1c / 1g, now one state instead of two.
 *
 * There is no card grid, no filmstrip and no filter row, and there is no
 * longer a SELECTED WORK / BROWSE ALL pair either: the index is the whole
 * catalogue in one table lying on the bare map, arrived at already open.
 * The owner's call -- "we're just going to put all the work into the table,
 * you can hide the browse all button" -- so the six featured ids, the second
 * table title, the second body line, the row stagger and the 420ms cinch
 * between the two states are all gone with it. The city / regional view that
 * used to sit between the index and a project went earlier: every row is a
 * link straight to a detail.
 *
 * What this component owns, in order of how much of it is not obvious:
 *
 *   - the hover channel, which now has three consumers rather than two. A
 *     row lights its city point and nudges the camera 8% toward it
 *     (scene/MapProvider's `setHover`), and it flies that project's capture
 *     into the stage's rail -- the same ScreenshotPlane a detail pins there,
 *     with 1d's own note honoured: "-16deg when it flies in on a projects
 *     hover and -18deg on a detail route".
 *   - closing that channel, which is this page's job too and is not the same
 *     thing as ProjectTable's onMouseLeave: nothing synthesises a mouseleave
 *     for an element that was removed, and MapProvider lives in _app and
 *     never unmounts -- so leaving /projects with the pointer parked on a
 *     row used to carry that row's city into every route after it. On
 *     /about, at zoom 10.5, a stale `vail` nudge is 1.30 degrees of
 *     longitude: the route points at empty ground instead of Portland.
 *   - the height the table scrolls inside. It asks for `flex-1 min-h-0` on
 *     itself and its own tbody, which resolves to nothing unless the column
 *     above it is a bounded flex column -- so the stack is `flex-1 min-h-0`
 *     inside the stage and the table grows into it.
 *   - NOT the column's width. That is the stage's, because the rail on the
 *     right is the stage's: see --reading-max in styles/tokens/spacing.css.
 *     The whole point of putting the plane in a stage slot is that /projects
 *     and a detail cannot disagree about where the reading column ends.
 *   - the map's own type. The table is over the label band at every width
 *     now, so the route vetoes labels outright -- 1c's data-labels="0",
 *     which used to apply only in browse-all.
 *
 * Copy is lorem ipsum on purpose, and stays that way: the owner asked that
 * nothing placeholder be written in words that could survive into
 * production by accident.
 */

/** 1b's body copy, verbatim from the bundle, and the page's only prose. */
export const BODY_COPY =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';

/*
 * `href` is what makes the row a row and not a div with a click handler:
 * ProjectTable stretches one link over the whole row when it is set, so
 * the table gets keyboard access, middle-click, a status-bar target and a
 * crawlable path to all fourteen details. Without it a row is a mouse
 * gesture and nothing else.
 */
export const toRow = (project: Project): ProjectRow => ({
  id: project.id,
  title: project.title,
  client: project.client,
  city: anchors[project.anchor].name,
  year: project.year,
  users: project.usersApproximate,
  href: projectPath(project.id),
});

/** The project a row is pointing at, or null for "nothing is hovered". */
export const projectFor = (
  projects: Project[],
  id: string | null,
): Project | null =>
  projects.find((project) => project.id === id) ?? null;

/** The city a row is pointing at, or null for "nothing is hovered". */
export const anchorFor = (
  projects: Project[],
  id: string | null,
): AnchorId | null => projectFor(projects, id)?.anchor ?? null;

/*
 * The capture crossfades rather than flying in per row: a pointer running
 * down fourteen rows would otherwise restart a 420ms entrance fourteen
 * times. --scene-ease IS cubic-bezier(.65,0,.35,1), so `ease-scene` is that
 * curve rather than a near miss.
 *
 * `pointer-events-none` because the plane is a preview of a row, not a
 * target: it lies over the map at the one place the globe is still
 * draggable, and a preview that swallowed that drag would be a bug the
 * pointer could not report.
 */
const PREVIEW =
  'pointer-events-none transition-opacity duration-[240ms] ease-scene motion-reduce:transition-none';

/*
 * THE DRIFT: how far the capture moves between the first row and the last,
 * in CSS pixels, centred on the rail's resting position.
 *
 * "Offset it a tasteful amount depending on the hovered item so it tracks
 * down and up according to same in table a bit" -- so it is a share of the
 * row's place in the list rather than the row's own y. Measuring the row
 * would tie the rail to a scroll position, a resize listener and a layout
 * read on every hover, to say the same thing about a list that is always
 * fourteen rows in one order.
 *
 * 120px against a table about 560px tall is a little over a fifth of the
 * travel: enough to read as following the pointer, not enough to look like
 * the capture is being dragged. The plane rests at --plane-top 230 and is
 * about 255px tall at 1440, so +/-60 keeps it between 170 and 545 of a
 * 900px viewport with room at both ends.
 */
export const PLANE_DRIFT_PX = 120;

/**
 * Where the capture sits for row `index` of `count`, as an offset either
 * side of the rail's resting top. Nothing hovered -- index below zero --
 * rests at 0, and so does a list too short to have a direction.
 */
export const planeDrift = (index: number, count: number): number => {
  if (index < 0 || count <= 1) return 0;
  return Math.round((index / (count - 1) - 0.5) * PLANE_DRIFT_PX);
};

export type ProjectsPageProps = {
  projects: Project[];
  onHoverProject?: (id: string | null) => void;
};

export const ProjectsPage = ({
  projects,
  onHoverProject,
}: ProjectsPageProps) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  /*
   * The last project hovered, which is NOT the same as the hovered one: it
   * is never cleared, so the capture fades out carrying its own image
   * instead of blanking to the placeholder weave on the way. It starts
   * null so nothing loads a texture before a pointer has asked for one.
   */
  const [preview, setPreview] = useState<Project | null>(null);

  const { setHover } = useSceneHover();
  const reduced = useReducedMotion();

  /*
   * 1c carries data-labels="0", for the reason it states: "there is no band
   * where both can be read, so the table carries the names and the points
   * carry the places." That was a browse-all rule while browse-all existed;
   * the table is full bleed on arrival now, so it is the route's rule. It
   * is a veto -- the scene ANDs it with the viewport's own -- so declaring
   * it here cannot switch the mobile suppression back on.
   *
   * Written inline on purpose: useSceneView compares the patch by value.
   */
  useSceneView({ labels: false });

  /*
   * 1b and 1g: the foreground arrives once the camera move is 60% done
   * and steps 40ms apart -- word, copy, table. The delay is not a number
   * this route keeps; scene/enter.ts derives it from the move /projects
   * actually arrives on, so retiming the camera retimes this.
   */
  const step = (index: number) =>
    foregroundEnter(index, { reduced, scene: 'projects' });

  const rows = useMemo(() => projects.map(toRow), [projects]);

  const handleHover = useCallback(
    (id: string | null) => {
      setActiveId(id);
      const project = projectFor(projects, id);
      if (project !== null) setPreview(project);
      setHover(project?.anchor ?? null);
      onHoverProject?.(id);
    },
    [onHoverProject, projects, setHover],
  );

  /*
   * The hover channel is this page's to close. It is opened by a pointer
   * and the pointer does not report leaving a page -- only a row -- so the
   * only event that can end it is this one. setHover is stable, so this
   * runs on unmount and not on every hover.
   */
  useEffect(() => () => setHover(null), [setHover]);

  return (
    <SceneStage
      align="center"
      className="clif-projects"
      plane={
        <ScreenshotPlane
          alt={preview === null ? '' : preview.title}
          className={cn(PREVIEW, activeId === null && 'opacity-0')}
          src={preview?.imgSrc}
          tilt={-16}
        />
      }
      planeFold={false}
      planeShift={planeDrift(
        preview === null ? -1 : projects.indexOf(preview),
        projects.length,
      )}
      vignette="sheet"
    >
      <div
        className={cn(
          'flex min-h-0 w-full flex-1 flex-col justify-center gap-5',
          // The stage pads its own bottom and nothing else, and the table
          // fills the column top to bottom -- so without this the word sits
          // on the viewport edge. Mirrors the stage's bottom inset.
          'pt-[var(--foreground-bottom-mobile)] tablet:pt-[var(--foreground-bottom)]',
        )}
      >
        <div className="flex flex-col gap-2.5">
          {/* The word gets its own box: PageWord is w-fit so its clipped
              gradient samples the word itself, and the arrival belongs to
              the box rather than to the glyphs. */}
          <div style={step(0)}>
            <PageWord className="whitespace-nowrap" size="sm">
              projects
            </PageWord>
          </div>
          {/* 1g drops it: at 390px the word and the table are the whole
              page, and a third block would push the table off. */}
          <Text
            className="max-tablet:hidden"
            style={step(1)}
            variant="detail"
          >
            {BODY_COPY}
          </Text>
        </div>
        {/* The table's step is a box around it: the arrival and the height
            are two different properties of the same element, and
            ProjectTable takes a className rather than a style. The box is
            also the bounded flex parent its own flex-1 resolves against. */}
        <div className="flex min-h-0 flex-1 flex-col" style={step(2)}>
          <ProjectTable
            activeId={activeId}
            count={String(projects.length)}
            eyebrow="all projects"
            onHoverRow={handleHover}
            rows={rows}
          />
        </div>
      </div>
    </SceneStage>
  );
};

export default ProjectsPage;
