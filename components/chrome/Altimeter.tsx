import Glyph, { type GlyphKind } from 'components/primitives/Glyph';
import Text from 'components/primitives/Text';
import { routes, type RouteId } from 'content/routes';
import { cn } from 'utils/cn';

/*
 * The rail. 120x120, pinned 48px from the top and right (44/20 at 78% on
 * mobile). It never unmounts and never leaves the screen.
 *
 * Geometry, from the prototype, which supersedes the older JSX/1i spec:
 *   rail   1px hairline, --accent2-line, 104px tall
 *   ticks  three 10px x 1px marks at top 20 / 60 / 100
 *   bead   7x21 fully rounded, --clif-accent, pushed 3px proud of the rail
 *          so the line itself never thickens; travels on
 *          340ms cubic-bezier(.22,1,.36,1) and necks to scale(.5,1.9) at 30%
 *   dots   3px --accent2-solid, grow to scale(2.333) on hover -- exactly the
 *          bead's width, so a hovered dot previews where the bead would land
 *
 * `indicator` overrides the active notch with a raw 0-1 position and is how
 * the detail route shows "deeper than the index" (0.62, below the projects
 * notch rather than on it). While travelling there is no active notch.
 *
 * Re-selecting the live route does not navigate: the bead jiggles and the
 * rail stays put.
 */
export const ALTIMETER_NOTCHES = [20, 60, 100];

// The home route is called `hello`; its glyph is the house.
const ROUTE_GLYPHS: Record<RouteId, GlyphKind> = {
  hello: 'home',
  projects: 'projects',
  about: 'about',
};

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
  if (indicator !== null) return 20 + indicator * 80;
  const index = routes.findIndex((route) => route.id === active);
  return ALTIMETER_NOTCHES[Math.max(index, 0)];
};

export const Altimeter = ({
  active = null,
  indicator = null,
  onNavigate,
  className,
}: AltimeterProps) => (
  <nav
    aria-label="Sections"
    className={cn('clif-altimeter', className)}
  >
    <span aria-hidden="true" className="clif-altimeter-rail" />
    <span
      aria-hidden="true"
      className="clif-altimeter-bead"
      style={{ top: beadPosition(active, indicator) }}
    />
    {routes.map((route, index) => (
      <button
        aria-current={route.id === active}
        data-route={route.id}
        key={route.id}
        onClick={() => onNavigate?.(route.id)}
        style={{ top: ALTIMETER_NOTCHES[index] }}
        type="button"
      >
        <Text variant="detail">{route.label}</Text>
        <Glyph kind={ROUTE_GLYPHS[route.id]} />
      </button>
    ))}
  </nav>
);

export default Altimeter;
