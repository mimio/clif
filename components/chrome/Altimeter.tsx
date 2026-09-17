import { useCallback, useEffect, useRef, useState } from 'react';
import Glyph, { type GlyphKind } from 'components/primitives/Glyph';
import { routes, type RouteId } from 'content/routes';
import { prefersReducedMotion } from 'scene/budget';
import { cn } from 'utils/cn';

/*
 * The rail. An instrument, not a menu: it never unmounts, never leaves the
 * screen, sits directly on the scene with no background plate, and reads as
 * one hairline with a single bead riding it.
 *
 * GEOMETRY IS THE PROTOTYPE'S (Altimeter.dc.html), which supersedes the
 * older spec still printed in artboard 1i's annotation column and in the
 * legacy JSX. That legacy version -- 120x152, notches at 20/76/132, a 5x20
 * square indicator on 800ms ease-in-out-cubic, a --text-faint rail and 11px
 * uppercase label tabs -- is recorded in design inventory 8 gap 6 and is
 * deliberately NOT what this file implements.
 *
 * The numbers, all in px inside a 120x120 box:
 *
 *   rail    right:0, top:8.5, bottom:7.5, 1px wide, --accent2-line.
 *           Notch centrelines fall on N+0.5, so the rail runs exactly
 *           12.0px above the first notch and 12.0px below the last.
 *   ticks   three 10x1 marks, --accent2-line, at top 20 / 60 / 100 --
 *           evenly spaced, 40px centre to centre. Both the rail and the
 *           ticks are literally 1px and never thicken.
 *   bead    7x21 with fully rounded caps, --clif-accent, at right:-3 so it
 *           straddles the hairline (centre 119.5 = the rail's own centre)
 *           and margin-top:-10 so it straddles the tick (centre N+0.5).
 *           It is pushed proud of the rail rather than widening it.
 *   dots    3px circles, --accent2-solid, fully opaque, in a zero-size
 *           wrapper pinned to the rail's centre so they scale about that
 *           point instead of snapping subpixel. 3 is the smallest odd size
 *           that straddles a 1px line symmetrically.
 *   rows    34px hit rows at right:14, label then glyph, right-aligned.
 *
 * Every element on the notch line is odd-sized for that reason: the rail is
 * 1px so its centre is at x.5, and only an odd size can sit symmetrically
 * across it.
 */
export const ALTIMETER_SIZE = 120;
export const ALTIMETER_NOTCHES = [20, 60, 100];

export const RAIL_TOP = 8.5;
export const RAIL_BOTTOM = 7.5;
export const TICK_LENGTH = 10;

export const BEAD_WIDTH = 7;
export const BEAD_HEIGHT = 21;
export const DOT_SIZE = 3;

/** A hovered dot grows to exactly the bead's width, still a circle. */
export const DOT_HOVER_SCALE = BEAD_WIDTH / DOT_SIZE;

export const TRAVEL_MS = 340;
export const TRAVEL_EASE = 'cubic-bezier(.22,1,.36,1)';
export const JIGGLE_MS = 460;
export const JIGGLE_EASE = 'cubic-bezier(.3,.1,.3,1)';

/** Every rail on the page shows the same route, so a click moves all of them. */
export const ROUTE_EVENT = 'oneglobe:route';

/*
 * The bead necks and elongates ALONG its travel, then lands at its own size.
 * transform-origin is the centre, so the stretch is symmetric and the bead
 * can never squash toward either end of the rail. The duration equals the
 * travel duration, so the elongation resolves exactly on arrival.
 */
export const BEAD_STRETCH: Keyframe[] = [
  { offset: 0, transform: 'scale(1,1)' },
  { offset: 0.3, transform: 'scale(.5,1.9)' },
  { offset: 1, transform: 'scale(1,1)' },
];

/*
 * Re-selecting the live notch goes nowhere, so the bead acknowledges in
 * place: a damped bounce that travels EQUALLY up and down -- +-5, +-2.5,
 * +-1 -- with the width playing thin at each extreme.
 */
