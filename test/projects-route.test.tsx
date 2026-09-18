import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import projectsById, { projectsList } from 'content/projects';
import ProjectsPage, {
  anchorFor,
  BODY_COPY,
  projectFor,
  toRow,
} from 'pagesComponents/projects';
import { FG_STAGGER_MS, foregroundHandoffMs } from 'scene/enter';
import MapProvider, {
  useSceneHover,
  useSceneViewValue,
} from 'scene/MapProvider';
import {
  MOBILE_QUERY,
  REDUCED_MOTION_QUERY,
} from 'scene/useViewport';
import { showLabels } from 'scene/view';

/*
 * 1b / 1c / 1g, from the outside.
 *
 * The one thing worth stating about this file: THERE IS NO SECOND STATE
 * LEFT. The index arrives carrying every project, so nothing here clicks a
 * cap to widen anything; what used to be the browse-all assertions are the
 * assertions about arrival now. If a test here ever needs a router, the
 * index has grown a navigation it is not supposed to have.
 */

/** Body rows only: the header row lives in its own rowgroup. */
const bodyRows = (): HTMLElement[] => {
  const groups = screen.getAllByRole('rowgroup');
  return within(groups[1]).getAllByRole('row');
};

/** The stage's rail, and the capture in it. */
const plane = (container: HTMLElement): HTMLElement | null =>
  container.querySelector('[data-slot="plane"] figure');

const matchMediaFor = (matching: string) =>
  vi.fn((query: string) => ({
    matches: query === matching,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));

/*
 * test/setup.ts installs a matchMedia that answers "no" to everything,
 * which is the desktop, full-motion snapshot. A test that wants the
 * mobile answer replaces it, so every test puts the desktop one back.
 */
afterEach(() => {
  vi.stubGlobal('matchMedia', matchMediaFor('nothing matches'));
});

describe('toRow', () => {
  it('carries the city and a link to the detail, and no ordinal', () => {
    const row = toRow(projectsById.gopro);
    expect(row).toMatchObject({
      city: 'Vail CO',
      href: '/projects/gopro',
      year: 2017,
    });
    expect(row).not.toHaveProperty('index');
  });
});

describe('projectFor / anchorFor', () => {
  it('finds the hovered project and its city', () => {
    expect(projectFor(projectsList, 'gopro')?.id).toBe('gopro');
    expect(anchorFor(projectsList, 'gopro')).toBe('vail');
  });

  it('is null when nothing is hovered', () => {
    expect(projectFor(projectsList, null)).toBeNull();
    expect(anchorFor(projectsList, null)).toBeNull();
  });

  it('is null for an id that is not a project', () => {
    expect(anchorFor(projectsList, 'not-a-project')).toBeNull();
  });
});

describe('the index is the whole catalogue, on arrival', () => {
  it('is fourteen rows over the sheet wash, with the body copy', () => {
    render(<ProjectsPage projects={projectsList} />);

    expect(bodyRows()).toHaveLength(projectsList.length);
    expect(screen.getByText('all projects')).toBeVisible();
    expect(screen.getByText('14')).toBeVisible();
    expect(screen.getByText(BODY_COPY)).toBeVisible();
    // The table runs most of the way across now, and --scrim-wide has
    // decayed to nothing by its right edge; `sheet` is the pairing that
    // protects the whole width.
    expect(screen.getByRole('main')).toHaveAttribute(
      'data-vignette',
      'sheet',
    );
  });

  it('has no cap to widen it with, because there is nothing left to widen', () => {
    render(<ProjectsPage projects={projectsList} />);
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.queryByText('selected work')).toBeNull();
  });

  it('lists every project, in the catalogue order, each a real link', () => {
    render(<ProjectsPage projects={projectsList} />);
    const links = screen
      .getAllByRole('link')
      .map((link) => link.getAttribute('href'));
    expect(links).toEqual(
      projectsList.map((project) => `/projects/${project.id}`),
    );
    expect(
      screen.getByRole('link', { name: /Haikumi/ }),
    ).toHaveAttribute('href', '/projects/haikumi');
  });

  it('prints no ordinal anywhere on the page', () => {
    render(<ProjectsPage projects={projectsList} />);
    expect(screen.queryByText('##')).toBeNull();
    expect(screen.queryByText('00')).toBeNull();
    expect(screen.queryByText('13')).toBeNull();
  });

  it('gives the scrolling table a bounded height to scroll inside', () => {
    render(<ProjectsPage projects={projectsList} />);

    // The stack is the flex column the table's own flex-1 resolves
    // against; without it the tbody has nothing to be bounded by.
    const table = screen.getByRole('table');
    expect(table.parentElement).toHaveClass('flex-1');
    expect(table.parentElement?.parentElement).toHaveClass(
      'min-h-0',
      'flex-1',
    );
  });

  /*
   * The column is not this route's number and must not become one: the rail
   * is the stage's, so the width left over is the stage's too, and that is
   * the only reason /projects and a detail can be said to match.
   */
  it('leaves the column width to the stage that reserves the rail', () => {
    const { container } = render(
      <ProjectsPage projects={projectsList} />,
    );
    const column = container.querySelector('.clif-stage-column');
    expect(container.querySelector('main')).toHaveAttribute(
      'data-rail',
      'true',
    );
    expect(column).toHaveClass('wide:max-w-[var(--reading-max)]');
    expect(container.innerHTML).not.toMatch(/max-w-\[620px\]/);
  });
});

