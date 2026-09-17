import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cameras } from 'content/cameras';
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
import MapProvider, { useScene } from 'scene/MapProvider';

/*
 * Artboards 1e (About / Ubiquiti selected / Desktop 1440x900) and 1h
 * (About / Sheet open / Mobile 390x844). What is asserted is the route's
 * contract rather than its pixels: which stop opens, where the sheet is
 * pinned, what the scrubber is told, and what selecting a stop does to the
 * URL and to the camera.
 */

const router = vi.hoisted(() => ({
  query: undefined as Record<string, string> | undefined,
  push: vi.fn(),
  pathname: '/about',
}));

vi.mock('next/router', () => ({
  useRouter: () => router,
}));

afterEach(() => {
  router.query = undefined;
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

    // Arriving is travel, and it belongs to the pinned wrapper: 1e's 240ms
    // from a 40px offset. Swapping is the sheet's own 160ms crossfade,
    // important because tailwind-merge cannot drop the class it overrides.
    const pinned = sheet().parentElement;
    const before = sheet();
    expect(pinned).toHaveClass('[--slide-in-from:40px]');
    expect(pinned?.className).toContain('clif-slidein_240ms');
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

  it('1h rises the sheet from the bottom edge, 280ms', () => {
    render(<AboutPage mobile stops={historyStops} />);
    expect(sheet().parentElement?.className).toContain(
      'clif-slidein_280ms',
    );
  });

  it('reduced motion is a 200ms crossfade and no travel', () => {
    render(<AboutPage reduced stops={historyStops} />);
    expect(sheet().className).toContain(
      `animate-[clif-slidein_${REDUCED_CROSSFADE_MS}ms_linear_forwards]!`,
    );
    expect(sheet().parentElement).toHaveClass(
      `animate-[clif-slidein_${REDUCED_CROSSFADE_MS}ms_linear_forwards]`,
      '[--slide-in-from:0px]',
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
    const { camera } = useScene();
    return (
      <span data-testid="camera">
        {camera === null ? 'none' : camera.center.join()}
      </span>
    );
  };

  const renderPage = async () => {
    const about = await import('pages/about');
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

  it('a deep-linked stop opens it and reframes the camera onto it', async () => {
    router.query = { stop: 'salesforce' };
    await renderPage();

    expect(
      screen.getByRole('heading', { name: 'Salesforce' }),
    ).toBeVisible();
    expect(screen.getByText('stop 06 / 06')).toBeVisible();
    expect(camera()).toBe(historyStops[5].coordinates.join());
    // Only the centre moved, so the scene treats it as a refinement of the
    // about camera and eases 600ms rather than ignoring it as stale.
    expect(
      refinesCamera(
        { ...cameras.about, center: historyStops[5].coordinates },
        cameras.about,
      ),
    ).toBe(true);
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
});
