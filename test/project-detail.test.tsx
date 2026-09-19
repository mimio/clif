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
import ProjectDetailPage, {
  pagerLabel,
} from 'pagesComponents/projectDetail';
import {
  FG_REDUCED_MS,
  FG_STAGGER_MS,
  foregroundHandoffMs,
} from 'scene/enter';
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

  it('names the pager caps by title, with no ordinal in front of it', () => {
    render(<ProjectDetailPage project={gopro} />);

    // The cap's accessible name is its arrow and its label; what the
    // ordinal removal is about is the label, which pagerLabel states
    // exactly a few lines down.
    expect(
      screen.getByRole('link', { name: /sports events finder/ }),
    ).toHaveAttribute('href', '/projects/ngwsd');
    expect(
      screen.getByRole('link', {
        name: /3d asset searching and viewing tool/,
      }),
    ).toHaveAttribute('href', '/projects/poly');
  });

  it('wraps the catalogue at both ends', () => {
    expect(pagerLabel('haikumi')).toBe(
      'haikumi: mobile messaging with care',
    );
    expect(pagerLabel(projectsById.haikumi.prevId)).toBe(
      'birds of prey winter sports event map',
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
    const rail = container.querySelector('figure')?.parentElement;
    expect(rail).toHaveAttribute('data-slot', 'plane');
    expect(rail?.style.animation).toBe('');
    expect(rail?.parentElement?.style.animation).toBe('');
  });

  /*
   * The column's width is the STAGE's, because the rail the capture sits in
   * is: /projects and a detail read the same --reading-max, which is the
   * only way the owner's "they can pretty much exactly match" can survive a
   * later change to either page. The artboard's hand-held 560px and 470px
   * blocks are what that replaced.
   */
  it('takes its column width from the rail the stage reserves', () => {
    const { container } = render(
      <ProjectDetailPage project={gopro} />,
    );
    expect(container.querySelector('main')).toHaveAttribute(
      'data-rail',
      'true',
    );
    expect(container.querySelector('.clif-stage-column')).toHaveClass(
      'wide:max-w-[var(--reading-max)]',
    );
    expect(container.innerHTML).not.toMatch(/max-w-\[(560|470)px\]/);
  });
});

describe('foreground choreography', () => {
  /*
   * scene/enter.ts owns the shape of the enter and test/scene-enter.test.ts
   * proves it. What belongs to this route is WHICH move it waits on -- the
   * 900ms flight into a detail, not the 800ms everything else gets -- and
   * that the steps come out in the artboard's order.
   */
  const animationOf = (el: Element | null | undefined) =>
    (el as HTMLElement | null | undefined)?.style.animation ?? '';

  it('waits on the detail move and steps 40ms apart', () => {
    const { container } = render(
      <ProjectDetailPage project={gopro} />,
    );
    const handoff = foregroundHandoffMs('projectDetail');
    expect(handoff).toBe(540);

    expect(
      animationOf(container.querySelector('h1')?.parentElement),
    ).toContain(`${handoff}ms both`);
    expect(animationOf(container.querySelector('h2'))).toContain(
      `${handoff + FG_STAGGER_MS}ms both`,
    );
    expect(
      animationOf(container.querySelector('dl')?.parentElement),
    ).toContain(`${handoff + 4 * FG_STAGGER_MS}ms both`);
  });

  it('crossfades in place under reduced motion', () => {
    stubReducedMotion(true);
    const { container } = render(
      <ProjectDetailPage project={gopro} />,
    );
    const word = container.querySelector('h1')?.parentElement;
    expect(animationOf(word)).toBe(
      `clif-slidein ${FG_REDUCED_MS}ms linear both`,
    );
    expect(word?.style.getPropertyValue('--slide-in-from')).toBe(
      '0px',
    );
  });
});
