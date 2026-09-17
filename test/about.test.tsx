import { useState } from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cameras, SCENE_MOVE_MS } from 'content/cameras';
import { historyStops } from 'content/history';
import AboutPage, {
  ABOUT_PATH,
  aboutStopPath,
  DEFAULT_STOP_INDEX,
  formatStopMeta,
  REDUCED_CROSSFADE_MS,
  SCRUBBER_POSITIONS,
  stopIndexFor,
  stopSlug,
  STOP_CROSSFADE_MS,
  toScrubberStops,
} from 'pagesComponents/about';
import { refinesCamera } from 'scene/camera';
import { HISTORY_POINTS } from 'scene/layers/sets';
import SceneRoot from 'scene/SceneRoot';
import {
  FG_REDUCED_MS,
  FG_STAGGER_MS,
  foregroundHandoffMs,
} from 'scene/enter';
import MapProvider, { useScene } from 'scene/MapProvider';
import { resetMapForTests } from 'scene/mapbox/instance';
import { FakeMap, installMapboxStub } from 'test/fake-mapbox';

/*
 * Artboards 1e (About / Ubiquiti selected / Desktop 1440x900) and 1h
 * (About / Sheet open / Mobile 390x844). What is asserted is the route's
 * contract rather than its pixels: which stop opens, where the sheet is
 * pinned, what the scrubber is told, and what selecting a stop does to the
 * URL and to the camera.
 */

/*
 * The mock carries `isReady` because the route now depends on it: with a
 * query string in the URL the real Next router starts NOT ready and fills
 * its copy of the query a task later. `true` is the steady state that every
 * test but the deep-link one is about.
 */
const router = vi.hoisted(() => ({
  isReady: true,
  query: undefined as Record<string, string> | undefined,
  push: vi.fn(),
  pathname: '/about',
}));

vi.mock('next/router', () => ({
  useRouter: () => router,
}));

/** The URL the browser is on, which the route reads before the router does. */
const visit = (url: string): void =>
  window.history.replaceState(null, '', url);

afterEach(() => {
  router.isReady = true;
  router.query = undefined;
  visit('/about');
  // Two tests here drive the real SceneRoot, and ensureMap caches its map
  // for the life of the module: without this the second one inherits the
  // first one's, and its recording.
  resetMapForTests();
  vi.clearAllMocks();
});

/** The sheet, found by the one attribute that names its shape. */
const sheet = (): HTMLElement =>
  document.body.querySelector(
    '[data-placement]',
  ) as unknown as HTMLElement;

