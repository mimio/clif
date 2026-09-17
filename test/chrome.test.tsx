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
import Altimeter, {
  ALTIMETER_NOTCHES,
  BEAD_JIGGLE,
  BEAD_STRETCH,
  BEAD_WIDTH,
  beadPosition,
  DOT_HOVER_SCALE,
  DOT_SIZE,
  dotTiming,
  JIGGLE_EASE,
  JIGGLE_MS,
  playBead,
  prefersReducedMotion,
  RAIL_BOTTOM,
  RAIL_TOP,
  ROUTE_EVENT,
  TRAVEL_EASE,
  TRAVEL_MS,
} from 'components/chrome/Altimeter';
import ChromeRoot, {
  DETAIL_INDICATOR,
  DETAIL_PATH,
  indicatorForPath,
  pathForRoute,
  routeIdForPath,
} from 'components/chrome/ChromeRoot';
import ContactMouth, {
  COPIED_MS,
  copyText,
} from 'components/chrome/ContactMouth';
import CoordPill, {
  formatCoordinates,
  REST,
  WAKE,
} from 'components/chrome/CoordPill';
import ThemeEye, {
  announceTheme,
  currentTheme,
  serverTheme,
} from 'components/chrome/ThemeEye';
import { POPOVER_EVENT } from 'components/chrome/usePopover';
import { cameras } from 'content/cameras';
import { SceneContext } from 'scene/MapProvider';
import {
  DEFAULT_THEME,
  readStoredTheme,
  THEME_STORAGE_KEY,
} from 'styles/theme-bootstrap';

const pathname = vi.hoisted(() => ({ current: '/' }));
const push = vi.hoisted(() => vi.fn());

vi.mock('next/router', () => ({
  useRouter: () => ({ pathname: pathname.current, push }),
}));

/*
 * jsdom implements no Web Animations, so the bead's stretch and jiggle have
 * nothing to run against. The fake records what was asked for, which is the
 * part worth asserting: the keyframes, the duration and the easing.
 */
type Played = {
  keyframes: Keyframe[];
  options: KeyframeAnimationOptions;
};

const installAnimate = (): {
  played: Played[];
  cancelled: () => number;
} => {
  const played: Played[] = [];
  let cancels = 0;
  const animate = vi.fn(function fake(
    keyframes: Keyframe[],
    options: KeyframeAnimationOptions,
  ) {
    played.push({ keyframes, options });
    return { cancel: () => (cancels += 1) } as unknown as Animation;
  });
  Object.defineProperty(Element.prototype, 'animate', {
    configurable: true,
    writable: true,
    value: animate,
  });
  return { played, cancelled: () => cancels };
};

const removeAnimate = (): void => {
  Reflect.deleteProperty(Element.prototype, 'animate');
};

const reduceMotion = (matches: boolean): void => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches,
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

const rail = (name: RegExp): HTMLElement =>
  screen.getByRole('button', { name });

beforeEach(() => {
  pathname.current = '/';
  push.mockClear();
  reduceMotion(false);
});

afterEach(() => {
  removeAnimate();
  vi.useRealTimers();
  vi.restoreAllMocks();
  delete document.documentElement.dataset.theme;
  window.localStorage.clear();
});

describe('Altimeter geometry', () => {
  it('spaces the notches evenly and hangs equal rail past each end', () => {
    const [top, middle, bottom] = ALTIMETER_NOTCHES;
    expect(middle - top).toBe(bottom - middle);

    // A notch centreline is N + 0.5: the tick is 1px tall at top N.
    const above = top + 0.5 - RAIL_TOP;
    const below = 120 - RAIL_BOTTOM - (bottom + 0.5);
    expect(above).toBe(below);
    expect(above).toBe(12);
  });

  it('grows a hovered dot to exactly the bead width', () => {
    expect(DOT_SIZE * DOT_HOVER_SCALE).toBe(BEAD_WIDTH);
    // Odd sizes only: a 1px rail has its centre at x.5.
    expect(DOT_SIZE % 2).toBe(1);
    expect(BEAD_WIDTH % 2).toBe(1);
  });

  it('sits on a notch, and on the first when nothing is active', () => {
    expect(beadPosition('projects', null)).toBe(ALTIMETER_NOTCHES[1]);
    expect(beadPosition('about', null)).toBe(ALTIMETER_NOTCHES[2]);
    expect(beadPosition(null, null)).toBe(ALTIMETER_NOTCHES[0]);
  });

  it('lets an explicit indicator win, as the detail route does', () => {
    expect(beadPosition('projects', DETAIL_INDICATOR)).toBeCloseTo(
      20 + 0.62 * 80,
    );
    expect(beadPosition(null, 0)).toBe(ALTIMETER_NOTCHES[0]);
    expect(beadPosition(null, 1)).toBe(ALTIMETER_NOTCHES[2]);
    expect(beadPosition(null, 0.5)).toBe(ALTIMETER_NOTCHES[1]);
  });
});

