import { fireEvent, render, screen } from '@testing-library/react';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import projectsById from 'content/projects';
import { SCENE_HANDOFF, SCENE_MOVE_LONG_MS } from 'content/cameras';
import ProjectDetailPage, {
  enterStyle,
  FG_REDUCED_MS,
  FG_STAGGER_MS,
  pagerLabel,
} from 'pagesComponents/projectDetail';
import { REDUCED_MOTION_QUERY } from 'scene/useViewport';

const push = vi.hoisted(() => vi.fn());

vi.mock('next/router', () => ({
  useRouter: () => ({ push }),
}));

/*
 * test/setup.ts stubs matchMedia as "no preference" for every query. This
 * swaps in a stub that answers one query differently, so useReducedMotion --
 * a useSyncExternalStore read, not an effect -- reports the preference on
 * the first render rather than after a repaint.
 */
const stubReducedMotion = (reduced: boolean) => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: reduced && query === REDUCED_MOTION_QUERY,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
};

beforeEach(() => {
  stubReducedMotion(false);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

const gopro = projectsById.gopro;

describe('project detail (artboard 1d)', () => {
  it('is the page word, the title, the roles and the meta', () => {
    render(<ProjectDetailPage project={gopro} />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'gopro' }),
    ).toBeVisible();
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'GoPro Mountain Games Event Map',
      }),
    ).toBeVisible();

    // The lead role is the accent outline, the rest the neutral one.
    expect(screen.getByText('Development')).toHaveAttribute(
      'data-tone',
      'accent',
    );
    expect(screen.getByText('Cartography')).toHaveAttribute(
      'data-tone',
      'neutral',
    );

    expect(screen.getByText('client')).toBeVisible();
    expect(screen.getByText('970 Design')).toBeVisible();
    expect(screen.getByText('2017')).toBeVisible();
    expect(screen.getAllByText('Event Map').length).toBeGreaterThan(
      0,
    );
  });

  it('renders the description links rather than flattening them', () => {
    render(<ProjectDetailPage project={gopro} />);

    expect(
      screen.getByRole('link', {
        name: 'The Vail Valley Foundation',
      }),
    ).toHaveAttribute('href', 'https://vvf.org/');
    expect(
      screen.getByRole('link', { name: '80,000 attendees' }),
    ).toHaveAttribute('target', '_blank');
    // Both paragraphs, plain spans and all.
    expect(screen.getByText(/interactive event map/)).toBeVisible();
  });

  it('names the pager caps by row number and title', () => {
    render(<ProjectDetailPage project={gopro} />);

    expect(
      screen.getByRole('link', { name: /09 sports events finder/ }),
    ).toHaveAttribute('href', '/projects/ngwsd');
    expect(
      screen.getByRole('link', {
        name: /11 3d asset searching and viewing tool/,
      }),
    ).toHaveAttribute('href', '/projects/poly');
  });

  it('wraps the catalogue at both ends', () => {
    expect(pagerLabel('haikumi')).toBe(
      '00 haikumi: mobile messaging with care',
    );
    expect(pagerLabel(projectsById.haikumi.prevId)).toBe(
      '13 birds of prey winter sports event map',
    );
  });

  it('ascends to the map from the cap and from escape', () => {
    render(<ProjectDetailPage project={gopro} />);

    expect(
      screen.getByRole('link', { name: /ascend to map/ }),
    ).toHaveAttribute('href', '/projects');

    fireEvent.keyDown(window, { key: 'a' });
    expect(push).not.toHaveBeenCalled();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(push).toHaveBeenCalledWith('/projects');
  });

  it('lets escape go once the route is gone', () => {
    const { unmount } = render(<ProjectDetailPage project={gopro} />);
    unmount();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(push).not.toHaveBeenCalled();
  });

  /*
   * The one transition the plane exists for. A new project has to arrive as
   * a new `src` on the mounted figure -- GlitchImage swaps the texture in
   * componentDidUpdate -- so this asserts the NODE ITSELF survives, not just
   * that a figure is on screen afterwards.
   */
  it('keeps the same screenshot plane across a project change', () => {
    const { container, rerender } = render(
      <ProjectDetailPage project={gopro} />,
    );
    const before = container.querySelector('figure');
    expect(before).toHaveAttribute('data-src', '/gopro.webp');

    rerender(<ProjectDetailPage project={projectsById.haikumi} />);
    const after = container.querySelector('figure');

    expect(after).toBe(before);
    expect(after).toHaveAttribute('data-src', '/haikumi.webp');
  });

  it('holds the plane out of the entering column', () => {
    const { container } = render(
      <ProjectDetailPage project={gopro} />,
    );
    const plane =
      container.querySelector('figure')?.parentElement?.parentElement;
    expect(plane?.style.animation).toBe('');
  });
});

describe('foreground choreography', () => {
  it('waits for the scene and then staggers', () => {
    expect(enterStyle(0, false).animationDelay).toBe(
      `${SCENE_MOVE_LONG_MS * SCENE_HANDOFF}ms`,
    );
    expect(enterStyle(3, false).animationDelay).toBe(
      `${SCENE_MOVE_LONG_MS * SCENE_HANDOFF + 3 * FG_STAGGER_MS}ms`,
    );
    expect(enterStyle(1, false).animation).toContain('clif-slidein');
  });

  it('crossfades in place under reduced motion', () => {
    const style = enterStyle(4, true) as Record<string, string>;
    expect(style.animation).toBe(
      `clif-slidein ${FG_REDUCED_MS}ms linear both`,
    );
    expect(style['--slide-in-from']).toBe('0px');
    expect(style.animationDelay).toBeUndefined();
  });

  it('reads the preference off the media query', () => {
    stubReducedMotion(true);
    const { container } = render(
      <ProjectDetailPage project={gopro} />,
    );
    const word = container.querySelector('h1')?.parentElement;
    expect(word?.style.animation).toBe(
      `clif-slidein ${FG_REDUCED_MS}ms linear both`,
    );
  });
});