describe('the about route, 1e and 1h', () => {
  it('opens on Ubiquiti, the stop both artboards draw', () => {
    render(<AboutPage stops={historyStops} />);

    expect(DEFAULT_STOP_INDEX).toBe(3);
    expect(screen.getByText('about')).toBeVisible();
    expect(
      screen.getByRole('heading', { name: 'Ubiquiti' }),
    ).toBeVisible();
    expect(screen.getByText('stop 04 / 06')).toBeVisible();
    expect(screen.getByText('Software Engineer')).toBeVisible();
    expect(
      screen.getByText('Portland OR · 2018 — 2020'),
    ).toBeVisible();
    expect(
      screen.getByText(historyStops[3].description),
    ).toBeVisible();
  });

  it('pins the sheet where 1e points it, tail toward the map', () => {
    render(<AboutPage stops={historyStops} />);

    expect(sheet()).toHaveAttribute('data-placement', 'right');
    expect(sheet().parentElement).toHaveClass(
      'top-[96px]',
      'desktop:right-[220px]',
    );
  });

  /*
   * The stop -- the role, the dates, the prose and the pager -- is what
   * this route is for, and it used to be rendered as a sibling of the
   * stage. SceneStage IS the <main>, so the landmark held the page word
   * and the scrubber and nothing else: "skip to main content" landed on
   * the h1 and stopped there.
   */
  it('keeps the stop inside the page’s main landmark', () => {
    const { container, rerender } = render(
      <AboutPage stops={historyStops} />,
    );

    const inMain = () => {
      const main = container.querySelector('main');
      expect(main).toContainElement(sheet());
      expect(main?.textContent).toContain(
        historyStops[DEFAULT_STOP_INDEX].description,
      );
      // Pinned to the viewport rather than to the stage's column, whose
      // own forwards enter animation would otherwise be the containing
      // block for anything positioned inside it.
      expect(sheet().parentElement).toHaveClass('fixed');
    };

    inMain();
    rerender(<AboutPage mobile stops={historyStops} />);
    inMain();
  });

  it('1h drops the sheet to the bottom edge, scrubber folded inside', () => {
    render(<AboutPage mobile stops={historyStops} />);

    expect(sheet()).toHaveAttribute('data-placement', 'bottom');
    expect(sheet().parentElement).toHaveClass(
      'inset-x-0',
      'bottom-0',
    );
    // Labelled by year, inside the sheet, and with no fit/prev/next row:
    // 1h has room for neither the company names nor the controls.
    expect(sheet()).toContainElement(
      screen.getByRole('button', { name: '2018' }),
    );
    expect(screen.queryByText('UBIQUITI')).toBeNull();
    expect(screen.queryByRole('button', { name: 'fit' })).toBeNull();
  });

  it('runs the scrubber 2015 to 2026 and reports a tick', async () => {
    const onSelectStop = vi.fn();
    render(
      <AboutPage onSelectStop={onSelectStop} stops={historyStops} />,
    );

    expect(screen.getByText('2015')).toBeVisible();
    expect(screen.getByText('2026')).toBeVisible();
    await userEvent.click(screen.getByText('NIKE'));
    expect(onSelectStop).toHaveBeenCalledWith(2);
  });

  it('gives the scrubber fit, prev and next, and wires them', async () => {
    const onFit = vi.fn();
    const onSelectStop = vi.fn();
    render(
      <AboutPage
        onFit={onFit}
        onSelectStop={onSelectStop}
        stops={historyStops}
      />,
    );

    await userEvent.click(
      screen.getByRole('button', { name: 'fit' }),
    );
    expect(onFit).toHaveBeenCalled();
    await userEvent.click(
      screen.getByRole('button', { name: 'prev' }),
    );
    expect(onSelectStop).toHaveBeenCalledWith(2);
    await userEvent.click(
      screen.getByRole('button', { name: 'next' }),
    );
    expect(onSelectStop).toHaveBeenCalledWith(4);
  });

  it('survives a control with nothing listening', async () => {
    render(<AboutPage stops={historyStops} />);
    await userEvent.click(
      screen.getByRole('button', { name: 'prev' }),
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'next' }),
    );
    expect(
      screen.getByRole('heading', { name: 'Ubiquiti' }),
    ).toBeVisible();
  });

  it('pages between stops as links, and has no end beyond the ends', () => {
    const { rerender } = render(
      <AboutPage selectedIndex={0} stops={historyStops} />,
    );

    expect(
      screen.getByRole('link', { name: /City of Tigard/ }),
    ).toHaveAttribute('href', '/about?stop=city-of-tigard');
    expect(
      screen.queryByRole('link', { name: /New York State Parks/ }),
    ).toBeNull();
    expect(screen.queryByRole('button', { name: 'prev' })).toBeNull();

    rerender(<AboutPage selectedIndex={5} stops={historyStops} />);
    expect(
      screen.getByRole('link', { name: /Freelancing/ }),
    ).toHaveAttribute('href', '/about?stop=freelancing');
    expect(screen.queryByRole('button', { name: 'next' })).toBeNull();
    expect(
      screen.getByText('Portland OR · 2020 — present'),
    ).toBeVisible();
  });

  it('crossfades the copy on a swap instead of re-entering the sheet', async () => {
    const Harness = () => {
      const [index, setIndex] = useState(DEFAULT_STOP_INDEX);
      return (
        <AboutPage
          onSelectStop={setIndex}
          selectedIndex={index}
          stops={historyStops}
        />
      );
    };
    render(<Harness />);

    // Arriving is the shared handoff and it belongs to the pinned wrapper,
    // which waits out 60% of the about move before its step. Swapping is
    // the sheet's own 160ms crossfade, important because tailwind-merge
    // cannot drop the class it overrides -- and with no wait in front of
    // it, because a swap is not an arrival.
    const pinned = sheet().parentElement;
    const before = sheet();
    expect(pinned?.style.animation).toBe(
      `clif-slidein var(--fg-enter) var(--fg-ease) ${
        foregroundHandoffMs('about') + FG_STAGGER_MS
      }ms both`,
    );
    expect(before.className).toContain(
      `animate-[clif-slidein_${STOP_CROSSFADE_MS}ms_linear_forwards]!`,
    );

    await userEvent.click(screen.getByText('NIKE'));
    expect(
      screen.getByRole('heading', { name: 'Nike' }),
    ).toBeVisible();
    // The sheet is a new element, so the crossfade runs; the wrapper that
    // carries the travel is the same one, so the sheet does not re-enter.
    expect(sheet()).not.toBe(before);
    expect(sheet().parentElement).toBe(pinned);
  });

  it('staggers 1e\u2019s three steps behind the camera, 40ms apart', () => {
    const { container } = render(<AboutPage stops={historyStops} />);
    const steps = [...container.querySelectorAll('[style]')]
      .map((el) => (el as HTMLElement).style.animation)
      .filter((animation) => animation.startsWith('clif-slidein'))
      .sort();

    // The word, the sheet and the scrubber -- 1e's three foreground steps,
    // each waiting out 60% of the move this route arrives on.
    expect(foregroundHandoffMs('about')).toBe(480);
    expect(steps).toEqual(
      [0, 1, 2]
        .map(
          (step) =>
            `clif-slidein var(--fg-enter) var(--fg-ease) ${
              foregroundHandoffMs('about') + step * FG_STAGGER_MS
            }ms both`,
        )
        .sort(),
    );
  });

  it('reduced motion is a 200ms crossfade, no travel and no wait', () => {
    render(<AboutPage reduced stops={historyStops} />);
    expect(sheet().className).toContain(
      `animate-[clif-slidein_${REDUCED_CROSSFADE_MS}ms_linear_forwards]!`,
    );
    const pinned = sheet().parentElement;
    expect(pinned?.style.animation).toBe(
      `clif-slidein ${FG_REDUCED_MS}ms linear both`,
    );
    expect(pinned?.style.getPropertyValue('--slide-in-from')).toBe(
      '0px',
    );
  });
});

