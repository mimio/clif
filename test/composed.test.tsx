import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import MetaGrid from 'components/composed/MetaGrid';
import Pager from 'components/composed/Pager';
import ProjectTable, {
  PROJECT_TABLE_COLUMNS,
  type ProjectRow,
} from 'components/composed/ProjectTable';
import SceneStage from 'components/composed/SceneStage';
import ScreenshotPlane from 'components/composed/ScreenshotPlane';
import Scrubber from 'components/composed/Scrubber';
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
    expect(PROJECT_TABLE_COLUMNS.featured).toHaveLength(4);
    expect(
      screen.getByRole('columnheader', { name: 'project' }),
    ).toBeVisible();
    expect(screen.getByText('10')).toBeVisible();
    expect(screen.getByText('00')).toBeVisible();
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
    expect(PROJECT_TABLE_COLUMNS.all).toHaveLength(6);
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
});

describe('Sheet', () => {
  it('is the right-hand card by default', () => {
    const { container } = render(
      <Sheet title="Ubiquiti">body</Sheet>,
    );
    expect(container.querySelector('aside')).toHaveAttribute(
      'data-placement',
      'right',
    );
    expect(
      screen.getByRole('heading', { name: 'Ubiquiti' }),
    ).toBeVisible();
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
    expect(container.querySelector('aside')).toHaveAttribute(
      'data-placement',
      'bottom',
    );
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
    expect(screen.getByText('NIKE')).toHaveAttribute(
      'data-live',
      'true',
    );
    await userEvent.click(screen.getByText('UBIQUITI'));
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
    });
    expect(container.querySelector('figcaption')).toBeNull();
  });

  it('takes a source, a caption and a hover tilt', () => {
    render(
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
    expect(screen.getByRole('img', { name: 'GoPro' })).toBeVisible();
  });
});
