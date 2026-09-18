import {
  act,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import MetaGrid from 'components/composed/MetaGrid';
import Pager, { PAGER_LABEL } from 'components/composed/Pager';
import ProjectTable, {
  cellValue,
  EM_DASH,
  isHoverPointer,
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
  TICK_TARGET,
  TICK_TARGET_PX,
} from 'components/composed/Scrubber';
import Sheet, {
  focusTarget,
  restoreFocus,
} from 'components/composed/Sheet';

/*
 * three.js, as a stand-in for a GL context.
 *
 * The WebGL SUCCESS path is the one a browser takes and the one no test
 * had ever run: jsdom's getContext returns nothing, three throws, and the
 * component falls straight through to its next/image fallback -- which is
 * why a shader canvas with no accessible name and a texture loader with no
 * error handler could both ship. The stub makes the success path reachable
 * and keeps the failure path one flag away, so both are asserted here.
 *
 * `renderer: 'throws'` is the default because it is jsdom's own answer, and
 * the tests written against that answer should go on describing it.
 */
const three = vi.hoisted(() => ({
  renderer: 'throws' as 'throws' | 'works',
  /** Every texture load's onError, waiting to be called. */
  failures: [] as (() => void)[],
  /** How many times the renderer was asked to draw a frame. */
  frames: 0,
}));

vi.mock('three', () => {
  const noop = (): void => {};

  class Texture {
    minFilter = 0;

    dispose = noop;
  }

  class TextureLoader {
    load(
      src: string,
      onLoad?: () => void,
      onProgress?: () => void,
      onError?: (error: unknown) => void,
    ) {
      three.failures.push(() => {
        onError?.(new Error(`could not load ${src}`));
      });
      return new Texture();
    }
  }

  class WebGLRenderer {
    domElement = document.createElement('canvas');

    constructor() {
      if (three.renderer === 'throws') {
        throw new Error('no WebGL context');
      }
    }

    setSize = noop;

    setClearColor = noop;

    setPixelRatio = noop;

    dispose = noop;

    render = () => {
      three.frames += 1;
    };
  }

  return {
    Clock: class {
      getElapsedTime = () => 0;
    },
    LinearFilter: 1006,
    Mesh: class {
      scale = { set: noop };
    },
    PerspectiveCamera: class {
      position = { z: 0 };

      aspect = 1;

      updateProjectionMatrix = noop;
    },
    PlaneGeometry: class {
      dispose = noop;
    },
    Scene: class {
      add = noop;
    },
    ShaderMaterial: class {
      uniforms: Record<string, { value: unknown }> = {
        uTime: { value: 0 },
        uTexture: { value: null },
      };

      dispose = noop;
    },
    Texture,
    TextureLoader,
    WebGLRenderer,
  };
});

/** jsdom implements no CSS, so a media query has to be answered by hand. */
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

const REDUCED = '(prefers-reduced-motion: reduce)';

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

  /*
   * THE HOVER CHANNEL, AND THE TWO WAYS IT USED TO BE WRONG.
   *
   * It latched on touch: the site's `hover` variant is bare `:hover` with
   * no `(hover: hover)` guard, and pointerenter fires on a tap while the
   * matching leave frequently never arrives -- so a tapped row kept the
   * wash, the slide, the lit city point and the 8% camera nudge until the
   * next tap somewhere else, and the wash is the same accent-07 that marks
   * the SELECTED row. And it was withheld from the keyboard entirely: the
   * row had no onFocus or onBlur, so tabbing through the table lit nothing
   * and moved nothing.
   */
  it('ignores a hover a finger could not have meant', () => {
    const onHoverRow = vi.fn();
    render(<ProjectTable onHoverRow={onHoverRow} rows={rows} />);
    const row = screen.getByText('Haikumi').closest('tr')!;

    fireEvent.pointerEnter(row, { pointerType: 'touch' });
    expect(onHoverRow).not.toHaveBeenCalled();
    fireEvent.pointerLeave(row, { pointerType: 'touch' });
    expect(onHoverRow).not.toHaveBeenCalled();

    // ...and a mouse still gets both halves.
    fireEvent.pointerEnter(row, { pointerType: 'mouse' });
    expect(onHoverRow).toHaveBeenCalledWith('haikumi');
    fireEvent.pointerLeave(row, { pointerType: 'mouse' });
    expect(onHoverRow).toHaveBeenLastCalledWith(null);

    expect(isHoverPointer('mouse')).toBe(true);
    expect(isHoverPointer('pen')).toBe(false);
  });

  it('survives a touch with no handler bound', () => {
    render(<ProjectTable rows={rows} />);
    const row = screen.getByText('Haikumi').closest('tr')!;
    fireEvent.pointerEnter(row, { pointerType: 'touch' });
    expect(row).toHaveAttribute('data-active', 'false');
  });

  it('gives the keyboard the same channel the mouse has', async () => {
    const onHoverRow = vi.fn();
    render(<ProjectTable onHoverRow={onHoverRow} rows={rows} />);
    const link = screen.getByRole('link');

    await userEvent.tab();
    expect(link).toHaveFocus();
    expect(onHoverRow).toHaveBeenCalledWith('gopro');

    await userEvent.tab();
    expect(link).not.toHaveFocus();
    expect(onHoverRow).toHaveBeenLastCalledWith(null);
  });

  it('paints the wash for focus, and only for a fine pointer on hover', () => {
    render(<ProjectTable rows={rows} />);
    const row = screen.getByText('Haikumi').closest('tr')!;
    row.className
      .split(' ')
      .filter((name) => name.includes('hover:'))
      .forEach((name) =>
        expect(name.startsWith('pointer-fine:hover:')).toBe(true),
      );
    expect(row).toHaveClass('focus-within:bg-accent-07');
    expect(row).toHaveClass('focus-within:translate-x-[3px]');
  });

  it('folds the client under the title without repeating the year', () => {
    render(<ProjectTable rows={rows} />);
    // The mobile grid keeps three columns -- ##, project, year -- so the
    // fold under the title carries the client alone. It used to carry the
    // year as well, and below 650px the year was on screen twice.
    const fold = screen
      .getByText('GoPro Mountain Games Event Map')
      .closest('td')!
      .querySelector('.tablet\\:hidden')!;
    expect(fold).toHaveTextContent('970 Design');
    expect(fold.textContent).not.toContain('2017');
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
    /*
     * The count is a custom property rather than a gridTemplateColumns
     * declaration because the template itself is now a `tablet:` utility:
     * below the breakpoint the list stacks, and an inline style would beat
     * the media query and put three 73px tracks back at 320.
     */
    const grid = container.querySelector('dl');
    expect(grid).toHaveStyle({ '--meta-columns': '3' });
    expect(grid).toHaveClass('grid-cols-1');
    rerender(
      <MetaGrid
        className="x"
        columns={2}
        items={[{ label: 'year', value: 2017 }]}
      />,
    );
    expect(container.querySelector('dl')).toHaveStyle({
      '--meta-columns': '2',
    });
  });

  it('lets a cell shrink and an unbroken value break', () => {
    const { container } = render(
      <MetaGrid
        items={[{ label: 'client', value: 'Wieden+Kennedy' }]}
      />,
    );
    // The grid item has to be allowed under its own content width, and the
    // value has to be breakable, or a track stops honouring minmax(0,1fr).
    expect(container.querySelector('dl > div')).toHaveClass(
      'min-w-0',
    );
    expect(screen.getByText('Wieden+Kennedy')).toHaveClass(
      '[overflow-wrap:anywhere]',
    );
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

afterEach(() => {
  three.renderer = 'throws';
  three.failures.length = 0;
  three.frames = 0;
  vi.stubGlobal('matchMedia', matchMediaFor('nothing matches'));
});

/*
 * A2 / A3 / A9, all three of which live on the path a browser takes and
 * none of which the jsdom fallback can stand in for.
 */
describe('the screenshot plane, with a GL context', () => {
  let warn: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    three.renderer = 'works';
    warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warn.mockRestore();
  });

  const canvas = (container: HTMLElement): HTMLCanvasElement | null =>
    container.querySelector('canvas');

  it('names the canvas, because on this path the canvas IS the image', () => {
    const { container } = render(
      <ScreenshotPlane
        alt="GoPro Mountain Games Event Map"
        caption="event map sheet"
        src="/gopro.webp"
      />,
    );

    // The shader path renders a bare <div> and lets three.js append the
    // canvas into it, so `alt` had nowhere to land: the figure's entire
    // text content was the caption, and the capture itself was not there.
    expect(container.querySelector('img')).toBeNull();
    expect(
      screen.getByRole('img', {
        name: 'GoPro Mountain Games Event Map',
      }),
    ).toBe(canvas(container));
  });

  it('keeps the name on the canvas across a project swap', () => {
    // The plane must not remount between /projects and a detail, so the
    // name has to follow the prop rather than the mount.
    const { container, rerender } = render(
      <ScreenshotPlane alt="GoPro" src="/gopro.webp" />,
    );
    const first = canvas(container);
    rerender(<ScreenshotPlane alt="Haikumi" src="/haikumi.webp" />);

    expect(canvas(container)).toBe(first);
    expect(first).toHaveAttribute('aria-label', 'Haikumi');
  });

  it('hides a canvas with no alt rather than naming it nothing', () => {
    // alt="" is next/image's decorative case, and it is this one too: a
    // role="img" with an empty name is worse than no role at all.
    const { container } = render(
      <ScreenshotPlane src="/gopro.webp" />,
    );

    expect(canvas(container)).toHaveAttribute('aria-hidden', 'true');
    expect(canvas(container)).not.toHaveAttribute('role');
    expect(screen.queryByRole('img')).toBeNull();
  });

  it('degrades to the plain image when the texture never loads', () => {
    const { container } = render(
      <ScreenshotPlane alt="GoPro" src="/missing.webp" />,
    );
    expect(canvas(container)).not.toBeNull();

    // TextureLoader neither throws nor rejects: its fourth argument is the
    // only report a 404 or a decode failure ever makes. Before it was
    // wired up the shader went on drawing an empty texture for ever.
    expect(three.failures).toHaveLength(1);
    act(() => {
      three.failures[0]();
    });

    expect(canvas(container)).toBeNull();
    expect(screen.getByRole('img', { name: 'GoPro' }).tagName).toBe(
      'IMG',
    );
    expect(warn).toHaveBeenCalled();
  });

  it('waves on its own frame loop, and does not under reduced motion', () => {
    const raf = vi.spyOn(window, 'requestAnimationFrame');
    const { unmount } = render(
      <ScreenshotPlane alt="GoPro" src="/gopro.webp" />,
    );
    expect(raf).toHaveBeenCalled();
    unmount();

    raf.mockClear();
    three.frames = 0;
    vi.stubGlobal('matchMedia', matchMediaFor(REDUCED));
    render(<ScreenshotPlane alt="GoPro" src="/gopro.webp" />);

    // The globe is deliberately frozen under reduced motion; an
    // indefinite wave beside a still scene is the one thing this must not
    // be. The capture is still drawn -- once.
    expect(raf).not.toHaveBeenCalled();
    expect(three.frames).toBeGreaterThan(0);
    raf.mockRestore();
  });
});

describe('a scrubber tick is a control, at every width', () => {
  const stops = [
    { id: 1, label: 'NIKE', at: 25 },
    { id: 2, label: 'UBIQUITI', at: 36 },
  ];

  it('carries its name as an attribute, which a breakpoint cannot hide', () => {
    render(<Scrubber stops={stops} />);
    const tick = screen.getByRole('button', { name: 'UBIQUITI' });
    const label = screen.getByText('UBIQUITI');

    // jsdom applies no CSS, so this cannot be proved by measuring: under
    // 650px that label is display:none, and display:none content is
    // excluded from the accessible name. The proof is that the name is on
    // the control rather than only inside it.
    expect(label.className).toMatch(/max-tablet:hidden/);
    expect(tick).toHaveAttribute('aria-label', 'UBIQUITI');
    expect(tick.getAttribute('aria-label')).toBe(label.textContent);
  });

  it('gives the 1px stem a target WCAG 2.5.8 would accept', () => {
    render(<Scrubber stops={stops} />);
    const stem = screen
      .getByRole('button', { name: 'UBIQUITI' })
      .querySelector('span > span');

    expect(TICK_TARGET_PX).toBeGreaterThanOrEqual(24);
    // Tailwind's spacing scale is 0.25rem, so 6 is TICK_TARGET_PX.
    expect(TICK_TARGET).toContain(
      `before:h-${TICK_TARGET_PX / 4} before:w-${TICK_TARGET_PX / 4}`,
    );
    for (const className of TICK_TARGET.split(' ')) {
      expect(stem).toHaveClass(className);
    }
  });

  it('stops the live pulse for a visitor who asked it to', () => {
    render(<Scrubber stops={stops} />);
    const live = screen.getByRole('button', { name: 'NIKE' });

    // A 1.6s opacity pulse that never ends and cannot be paused is WCAG
    // 2.2.2; reduced motion is the pause.
    expect(live.querySelector('span')).toHaveClass(
      'animate-live-pulse',
      'motion-reduce:animate-none',
    );
    expect(live).toHaveClass(
      'animate-slide-in',
      'motion-reduce:animate-none',
    );
  });
});

describe('the sheet keeps the keyboard', () => {
  const caps = (from: string, to: string) => (
    <Pager
      next={{ href: `/about?stop=${to}`, label: to }}
      prev={{ href: `/about?stop=${from}`, label: from }}
    />
  );

  it('is a named landmark', () => {
    const { container } = render(
      <Sheet pager={caps('tigard', 'nike')} title="Ubiquiti">
        body
      </Sheet>,
    );
    expect(container.querySelector('aside')).toHaveAttribute(
      'aria-label',
      'Ubiquiti',
    );
    expect(
      screen.getByRole('navigation', { name: PAGER_LABEL }),
    ).toBeVisible();
  });

  it('hands focus on when the route swaps the stop under it', () => {
    // The about route keys this on the stop to buy the 160ms crossfade,
    // which deletes the cap the visitor just activated. Focus would fall
    // to document.body -- silently, next to a silent route announcer.
    const { rerender } = render(
      <Sheet key="ubiquiti" pager={caps('tigard', 'nike')} title="U">
        body
      </Sheet>,
    );
    screen.getByRole('link', { name: /nike/ }).focus();

    rerender(
      <Sheet key="nike" pager={caps('ubiquiti', 'harvard')} title="N">
        body
      </Sheet>,
    );

    expect(document.activeElement).not.toBe(document.body);
    expect(
      screen.getByRole('link', { name: /harvard/ }),
    ).toHaveFocus();
  });

  it('lands on the one cap a stop at the end of the line has', () => {
    const { rerender } = render(
      <Sheet key="nike" pager={caps('ubiquiti', 'harvard')} title="N">
        body
      </Sheet>,
    );
    screen.getByRole('link', { name: /harvard/ }).focus();

    rerender(
      <Sheet
        key="harvard"
        pager={
          <Pager prev={{ href: '/about?stop=nike', label: 'nike' }} />
        }
        title="H"
      >
        body
      </Sheet>,
    );

    expect(screen.getByRole('link', { name: /nike/ })).toHaveFocus();
  });

  it('falls back to the sheet itself, which is named and focusable', () => {
    const { container, rerender } = render(
      <Sheet key="ubiquiti" pager={caps('tigard', 'nike')} title="U">
        body
      </Sheet>,
    );
    screen.getByRole('link', { name: /tigard/ }).focus();

    rerender(
      <Sheet key="nike" title="Nike">
        body
      </Sheet>,
    );

    const aside = container.querySelector('aside');
    expect(aside).toHaveAttribute('tabindex', '-1');
    expect(aside).toHaveFocus();
  });

  it('leaves focus alone when the sheet was not holding it', () => {
    const outside = (
      <button data-testid="outside" type="button">
        elsewhere
      </button>
    );
    const { rerender } = render(
      <div>
        {outside}
        <Sheet
          key="ubiquiti"
          pager={caps('tigard', 'nike')}
          title="U"
        >
          body
        </Sheet>
      </div>,
    );
    const button = screen.getByTestId('outside');
    button.focus();

    rerender(
      <div>
        {outside}
        <Sheet
          key="nike"
          pager={caps('ubiquiti', 'harvard')}
          title="N"
        >
          body
        </Sheet>
      </div>,
    );

    expect(button).toHaveFocus();
  });

  it('does not hand focus to a sheet that mounts later', async () => {
    const { unmount } = render(
      <Sheet pager={caps('tigard', 'nike')} title="U">
        body
      </Sheet>,
    );
    screen.getByRole('link', { name: /nike/ }).focus();
    unmount();

    // The note expires at the end of the commit that wrote it. A sheet
    // arriving on some later route must not inherit a focus move from a
    // stop the visitor left behind.
    await act(async () => {
      await Promise.resolve();
    });
    render(
      <Sheet pager={caps('tigard', 'nike')} title="Later">
        body
      </Sheet>,
    );
    expect(document.body).toHaveFocus();
  });

  it('will not take focus that is already somewhere', () => {
    const { container } = render(
      <Sheet pager={caps('tigard', 'nike')} title="U">
        body
      </Sheet>,
    );
    const root = container.querySelector('aside') as HTMLElement;
    const held = screen.getByRole('link', { name: /tigard/ });
    held.focus();

    restoreFocus(root, true);
    expect(held).toHaveFocus();
  });

  it('knows both ends of a pager, and that a sheet may have none', () => {
    const { container } = render(
      <Sheet pager={caps('tigard', 'nike')} title="U">
        body
      </Sheet>,
    );
    const root = container.querySelector('aside') as HTMLElement;
    expect(focusTarget(root, true)).toBe(
      screen.getByRole('link', { name: /nike/ }),
    );
    expect(focusTarget(root, false)).toBe(
      screen.getByRole('link', { name: /tigard/ }),
    );

    const bare = render(<Sheet title="Bare">body</Sheet>);
    const alone = bare.container.querySelector(
      'aside',
    ) as HTMLElement;
    expect(focusTarget(alone, true)).toBe(alone);
  });
});

describe('reduced motion reaches components/composed', () => {
  it('guards every entry animation this lane owns', () => {
    const { container: stage } = render(
      <SceneStage>body</SceneStage>,
    );
    expect(
      stage.querySelector('.animate-slide-in')?.className,
    ).toMatch(/motion-reduce:animate-none/);

    const { container: sheet } = render(
      <Sheet title="Ubiquiti">body</Sheet>,
    );
    expect(sheet.querySelector('aside')?.className).toMatch(
      /motion-reduce:animate-none/,
    );
  });
});
