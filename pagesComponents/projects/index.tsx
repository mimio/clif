import { useCallback, useMemo, useState } from 'react';
import Button from 'components/primitives/Button';
import PageWord from 'components/primitives/PageWord';
import Text from 'components/primitives/Text';
import ProjectTable, {
  type ProjectRow,
} from 'components/composed/ProjectTable';
import SceneStage from 'components/composed/SceneStage';
import { anchors, type AnchorId } from 'content/anchors';
import type { Project } from 'content/projects';
import { projectPath } from 'content/routes';
import { foregroundEnter } from 'scene/enter';
import { useSceneHover, useSceneView } from 'scene/MapProvider';
import { useIsMobile, useReducedMotion } from 'scene/useViewport';
import { cn } from 'utils/cn';

/*
 * 1b / 1c / 1g. One page, two states.
 *
 * There is no card grid, no filmstrip and no filter row: the index is a
 * six-row SELECTED WORK table lying on the bare map, and BROWSE ALL widens
 * that same table to all fourteen. `all` is a VIEW, not a route -- nothing
 * navigates, the camera holds ("browsing is not travelling"), and the
 * table, the header and the wash are the only things that move. The city /
 * regional view that used to sit between the index and a project is gone
 * too: every row is a link straight to a detail.
 *
 * What this component owns, in order of how much of it is not obvious:
 *
 *   - the header cinch. The table's own geometry is ProjectTable's; the
 *     word dropping 52 -> 40px and the subtitle tightening 16/26 -> 14/20
 *     are this page's, and they run on the same 420ms ease-in-out-cubic
 *     the table widens on so the two read as one move.
 *   - the height the `all` table scrolls inside. It asks for `flex-1
 *     min-h-0` on itself and its own tbody, which resolves to nothing
 *     unless the column above it is a bounded flex column -- so the stack
 *     is `flex-1 min-h-0` inside the stage and the table grows into it.
 *   - the hover channel: a row lights its city point and nudges the camera
 *     8% toward it, which is scene/MapProvider's `setHover`.
 *   - the map's own type. Browse-all is a state of this page rather than
 *     of the viewport, so the scene cannot derive it; the route declares
 *     it through useSceneView and the scene vetoes on either input.
 *
 * Copy is lorem ipsum on purpose, and stays that way: the owner asked that
 * nothing placeholder be written in words that could survive into
 * production by accident. The two table titles are not copy -- they are
 * the artboards' own labels for the two states.
 */

/** 1b. The six projects worth opening first, in the artboard's order. */
export const FEATURED_IDS = [
  'gopro',
  'winter',
  '970',
  'harvard',
  'developers',
  'haikumi',
];

/** 1b's body copy and 1c's one-line subtitle, verbatim from the bundle. */
export const BODY_COPY =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';

export const SUBTITLE_COPY =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';

/*
 * `index` is the project's ordinal, not the row's -- 1b shows 10, 13, 12,
 * 08, 01, 00 in that order, so the number has to survive the filter.
 *
 * `href` is what makes the row a row and not a div with a click handler:
 * ProjectTable stretches one link over the whole row when it is set, so
 * the table gets keyboard access, middle-click, a status-bar target and a
 * crawlable path to all fourteen details. Without it a row is a mouse
 * gesture and nothing else.
 */
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
  href: projectPath(project.id),
});

/** The city a row is pointing at, or null for "nothing is hovered". */
export const anchorFor = (
  projects: Project[],
  id: string | null,
): AnchorId | null =>
  projects.find((project) => project.id === id)?.anchor ?? null;

/*
 * 420ms ease-in-out-cubic is the 1c number, and --scene-ease IS
 * cubic-bezier(.65,0,.35,1), so `ease-scene` is that curve rather than a
 * near miss. Everything that moves between the two states quotes this.
 */
const CINCH =
  'duration-[420ms] ease-scene motion-reduce:transition-none';

/*
 * The widening, as a max-width rather than a width, so the column is the
 * artboard's 620px on 1b and takes whatever the stage gives it on 1c.
 * 1400px is past every stage width there is -- it reads as "no limit" and
 * still interpolates, which `none` would not.
 */
const COLUMN = {
  featured: 'max-w-[620px]',
  all: 'max-w-[1400px]',
};

/*
 * 1c: "the eight held-back rows fade in 40ms apart behind the six that
 * were already there." Written out per row because Tailwind reads source
 * text -- a delay built by a loop is a class that never gets compiled.
 */
const ROW_STAGGER = [
  '[&_tbody_tr:nth-child(n+7)]:animate-slide-in-sheet',
  '[&_tbody_tr:nth-child(n+7)]:[animation-fill-mode:both]',
  '[&_tbody_tr:nth-child(8)]:[animation-delay:40ms]',
  '[&_tbody_tr:nth-child(9)]:[animation-delay:80ms]',
  '[&_tbody_tr:nth-child(10)]:[animation-delay:120ms]',
  '[&_tbody_tr:nth-child(11)]:[animation-delay:160ms]',
  '[&_tbody_tr:nth-child(12)]:[animation-delay:200ms]',
  '[&_tbody_tr:nth-child(13)]:[animation-delay:240ms]',
  '[&_tbody_tr:nth-child(14)]:[animation-delay:280ms]',
  'motion-reduce:[&_tbody_tr:nth-child(n+7)]:animate-none',
].join(' ');