export const BEAD_JIGGLE: Keyframe[] = [
  { offset: 0, transform: 'translateY(0) scale(1,1)' },
  { offset: 0.14, transform: 'translateY(-5px) scale(.78,1.28)' },
  { offset: 0.32, transform: 'translateY(5px) scale(.78,1.28)' },
  { offset: 0.5, transform: 'translateY(-2.5px) scale(.88,1.12)' },
  { offset: 0.68, transform: 'translateY(2.5px) scale(.88,1.12)' },
  { offset: 0.84, transform: 'translateY(-1px) scale(.96,1.04)' },
  { offset: 0.92, transform: 'translateY(1px) scale(.96,1.04)' },
  { offset: 1, transform: 'translateY(0) scale(1,1)' },
];

// The home route is called `hello`; its glyph is still the house.
const ROUTE_GLYPHS: Record<RouteId, GlyphKind> = {
  hello: 'home',
  projects: 'projects',
  about: 'about',
};

/**
 * Replays a keyframe list on the bead, cancelling whatever was running.
 *
 * The element that owns `top` is a different, never-remounted node, so the
 * position keeps interpolating while this replays and the bead cannot jump.
 * Returns null when there is nothing to animate -- no element, no Web
 * Animations (jsdom), or the visitor asked for less motion.
 *
 * THE ORDER OF THOSE THREE GUARDS IS LOAD-BEARING. The Web Animations check
 * comes first because it is also the "is there a browser here" check:
 * prefersReducedMotion reads window.matchMedia, which jsdom does not
 * implement, so asking the preference first would throw in every unit test
 * that renders the rail rather than quietly declining to animate. The
 * reduced-motion read is the scene's own (scene/budget.ts) -- the same
 * function scene/useViewport.ts subscribes to, so the rail and the globe
 * cannot end up disagreeing about what the visitor asked for.
 */
export const playBead = (
  element: HTMLElement | null,
  keyframes: Keyframe[],
  duration: number,
  easing: string,
  running: Animation | null,
): Animation | null => {
  running?.cancel();
  if (element === null || typeof element.animate !== 'function') {
    return null;
  }
  if (prefersReducedMotion()) return null;
  return element.animate(keyframes, {
    duration,
    easing,
    fill: 'none',
  });
};

export type DotTiming = {
  scale: number;
  opacity: number;
  /** transform, then opacity. */
  duration: string;
  delay: string;
};

/*
 * The hand-off. Every dot's scale and opacity are keyed off the SAME route
 * state as the bead's `top`, so all of them commit on one frame and the
 * sequencing is pure transition-delay against the bead's 340ms travel --
 * never a wall-clock timer that could fire before React committed.
 *
 *   on       the notch the bead is arriving at: collapses from under it,
 *            40ms in, over 140ms -- gone well before the bead's nose lands.
 *   vacated  the notch the bead just left: reopens 140ms in, once the bead
 *            has cleared it, over 200ms.
 *   neither  hover. No choreography at all: zero delay and 160ms on a
 *            fast-out curve, because an idle dot that waits before growing
 *            reads as unresponsive.
 *
 * The dot keeps --accent2-solid in every one of those states. Growing to
 * the bead's width previews where the bead would land; taking the bead's
 * colour as well would claim it already had.
 */
export const dotTiming = (
  on: boolean,
  hot: boolean,
  vacated: boolean,
): DotTiming => ({
  scale: on ? 0 : hot ? DOT_HOVER_SCALE : 1,
  opacity: on ? 0 : 1,
  duration: on
    ? '140ms, 140ms'
    : vacated
      ? '200ms, 200ms'
      : '160ms, 200ms',
  delay: on ? '40ms, 40ms' : vacated ? '140ms, 140ms' : '0ms, 0ms',
});

export type AltimeterProps = {
  active?: RouteId | null;
  /** 0-1 along the rail. Wins over `active` when set. */
  indicator?: number | null;
  onNavigate?: (route: RouteId) => void;
  className?: string;
};

