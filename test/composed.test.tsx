import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import MetaGrid from 'components/composed/MetaGrid';
import Pager from 'components/composed/Pager';
import ProjectTable, {
  cellValue,
  EM_DASH,
  PROJECT_TABLE_COLUMNS,
  PROJECT_TABLE_MODEL,
  type ProjectRow,
} from 'components/composed/ProjectTable';
import SceneStage, {
  STAGE_WASHES,
  type StageVignette,
} from 'components/composed/SceneStage';
import ScreenshotPlane from 'components/composed/ScreenshotPlane';
import Scrubber, {
  progressWidth,
  TICK_STAGGER_MS,
} from 'components/composed/Scrubber';
import Sheet from 'components/composed/Sheet';

const rows: ProjectRow[] = [
  {
    id: 'gopro',
    index: 10,
    title: 'GoPro Mountain Games Event Map',
    client: '970 Design',
    city: 'Vail CO',
    year: 2017,
    users: null,
    href: '/projects/gopro',
  },
  {
    id: 'haikumi',
    index: 0,
    title: 'Haikumi',
    client: 'Wieden+Kennedy',
    year: 2023,
  },
];

describe('SceneStage', () => {
  it('defaults to the left wash, centred', () => {
    const { container } = render(<SceneStage>body</SceneStage>);
    const stage = container.querySelector('main');
    expect(stage).toHaveAttribute('data-vignette', 'left');
    expect(stage).toHaveAttribute('data-align', 'center');
  });

  it('paints the left column with the wide scrim, not the plain vignette', () => {
    // The cardless table failed on --vignette-left: it decays underneath the
    // content. --scrim-wide holds its strength and only fades past it.
    expect(STAGE_WASHES.left).toBe('var(--scrim-wide)');
    const { container } = render(<SceneStage>body</SceneStage>);
    const wash = container.querySelector('[aria-hidden="true"]');
    expect(wash).toHaveStyle({
      backgroundImage: 'var(--scrim-wide)',
    });
  });

  it('never blurs the map to make type readable', () => {
    const { container } = render(<SceneStage>body</SceneStage>);
    expect(container.innerHTML).not.toMatch(/blur/);
  });

  it('gives every wash a themed token, and none no layer at all', () => {
    const named: StageVignette[] = [
      'left',
      'atmosphere',
      'night',
      'center',
      'sheet',
    ];
    named.forEach((vignette) => {
      const { container, unmount } = render(
        <SceneStage vignette={vignette}>body</SceneStage>,
      );
      expect(STAGE_WASHES[vignette]).toMatch(/^var\(--/);
      expect(
        container.querySelector('[aria-hidden="true"]'),
      ).not.toBeNull();
      unmount();
    });

    const { container } = render(
      <SceneStage vignette="none">body</SceneStage>,
    );
    expect(STAGE_WASHES.none).toBeNull();
    expect(
      container.querySelector('[aria-hidden="true"]'),
    ).toBeNull();
  });

  it('takes a word, a footer and a different wash', () => {
    render(
      <SceneStage
        align="top"
        className="x"
        footer={<p>footer</p>}
        vignette="night"
        word={<h1>about</h1>}
      >
        body
      </SceneStage>,
    );
    expect(screen.getByText('about')).toBeVisible();
    expect(screen.getByText('footer')).toBeVisible();
  });
});

describe('ProjectTable', () => {
  it('shows the featured columns and pads the index', () => {
    render(<ProjectTable rows={rows} />);
    expect(PROJECT_TABLE_COLUMNS.featured).toEqual([
      '##',
      'project',
      'client',
      'year',
    ]);
    expect(
      screen.getByRole('columnheader', { name: 'project' }),
    ).toBeVisible();
    expect(screen.getByText('10')).toBeVisible();
    expect(screen.getByText('00')).toBeVisible();
  });

  it('keeps the two column models in step with their headings', () => {
    expect(PROJECT_TABLE_MODEL.featured.map((c) => c.key)).toEqual([
      'index',
      'title',
      'client',
      'year',
    ]);
    expect(PROJECT_TABLE_MODEL.all.map((c) => c.key)).toEqual([
      'index',
      'title',
      'client',
      'city',
      'year',
      'users',
    ]);
    expect(PROJECT_TABLE_COLUMNS.all).toHaveLength(6);
  });

  it('reads every cell off the row, with an em dash for the gaps', () => {
    expect(cellValue(rows[0], 'index')).toBe('10');
    expect(cellValue(rows[0], 'title')).toBe(
      'GoPro Mountain Games Event Map',
    );
    expect(cellValue(rows[0], 'client')).toBe('970 Design');
    expect(cellValue(rows[0], 'city')).toBe('Vail CO');
    expect(cellValue(rows[0], 'year')).toBe('2017');
    expect(cellValue(rows[0], 'users')).toBe(EM_DASH);
    expect(cellValue(rows[1], 'city')).toBe(EM_DASH);
    expect(cellValue(rows[1], 'users')).toBe(EM_DASH);
  });

  it('never gives itself a surface: it lies on the bare map', () => {
    const { container } = render(<ProjectTable rows={rows} />);
    const root = container.querySelector('[data-columns]');
    expect(root?.className).not.toMatch(
      /\bbg-(surface|sheet)|shadow-|rounded-\[var\(--radius-card/,
    );
  });

  it('makes a row with an href a single link to its detail', () => {
    render(<ProjectTable rows={rows} />);
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute('href', '/projects/gopro');
    expect(links[0]).toHaveTextContent(
      'GoPro Mountain Games Event Map',
    );
  });

  it('survives having no handlers', async () => {
    render(<ProjectTable rows={rows} />);
    const row = screen.getByText('Haikumi').closest('tr');
    await userEvent.hover(row as HTMLElement);
    await userEvent.unhover(row as HTMLElement);
    await userEvent.click(row as HTMLElement);
  });

  it('reports hover and selection, and marks the active row', async () => {
    const onHoverRow = vi.fn();
    const onSelectRow = vi.fn();
    render(
      <ProjectTable
        activeId="gopro"
        className="x"
        columns="all"
        count="14 of 14"
        eyebrow="all projects"
        onHoverRow={onHoverRow}
        onSelectRow={onSelectRow}
        rows={rows}
      />,
    );
    expect(
      screen.getByRole('columnheader', { name: 'users' }),
    ).toBeVisible();
    const row = screen.getByText('Haikumi').closest('tr');
    await userEvent.hover(row as HTMLElement);
    expect(onHoverRow).toHaveBeenCalledWith('haikumi');
    await userEvent.unhover(row as HTMLElement);
    expect(onHoverRow).toHaveBeenCalledWith(null);
    await userEvent.click(row as HTMLElement);
    expect(onSelectRow).toHaveBeenCalledWith('haikumi');
    expect(
      screen
        .getByText('GoPro Mountain Games Event Map')
        .closest('tr'),
    ).toHaveAttribute('data-active', 'true');
  });

  it('scrolls inside itself only in the browse-all state', () => {
    const { container, rerender } = render(
      <ProjectTable columns="all" rows={rows} />,
    );
    expect(container.querySelector('tbody')?.className).toMatch(
      /overflow-y-auto/,
    );
    rerender(<ProjectTable rows={rows} />);
    expect(container.querySelector('tbody')?.className).not.toMatch(
      /overflow-y-auto/,
    );
  });
});

describe('Sheet', () => {
  it('is the right-hand card by default', () => {
    const { container } = render(
      <Sheet title="Ubiquiti">body</Sheet>,
    );
    const sheet = container.querySelector('aside');
    expect(sheet).toHaveAttribute('data-placement', 'right');
    expect(sheet?.className).toMatch(/w-\[380px\]/);
    expect(
      screen.getByRole('heading', { name: 'Ubiquiti' }),
    ).toBeVisible();
  });

  it('draws a two-triangle tail that points at its stop', () => {
    const { container, rerender } = render(
      <Sheet title="Ubiquiti">body</Sheet>,
    );
    const right = [
      ...container.querySelectorAll('aside > [aria-hidden="true"]'),
    ];
    expect(right).toHaveLength(2);
    expect(right[0].className).toMatch(/border-r-accent-30/);
    expect(right[1].className).toMatch(/border-r-sheet/);

    rerender(
      <Sheet placement="bottom" title="Ubiquiti">
        body
      </Sheet>,
    );
    const bottom = [
      ...container.querySelectorAll('aside > [aria-hidden="true"]'),
    ];
    // Two triangles plus the grab handle.
    expect(bottom).toHaveLength(3);
    expect(bottom[0].className).toMatch(/border-b-accent-30/);
    expect(bottom[1].className).toMatch(/border-b-sheet/);
  });

  it('becomes a bottom sheet with a pager', () => {
    const { container } = render(
      <Sheet
        className="x"
        eyebrow="stop 04 / 06"
        label="software engineer"
        meta="Portland OR"
        pager={<nav>pager</nav>}
        placement="bottom"
        title="Ubiquiti"
      >
        body
      </Sheet>,
    );
    const sheet = container.querySelector('aside');
    expect(sheet).toHaveAttribute('data-placement', 'bottom');
    expect(sheet?.className).toMatch(/rounded-t-/);
    expect(screen.getByText('pager')).toBeVisible();
  });
});

describe('Scrubber', () => {
  const stops = [
    { id: 1, label: 'NIKE', at: 25 },
    { id: 2, label: 'UBIQUITI', at: 36 },
  ];

  it('defaults to the first stop and the 2015-2026 span', async () => {
    render(<Scrubber stops={stops} />);
    expect(screen.getByText('2015')).toBeVisible();
    expect(screen.getByText('2026')).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'NIKE' }),
    ).toHaveAttribute('data-live', 'true');
    expect(
      screen.getByRole('button', { name: 'UBIQUITI' }),
    ).toHaveAttribute('data-live', 'false');
    await userEvent.click(screen.getByText('UBIQUITI'));
  });

  it('places each tick at its own percentage and staggers them', () => {
    render(<Scrubber stops={stops} />);
    const nike = screen.getByRole('button', { name: 'NIKE' });
    const ubiquiti = screen.getByRole('button', {
      name: 'UBIQUITI',
    });
    expect(nike).toHaveStyle({ left: '25%', animationDelay: '0ms' });
    expect(ubiquiti).toHaveStyle({
      left: '36%',
      animationDelay: `${TICK_STAGGER_MS}ms`,
    });
  });

  it('runs the progress rule to the last stop, and nowhere with none', () => {
    expect(progressWidth(stops)).toBe(36);
    expect(progressWidth([])).toBe(0);
    render(<Scrubber stops={[]} />);
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('reports selection and takes controls', async () => {
    const onSelect = vi.fn();
    render(
      <Scrubber
        className="x"
        controls={<span>fit</span>}
        from="2016"
        onSelect={onSelect}
        selectedIndex={1}
        stops={stops}
        to="2025"
      />,
    );
    expect(screen.getByText('fit')).toBeVisible();
    await userEvent.click(screen.getByText('NIKE'));
    expect(onSelect).toHaveBeenCalledWith(0);
  });
});

describe('Pager', () => {
  it('renders nothing when there is nowhere to go', () => {
    const { container } = render(<Pager />);
    expect(container.querySelectorAll('a')).toHaveLength(0);
  });

  it('renders one end when the other is missing', () => {
    const { container } = render(
      <Pager
        prev={{ href: '/projects/harvard', label: 'harvard' }}
      />,
    );
    expect(container.querySelectorAll('a')).toHaveLength(1);
  });

  it('renders both directions', () => {
    render(
      <Pager
        className="x"
        grow
        next={{ href: '/projects/winter', label: 'winter' }}
        prev={{ href: '/projects/harvard', label: 'harvard' }}
        size="xs"
      />,
    );
    expect(
      screen.getByRole('link', { name: /harvard/ }),
    ).toHaveAttribute('href', '/projects/harvard');
    expect(
      screen.getByRole('link', { name: /winter/ }),
    ).toHaveAttribute('href', '/projects/winter');
  });
});

describe('MetaGrid', () => {
  it('lays out label/value pairs in three columns', () => {
    const { container, rerender } = render(
      <MetaGrid items={[{ label: 'client', value: '970 Design' }]} />,
    );
    expect(screen.getByText('client')).toBeVisible();
    expect(container.querySelector('dl')).toHaveStyle({
      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    });
    rerender(
      <MetaGrid
        className="x"
        columns={2}
        items={[{ label: 'year', value: 2017 }]}
      />,
    );
    expect(container.querySelector('dl')).toHaveStyle({
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    });
  });
});

describe('ScreenshotPlane', () => {
  it('defaults to a 600x380 plane tilted -18deg', () => {
    const { container } = render(<ScreenshotPlane />);
    expect(container.querySelector('figure')).toHaveStyle({
      width: '600px',
      height: '380px',
      transform: 'perspective(1200px) rotateY(-18deg) rotateX(5deg)',
    });
    expect(container.querySelector('figcaption')).toBeNull();
  });

  it('is the one place the system spends a shadow', () => {
    const { container } = render(<ScreenshotPlane />);
    expect(container.querySelector('figure')?.className).toMatch(
      /shadow-\[var\(--shadow-plane\)\]/,
    );
  });

  it('takes a source, a caption and a hover tilt', () => {
    const { container } = render(
      <ScreenshotPlane
        alt="GoPro"
        caption="event map sheet"
        className="x"
        height={200}
        src="/gopro.webp"
        tilt={-16}
        width={300}
      />,
    );
    expect(screen.getByText('event map sheet')).toBeVisible();
    expect(container.querySelector('figure')).toHaveStyle({
      transform: 'perspective(1200px) rotateY(-16deg) rotateX(5deg)',
    });
    // No WebGL in jsdom, so the shader falls back to the plain image.
    expect(screen.getByRole('img', { name: 'GoPro' })).toBeVisible();
  });

  it('swaps the capture without remounting the plane', () => {
    const { container, rerender } = render(
      <ScreenshotPlane alt="GoPro" src="/gopro.webp" />,
    );
    const figure = container.querySelector('figure');
    rerender(<ScreenshotPlane alt="Haikumi" src="/haikumi.webp" />);
    expect(container.querySelector('figure')).toBe(figure);
    expect(container.querySelector('figure')).toHaveAttribute(
      'data-src',
      '/haikumi.webp',
    );
  });
});