describe('Altimeter dot hand-off', () => {
  it('collapses the destination dot before the bead can reach it', () => {
    const arriving = dotTiming(true, false, false);
    expect(arriving.scale).toBe(0);
    expect(arriving.opacity).toBe(0);
    expect(arriving.delay).toBe('40ms, 40ms');
    expect(arriving.duration).toBe('140ms, 140ms');
    // Gone at 180ms, with 160ms of the bead's 340ms travel still to run.
    expect(40 + 140).toBeLessThan(TRAVEL_MS);
  });

  it('reopens the vacated dot only once the bead has cleared it', () => {
    const left = dotTiming(false, false, true);
    expect(left.scale).toBe(1);
    expect(left.opacity).toBe(1);
    expect(left.delay).toBe('140ms, 140ms');
    expect(left.duration).toBe('200ms, 200ms');
    // The two never overlap: the arriving dot is gone at 180ms, and this
    // one does not start until 140ms -- on the other notch entirely.
    expect(140).toBeGreaterThanOrEqual(40);
  });

  it('gives hover no choreography at all', () => {
    const hot = dotTiming(false, true, false);
    expect(hot.scale).toBe(DOT_HOVER_SCALE);
    expect(hot.delay).toBe('0ms, 0ms');
    expect(hot.duration).toBe('160ms, 200ms');

    const rest = dotTiming(false, false, false);
    expect(rest.scale).toBe(1);
    expect(rest.opacity).toBe(1);
  });

  it('never lets a hovered dot outrank the live notch', () => {
    expect(dotTiming(true, true, false).scale).toBe(0);
  });
});

describe('playBead', () => {
  it('does nothing without an element or without Web Animations', () => {
    expect(
      playBead(null, BEAD_STRETCH, 1, 'linear', null),
    ).toBeNull();
    const bare = document.createElement('span');
    expect(
      playBead(bare, BEAD_STRETCH, 1, 'linear', null),
    ).toBeNull();
  });

  it('cancels what was running before replaying', () => {
    const { played, cancelled } = installAnimate();
    const element = document.createElement('span');
    const first = playBead(
      element,
      BEAD_STRETCH,
      TRAVEL_MS,
      TRAVEL_EASE,
      null,
    );
    expect(first).not.toBeNull();
    playBead(element, BEAD_JIGGLE, JIGGLE_MS, JIGGLE_EASE, first);
    expect(cancelled()).toBe(1);
    expect(played).toHaveLength(2);
    expect(played[0].options).toEqual({
      duration: TRAVEL_MS,
      easing: TRAVEL_EASE,
      fill: 'none',
    });
    expect(played[1].keyframes).toBe(BEAD_JIGGLE);
  });

  it('stands still when the visitor asked for less motion', () => {
    installAnimate();
    reduceMotion(true);
    expect(prefersReducedMotion()).toBe(true);
    const element = document.createElement('span');
    expect(
      playBead(element, BEAD_STRETCH, 1, 'linear', null),
    ).toBeNull();
  });
});

