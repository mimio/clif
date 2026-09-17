import type { ReactNode } from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import type { GetStaticPropsContext } from 'next';
import { historyStops } from 'content/history';
import projectsById, { projectsList } from 'content/projects';
import AboutPage, {
  formatStopMeta,
  SCRUBBER_POSITIONS,
  toScrubberStops,
} from 'pagesComponents/about';
import HelloPage from 'pagesComponents/hello';
import NotFoundPage from 'pagesComponents/notFound';
import ProjectDetailPage, {
  richTextToString,
} from 'pagesComponents/projectDetail';
import ProjectsPage, {
  FEATURED_IDS,
  toRow,
} from 'pagesComponents/projects';
import MapProvider from 'scene/MapProvider';

const pathname = vi.hoisted(() => ({ current: '/' }));
const routerEvents = vi.hoisted(() => ({
  on: vi.fn(),
  off: vi.fn(),
}));

vi.mock('next/router', () => ({
  useRouter: () => ({
    pathname: pathname.current,
    events: routerEvents,
  }),
}));

vi.mock('next/script', () => ({
  default: ({ children }: { children?: ReactNode }) => (
    <span data-testid="script">{children}</span>
  ),
}));

beforeEach(() => {
  pathname.current = '/';
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

describe('route components', () => {
  it('hello is the word, the copy and two keycaps', () => {
    render(<HelloPage />);
    expect(screen.getByText('hello.')).toBeVisible();
    expect(
      screen.getByRole('link', { name: /projects/ }),
    ).toHaveAttribute('href', '/projects');
    expect(
      screen.getByRole('link', { name: /about/ }),
    ).toHaveAttribute('href', '/about');
  });

  it('404 is the UFO and one way home', () => {
    render(<NotFoundPage />);
    expect(screen.getByText('404')).toBeVisible();
    expect(
      screen.getByRole('link', { name: /take me home/ }),
    ).toHaveAttribute('href', '/');
  });

  it('projects shows six featured rows, and all fourteen on request', () => {
    const { rerender } = render(
      <ProjectsPage projects={projectsList} />,
    );
    expect(FEATURED_IDS).toHaveLength(6);
    expect(screen.getByText('06 of 14')).toBeVisible();
    rerender(<ProjectsPage all projects={projectsList} />);
    expect(screen.getByText('14 of 14')).toBeVisible();
  });

  it('projects reports the hovered row so the camera can nudge', async () => {
    const onHoverProject = vi.fn();
    render(
      <ProjectsPage
        onHoverProject={onHoverProject}
        projects={projectsList}
      />,
    );
    await userEvent.hover(
      screen.getByText('GoPro Mountain Games Event Map'),
    );
    expect(onHoverProject).toHaveBeenCalledWith('gopro');
  });

  it('projects rows carry the anchor city', () => {
    expect(toRow(projectsById.gopro, 10).city).toBe('Vail CO');
  });

  it('the detail route renders the prose, links and all', () => {
    render(<ProjectDetailPage project={projectsById.haikumi} />);
    expect(
      screen.getByRole('link', { name: 'Wieden + Kennedy' }),
    ).toHaveAttribute('href', 'https://www.wk.com/');
    expect(
      screen.getByRole('link', { name: /ascend to map/ }),
    ).toHaveAttribute('href', '/projects');
    expect(screen.getByText('Development')).toBeVisible();
  });

  it('flattens rich text for a plain-text consumer', () => {
    expect(richTextToString(projectsById.pricing.description)).toBe(
      'I worked with Heroku to construct a pricing comparison tool for Heroku products and plans.',
    );
    expect(
      richTextToString(projectsById.emote.description),
    ).toContain('\n\n');
    expect(
      richTextToString(projectsById.haikumi.description),
    ).toContain('Wieden + Kennedy team');
  });

  it('about opens on Ubiquiti and pages between stops', () => {
    render(<AboutPage stops={historyStops} />);
    expect(
      screen.getByRole('heading', { name: 'Ubiquiti' }),
    ).toBeVisible();
    expect(screen.getByText('stop 04 / 06')).toBeVisible();
    expect(screen.getByRole('link', { name: /Nike/ })).toBeVisible();
    expect(
      screen.getByRole('link', { name: /Freelancing/ }),
    ).toBeVisible();
  });

  it('about has no previous on the first stop or next on the last', () => {
    const { rerender } = render(
      <AboutPage selectedIndex={0} stops={historyStops} />,
    );
    expect(
      screen.queryByRole('link', { name: /New York State Parks/ }),
    ).toBeNull();
    rerender(<AboutPage selectedIndex={5} stops={historyStops} />);
    expect(
      screen.queryByRole('link', { name: /Salesforce/ }),
    ).toBeNull();
  });

  it('about reports scrubber selection', async () => {
    const onSelectStop = vi.fn();
    render(
      <AboutPage onSelectStop={onSelectStop} stops={historyStops} />,
    );
    await userEvent.click(screen.getByText('NIKE'));
    expect(onSelectStop).toHaveBeenCalledWith(2);
  });

  it('places the scrubber stops where the artboards put them', () => {
    expect(SCRUBBER_POSITIONS).toEqual([0, 15, 25, 36, 46, 57]);
    expect(toScrubberStops(historyStops)[3]).toEqual({
      id: 4,
      label: 'UBIQUITI',
      at: 36,
    });
  });

  it('formats a stop, leaving the current one open-ended', () => {
    expect(formatStopMeta(historyStops[3])).toBe(
      'Portland OR · 2018 — 2020',
    );
    expect(formatStopMeta(historyStops[5])).toBe(
      'Portland OR · 2020 — present',
    );
  });
});

describe('pages', () => {
  it('/ declares the hello camera', async () => {
    const { default: Hello } = await import('pages/index.page');
    render(
      <MapProvider>
        <Hello />
      </MapProvider>,
    );
    expect(screen.getByText('hello.')).toBeVisible();
  });

  it('/404 declares the furthest camera', async () => {
    const { default: NotFound } = await import('pages/404.page');
    render(
      <MapProvider>
        <NotFound />
      </MapProvider>,
    );
    expect(screen.getByText('404')).toBeVisible();
  });

  it('/about serves the six stops statically', async () => {
    const about = await import('pages/about.page');
    const result = await about.getStaticProps({});
    expect(result).toEqual({ props: { stops: historyStops } });
    render(
      <MapProvider>
        <about.default stops={historyStops} />
      </MapProvider>,
    );
    expect(
      screen.getByRole('heading', { name: 'Ubiquiti' }),
    ).toBeVisible();
  });

  it('/projects serves the fourteen statically', async () => {
    const projects = await import('pages/projects/index.page');
    const result = await projects.getStaticProps({});
    expect(result).toEqual({
      props: { projects: projectsList },
    });
    render(
      <MapProvider>
        <projects.default projects={projectsList} />
      </MapProvider>,
    );
    expect(screen.getByText('projects')).toBeVisible();
  });

  it('/projects/[projectId] keeps its static shape', async () => {
    const detail = await import('pages/projects/[projectId].page');
    const paths = await detail.getStaticPaths({});
    expect(paths).toEqual({
      paths: projectsList.map((project) => `/projects/${project.id}`),
      fallback: false,
    });
    await expect(
      detail.getStaticProps({
        params: { projectId: 'gopro' },
      } as GetStaticPropsContext<{ projectId: string }>),
    ).resolves.toEqual({ props: { projectId: 'gopro' } });
    await expect(
      detail.getStaticProps(
        {} as GetStaticPropsContext<{ projectId: string }>,
      ),
    ).resolves.toEqual({ notFound: true });

    render(
      <MapProvider>
        <detail.default projectId="gopro" />
      </MapProvider>,
    );
    expect(screen.getByText('gopro')).toBeVisible();
  });
});

describe('_app', () => {
  const Page = () => <p>page</p>;

  const renderApp = async () => {
    const { default: App } = await import('pages/_app.page');
    await act(async () => {
      render(
        <App
          Component={Page}
          pageProps={{}}
          router={
            {} as unknown as Parameters<typeof App>[0]['router']
          }
        />,
      );
    });
  };

  it('mounts the scene, the page and the chrome, in that order', async () => {
    vi.stubEnv('NEXT_PUBLIC_GA_MEASUREMENT_ID', '');
    vi.resetModules();
    await renderApp();

    expect(screen.getByTestId('scene-root')).toBeInTheDocument();
    expect(screen.getByText('page')).toBeVisible();
    expect(
      screen.getByRole('navigation', { name: 'Sections' }),
    ).toBeInTheDocument();
    expect(screen.queryByTestId('script')).toBeNull();
    expect(routerEvents.on).toHaveBeenCalledWith(
      'routeChangeComplete',
      expect.any(Function),
    );
  });

  it('loads GA only when a measurement id is configured', async () => {
    vi.stubEnv('NEXT_PUBLIC_GA_MEASUREMENT_ID', 'G-TEST');
    vi.resetModules();
    await renderApp();
    expect(screen.getAllByTestId('script')).toHaveLength(2);
  });
});