describe('the hover channel', () => {
  it('lights the row and hands its city to the scene', async () => {
    const user = userEvent.setup();
    const onHoverProject = vi.fn();
    render(
      <MapProvider>
        <ProjectsPage
          onHoverProject={onHoverProject}
          projects={projectsList}
        />
      </MapProvider>,
    );

    const row = screen
      .getByRole('link', { name: /Haikumi/ })
      .closest('tr') as HTMLElement;

    await user.hover(row);
    expect(row).toHaveAttribute('data-active', 'true');
    expect(onHoverProject).toHaveBeenLastCalledWith('haikumi');

    await user.unhover(row);
    expect(row).toHaveAttribute('data-active', 'false');
    expect(onHoverProject).toHaveBeenLastCalledWith(null);
  });

  /*
   * THE CAPTURE IS THE THIRD CONSUMER of the same hover, and the one the
   * owner asked for: "on hover of table rows we can show the same image
   * that appears in the single project view -- reuse that exact thing."
   * So it is ScreenshotPlane in the stage's rail, not a second component,
   * and the rail is reserved before anything is hovered so the column
   * cannot resize under the pointer.
   */
  it('flies the hovered capture into the rail, and fades it out again', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <ProjectsPage projects={projectsList} />,
    );

    // Reserved and empty: no texture is loaded before a pointer asks.
    expect(plane(container)).not.toBeNull();
    expect(plane(container)).not.toHaveAttribute('data-src');
    expect(plane(container)).toHaveClass('opacity-0');

    const row = screen
      .getByRole('link', { name: /GoPro/ })
      .closest('tr') as HTMLElement;
    await user.hover(row);

    expect(plane(container)).toHaveAttribute(
      'data-src',
      '/gopro.webp',
    );
    expect(plane(container)).not.toHaveClass('opacity-0');
    // 1d's own note: -16deg when it flies in on a projects hover.
    expect(plane(container)?.style.transform).toContain(
      'rotateY(-16deg)',
    );

    /*
     * On the way out it keeps the image it was showing rather than
     * blanking to the placeholder weave: a capture that vanished before it
     * faded would read as a load failure.
     */
    await user.unhover(row);
    expect(plane(container)).toHaveAttribute(
      'data-src',
      '/gopro.webp',
    );
    expect(plane(container)).toHaveClass('opacity-0');
  });

  it('closes when the page goes, not only when a row does', async () => {
    const user = userEvent.setup();
    const Lit = () => {
      const { hover } = useSceneHover();
      return <span data-testid="lit">{hover ?? 'none'}</span>;
    };
    // MapProvider is mounted in _app and never unmounts, so whatever the
    // channel is holding when a route leaves is what the next route gets.
    const { rerender } = render(
      <MapProvider>
        <ProjectsPage projects={projectsList} />
        <Lit />
      </MapProvider>,
    );

    const row = screen
      .getByRole('link', { name: /GoPro/ })
      .closest('tr') as HTMLElement;
    await user.hover(row);
    expect(screen.getByTestId('lit')).toHaveTextContent('vail');

    // Leaving the page with the pointer parked on the row: no mouseleave
    // is synthesised for an element that was removed, so the only event
    // that can end this is the unmount. A stale `vail` moves the about
    // route's centre 1.30 degrees of longitude at zoom 10.5 -- which is
    // empty ground, not Portland.
    rerender(
      <MapProvider>
        <Lit />
      </MapProvider>,
    );
    expect(screen.getByTestId('lit')).toHaveTextContent('none');
  });

  it('is a no-op outside a provider, and needs no callback', async () => {
    const user = userEvent.setup();
    render(<ProjectsPage projects={projectsList} />);
    const row = screen
      .getByRole('link', { name: /Haikumi/ })
      .closest('tr') as HTMLElement;

    await user.hover(row);
    expect(row).toHaveAttribute('data-active', 'true');
  });
});