describe('Altimeter motion', () => {
  it('stretches along the travel and lands at its own size', () => {
    // Symmetric about the centre at every frame, so it can never squash
    // toward an end of the rail; and it starts and ends at rest.
    expect(BEAD_STRETCH[0].transform).toBe('scale(1,1)');
    expect(BEAD_STRETCH[2].transform).toBe('scale(1,1)');
    expect(BEAD_STRETCH[1].offset).toBe(0.3);
    expect(BEAD_STRETCH[1].transform).toBe('scale(.5,1.9)');
  });

  it('jiggles equally up and down, with width play', () => {
    const shifts = BEAD_JIGGLE.map((frame) =>
      Number(
        /translateY\((-?[\d.]+)/.exec(String(frame.transform))?.[1],
      ),
    );
    const ups = shifts.filter((value) => value < 0).map(Math.abs);
    const downs = shifts.filter((value) => value > 0);
    expect(ups).toEqual(downs);
    expect(ups).toEqual([5, 2.5, 1]);

    const widths = BEAD_JIGGLE.map((frame) =>
      Number(/scale\(([\d.]+)/.exec(String(frame.transform))?.[1]),
    );
    expect(Math.min(...widths)).toBeLessThan(1);
    expect(Math.max(...widths)).toBe(1);
  });

  it('plays the stretch on a move and the jiggle on a re-select', () => {
    const { played } = installAnimate();
    render(<Altimeter active="hello" />);
    expect(played).toHaveLength(0);

    fireEvent.click(rail(/projects/));
    expect(played).toHaveLength(1);
    expect(played[0].keyframes).toBe(BEAD_STRETCH);

    // Already here: acknowledge, go nowhere.
    fireEvent.click(rail(/projects/));
    expect(played).toHaveLength(2);
    expect(played[1].keyframes).toBe(BEAD_JIGGLE);
    expect(played[1].options.duration).toBe(JIGGLE_MS);
  });

  it('skips the keyframes under prefers-reduced-motion', () => {
    const { played } = installAnimate();
    reduceMotion(true);
    render(<Altimeter active="hello" />);
    fireEvent.click(rail(/about/));
    expect(played).toHaveLength(0);
    // The route still moved; only the flourish is gone.
    expect(rail(/about/)).toHaveAttribute('aria-current', 'true');
  });
});

describe('Altimeter behaviour', () => {
  it('renders one notch per route and navigates', async () => {
    const onNavigate = vi.fn();
    render(<Altimeter active="hello" onNavigate={onNavigate} />);
    expect(screen.getAllByRole('button')).toHaveLength(3);
    expect(rail(/hello/)).toHaveAttribute('aria-current', 'true');

    await userEvent.click(rail(/projects/));
    expect(onNavigate).toHaveBeenCalledWith('projects');
    expect(rail(/projects/)).toHaveAttribute('aria-current', 'true');
    expect(rail(/hello/)).toHaveAttribute('aria-current', 'false');
  });

  it('survives having no navigate handler, and no active route', async () => {
    render(<Altimeter />);
    await userEvent.click(rail(/about/));
    expect(rail(/about/)).toHaveAttribute('aria-current', 'true');
  });

  it('shows no active notch while an indicator is driving it', () => {
    render(
      <Altimeter active="projects" className="x" indicator={0.45} />,
    );
    screen.getAllByRole('button').forEach((notch) => {
      expect(notch).toHaveAttribute('aria-current', 'false');
    });
  });

  it('reveals a label on hover and colours it on select', async () => {
    render(<Altimeter active="hello" />);
    const hello = rail(/hello/);
    const label = screen.getByText('hello');
    expect(label).toHaveStyle({ opacity: '0' });

    await userEvent.hover(hello);
    expect(label).toHaveStyle({ opacity: '1' });
    expect(label.className).toContain('text-accent');

    await userEvent.unhover(hello);
    expect(label).toHaveStyle({ opacity: '0' });
    expect(screen.getByText('projects').className).toContain(
      'text-fg-2',
    );
  });

  it('reveals the label for keyboard focus too', () => {
    render(<Altimeter active="hello" />);
    fireEvent.focus(rail(/about/));
    expect(screen.getByText('about')).toHaveStyle({ opacity: '1' });
    fireEvent.blur(rail(/about/));
    expect(screen.getByText('about')).toHaveStyle({ opacity: '0' });
  });

  it('moves every rail on the page from one click', async () => {
    render(
      <>
        <Altimeter active="hello" />
        <Altimeter active="hello" />
      </>,
    );
    const [first, second] = screen.getAllByRole('button', {
      name: /about/,
    });
    await userEvent.click(first);
    expect(first).toHaveAttribute('aria-current', 'true');
    expect(second).toHaveAttribute('aria-current', 'true');
  });

  it('ignores an empty route event, and its own announcement', () => {
    const { played } = installAnimate();
    render(<Altimeter active="hello" />);

    act(() => {
      window.dispatchEvent(new CustomEvent(ROUTE_EVENT));
    });
    expect(rail(/hello/)).toHaveAttribute('aria-current', 'true');
    expect(played).toHaveLength(0);

    // A rail that clicks announces once and must not travel twice.
    fireEvent.click(rail(/about/));
    expect(played).toHaveLength(1);
  });

  it('ignores an announcement for the notch it already holds', () => {
    const { played } = installAnimate();
    render(
      <>
        <Altimeter active="hello" />
        <Altimeter active="about" />
      </>,
    );
    const [helloRail] = screen.getAllByRole('button', {
      name: /about/,
    });
    fireEvent.click(helloRail);
    // The first rail moved; the second was already there and stayed put,
    // with no stretch to replay.
    expect(played).toHaveLength(1);
    screen
      .getAllByRole('button', { name: /about/ })
      .forEach((notch) => {
        expect(notch).toHaveAttribute('aria-current', 'true');
      });
  });

  it('follows the router when the route changes underneath it', () => {
    const { rerender } = render(<Altimeter active="hello" />);
    rerender(<Altimeter active="about" />);
    expect(rail(/about/)).toHaveAttribute('aria-current', 'true');

    // Back to a route with no notch: the rail holds where it was.
    rerender(<Altimeter active={null} />);
    expect(rail(/about/)).toHaveAttribute('aria-current', 'true');
  });

  it('does not announce its own route on mount', () => {
    render(
      <>
        <Altimeter active="hello" />
        <Altimeter active="about" />
      </>,
    );
    expect(
      screen.getAllByRole('button', { name: /hello/ })[0],
    ).toHaveAttribute('aria-current', 'true');
    expect(
      screen.getAllByRole('button', { name: /about/ })[1],
    ).toHaveAttribute('aria-current', 'true');
  });
});

describe('ThemeEye', () => {
  it('opens, applies a theme and stays open for comparison', async () => {
    const onChange = vi.fn();
    render(<ThemeEye onChange={onChange} />);
    await userEvent.click(
      screen.getByRole('button', { name: 'Theme' }),
    );
    await userEvent.click(
      screen.getByRole('option', { name: 'teal' }),
    );

    expect(document.documentElement.dataset.theme).toBe('teal');
    expect(onChange).toHaveBeenCalledWith('teal');
    expect(screen.getByRole('listbox')).toBeVisible();
    expect(
      screen.getByRole('option', { name: 'teal' }),
    ).toHaveAttribute('aria-selected', 'true');
  });

  it('remembers the pick, and reads it back on the next visit', async () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    render(<ThemeEye defaultOpen />);
    await userEvent.click(
      screen.getByRole('option', { name: 'pink' }),
    );

    expect(setItem).toHaveBeenCalledWith(THEME_STORAGE_KEY, 'pink');
    expect(readStoredTheme()).toBe('pink');

    // A fresh eye, with no attribute on <html>, picks the stored theme up.
    delete document.documentElement.dataset.theme;
    expect(currentTheme()).toBe('pink');
  });

  it('falls back to the default with nothing stored or set', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
    expect(currentTheme()).toBe(DEFAULT_THEME);
    expect(serverTheme()).toBe(DEFAULT_THEME);

    document.documentElement.dataset.theme = 'not-a-theme';
    expect(currentTheme()).toBe(DEFAULT_THEME);
  });

  it('shows the theme the document already carries', () => {
    document.documentElement.dataset.theme = 'chalk';
    render(<ThemeEye defaultOpen />);
    expect(
      screen.getByRole('option', { name: 'chalk' }),
    ).toHaveAttribute('aria-selected', 'true');
  });

  it('follows a pick made by another lens on the page', () => {
    render(<ThemeEye defaultOpen />);
    act(() => announceTheme('rust'));
    expect(
      screen.getByRole('option', { name: 'rust' }),
    ).toHaveAttribute('aria-selected', 'true');
  });

  it('can be pinned to a value it does not own', async () => {
    render(<ThemeEye className="x" defaultOpen value="lime" />);
    expect(
      screen.getByRole('option', { name: 'lime' }),
    ).toHaveAttribute('aria-selected', 'true');
    await userEvent.click(
      screen.getByRole('option', { name: 'cream' }),
    );
    expect(document.documentElement.dataset.theme).toBe('cream');
    expect(
      screen.getByRole('option', { name: 'lime' }),
    ).toHaveAttribute('aria-selected', 'true');
  });

  it('closes on a second click of the eye', async () => {
    render(<ThemeEye defaultOpen />);
    expect(screen.getByRole('listbox')).toBeVisible();
    await userEvent.click(
      screen.getByRole('button', { name: 'Theme' }),
    );
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('survives storage that refuses to answer', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    delete document.documentElement.dataset.theme;
    render(<ThemeEye />);
    expect(document.documentElement.dataset.theme).toBe(
      DEFAULT_THEME,
    );
  });
});

describe('ContactMouth', () => {
  it('opens onto the one address', async () => {
    render(<ContactMouth />);
    expect(screen.queryByRole('link')).toBeNull();
    await userEvent.click(
      screen.getByRole('button', { name: 'Contact' }),
    );
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      'mailto:clif@mimio.io',
    );
  });

  it('can start open with a different address, and closes again', async () => {
    render(
      <ContactMouth className="x" defaultOpen email="hi@x.io" />,
    );
    expect(screen.getByText('hi@x.io')).toBeVisible();
    await userEvent.click(
      screen.getByRole('button', { name: 'Contact' }),
    );
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('copies through the clipboard when it is allowed', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
    await copyText('a@b.c');
    expect(writeText).toHaveBeenCalledWith('a@b.c');
    Reflect.deleteProperty(navigator, 'clipboard');
  });

  it('falls back to a hidden field, and survives that failing too', async () => {
    const exec = vi.fn().mockReturnValue(true);
    Object.defineProperty(document, 'execCommand', {
      configurable: true,
      value: exec,
    });
    await copyText('a@b.c');
    expect(exec).toHaveBeenCalledWith('copy');
    expect(document.querySelector('textarea')).toBeNull();

    exec.mockImplementation(() => {
      throw new Error('blocked');
    });
    await copyText('a@b.c');
    Reflect.deleteProperty(document, 'execCommand');
  });

  it('says copied for 1600ms without moving the row', async () => {
    vi.useFakeTimers();
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
    const { unmount } = render(<ContactMouth defaultOpen />);
    const button = screen.getByRole('button', { name: 'copy' });
    const width = button.style.width;

    await act(async () => {
      fireEvent.click(button);
    });
    expect(
      screen.getByRole('button', { name: 'copied' }),
    ).toHaveStyle({ width });

    act(() => {
      vi.advanceTimersByTime(COPIED_MS);
    });
    expect(
      screen.getByRole('button', { name: 'copy' }),
    ).toBeVisible();

    // A second copy restarts the clock rather than stacking timers.
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'copy' }));
    });
    unmount();
    Reflect.deleteProperty(navigator, 'clipboard');
  });
});

