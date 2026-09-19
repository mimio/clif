import {
  act,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { Profiler, type ReactNode } from 'react';
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
  FOCUS_RING,
  JIGGLE_EASE,
  JIGGLE_MS,
  LABEL_CHARS,
  LABEL_TRACKING,
  LABEL_WIDTH,
  playBead,
  RAIL_BOTTOM,
  RAIL_TOP,
  ROUTE_EVENT,
  TRAVEL_EASE,
  TRAVEL_MS,
} from 'components/chrome/Altimeter';
import ChromeRoot, {
  DETAIL_PATH,
  liveCamera,
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
import LiveCoordPill from 'components/chrome/LiveCoordPill';
import ThemeEye, {
  announceTheme,
  currentTheme,
  publishTheme,
  serverTheme,
} from 'components/chrome/ThemeEye';
import { POPOVER_EVENT } from 'components/chrome/usePopover';
import type { AnchorId } from 'content/anchors';
import { routes } from 'content/routes';
import { prefersReducedMotion } from 'scene/budget';
import {
  cameraForHover,
  coordLabel,
  forViewport,
  resolveCamera,
} from 'scene/camera';
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
 * The map's camera feed, driven by hand.
 *
 * scene/liveCamera re-exports watchCamera from scene/mapbox/instance, and
 * with no token there is never a map for it to attach to -- so the real
 * one is silent here, which is right for every test that only wants the
 * fallback and useless for the ones below that are about WHEN the pill
 * renders. This stands in for the map: `camera.emit()` is one `move`.
 */
const camera = vi.hoisted(() => {
  const listeners = new Set<(center: [number, number]) => void>();
  return {
    listeners,
    stops: 0,
    emit(center: [number, number]) {
      for (const listener of [...listeners]) listener(center);
    },
    reset() {
      listeners.clear();
      this.stops = 0;
    },
  };
});

vi.mock('scene/liveCamera', () => ({
  watchCamera: (listener: (center: [number, number]) => void) => {
    camera.listeners.add(listener);
    return () => {
      camera.listeners.delete(listener);
      camera.stops += 1;
    };
  },
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

  /*
   * THE SHARED ROW WIDTH, AND THE GUARD ON ITS DERIVATION.
   *
   * "all altimeter items become the width of their widest member". The
   * width is one expression shared by all three label cells, and it is
   * built from content/routes.ts rather than typed, so renaming a route to
   * a longer word widens every row on its own. These two assertions are
   * what makes that a fact rather than an intention: the first fails the
   * moment LABEL_CHARS stops tracking the longest label -- including when
   * someone renames `projects` to something longer -- and the second fails
   * if the width is ever rewritten as a px number, which would then quietly
   * clip whatever outgrew it.
   *
   * The RENDERED equality is measured in e2e/hermetic/altimeter-widths.spec
   * against real boxes; jsdom has no layout and cannot resolve `ch`.
   */
  it('derives one label width from the longest route label', () => {
    const longest = Math.max(
      ...routes.map((route) => route.label.length),
    );
    expect(LABEL_CHARS).toBe(longest);
    expect(LABEL_CHARS).toBeGreaterThan(0);

    expect(LABEL_WIDTH).toBe(
      `calc(${longest}ch + ${longest * LABEL_TRACKING}em)`,
    );
    // No px anywhere in it: a hardcoded width is the failure mode this
    // whole approach exists to avoid.
    expect(LABEL_WIDTH).not.toMatch(/px/);
  });

  it('gives every row the same label cell and the same ring', () => {
    render(<Altimeter active="hello" />);

    const cells = routes.map((route) =>
      screen.getByText(route.label),
    );
    // One width expression, not three -- jsdom resolves `calc()` to its own
    // px on the way in, so what is asserted is that all three cells resolve
    // to the SAME thing and that none of them is `auto`.
    const widths = new Set(cells.map((cell) => cell.style.width));
    expect(widths.size).toBe(1);
    expect([...widths][0]).not.toBe('');

    cells.forEach((cell) => {
      expect(cell.style.letterSpacing).toBe(`${LABEL_TRACKING}em`);
      expect(cell.className).toContain('text-right');
    });

    /*
     * The ring is one class list on all three, and it is square and
     * keyboard-only. `rounded-none` is what makes "rectangular" a
     * property of the markup rather than of the UA default, and
     * focus-visible is what keeps a pointer click from painting it.
     */
    screen.getAllByRole('button').forEach((row) => {
      FOCUS_RING.split(' ').forEach((token) => {
        expect(row.className).toContain(token);
      });
    });
    expect(FOCUS_RING).toContain('rounded-none');
    expect(FOCUS_RING).toContain('focus-visible:outline-2');
    expect(FOCUS_RING).not.toMatch(/(^|\s)outline-2/);
  });

  it('sits on a notch, and on the first when nothing is active', () => {
    expect(beadPosition('projects', null)).toBe(ALTIMETER_NOTCHES[1]);
    expect(beadPosition('about', null)).toBe(ALTIMETER_NOTCHES[2]);
    expect(beadPosition(null, null)).toBe(ALTIMETER_NOTCHES[0]);
  });

  it('lets a mid-travel indicator win over the active notch', () => {
    expect(beadPosition('projects', 0.62)).toBeCloseTo(
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
    // B6: one reduced-motion read for the whole app -- scene/budget.ts's,
    // which scene/useViewport.ts subscribes to as well. The rail used to
    // carry a byte-for-byte copy of it.
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
    expect(screen.getByText('about me')).toHaveStyle({
      opacity: '1',
    });
    fireEvent.blur(rail(/about/));
    expect(screen.getByText('about me')).toHaveStyle({
      opacity: '0',
    });
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

/*
 * The panel is a NAMED GROUP of toggles now, not a listbox of options. The
 * roles it used to carry promised a keyboard model it did not have -- no
 * arrows, no aria-activedescendant, no roving tabindex -- and the list had
 * no accessible name either, so a screen reader announced "list box, 8
 * items" and then switched into a mode whose keys did nothing. Each row was
 * always a real button; the ARIA was the only thing making it worse.
 */
const themePanel = (): HTMLElement =>
  screen.getByRole('group', { name: 'theme' });

const queryThemePanel = (): HTMLElement | null =>
  screen.queryByRole('group', { name: 'theme' });

describe('ThemeEye', () => {
  it('opens, applies a theme and stays open for comparison', async () => {
    const onChange = vi.fn();
    render(<ThemeEye onChange={onChange} />);
    await userEvent.click(
      screen.getByRole('button', { name: 'Theme' }),
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'teal' }),
    );

    expect(document.documentElement.dataset.theme).toBe('teal');
    expect(onChange).toHaveBeenCalledWith('teal');
    expect(themePanel()).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'teal' }),
    ).toHaveAttribute('aria-pressed', 'true');
  });

  it('remembers the pick, and reads it back on the next visit', async () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    render(<ThemeEye defaultOpen />);
    await userEvent.click(
      screen.getByRole('button', { name: 'pink' }),
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
      screen.getByRole('button', { name: 'chalk' }),
    ).toHaveAttribute('aria-pressed', 'true');
  });

  it('follows a pick made by another lens on the page', () => {
    render(<ThemeEye defaultOpen />);
    act(() => announceTheme('rust'));
    expect(
      screen.getByRole('button', { name: 'rust' }),
    ).toHaveAttribute('aria-pressed', 'true');
  });

  it('follows the attribute even when nothing announced', async () => {
    render(<ThemeEye defaultOpen />);
    document.documentElement.dataset.theme = 'lime';
    await screen.findByRole('button', {
      name: 'lime',
      pressed: true,
    });
  });

  it('can be pinned to a value it does not own', async () => {
    render(<ThemeEye className="x" defaultOpen value="lime" />);
    expect(
      screen.getByRole('button', { name: 'lime' }),
    ).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(
      screen.getByRole('button', { name: 'cream' }),
    );
    expect(document.documentElement.dataset.theme).toBe('cream');
    expect(
      screen.getByRole('button', { name: 'lime' }),
    ).toHaveAttribute('aria-pressed', 'true');
  });

  it('closes on a second click of the eye', async () => {
    render(<ThemeEye defaultOpen />);
    expect(themePanel()).toBeVisible();
    await userEvent.click(
      screen.getByRole('button', { name: 'Theme' }),
    );
    expect(queryThemePanel()).toBeNull();
  });

  it('does not remember a theme nobody chose', () => {
    // applyTheme's contract is that it remembers a CHOICE. Mount is not
    // one: it publishes whatever the bootstrap already resolved, which for
    // a first visit is just DEFAULT_THEME. Writing that to storage pinned
    // every first-time visitor to today's default for good.
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    render(<ThemeEye />);
    expect(setItem).not.toHaveBeenCalled();
    expect(document.documentElement.dataset.theme).toBe(
      DEFAULT_THEME,
    );

    // A pick is a choice, and is remembered.
    publishTheme('teal');
    expect(setItem).not.toHaveBeenCalled();
    announceTheme('teal');
    expect(setItem).toHaveBeenCalledWith(THEME_STORAGE_KEY, 'teal');
  });

  it('puts the panel after the trigger, where Tab will find it', async () => {
    render(<ThemeEye />);
    const eye = screen.getByRole('button', { name: 'Theme' });
    eye.focus();
    await userEvent.click(eye);
    // Tabbing forward off the eye used to leave the component entirely --
    // in the real chrome stack it landed on the mouth -- because the panel
    // was rendered before the trigger and tab order is DOM order.
    await userEvent.tab();
    expect(
      screen.getByRole('button', { name: 'yellow' }),
    ).toHaveFocus();
    expect(themePanel()).toContainElement(
      document.activeElement as HTMLElement,
    );
  });

  it('closes on Escape', async () => {
    render(<ThemeEye defaultOpen />);
    expect(themePanel()).toBeVisible();
    await userEvent.keyboard('{Escape}');
    expect(queryThemePanel()).toBeNull();
    // Any other key leaves it alone.
    await userEvent.click(
      screen.getByRole('button', { name: 'Theme' }),
    );
    await userEvent.keyboard('{ArrowDown}');
    expect(themePanel()).toBeVisible();
  });

  it('closes when a press lands outside it', async () => {
    render(
      <>
        <ThemeEye defaultOpen />
        <button type="button">elsewhere</button>
      </>,
    );
    expect(themePanel()).toBeVisible();

    // Inside is the whole wrapper, trigger included, and a press inside
    // leaves it alone -- picking a theme is the point of the panel.
    await userEvent.click(
      screen.getByRole('button', { name: 'lime' }),
    );
    expect(themePanel()).toBeVisible();

    await userEvent.click(
      screen.getByRole('button', { name: 'elsewhere' }),
    );
    expect(queryThemePanel()).toBeNull();
  });

  it('gaps its border where the tail joins, in this order', () => {
    // The panel border and the tail's edge are both 30% accent. The edge
    // triangle's base covers the border, so the border is erased first --
    // before the edge, or the two composite to ~51% and light a bright
    // 1px point at each joint.
    render(<ThemeEye defaultOpen />);
    const tail = [
      ...(themePanel().parentElement as HTMLElement).querySelectorAll(
        ':scope > span',
      ),
    ].map((node) => node.className);
    expect(tail).toHaveLength(3);
    expect(tail[0]).toMatch(/bg-surface-2/);
    expect(tail[0]).toMatch(/h-\[14px\]/);
    expect(tail[1]).toMatch(/border-l-accent-30/);
    expect(tail[2]).toMatch(/border-l-surface-2/);
  });

  it('scopes the eye and its rows to a fine pointer', () => {
    render(<ThemeEye defaultOpen />);
    [
      screen.getByRole('button', { name: 'Theme' }),
      screen.getByRole('button', { name: 'yellow' }),
      screen.getByRole('button', { name: 'teal' }),
    ].forEach((node) =>
      node.className
        .split(' ')
        .filter((name) => name.includes('hover:'))
        .forEach((name) =>
          expect(name.startsWith('pointer-fine:')).toBe(true),
        ),
    );
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

describe('the dense labels sit on the micro steps', () => {
  /*
   * These were rendered at 11px before typography.css had a step below the
   * readout, which was a visible deviation on the densest text in the
   * system. The scale now goes label 12 / readout 11 / caption 10 / micro 9,
   * and these assertions exist so nobody rounds them back up.
   */
  it('sets the theme panel in the 9px micro step', () => {
    render(<ThemeEye defaultOpen />);
    expect(screen.getByText('theme')).toHaveStyle({
      fontSize: 'var(--type-micro-size)',
      letterSpacing: 'var(--type-micro-tracking)',
    });
    expect(
      screen.getByRole('button', { name: 'teal' }).lastElementChild,
    ).toHaveStyle({ fontSize: 'var(--type-micro-size)' });
  });

  it('sets the contact eyebrow in the same step', () => {
    render(<ContactMouth defaultOpen />);
    expect(screen.getByText('lorem ipsum')).toHaveStyle({
      fontSize: 'var(--type-micro-size)',
      letterSpacing: 'var(--type-micro-tracking)',
    });
  });

  it('splits the pill: readout 11px, caption 10px', () => {
    render(<CoordPill lat={45.5} lng={-122.7} />);
    expect(screen.getByText('45.500, -122.700')).toHaveStyle({
      fontSize: 'var(--type-readout-size)',
    });
    expect(screen.getByText('camera')).toHaveStyle({
      fontSize: 'var(--type-caption-size)',
    });
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

  /*
   * The label flip is a PICTURE of the state, and it used to be the only
   * record of it: no aria-live, no role="status", and an accessible name
   * that rewrote itself on a focused control -- announced inconsistently
   * across screen readers and then reverted in silence. The button's name
   * is fixed now and says what it copies; the confirmation is a live
   * region beside it.
   */
  it('says copied for 1600ms without moving the row, and announces it', async () => {
    vi.useFakeTimers();
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
    const { unmount } = render(<ContactMouth defaultOpen />);
    const button = screen.getByRole('button', {
      name: 'Copy clif@mimio.io',
    });
    const width = button.style.width;
    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('');

    await act(async () => {
      fireEvent.click(button);
    });
    expect(button).toHaveTextContent('copied');
    expect(button).toHaveStyle({ width });
    expect(status).toHaveTextContent(
      'clif@mimio.io copied to clipboard',
    );
    // The name never moved, so nothing was announced by changing it.
    expect(button).toHaveAccessibleName('Copy clif@mimio.io');

    act(() => {
      vi.advanceTimersByTime(COPIED_MS);
    });
    expect(button).toHaveTextContent('copy');
    expect(status).toHaveTextContent('');

    // A second copy restarts the clock rather than stacking timers.
    await act(async () => {
      fireEvent.click(button);
    });
    unmount();
    Reflect.deleteProperty(navigator, 'clipboard');
  });

  it('puts the panel after the lips, where Tab will find it', async () => {
    render(<ContactMouth />);
    const mouth = screen.getByRole('button', { name: 'Contact' });
    mouth.focus();
    await userEvent.click(mouth);
    await userEvent.tab();
    expect(screen.getByRole('link')).toHaveFocus();
  });

  it('closes on Escape', async () => {
    render(<ContactMouth defaultOpen />);
    expect(screen.getByRole('link')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('closes when a press lands outside it', async () => {
    render(
      <>
        <ContactMouth defaultOpen />
        <button type="button">elsewhere</button>
      </>,
    );
    expect(screen.getByRole('link')).toBeVisible();

    // A press on the address is inside, and the panel is select-text: a
    // drag across it must not pull the address out from under the pointer.
    await userEvent.click(screen.getByRole('link'));
    expect(screen.getByRole('link')).toBeVisible();

    await userEvent.click(
      screen.getByRole('button', { name: 'elsewhere' }),
    );
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('gaps its border where the tail joins, in this order', () => {
    // As the eye's panel: the border goes first, then the 30% edge over
    // the gap, then the fill. See the note on the tail in ContactMouth.
    render(<ContactMouth defaultOpen />);
    const panel = screen
      .getByRole('link')
      .closest('[class*="select-text"]');
    const tail = [
      ...(panel as HTMLElement).querySelectorAll(':scope > span'),
    ].map((node) => node.className);
    expect(tail).toHaveLength(3);
    expect(tail[0]).toMatch(/bg-surface-2/);
    expect(tail[0]).toMatch(/h-\[14px\]/);
    expect(tail[1]).toMatch(/border-l-accent-30/);
    expect(tail[2]).toMatch(/border-l-surface-2/);
  });

  it('leaves the address selectable, as the copy fallback assumes', () => {
    // The wrapper is select-none so a drag across the lips cannot select
    // them; that inherited into the panel and made the last-resort "the
    // address is on screen and selectable anyway" untrue.
    render(<ContactMouth defaultOpen />);
    expect(
      screen.getByRole('link').closest('[class*="select-text"]'),
    ).not.toBeNull();
  });

  it('scopes the mouth and its actions to a fine pointer', () => {
    render(<ContactMouth defaultOpen />);
    [
      screen.getByRole('button', { name: 'Contact' }),
      screen.getByRole('link'),
      screen.getByRole('button', { name: /^Copy / }),
    ].forEach((node) =>
      node.className
        .split(' ')
        .filter((name) => name.includes('hover:'))
        .forEach((name) =>
          expect(name.startsWith('pointer-fine:')).toBe(true),
        ),
    );
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
    expect(themePanel()).toBeVisible();

    await userEvent.click(
      screen.getByRole('button', { name: 'Contact' }),
    );
    expect(queryThemePanel()).toBeNull();
    expect(screen.getByRole('link')).toBeVisible();

    await userEvent.click(
      screen.getByRole('button', { name: 'Theme' }),
    );
    expect(screen.queryByRole('link')).toBeNull();
    expect(themePanel()).toBeVisible();
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
    expect(queryThemePanel()).toBeNull();
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
    expect(routeIdForPath('/404')).toBeNull();
  });

  /*
   * A detail page is INSIDE the projects section, so the rail reads
   * projects there. It used to resolve to null and show no active notch
   * at all -- see the note on routeIdForPath.
   */
  it('keeps a nested path on its section notch', () => {
    expect(routeIdForPath(DETAIL_PATH)).toBe('projects');
    // The URL as well as Next's pattern: both are inside /projects.
    expect(routeIdForPath('/projects/haikumi')).toBe('projects');
    expect(routeIdForPath('/projects/gopro/gallery')).toBe(
      'projects',
    );
  });

  it('matches a whole segment, so a longer word is not a child', () => {
    // The trap a bare startsWith would fall into.
    expect(routeIdForPath('/aboutus')).toBeNull();
    expect(routeIdForPath('/projectsomething')).toBeNull();
    // '/' is every path's prefix and must not claim any of them.
    expect(routeIdForPath('/nowhere')).toBeNull();
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

  it('captions the pill from the camera, not from the URL', () => {
    expect(coordLabel(null)).toBe('camera');
    expect(coordLabel(cameras.hello)).toBe('camera');
    expect(coordLabel(cameras.projectDetail)).toBe('held');
  });

  it('holds the camera on the detail route', () => {
    pathname.current = DETAIL_PATH;
    render(
      <SceneContext.Provider
        value={{ camera: cameras.projectDetail, setCamera: vi.fn() }}
      >
        <ChromeRoot />
      </SceneContext.Provider>,
    );
    // The camera is frozen there, so the caption says so rather than
    // leaving an unchanging coordinate under the word CAMERA.
    expect(screen.getByText('held')).toBeVisible();
    // ...and the rail still reads projects, because that is the section
    // the page is in. The bead is on the notch, not stranded below it.
    expect(rail(/projects/)).toHaveAttribute('aria-current', 'true');
    expect(rail(/hello/)).toHaveAttribute('aria-current', 'false');
    expect(rail(/about/)).toHaveAttribute('aria-current', 'false');
  });

  it('drives the router from the rail', async () => {
    render(<ChromeRoot />);
    await userEvent.click(rail(/projects/));
    expect(push).toHaveBeenCalledWith('/projects');
  });
});

/*
 * B1. The pill is a readout of the map, so what it reads has to be what
 * the map was driven to -- which is the camera a route DECLARED put
 * through scene/SceneRoot's three transforms, not the declaration itself.
 */
describe('the coordinate pill reads the driven camera', () => {
  const pill = (): string =>
    screen.getByText(/-?\d+\.\d{3}, -?\d+\.\d{3}/).textContent ?? '';

  const chrome = (
    camera: (typeof cameras)[keyof typeof cameras] | null,
    hover: AnchorId | null = null,
  ) =>
    render(
      <SceneContext.Provider
        value={{
          camera,
          hover,
          setCamera: vi.fn(),
          setHover: vi.fn(),
        }}
      >
        <ChromeRoot />
      </SceneContext.Provider>,
    );

  it('is the composition SceneRoot drives the map with, in its order', () => {
    // Not "a camera like the scene's": the same three functions, applied
    // to the same four inputs, in the order scene/SceneRoot applies them.
    for (const isMobile of [false, true]) {
      for (const hover of [null, 'portland'] as const) {
        expect(
          liveCamera('/about', cameras.about, isMobile, hover),
        ).toEqual(
          cameraForHover(
            forViewport(
              resolveCamera('/about', cameras.about),
              'about',
              isMobile,
            ),
            hover,
          ),
        );
      }
    }
  });

  it('follows a hovered row, which moves the map two degrees', () => {
    pathname.current = '/projects';
    chrome(cameras.projects, 'portland');

    // The measurement: for as long as a pointer rests on a project row the
    // pill used to read the untouched centre -- to three decimals, which
    // is a claim of about a hundred metres -- while the map sat half a
    // degree of latitude and near two of longitude away.
    expect(pill()).toBe('39.522, -99.974');
    expect(pill()).not.toBe('39.000, -98.000');
  });

  it('does not show the previous route while the next one is flying', () => {
    // SceneRoot's effect runs before the page's, so on every navigation
    // the raw context value is briefly the route the visitor just left.
    // resolveCamera is what tells a refinement from a leftover, and the
    // scene has always applied it; the readout had not.
    pathname.current = '/about';
    chrome(cameras.projects);

    expect(pill()).toBe('45.512, -122.658');
  });

  it('still answers before any route has declared a camera', () => {
    pathname.current = '/projects';
    chrome(null);
    expect(pill()).toBe('39.000, -98.000');
  });

  it('captions the detail route held, declared or not', () => {
    pathname.current = DETAIL_PATH;
    chrome(null);
    expect(screen.getByText('held')).toBeVisible();
  });
});

/*
 * B1. THE CHROME RENDERS WHEN WHAT IT SHOWS CHANGES, AND NOT OTHERWISE.
 *
 * The globe walks its centre meridian by setCenter every animation frame,
 * and setCenter is jumpTo, and jumpTo fires `move`. The live centre used
 * to be ChromeRoot's own state, set from that event with a freshly
 * allocated pair, so the whole chrome -- rail, altimeter, eye, mouth --
 * was rendered again at the display's refresh rate for the life of the
 * tab. e2e/hermetic/chrome-churn.spec.ts measures that end to end against
 * the real library; this measures the two gates that bound it, with the
 * camera feed driven by hand.
 *
 * Renders are counted through React's own Profiler rather than by
 * counting DOM writes: a component that renders to identical output
 * writes nothing, so the DOM cannot see the storm this is about.
 */
describe('the live coordinate pill', () => {
  /** One animation frame, which is a 16ms timer in jsdom. */
  const tick = async (): Promise<void> => {
    await act(async () => {
      await new Promise((done) => {
        requestAnimationFrame(() => done(null));
      });
    });
  };

  const counted = (node: ReactNode) => {
    const renders = { count: 0 };
    const view = render(
      <Profiler
        id="pill"
        onRender={() => {
          renders.count += 1;
        }}
      >
        {node}
      </Profiler>,
    );
    return { ...view, renders };
  };

  const readout = (): string =>
    screen.getByTestId('coord-readout').textContent ?? '';

  beforeEach(() => {
    camera.reset();
  });

  it('prints the fallback until the map says otherwise', () => {
    counted(
      <LiveCoordPill fallback={[-122.7, 45.5]} label="camera" />,
    );
    expect(readout()).toBe('45.500, -122.700');
    // And it did subscribe: a pill that never listens reads the table
    // for ever, which is the bug the live feed exists to fix.
    expect(camera.listeners.size).toBe(1);
  });

  it('commits on a frame rather than on an event', async () => {
    const { renders } = counted(
      <LiveCoordPill fallback={[-122.7, 45.5]} label="camera" />,
    );
    const mounted = renders.count;

    // Three moves inside one frame, which is an ordinary drag: a
    // high-polling pointer delivers them faster than the screen paints.
    camera.emit([-100, 10]);
    camera.emit([-101, 11]);
    camera.emit([-102, 12]);
    expect(renders.count, 'an event rendered the pill').toBe(mounted);

    await tick();
    // One render, carrying the NEWEST value: bounding the rate must not
    // cost the visitor the up-to-date reading.
    expect(renders.count).toBe(mounted + 1);
    expect(readout()).toBe('12.000, -102.000');
  });

  it('does not render for a move it would print identically', async () => {
    const { renders } = counted(
      <LiveCoordPill fallback={[-122.7, 45.5]} label="camera" />,
    );
    camera.emit([-122.7, 45.5]);
    await tick();
    const shown = renders.count;
    expect(readout()).toBe('45.500, -122.700');

    /*
     * A pan of four ten-thousandths of a degree. It is a real move and
     * the transform really changed -- it is about forty metres -- but
     * the pill carries three decimals, so there is nothing to redraw.
     * This is the gate that makes a slow drag, the last frames of an
     * ease and the held detail route cost nothing.
     */
    camera.emit([-122.7004, 45.5004]);
    await tick();
    expect(renders.count, 'the chrome rendered the same text').toBe(
      shown,
    );
    expect(readout()).toBe('45.500, -122.700');

    // ...and a move that DOES change the text still gets through.
    camera.emit([-122.699, 45.501]);
    await tick();
    expect(renders.count).toBe(shown + 1);
    expect(readout()).toBe('45.501, -122.699');
  });

  it('lets go of the map and of its pending frame', async () => {
    const { unmount } = counted(
      <LiveCoordPill fallback={[-122.7, 45.5]} label="camera" />,
    );
    // A move with its commit still queued, and then the component goes.
    camera.emit([-100, 10]);
    unmount();
    expect(camera.stops).toBe(1);
    expect(camera.listeners.size).toBe(0);
    // The queued frame must not arrive at an unmounted component.
    await tick();
  });
});
