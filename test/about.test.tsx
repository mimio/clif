import { useState } from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cameras, SCENE_MOVE_MS } from 'content/cameras';
import { historyStops } from 'content/history';
import AboutPage, {
  ABOUT_WORD,
  aboutStopPath,
  DEFAULT_STOP_INDEX,
  formatStopMeta,
  REDUCED_CROSSFADE_MS,
  stopIndexFor,
  stopSlug,
  STOP_CROSSFADE_MS,
} from 'pagesComponents/about';
import { HISTORY_LABELS, HISTORY_POINTS } from 'scene/layers/sets';
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
 * Artboard 1e, SIMPLIFIED: the word, four lines of copy loose under it,
 * and a map you can drag. What the route used to be -- a 380px sheet
 * pinned right, a scrubber along the bottom, and a camera that reframed
 * to the selected stop -- is gone, and most of what is asserted here is
 * asserted because of that: the panel chrome is absent, the map is
 * reachable, the camera holds still, and a click on a stop is what moves
 * the copy.
 *
 * What is checked is the route's contract rather than its pixels: which
 * stop opens, where the two boxes are pinned, what the scene is told, and
 * what clicking the map does to the URL.
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
  // Several tests here drive the real SceneRoot, and ensureMap caches its
  // map for the life of the module: without this the second one inherits
  // the first one's, and its recording.
  resetMapForTests();
  vi.clearAllMocks();
});