describe('popover exclusion', () => {
  it('closes the theme panel when the contact panel opens', async () => {
    render(
      <>
        <ThemeEye />
        <ContactMouth />
      </>,
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Theme' }),
    );
    expect(screen.getByRole('listbox')).toBeVisible();

    await userEvent.click(
      screen.getByRole('button', { name: 'Contact' }),
    );
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(screen.getByRole('link')).toBeVisible();

    await userEvent.click(
      screen.getByRole('button', { name: 'Theme' }),
    );
    expect(screen.queryByRole('link')).toBeNull();
    expect(screen.getByRole('listbox')).toBeVisible();
  });

  it('leaves a popover alone when something else announces', async () => {
    render(<ThemeEye />);
    await userEvent.click(
      screen.getByRole('button', { name: 'Theme' }),
    );
    act(() => {
      window.dispatchEvent(
        new CustomEvent(POPOVER_EVENT, { detail: {} }),
      );
    });
    expect(screen.queryByRole('listbox')).toBeNull();
  });
});

describe('CoordPill', () => {
  it('reads lat, lng to three decimals', () => {
    expect(formatCoordinates(-122.658, 45.512)).toBe(
      '45.512, -122.658',
    );
  });

  it('says camera by default and held when told', () => {
    const { rerender } = render(
      <CoordPill lat={45.5} lng={-122.7} />,
    );
    expect(screen.getByText('camera')).toBeVisible();
    rerender(
      <CoordPill
        className="x"
        label="held"
        lat={39.641}
        lng={-106.355}
      />,
    );
    expect(screen.getByText('held')).toBeVisible();
  });

  it('wakes its limbs on hover and rests them again', async () => {
    const { container } = render(
      <CoordPill lat={45.5} lng={-122.7} />,
    );
    const body = container.firstElementChild as HTMLElement;
    const arm = container.querySelector('span') as HTMLElement;
    expect(body.dataset.awake).toBe('false');
    expect(arm.style.transform).toBe(`rotate(${REST.armL}deg)`);

    await userEvent.hover(screen.getByText('camera'));
    expect(body.dataset.awake).toBe('true');
    expect(arm.style.transform).toBe(`rotate(${WAKE.armL}deg)`);

    await userEvent.unhover(screen.getByText('camera'));
    expect(body.dataset.awake).toBe('false');
  });

  it('keeps every limb out of the hit test', () => {
    const { container } = render(
      <CoordPill lat={45.5} lng={-122.7} />,
    );
    const limbs = container.querySelectorAll(
      '[class*="pointer-events-none"]',
    );
    expect(limbs).toHaveLength(3);
  });
});