describe('the about route as data', () => {
  it('places the scrubber stops where the artboards put them', () => {
    expect(SCRUBBER_POSITIONS).toEqual([0, 15, 25, 36, 46, 57]);
    expect(toScrubberStops(historyStops)[3]).toEqual({
      id: 4,
      label: 'UBIQUITI',
      at: 36,
    });
    expect(toScrubberStops(historyStops, 'year')[3].label).toBe(
      '2018',
    );
    // 1e's short forms, which are what keeps the first three labels from
    // overprinting each other at 11px.
    expect(
      toScrubberStops(historyStops).map((stop) => stop.label),
    ).toEqual([
      'NY STATE PARKS',
      'TIGARD',
      'NIKE',
      'UBIQUITI',
      'FREELANCING',
      'SALESFORCE',
    ]);
  });

  it('formats a stop, leaving the current one open-ended', () => {
    expect(formatStopMeta(historyStops[3])).toBe(
      'Portland OR · 2018 — 2020',
    );
    expect(formatStopMeta(historyStops[5])).toBe(
      'Portland OR · 2020 — present',
    );
  });

  it('names a stop in a URL, and finds it again', () => {
    expect(stopSlug(historyStops[0])).toBe('new-york-state-parks');
    expect(aboutStopPath(historyStops[3])).toBe(
      '/about?stop=ubiquiti',
    );
    expect(stopIndexFor(historyStops, 'ubiquiti')).toBe(3);
    expect(stopIndexFor(historyStops, ['ubiquiti'])).toBeNull();
    expect(stopIndexFor(historyStops, undefined)).toBeNull();
  });
});

