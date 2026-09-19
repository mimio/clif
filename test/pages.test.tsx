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
import { cameras } from 'content/cameras';
import { historyStops } from 'content/history';
import projectsById, { projectsList } from 'content/projects';
import AboutPage, {
  aboutStopPath,
  formatStopMeta,
} from 'pagesComponents/about';
import HelloPage from 'pagesComponents/hello';
import NotFoundPage from 'pagesComponents/notFound';
import ProjectDetailPage, {
  richTextToString,
} from 'pagesComponents/projectDetail';
import ProjectsPage, { toRow } from 'pagesComponents/projects';
import MapProvider, { useScene } from 'scene/MapProvider';

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

/*
 * next/head hands its children to a head manager through context. Rendered
 * straight, React 19 hoists <title>, <meta> and <link> into document.head
 * itself, which is where the assertions below read them back.
 */
vi.mock('next/head', () => ({
  default: ({ children }: { children?: ReactNode }) => (
    <>{children}</>
  ),
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

  it('projects shows every project, with no state to open first', () => {
    render(<ProjectsPage projects={projectsList} />);
    expect(screen.getByText('all projects')).toBeVisible();
    expect(
      screen.getByText(String(projectsList.length)),
    ).toBeVisible();
    expect(screen.queryByRole('button')).toBeNull();
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
    expect(toRow(projectsById.gopro).city).toBe('Vail CO');
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

  it('about opens on Ubiquiti, loose on the page', () => {
    render(<AboutPage stops={historyStops} />);
    expect(screen.getByText('about me')).toBeVisible();
    expect(
      screen.getByRole('heading', { name: 'Ubiquiti' }),
    ).toBeVisible();
    expect(screen.getByText('Software Engineer')).toBeVisible();
    expect(
      screen.getByText(formatStopMeta(historyStops[3])),
    ).toBeVisible();
    expect(
      screen.getByText(historyStops[3].description),
    ).toBeVisible();
  });

  /*
   * The simplified board has no sheet and no scrubber, so the panel
   * chrome those carried goes with them. Asserted by absence rather than
   * left to be noticed: `stop 04 / 06` was the sheet's eyebrow and the
   * pager caps were its prev/next, and a route that still rendered either
   * would be the old board wearing the new camera.
   */
  it('about draws no sheet, no pager and no scrubber', () => {
    const { container } = render(<AboutPage stops={historyStops} />);
    expect(screen.queryByText('stop 04 / 06')).toBeNull();
    expect(container.querySelector('[data-placement]')).toBeNull();
    expect(container.querySelector('[data-sheet-pager]')).toBeNull();
  });

  /*
   * With the map as the only pointing control, these six links are the
   * route's whole keyboard surface -- see the `stopList` note in
   * pagesComponents/about.
   */
  it('about keeps every stop reachable as a link', () => {
    render(<AboutPage stops={historyStops} />);
    for (const stop of historyStops) {
      expect(
        screen.getByRole('link', { name: stop.company }),
      ).toHaveAttribute('href', aboutStopPath(stop));
    }
    expect(
      screen.getByRole('link', { name: 'Ubiquiti' }),
    ).toHaveAttribute('aria-current', 'true');
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
  /*
   * The camera the route declared, read back out of the provider.
   *
   * Three tests below were named for a camera and asserted a word:
   * '/ declares the hello camera' checked that "hello." was on the screen,
   * so deleting the useSceneCamera() line left it green -- and neither /
   * nor /projects had a camera assertion anywhere else in the suite. The
   * scene is the site, and this one call is a route's whole statement
   * about it.
   */
  const Camera = () => {
    const { camera } = useScene();
    return <span data-testid="camera">{JSON.stringify(camera)}</span>;
  };

  const declaredCamera = (): unknown =>
    JSON.parse(screen.getByTestId('camera').textContent ?? 'null');

  it('/ declares the hello camera', async () => {
    const { default: Hello } = await import('pages/index.page');
    render(
      <MapProvider>
        <Hello />
        <Camera />
      </MapProvider>,
    );
    expect(screen.getByText('hello.')).toBeVisible();
    expect(declaredCamera()).toEqual(cameras.hello);
  });

  it('/404 declares the furthest camera', async () => {
    const { default: NotFound } = await import('pages/404.page');
    render(
      <MapProvider>
        <NotFound />
        <Camera />
      </MapProvider>,
    );
    expect(screen.getByText('404')).toBeVisible();
    expect(declaredCamera()).toEqual(cameras.notFound);
    // The furthest the globe ever gets, which is the point of the route:
    // hello's framing, eight tenths of a zoom step back.
    expect(cameras.notFound.zoom).toBeCloseTo(
      cameras.hello.zoom - 0.8,
      12,
    );
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
        <Camera />
      </MapProvider>,
    );
    expect(screen.getByText('projects')).toBeVisible();
    expect(declaredCamera()).toEqual(cameras.projects);
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

/*
 * PAGE METADATA.
 *
 * Every route used to ship _app's `<title>hello</title>`: the index, about,
 * the 404 and all fourteen project pages, with one description between
 * them, no og:, no twitter: and no canonical. Two things rode on that and
 * only one of them is about sharing links.
 *
 * next/dist/client/route-announcer reads document.title and only falls
 * back to the <h1> when there is no title at all. One constant title means
 * every navigation sets the live region to the same string, React bails
 * out of the update, and a screen reader hears nothing after the first
 * route change -- on a site whose map never unmounts and which therefore
 * never reloads a page. So "each route has its own title" is an
 * accessibility assertion (WCAG 2.4.2) before it is an SEO one, and the
 * distinctness below is the part the announcer actually depends on.
 *
 * next/head is mocked to render its children, which lets React 19's own
 * metadata hoisting put them in document.head where they can be read back.
 * The real head manager does the same job through a context this test has
 * no reason to stand up.
 */
describe('page metadata', () => {
  const content = (selector: string): string | null =>
    document.head.querySelector(selector)?.getAttribute('content') ??
    null;

  const canonical = (): string | null =>
    document.head
      .querySelector('link[rel="canonical"]')
      ?.getAttribute('href') ?? null;

  const titleOf = (node: ReactNode): string => {
    const view = render(<MapProvider>{node}</MapProvider>);
    const { title } = document;
    view.unmount();
    return title;
  };

  it('titles every route in its own words, and no two the same', async () => {
    const [hello, projects, about, detail, notFound] =
      await Promise.all([
        import('pages/index.page'),
        import('pages/projects/index.page'),
        import('pages/about.page'),
        import('pages/projects/[projectId].page'),
        import('pages/404.page'),
      ]);

    const titles = [
      titleOf(<hello.default />),
      titleOf(<projects.default projects={projectsList} />),
      titleOf(<about.default stops={historyStops} />),
      titleOf(<detail.default projectId="gopro" />),
      titleOf(<notFound.default />),
    ];

    // Page words stay lowercase; a project keeps its own capitals.
    expect(titles).toEqual([
      'hello · Clifton Campbell',
      'projects · Clifton Campbell',
      'about me · Clifton Campbell',
      'GoPro Mountain Games Event Map · Clifton Campbell',
      '404 · Clifton Campbell',
    ]);
    expect(new Set(titles).size).toBe(titles.length);
  });

  it('gives a shared project link a card of its own', async () => {
    const detail = await import('pages/projects/[projectId].page');
    render(
      <MapProvider>
        <detail.default projectId="gopro" />
      </MapProvider>,
    );

    const title = 'GoPro Mountain Games Event Map · Clifton Campbell';
    expect(document.title).toBe(title);
    expect(content('meta[property="og:title"]')).toBe(title);
    expect(content('meta[property="og:site_name"]')).toBe(
      'Clifton Campbell',
    );
    expect(content('meta[property="og:url"]')).toBe(
      '/projects/gopro',
    );
    expect(canonical()).toBe('/projects/gopro');
    // The detail route already draws this screenshot; the card is it.
    expect(content('meta[property="og:image"]')).toBe('/gopro.webp');
    expect(content('meta[property="og:image:alt"]')).toBe(
      'GoPro Mountain Games Event Map',
    );
    expect(content('meta[name="twitter:card"]')).toBe(
      'summary_large_image',
    );

    const description = content('meta[name="description"]');
    expect(description).toContain('Event Map for 970 Design.');
    // The project's own prose, flattened to one line and cut to fit.
    expect(description).toContain('The Vail Valley Foundation');
    expect(description).not.toContain('\n');
    expect(description?.length).toBeLessThanOrEqual(160);
    expect(content('meta[property="og:description"]')).toBe(
      description,
    );
    expect(content('meta[name="twitter:description"]')).toBe(
      description,
    );
  });

  it('counts the projects rather than spelling them out', async () => {
    const projects = await import('pages/projects/index.page');
    render(
      <MapProvider>
        <projects.default projects={projectsList} />
      </MapProvider>,
    );
    expect(content('meta[name="description"]')).toBe(
      projects.projectsDescription(14),
    );
    expect(content('meta[name="description"]')).toContain(
      '14 projects',
    );
    expect(canonical()).toBe('/projects');
    // No stock card image, so no large card claiming one.
    expect(content('meta[name="twitter:card"]')).toBe('summary');
    expect(content('meta[property="og:image"]')).toBeNull();
  });

  it('canonicalises a deep-linked stop to /about itself', async () => {
    const about = await import('pages/about.page');
    render(
      <MapProvider>
        <about.default stops={historyStops} />
      </MapProvider>,
    );
    expect(canonical()).toBe('/about');
    expect(content('meta[name="description"]')).toBe(
      about.ABOUT_DESCRIPTION,
    );
    expect(about.ABOUT_DESCRIPTION).toContain('6 of them');
  });

  it('keeps the 404 out of the index', async () => {
    const { default: NotFound } = await import('pages/404.page');
    render(
      <MapProvider>
        <NotFound />
      </MapProvider>,
    );
    expect(content('meta[name="robots"]')).toBe('noindex');
    expect(canonical()).toBe('/404');
  });

  it('is relative until a deployment names its origin', async () => {
    const app = await import('pages/_app.page');
    expect(app.SITE_ORIGIN).toBe('');
    expect(app.siteUrl('/projects/gopro')).toBe('/projects/gopro');

    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://example.com/');
    vi.resetModules();
    const configured = await import('pages/_app.page');
    expect(configured.siteUrl('/projects/gopro')).toBe(
      'https://example.com/projects/gopro',
    );
    expect(configured.siteUrl('/')).toBe('https://example.com/');
  });

  it('flattens and clamps prose to the unfurl budget', async () => {
    const { metaDescription, META_DESCRIPTION_MAX } =
      await import('pages/_app.page');
    expect(metaDescription(' one\n\ntwo  three ')).toBe(
      'one two three',
    );
    const long = metaDescription('word '.repeat(60));
    expect(long).toHaveLength(META_DESCRIPTION_MAX);
    expect(long.endsWith('…')).toBe(true);
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