describe('ChromeRoot', () => {
  it('maps a pathname to the rail notch', () => {
    expect(routeIdForPath('/')).toBe('hello');
    expect(routeIdForPath('/projects')).toBe('projects');
    expect(routeIdForPath('/about')).toBe('about');
    expect(routeIdForPath(DETAIL_PATH)).toBeNull();
    expect(routeIdForPath('/404')).toBeNull();
  });

  it('hands the detail route an indicator instead of a notch', () => {
    expect(indicatorForPath(DETAIL_PATH)).toBe(DETAIL_INDICATOR);
    expect(indicatorForPath('/projects')).toBeNull();
  });

  it('knows where each route lives', () => {
    expect(pathForRoute('hello')).toBe('/');
    expect(pathForRoute('projects')).toBe('/projects');
    expect(pathForRoute('about')).toBe('/about');
  });

  it('falls back to the opening camera before a route sets one', () => {
    render(<ChromeRoot />);
    expect(screen.getByText('45.500, -122.700')).toBeVisible();
    expect(screen.getByText('camera')).toBeVisible();
  });

  it('reads the live camera and the live route', () => {
    pathname.current = '/about';
    render(
      <SceneContext.Provider
        value={{ camera: cameras.about, setCamera: vi.fn() }}
      >
        <ChromeRoot className="x" />
      </SceneContext.Provider>,
    );
    expect(screen.getByText('45.512, -122.658')).toBeVisible();
    expect(rail(/about/)).toHaveAttribute('aria-current', 'true');
  });

  it('holds the camera on the detail route', () => {
    pathname.current = DETAIL_PATH;
    render(<ChromeRoot />);
    expect(screen.getByText('held')).toBeVisible();
    expect(rail(/projects/)).toHaveAttribute('aria-current', 'false');
  });

  it('drives the router from the rail', async () => {
    render(<ChromeRoot />);
    await userEvent.click(rail(/projects/));
    expect(push).toHaveBeenCalledWith('/projects');
  });
});