export const beadPosition = (
  active: RouteId | null,
  indicator: number | null,
): number => {
  if (indicator !== null) {
    return (
      ALTIMETER_NOTCHES[0] +
      indicator * (ALTIMETER_NOTCHES[2] - ALTIMETER_NOTCHES[0])
    );
  }
  const index = routes.findIndex((route) => route.id === active);
  return ALTIMETER_NOTCHES[Math.max(index, 0)];
};

type Nav = { route: RouteId | null; prev: RouteId | null };

export const Altimeter = ({
  active = null,
  indicator = null,
  onNavigate,
  className,
}: AltimeterProps) => {
  // The rail owns the live route. `active` seeds it and, when the router
  // moves it afterwards, announces on the bus like any other move -- so
  // there is one authority here and `prev` is never lost to a prop change.
  const [nav, setNav] = useState<Nav>({ route: active, prev: null });
  const [hover, setHover] = useState<RouteId | null>(null);
  const beadRef = useRef<HTMLSpanElement>(null);
  const runningRef = useRef<Animation | null>(null);

  // Identity, so this instance can ignore the move it announced itself.
  const tokenRef = useRef<object>({});
  // The route the bead was last seen at. `undefined` means "not yet
  // mounted", which is the one route change that is not a move.
  const lastRef = useRef<RouteId | null | undefined>(undefined);

  const current = nav.route;

  /*
   * The one commit. `prev` is written beside `route`, so the bead's top and
   * every dot's timing change on the same frame; re-asking for the notch the
   * rail is already on is a no-op that React bails out of.
   */
  const travel = useCallback((to: RouteId) => {
    setNav((was) =>
      was.route === to ? was : { route: to, prev: was.route },
    );
  }, []);

  /*
   * One place plays the stretch: whenever the resolved route changes, from
   * whichever authority -- a click here, another rail's event, or the
   * router. The element that owns `top` never remounts, so the position goes
   * on interpolating while this replays and the bead cannot jump.
   */
  useEffect(() => {
    const was = lastRef.current;
    lastRef.current = current;
    if (was === undefined || was === current) return;
    runningRef.current = playBead(
      beadRef.current,
      BEAD_STRETCH,
      TRAVEL_MS,
      TRAVEL_EASE,
      runningRef.current,
    );
  }, [current]);

  useEffect(() => {
    const onRoute = (event: Event) => {
      const { detail } = event as CustomEvent<{
        route: RouteId;
        from: unknown;
      }>;
      if (!detail || detail.from === tokenRef.current) return;
      travel(detail.route);
    };
    window.addEventListener(ROUTE_EVENT, onRoute);
    return () => window.removeEventListener(ROUTE_EVENT, onRoute);
  }, [travel]);

  /*
   * The router is the other authority on the live route. When it moves --
   * a back button, a link in the page -- the rail announces on the same bus
   * a click uses, so every rail on the page follows rather than only the one
   * that happens to be wired to the router. Mount is not a move: a board of
   * specimen rails each showing a different route must not shout each other
   * down the moment it renders.
   */
  const seenRef = useRef<RouteId | null | undefined>(undefined);
  useEffect(() => {
    const was = seenRef.current;
    seenRef.current = active;
    if (was === undefined || was === active || active === null)
      return;
    window.dispatchEvent(
      new CustomEvent(ROUTE_EVENT, { detail: { route: active } }),
    );
  }, [active]);

  const go = (route: RouteId) => {
    if (route === current) {
      // Already here: acknowledge, go nowhere. No state change, no event.
      runningRef.current = playBead(
        beadRef.current,
        BEAD_JIGGLE,
        JIGGLE_MS,
        JIGGLE_EASE,
        runningRef.current,
      );
      return;
    }
    travel(route);
    window.dispatchEvent(
      new CustomEvent(ROUTE_EVENT, {
        detail: { route, from: tokenRef.current },
      }),
    );
    onNavigate?.(route);
  };

  const travelling = indicator !== null;

  return (
    <nav
      aria-label="Sections"
      className={cn('relative font-mono select-none', className)}
      style={{ width: ALTIMETER_SIZE, height: ALTIMETER_SIZE }}
    >
      <span
        aria-hidden="true"
        className="absolute right-0 w-px bg-accent2-line"
        style={{ top: RAIL_TOP, bottom: RAIL_BOTTOM }}
      />

      <span
        aria-hidden="true"
        className="absolute right-[-3px] z-[3] transition-[top] ease-[cubic-bezier(.22,1,.36,1)] motion-reduce:transition-none"
        style={{
          top: beadPosition(current, indicator),
          width: BEAD_WIDTH,
          height: BEAD_HEIGHT,
          marginTop: -(BEAD_HEIGHT - 1) / 2,
          transitionDuration: `${TRAVEL_MS}ms`,
        }}
      >
        <span
          className="absolute inset-0 origin-center rounded-full bg-accent"
          ref={beadRef}
        />
      </span>

      {routes.map((route, index) => {
        const notch = ALTIMETER_NOTCHES[index];
        const on = !travelling && current === route.id;
        const hot = hover === route.id;
        const vacated = route.id === nav.prev && nav.prev !== current;
        const dot = dotTiming(on, hot, vacated);

        return (
          <span key={route.id}>
            <span
              aria-hidden="true"
              className="absolute right-0 h-px bg-accent2-line"
              style={{ top: notch, width: TICK_LENGTH }}
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute right-[0.5px] z-[2] h-0 w-0"
              style={{ top: notch }}
            >
              <span
                className="absolute origin-center rounded-full bg-accent2-solid transition-[transform,opacity] motion-reduce:transition-none"
                style={{
                  // The wrapper's right edge already sits on the rail's
                  // centre line, so x is a plain half-width back; y has to
                  // clear the extra half pixel to the tick's centre.
                  left: -DOT_SIZE / 2,
                  top: 0.5 - DOT_SIZE / 2,
                  width: DOT_SIZE,
                  height: DOT_SIZE,
                  opacity: dot.opacity,
                  transform: `scale(${dot.scale})`,
                  transitionDuration: dot.duration,
                  transitionDelay: dot.delay,
                  transitionTimingFunction:
                    'cubic-bezier(.16,1,.3,1), ease-out',
                }}
              />
            </span>
            <button
              aria-current={on}
              className="absolute right-[14px] flex h-[34px] cursor-pointer items-center justify-end gap-[6px] select-none"
              data-route={route.id}
              onBlur={() => setHover(null)}
              onClick={() => go(route.id)}
              onFocus={() => setHover(route.id)}
              onMouseEnter={() => setHover(route.id)}
              onMouseLeave={() => setHover(null)}
              style={{
                top: notch,
                marginTop: -17,
                zIndex: hot ? 4 : 2,
              }}
              type="button"
            >
              <span
                className={cn(
                  'whitespace-nowrap transition-[opacity,color,transform] motion-reduce:transition-none',
                  on ? 'text-accent' : 'text-fg-2',
                )}
                style={{
                  fontSize: 'var(--type-detail-size)',
                  lineHeight: 'var(--type-detail-line)',
                  letterSpacing: '.02em',
                  opacity: hot ? 1 : 0,
                  transform: `translateX(${hot ? 0 : 8}px)`,
                  transitionDuration: '180ms, 120ms, 220ms',
                  transitionTimingFunction:
                    'ease-out, ease-out, cubic-bezier(.165,.84,.44,1)',
                }}
              >
                {route.label}
              </span>
              <span
                className="flex-none transition-[transform,opacity,filter] motion-reduce:transition-none"
                style={{
                  transform: `scale(${
                    on ? (hot ? 1 : 0.94) : hot ? 0.88 : 0.74
                  })`,
                  opacity: on || hot ? 1 : 0.42,
                  filter:
                    on || hot
                      ? 'none'
                      : 'grayscale(0.9) brightness(0.85)',
                  transitionDuration: '180ms',
                  transitionTimingFunction:
                    'cubic-bezier(.34,1.56,.64,1), ease-out, ease-out',
                }}
              >
                <Glyph kind={ROUTE_GLYPHS[route.id]} />
              </span>
            </button>
          </span>
        );
      })}
    </nav>
  );
};

export default Altimeter;