describe('the about route, 1e simplified', () => {
  it('opens on Ubiquiti, loose on the page', () => {
    render(<AboutPage stops={historyStops} />);

    expect(DEFAULT_STOP_INDEX).toBe(3);
    expect(screen.getByText(ABOUT_WORD)).toBeVisible();
    expect(ABOUT_WORD).toBe('about me');
    expect(
      screen.getByRole('heading', { name: 'Ubiquiti' }),
    ).toBeVisible();
    expect(screen.getByText('Software Engineer')).toBeVisible();
    expect(
      screen.getByText('Portland OR · 2018 — 2020'),
    ).toBeVisible();
    expect(
      screen.getByText(historyStops[3].description),
    ).toBeVisible();
  });

  /*
   * The three things the simplification removed, asserted by absence.
   * Each was load-bearing on the old board -- `stop 04 / 06` was the
   * sheet's eyebrow, `[data-placement]` is the sheet itself, and the
   * scrubber carried the year rail and the fit/prev/next row -- so a
   * route that still rendered any of them would be the old board wearing
   * the new camera, which is exactly the failure a screenshot would miss.
   */
  it('draws no sheet, no scrubber and no pager', () => {
    const { container } = render(<AboutPage stops={historyStops} />);

    expect(container.querySelector('[data-placement]')).toBeNull();
    expect(container.querySelector('[data-sheet-pager]')).toBeNull();
    expect(screen.queryByText('stop 04 / 06')).toBeNull();
    expect(screen.queryByText('2015')).toBeNull();
    expect(screen.queryByText('UBIQUITI')).toBeNull();
    expect(screen.queryByRole('button', { name: 'fit' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'prev' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'next' })).toBeNull();
  });

  /*
   * The copy is the primary content of this route and not an aside to it,
   * so it has to be inside <main> -- and SceneStage IS the <main>. The
   * old board learned this the hard way: the stop used to be a sibling of
   * the stage, which left the landmark holding the page word and nothing
   * else, so "skip to main content" landed on the h1 and stopped.
   */
  it('keeps the stop inside the page’s main landmark', () => {
    const { container } = render(<AboutPage stops={historyStops} />);
    const main = container.querySelector('main');

    expect(main?.textContent).toContain(
      historyStops[DEFAULT_STOP_INDEX].description,
    );
    expect(main).toContainElement(
      screen.getByRole('heading', { name: 'Ubiquiti' }),
    );
    expect(main).toContainElement(screen.getByText(ABOUT_WORD));
  });

  /*
   * 1e's two absolute boxes: the word at top 64 and the copy at top 160,
   * 520 wide, both on the stage's own left inset. They are two boxes and
   * not a column because the gap between them is a number the artboard
   * states rather than one that falls out of the word's cap height.
   */
  it('pins the word and the copy where 1e draws them', () => {
    const { container } = render(<AboutPage stops={historyStops} />);

    const word = screen.getByText(ABOUT_WORD).parentElement;
    expect(word).toHaveClass(
      'absolute',
      'top-[52px]',
      'tablet:top-[64px]',
    );

    const copy = container.querySelector('.max-w-\\[520px\\]');
    expect(copy).toHaveClass(
      'absolute',
      'top-[112px]',
      'tablet:top-[160px]',
      'w-fit',
    );
  });

  /*
   * THE CHANGE THIS ROUTE IS FOR. The map was never un-interactive --
   * cameras.about has said `interactive: true` all along -- it was
   * covered by a foreground that took every press. The stage stops
   * intercepting, and the copy block re-arms itself so prose can still be
   * selected and a link inside a description can still be followed.
   */
  it('lets the pointer through to the map, except over the copy', () => {
    const { container } = render(<AboutPage stops={historyStops} />);

    const main = container.querySelector('main');
    expect(main).toHaveAttribute('data-through', 'true');
    expect(main).toHaveClass('pointer-events-none');
    expect(main?.querySelector('.clif-stage-column')).toHaveClass(
      'pointer-events-none',
    );
    expect(container.querySelector('.max-w-\\[520px\\]')).toHaveClass(
      'pointer-events-auto',
    );
  });

  /*
   * With the scrubber and the pager gone the map is the only pointing
   * control, and a map click is not something a keyboard can perform --
   * nor a screen reader, since scene/SceneRoot's container is aria-hidden.
   * These six links are what keeps the route operable without a mouse.
   */
  it('keeps every stop reachable as a link, current one marked', () => {
    render(<AboutPage stops={historyStops} />);

    for (const stop of historyStops) {
      expect(
        screen.getByRole('link', { name: stop.company }),
      ).toHaveAttribute('href', aboutStopPath(stop));
    }
    expect(
      screen.getByRole('link', { name: 'Ubiquiti' }),
    ).toHaveAttribute('aria-current', 'true');
    expect(
      screen.getByRole('link', { name: 'Nike' }),
    ).not.toHaveAttribute('aria-current');
    expect(
      screen.getByRole('navigation', { name: 'Work history' }),
    ).toHaveClass('sr-only');
  });

  it('crossfades the copy on a swap instead of re-entering the box', async () => {
    const Harness = () => {
      const [index, setIndex] = useState(DEFAULT_STOP_INDEX);
      return (
        <>
          <button onClick={() => setIndex(2)} type="button">
            to nike
          </button>
          <AboutPage selectedIndex={index} stops={historyStops} />
        </>
      );
    };
    const { container } = render(<Harness />);

    /*
     * Arriving is the shared handoff and it belongs to the pinned box,
     * which waits out 60% of the about move before its step. Swapping is
     * the copy's own 160ms crossfade, with no wait in front of it because
     * a swap is not an arrival. The `!` matters: tailwind-merge knows
     * Tailwind's own animation names and no others, so without it which
     * animation won would come down to stylesheet order.
     */
    const pinned = container.querySelector('.max-w-\\[520px\\]');
    const before = pinned?.firstElementChild;
    expect((pinned as HTMLElement).style.animation).toBe(
      `clif-slidein var(--fg-enter) var(--fg-ease) ${
        foregroundHandoffMs('about') + FG_STAGGER_MS
      }ms both`,
    );
    expect(before?.className).toContain(
      `animate-[clif-slidein_${STOP_CROSSFADE_MS}ms_linear_forwards]!`,
    );

    await userEvent.click(
      screen.getByRole('button', { name: 'to nike' }),
    );

    expect(
      screen.getByRole('heading', { name: 'Nike' }),
    ).toBeVisible();
    // Keyed on the stop, so the copy is a new element and the crossfade
    // runs; the box around it is the same one, so it does not re-enter.
    expect(pinned?.firstElementChild).not.toBe(before);
    expect(container.querySelector('.max-w-\\[520px\\]')).toBe(
      pinned,
    );
  });

  it('staggers 1e’s two steps behind the camera, 40ms apart', () => {
    const { container } = render(<AboutPage stops={historyStops} />);
    const steps = [...container.querySelectorAll('[style]')]
      .map((el) => (el as HTMLElement).style.animation)
      .filter((animation) => animation.startsWith('clif-slidein'))
      .sort();

    // The word and the copy. Two, not the old board's three: the
    // scrubber was the third and there is no scrubber.
    expect(foregroundHandoffMs('about')).toBe(480);
    expect(steps).toEqual(
      [0, 1]
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
    const { container } = render(
      <AboutPage reduced stops={historyStops} />,
    );

    const pinned = container.querySelector(
      '.max-w-\\[520px\\]',
    ) as HTMLElement;
    expect(pinned.firstElementChild?.className).toContain(
      `animate-[clif-slidein_${REDUCED_CROSSFADE_MS}ms_linear_forwards]!`,
    );
    expect(pinned.style.animation).toBe(
      `clif-slidein ${FG_REDUCED_MS}ms linear both`,
    );
    expect(pinned.style.getPropertyValue('--slide-in-from')).toBe(
      '0px',
    );
  });
});

describe('the about route as data', () => {
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

  it('rests on 1e’s centre, whatever stop is showing', async () => {
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
   * What it costs has changed with the camera. It used to be a second
   * camera move: the route refined cameras.about to the stop's own
   * coordinate, so reading the query late meant a flight to the fit view
   * and then a reframe off it. The camera is constant now, so the cost is
   * the copy and the map's one lit point -- smaller, and still the
   * difference between arriving on the stop you asked for and arriving on
   * stop 04. Both are asserted, and so is the ONE move, because a
   * constant camera is only worth stating if the scene actually issues it
   * once.
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
    expect(camera()).toBe(cameras.about.center.join());
    // The globe's one live point is the linked stop, not the default one.
    expect(live()).toBe(String(historyStops[5].id));

    const moves = () => FakeMap.last.calls.easeTo;
    expect(moves()).toHaveLength(1);
    expect(moves()[0]).toMatchObject({
      center: cameras.about.center,
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
    expect(camera()).toBe(cameras.about.center.join());

    uninstall();
  });

  /*
   * The trade the fix does NOT make. /about is getStaticProps, so one
   * document answers all six deep links and the server snapshot carries no
   * stop: a crawler and a no-JS reader get stop 04 whichever link they
   * followed. That is why the route's canonical drops the query -- the six
   * are one document, and are asked to be indexed as one. The six links
   * are in that document either way, which is what stops the other five
   * stops being invisible to a crawler entirely.
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

    expect(html).toContain(historyStops[3].description);
    expect(html).not.toContain(historyStops[5].description);
    for (const stop of historyStops) {
      expect(html).toContain(aboutStopPath(stop));
    }
  });

  /*
   * THE MAP IS THE CONTROL, end to end: the layer set binds the click,
   * scene/MapProvider carries it up as a request, and the route turns it
   * into a shallow push. Driven through the real SceneRoot against the
   * fake map, because the binding is the half a component test cannot
   * see -- the old board's equivalent test clicked a scrubber tick, and a
   * tick is a DOM node.
   */
  it('a click on a stop pushes it into the URL, shallow', async () => {
    const uninstall = installMapboxStub();
    const about = await import('pages/about.page');
    const tree = () => (
      <MapProvider>
        <SceneRoot />
        <about.default stops={historyStops} />
      </MapProvider>
    );

    await act(async () => {
      render(tree());
    });

    /*
     * Both the point and its label are bound: the circle is a small
     * target and the company name beside it reads as the same thing.
     *
     * By prefix, because what the registry actually binds is its own
     * stable forwarder -- it re-points that at the newest handler on
     * every sync, which is what lets a handler close over route state --
     * so the third field is the forwarder's source, not ours.
     */
    const boundTo = (layer: string): boolean =>
      FakeMap.last.handlers.some((entry) =>
        entry.startsWith(`click|${layer}|`),
      );
    expect(boundTo(HISTORY_POINTS)).toBe(true);
    expect(boundTo(HISTORY_LABELS)).toBe(true);

    await act(async () => {
      FakeMap.last.fire('click', {
        features: [{ properties: { id: historyStops[2].id } }],
      });
    });

    expect(router.push).toHaveBeenCalledWith(
      '/about?stop=nike',
      undefined,
      { shallow: true },
    );
    uninstall();
  });

  /*
   * The mailbox, emptied. `requestStop` is a request and not a value
   * precisely so the SAME stop can be clicked twice -- a plain `selected`
   * would already equal it and the route would have nothing to react to.
   * Two clicks on one stop is the case that proves it.
   */
  it('serves the same stop twice, and ignores one it does not have', async () => {
    const uninstall = installMapboxStub();
    const about = await import('pages/about.page');
    const tree = () => (
      <MapProvider>
        <SceneRoot />
        <about.default stops={historyStops} />
      </MapProvider>
    );

    await act(async () => {
      render(tree());
    });

    const click = async (id: unknown) => {
      await act(async () => {
        FakeMap.last.fire('click', {
          features: [{ properties: { id } }],
        });
      });
    };

    await click(historyStops[2].id);
    await click(historyStops[2].id);
    expect(router.push).toHaveBeenCalledTimes(2);

    // A stop id this page's props do not carry is a request from a layer
    // set that has already moved on. Dropping it is the same as not
    // having heard it -- and it must not throw on the way past.
    await click(99);
    await click('4');
    expect(router.push).toHaveBeenCalledTimes(2);

    uninstall();
  });

  /*
   * The camera is the visitor's now, so the route must not take it back.
   * Selecting a stop used to re-centre on its coordinate, which with a
   * draggable map would undo the visitor's own pan the moment they
   * clicked anything on it.
   */
  it('does not move the camera when the stop changes', async () => {
    const uninstall = installMapboxStub();
    const about = await import('pages/about.page');
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
    expect(FakeMap.last.calls.easeTo).toHaveLength(1);

    router.query = { stop: 'nike' };
    await act(async () => {
      mounted?.rerender(tree());
    });

    expect(
      screen.getByRole('heading', { name: 'Nike' }),
    ).toBeVisible();
    expect(FakeMap.last.calls.easeTo).toHaveLength(1);

    // And every gesture handler the visitor needs is live, which is the
    // other half of "the map is yours".
    for (const handler of [
      'dragPan',
      'dragRotate',
      'scrollZoom',
      'touchZoomRotate',
    ]) {
      expect(FakeMap.last.enabled.get(handler)).toBe(true);
    }

    uninstall();
  });

  /*
   * The whole point of the scene's selectedStop channel: the map's one
   * live element has to be the stop the copy is showing. Driven through
   * the real SceneRoot against the fake map, because the route's
   * declaration is only half of it -- this is the half that proves the
   * declaration arrives.
   */
  it('hands the map the same stop the copy is showing', async () => {
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
