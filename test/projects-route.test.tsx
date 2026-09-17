import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import projectsById, { projectsList } from 'content/projects';
import ProjectsPage, {
  anchorFor,
  BODY_COPY,
  FEATURED_IDS,
  SUBTITLE_COPY,
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
 * The one thing worth stating about this file: BROWSE ALL is checked as a
 * state change on a single mounted page, never as a navigation. If a test
 * here ever needs a router, the view has become a route and the owner's
 * decision has been undone.
 */

/** Body rows only: the header row lives in its own rowgroup. */
const bodyRows = (): HTMLElement[] => {
  const groups = screen.getAllByRole('rowgroup');
  return within(groups[1]).getAllByRole('row');
};

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
  it('carries the project ordinal, its city and a link to its detail', () => {
    const row = toRow(projectsById.gopro, 10);
    expect(row).toMatchObject({
      city: 'Vail CO',
      href: '/projects/gopro',
      index: 10,
      year: 2017,
    });
  });
});

describe('anchorFor', () => {
  it('finds the hovered project city', () => {
    expect(anchorFor(projectsList, 'gopro')).toBe('vail');
  });

  it('is null when nothing is hovered', () => {
    expect(anchorFor(projectsList, null)).toBeNull();
  });

  it('is null for an id that is not a project', () => {
    expect(anchorFor(projectsList, 'not-a-project')).toBeNull();
  });
});

describe('projects, at rest (1b)', () => {
  it('is six featured rows over the left wash, with the body copy', () => {
    render(<ProjectsPage projects={projectsList} />);

    expect(bodyRows()).toHaveLength(6);
    expect(screen.getByText('selected work')).toBeVisible();
    expect(screen.getByText('06 of 14')).toBeVisible();
    expect(screen.getByText(BODY_COPY)).toBeVisible();
    expect(screen.getByRole('main')).toHaveAttribute(
      'data-vignette',
      'left',
    );
  });

  it('shows the six the artboard picked, in the artboard order', () => {
    render(<ProjectsPage projects={projectsList} />);
    const links = screen
      .getAllByRole('link')
      .map((link) => link.getAttribute('href'));
    expect(links).toEqual(
      projectsList
        .filter((project) => FEATURED_IDS.includes(project.id))
        .map((project) => `/projects/${project.id}`),
    );
  });

  it('makes every row a real link, so a detail is reachable without a mouse', () => {
    render(<ProjectsPage projects={projectsList} />);
    expect(
      screen.getByRole('link', { name: /Haikumi/ }),
    ).toHaveAttribute('href', '/projects/haikumi');
  });
});

describe('browse all is a view, not a route (1c)', () => {
  it('widens the same table to fourteen and back again', async () => {
    const user = userEvent.setup();
    render(<ProjectsPage projects={projectsList} />);

    await user.click(
      screen.getByRole('button', { name: /browse all/ }),
    );

    expect(bodyRows()).toHaveLength(14);
    expect(screen.getByText('all projects')).toBeVisible();
    expect(screen.getByText('14 of 14')).toBeVisible();
    expect(screen.getByText(SUBTITLE_COPY)).toBeVisible();
    expect(screen.getByRole('main')).toHaveAttribute(
      'data-vignette',
      'sheet',
    );

    await user.click(
      screen.getByRole('button', { name: /selected work/ }),
    );

    expect(bodyRows()).toHaveLength(6);
    expect(screen.getByRole('main')).toHaveAttribute(
      'data-vignette',
      'left',
    );
  });

  it('cinches the header and widens the column on the same curve', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <ProjectsPage projects={projectsList} />,
    );
    const column = container.querySelector('[data-view]');
    const word = screen.getByText('projects');

    expect(column).toHaveClass('max-w-[620px]');
    expect(word).toHaveAttribute('data-size', 'md');

    await user.click(
      screen.getByRole('button', { name: /browse all/ }),
    );

    expect(column).toHaveClass('max-w-[1400px]');
    expect(word).toHaveAttribute('data-size', 'sm');
    expect(column).toHaveClass('duration-[420ms]', 'ease-scene');
  });

  it('gives the scrolling table a bounded height to scroll inside', async () => {
    const user = userEvent.setup();
    render(<ProjectsPage projects={projectsList} />);
    await user.click(
      screen.getByRole('button', { name: /browse all/ }),
    );

    // The stack is the flex column the table's own flex-1 resolves
    // against; without it the tbody has nothing to be bounded by.
    const table = screen.getByRole('table');
    expect(table.parentElement).toHaveClass('flex-1');
    expect(table.parentElement?.parentElement).toHaveClass(
      'min-h-0',
      'flex-1',
    );
  });

  it('can be forced by the prop, for a harness that has no pointer', () => {
    render(<ProjectsPage all projects={projectsList} />);
    expect(bodyRows()).toHaveLength(14);
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
  it('drops the subtitle and reads "all 14" on the cap', () => {
    vi.stubGlobal('matchMedia', matchMediaFor(MOBILE_QUERY));
    render(<ProjectsPage projects={projectsList} />);

    expect(
      screen.getByRole('button', { name: /all 14/ }),
    ).toBeVisible();
    // Still in the DOM -- it is the breakpoint that hides it, so the
    // browse-all view can reuse it without a second element.
    expect(screen.getByText(BODY_COPY)).toHaveClass(
      'max-tablet:hidden',
    );
    expect(bodyRows()).toHaveLength(6);
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

  const drawn = (): string =>
    screen.getByTestId('labels').textContent ?? '';

  it('keeps the map type at rest and vetoes it at full bleed', async () => {
    const user = userEvent.setup();
    render(
      <MapProvider>
        <ProjectsPage projects={projectsList} />
        <Labels />
      </MapProvider>,
    );

    // Drawn on the desktop board, already suppressed at 390px (1g) --
    // and that half is the viewport's, not this route's.
    expect(drawn()).toBe('true/false');

    await user.click(
      screen.getByRole('button', { name: /browse all/ }),
    );
    // 1c: the table is over the label band now, so the table carries the
    // names and the points carry the places. Off at both widths.
    expect(drawn()).toBe('false/false');

    await user.click(
      screen.getByRole('button', { name: /selected work/ }),
    );
    expect(drawn()).toBe('true/false');
  });
});

describe('the foreground arrives with the camera', () => {
  /** word, subtitle, table, cap -- the order 1b lists them in. */
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
      [0, 1, 2, 3].map(
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