export type ProjectsPageProps = {
  projects: Project[];
  /**
   * Forces the browse-all view. Left undefined -- which is how the route
   * renders it -- the page owns the state and the two caps toggle it.
   */
  all?: boolean;
  onHoverProject?: (id: string | null) => void;
};

export const ProjectsPage = ({
  projects,
  all,
  onHoverProject,
}: ProjectsPageProps) => {
  const [browsing, setBrowsing] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const showAll = all ?? browsing;

  const { setHover } = useSceneHover();
  const isMobile = useIsMobile();
  const reduced = useReducedMotion();

  /*
   * 1c and 1g both carry data-labels="0", for the reason stated twice:
   * "there is no band where both can be read, so the table carries the
   * names and the points carry the places." Mobile is the viewport's own
   * call and the scene already makes it; browse-all is this page's, at
   * any width. Both are vetoes -- the scene ANDs them -- so declaring it
   * here cannot switch the mobile suppression back on.
   *
   * Written inline on purpose: useSceneView compares the patch by value.
   */
  useSceneView({ labels: !showAll });

  /*
   * 1b and 1g: the foreground arrives once the camera move is 60% done
   * and steps 40ms apart -- word, subtitle, table, cap. The delay is not
   * a number this route keeps; scene/enter.ts derives it from the move
   * /projects actually arrives on, so retiming the camera retimes this.
   */
  const step = (index: number) =>
    foregroundEnter(index, { reduced, scene: 'projects' });

  const rows = useMemo(
    () =>
      projects
        .map(toRow)
        .filter((row) => showAll || FEATURED_IDS.includes(row.id)),
    [projects, showAll],
  );

  const handleHover = useCallback(
    (id: string | null) => {
      setActiveId(id);
      setHover(anchorFor(projects, id));
      onHoverProject?.(id);
    },
    [onHoverProject, projects, setHover],
  );

  return (
    <SceneStage
      align="center"
      className="clif-projects"
      vignette={showAll ? 'sheet' : 'left'}
    >
      <div
        className={cn(
          'flex min-h-0 w-full flex-1 flex-col justify-center gap-5',
          // The stage pads its own bottom and nothing else, and browse-all
          // fills the column top to bottom -- so without this the word sits
          // on the viewport edge. Mirrors the stage's bottom inset.
          'pt-[var(--foreground-bottom-mobile)] tablet:pt-[var(--foreground-bottom)]',
          'transition-[max-width]',
          CINCH,
          COLUMN[showAll ? 'all' : 'featured'],
        )}
        data-view={showAll ? 'all' : 'featured'}
      >
        <div className="flex flex-col gap-2.5">
          {/* The word gets its own box: PageWord is w-fit so its clipped
              gradient samples the word itself, and the arrival belongs to
              the box rather than to the glyphs. */}
          <div style={step(0)}>
            <PageWord
              className={cn(
                'whitespace-nowrap transition-[font-size,padding-bottom]',
                CINCH,
              )}
              size={showAll ? 'sm' : 'md'}
            >
              projects
            </PageWord>
          </div>
          {/* 1g has no subtitle: at 390px the word and the table are the
              whole page, and a third block would push the table off. */}
          <Text
            className={cn(
              'transition-[font-size,line-height] max-tablet:hidden',
              CINCH,
            )}
            style={step(1)}
            variant={showAll ? 'detail' : 'body'}
          >
            {showAll ? SUBTITLE_COPY : BODY_COPY}
          </Text>
        </div>
        {/* The table's step is a box around it: the arrival and the growth
            are two different properties of the same element, and
            ProjectTable takes a className rather than a style. The box is
            also the bounded flex parent its own flex-1 resolves against. */}
        <div
          className={cn(
            'flex min-h-0 flex-col transition-[flex-grow]',
            CINCH,
            showAll && 'flex-1',
          )}
          style={step(2)}
        >
          <ProjectTable
            activeId={activeId}
            className={cn(showAll && ROW_STAGGER)}
            columns={showAll ? 'all' : 'featured'}
            count={`${String(rows.length).padStart(2, '0')} of ${
              projects.length
            }`}
            eyebrow={showAll ? 'all projects' : 'selected work'}
            onHoverRow={handleHover}
            rows={rows}
          />
        </div>
        <div className="flex pt-2" style={step(3)}>
          {showAll ? (
            <Button
              lead="←"
              onClick={() => setBrowsing(false)}
              size="sm"
            >
              selected work
            </Button>
          ) : (
            // 1g reads "all 14" at xs: "browse all" does not fit 390px.
            <Button
              expand
              onClick={() => setBrowsing(true)}
              size={isMobile ? 'xs' : 'sm'}
            >
              {isMobile ? 'all 14' : 'browse all'}
            </Button>
          )}
        </div>
      </div>
    </SceneStage>
  );
};

export default ProjectsPage;