describe('mobile (1g)', () => {
  it('drops the body copy and keeps every row', () => {
    vi.stubGlobal('matchMedia', matchMediaFor(MOBILE_QUERY));
    render(<ProjectsPage projects={projectsList} />);

    // Still in the DOM -- it is the breakpoint that hides it, so nothing
    // needs a second element or a width read to decide.
    expect(screen.getByText(BODY_COPY)).toHaveClass(
      'max-tablet:hidden',
    );
    expect(bodyRows()).toHaveLength(projectsList.length);
  });
});

/*
 * Asserted through showLabels -- the function SceneRoot itself calls --
 * rather than off the raw patch, because the answer is a composition and
 * the half this route owns is only one of its two inputs. No Mapbox tiles
 * are reachable in CI or in the sandbox, so this seam is as close to the
 * drawn labels as a test can get.
 */
describe('what the route tells the scene', () => {
  const Labels = () => {
    const view = useSceneViewValue();
    return (
      <span data-testid="labels">
        {`${String(showLabels(view, false))}/${String(
          showLabels(view, true),
        )}`}
      </span>
    );
  };

  it('vetoes the map type at every width, because the table is over the band', () => {
    render(
      <MapProvider>
        <ProjectsPage projects={projectsList} />
        <Labels />
      </MapProvider>,
    );

    // 1c's data-labels="0", which used to apply only in browse-all: the
    // table carries the names and the points carry the places.
    expect(screen.getByTestId('labels')).toHaveTextContent(
      'false/false',
    );
  });
});

describe('the foreground arrives with the camera', () => {
  /** word, copy, table -- the order 1b lists them in. */
  const steps = (container: HTMLElement): string[] =>
    [...container.querySelectorAll('[style*="animation"]')].map(
      (el) => (el as HTMLElement).style.animation,
    );

  it('waits out 60% of the move, then steps 40ms apart', () => {
    const { container } = render(
      <ProjectsPage projects={projectsList} />,
    );
    const handoff = foregroundHandoffMs('projects');

    expect(steps(container)).toEqual(
      [0, 1, 2].map(
        (step) =>
          `clif-slidein var(--fg-enter) var(--fg-ease) ${
            handoff + step * FG_STAGGER_MS
          }ms both`,
      ),
    );
  });

  it('is a crossfade with no wait under reduced motion', () => {
    vi.stubGlobal('matchMedia', matchMediaFor(REDUCED_MOTION_QUERY));
    const { container } = render(
      <ProjectsPage projects={projectsList} />,
    );

    for (const animation of steps(container)) {
      expect(animation).toBe('clif-slidein 200ms linear both');
    }
  });
});