describe('/about', () => {
  const Camera = () => {
    const { camera, view } = useScene();
    return (
      <>
        <span data-testid="camera">
          {camera === null ? 'none' : camera.center.join()}
        </span>
        <span data-testid="live">{view?.selectedStop ?? 'none'}</span>
      </>
    );
  };

  const renderPage = async () => {
    const about = await import('pages/about.page');
    render(
      <MapProvider>
        <about.default stops={historyStops} />
        <Camera />
      </MapProvider>,
    );
    return about;
  };

  const camera = (): string =>
    screen.getByTestId('camera').textContent ?? '';

  /** The stop the map draws live, which 1e says is the selected one. */
  const live = (): string =>
    screen.getByTestId('live').textContent ?? '';

  it('serves the six stops statically', async () => {
    const about = await renderPage();
    await expect(about.getStaticProps({})).resolves.toEqual({
      props: { stops: historyStops },
    });
    expect(
      screen.getByRole('heading', { name: 'Ubiquiti' }),
    ).toBeVisible();
  });

  it('bare /about is the fit view: 1e’s resting centre', async () => {
    await renderPage();
    expect(camera()).toBe(cameras.about.center.join());
  });

  /*
   * A DEEP LINK, IN THE TWO PHASES A BROWSER ACTUALLY DOES IT.
   *
   * This test used to set router.query before the first render, which is
   * the one thing a real deep link never does: the static HTML is built
   * with no query, and with a query string in the URL the client router
   * starts `isReady: false` and fills `query` a task later. Asserting the
   * steady state after that handover passed whether or not the route read
   * the URL any earlier than the router did -- which is exactly the bug it
   * was named for.
   *
   * So both phases are driven here, against the real SceneRoot and the
   * fake map, because the cost of getting this wrong is not a wrong
   * pixel: it is a second camera move. The scene only ever moves when the
   * camera it was handed changes, so "the sheet catches up later" and "the
   * globe flies to the fit view and then reframes" are the same fact, and
   * easeTo is where it is legible.
   */
  it('a deep link opens its stop on the first paint, for one camera move', async () => {
    const uninstall = installMapboxStub();
    visit('/about?stop=salesforce');
    // Phase 1: hydration. The URL has a query; the router has not read it.
    router.isReady = false;
    router.query = {};

    const about = await import('pages/about.page');
    const tree = () => (
      <MapProvider>
        <SceneRoot />
        <about.default stops={historyStops} />
        <Camera />
      </MapProvider>
    );

    let mounted: ReturnType<typeof render> | null = null;
    await act(async () => {
      mounted = render(tree());
    });

    expect(
      screen.getByRole('heading', { name: 'Salesforce' }),
    ).toBeVisible();
    expect(screen.getByText('stop 06 / 06')).toBeVisible();
    expect(camera()).toBe(historyStops[5].coordinates.join());
    // The globe's one live point is the linked stop, not the default one.
    expect(live()).toBe(String(historyStops[5].id));

    // One move, straight to the stop: no 800ms flight to the fit view
    // followed by a 600ms reframe off it.
    const moves = () => FakeMap.last.calls.easeTo;
    expect(moves()).toHaveLength(1);
    expect(moves()[0]).toMatchObject({
      center: historyStops[5].coordinates,
      duration: SCENE_MOVE_MS,
      zoom: cameras.about.zoom,
    });

    // Phase 2: the router catches up and takes the query over. It agrees
    // with the URL, so nothing about the scene changes.
    router.isReady = true;
    router.query = { stop: 'salesforce' };
    await act(async () => {
      mounted?.rerender(tree());
    });

    expect(moves()).toHaveLength(1);
    expect(camera()).toBe(historyStops[5].coordinates.join());
    // Only the centre moved, so the scene treats a later stop change as a
    // refinement of the about camera rather than ignoring it as stale.
    expect(
      refinesCamera(
        { ...cameras.about, center: historyStops[5].coordinates },
        cameras.about,
      ),
    ).toBe(true);

    uninstall();
  });

  /*
   * The trade the fix does NOT make. /about is getStaticProps, so one
   * document answers all six deep links and the server snapshot carries no
   * stop: a crawler and a no-JS reader get stop 04 whichever link they
   * followed. That is why the route's canonical drops the query -- the six
   * are one document, and are asked to be indexed as one.
   */
  it('serves one static document, whatever the query says', async () => {
    visit('/about?stop=salesforce');
    router.isReady = false;
    router.query = {};
    const about = await import('pages/about.page');

    const html = renderToStaticMarkup(
      <MapProvider>
        <about.default stops={historyStops} />
      </MapProvider>,
    );

    expect(html).toContain('stop 04 / 06');
    expect(html).not.toContain('stop 06 / 06');
  });

  it('a tick pushes the stop into the URL, shallow', async () => {
    await renderPage();
    await userEvent.click(screen.getByText('NIKE'));
    expect(router.push).toHaveBeenCalledWith(
      '/about?stop=nike',
      undefined,
      { shallow: true },
    );
  });

  it('fit clears the query again', async () => {
    await renderPage();
    await userEvent.click(
      screen.getByRole('button', { name: 'fit' }),
    );
    expect(router.push).toHaveBeenCalledWith(ABOUT_PATH, undefined, {
      shallow: true,
    });
  });

  /*
   * The whole point of the scene's selectedStop channel: the map's one
   * live element has to be the stop the sheet and the scrubber are
   * showing. Driven through the real SceneRoot against the fake map,
   * because the route's declaration is only half of it -- this is the
   * half that proves the declaration arrives.
   */
  it('hands the map the same stop the scrubber is showing', async () => {
    const uninstall = installMapboxStub();
    const about = await import('pages/about.page');
    // A fresh element each time: React bails out of a rerender handed the
    // very same one, and this test is about what a re-render does.
    const tree = () => (
      <MapProvider>
        <SceneRoot />
        <about.default stops={historyStops} />
      </MapProvider>
    );

    let mounted: ReturnType<typeof render> | null = null;
    await act(async () => {
      mounted = render(tree());
    });

    /** The id the points' colour expression is currently lighting. */
    const lit = (): string =>
      JSON.stringify(
        FakeMap.last.calls.paint
          .filter(
            ([layer, property]) =>
              layer === HISTORY_POINTS && property === 'circle-color',
          )
          .at(-1),
      );

    expect(lit()).toContain(`"id"],${historyStops[3].id}]`);

    router.query = { stop: 'nike' };
    await act(async () => {
      mounted?.rerender(tree());
    });
    expect(lit()).toContain(`"id"],${historyStops[2].id}]`);

    uninstall();
  });
});
