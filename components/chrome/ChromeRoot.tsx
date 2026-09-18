import { useRouter } from 'next/router';
import type { AnchorId } from 'content/anchors';
import type { CameraSpec } from 'content/cameras';
import Altimeter from 'components/chrome/Altimeter';
import ContactMouth from 'components/chrome/ContactMouth';
import LiveCoordPill from 'components/chrome/LiveCoordPill';
import ThemeEye from 'components/chrome/ThemeEye';
import { ABOUT, routes, type RouteId } from 'content/routes';
import {
  cameraForHover,
  coordLabel,
  forViewport,
  resolveCamera,
  sceneIdForPath,
} from 'scene/camera';
import { useScene, useSceneHover } from 'scene/MapProvider';
import { useIsMobile } from 'scene/useViewport';
import { cn } from 'utils/cn';

/*
 * The chrome. Mounted once in pages/_app.page.tsx above every page, fixed at
 * z-index 40, and never unmounted: the rail and the readout are instruments,
 * and an instrument that remounts is not one.
 *
 * Layout, from the artboards (design inventory 5):
 *   desktop  altimeter top/right 48; stack bottom/right 48, gap 14
 *   mobile   altimeter top 44 right 20 at 78%, origin top right;
 *            stack bottom 28 right 20 at 86%, origin bottom right
 *
 * The scale-down is CSS (`max-tablet:`), not JS. There is no device state in
 * this app: a transform and a breakpoint do the whole job, and the chrome
 * renders identically on the server and the client.
 *
 * Board 1h is the one exception to the stack: on the mobile about route the
 * bottom sheet owns the bottom of the screen, so the coordinate pill yields
 * to it and the eye and mouth move to the upper right.
 */
const ROUTE_BY_PATH = Object.fromEntries(
  routes.map((route) => [route.path, route.id]),
) as Record<string, RouteId>;

/**
 * The sections that own a subtree, longest path first, so a nested path is
 * claimed by the deepest section that could own it rather than by whichever
 * one `routes` happens to list first. `/` is left out on purpose: it is a
 * prefix of every path in the app, and matching it here would light the
 * hello notch on every route that has no notch of its own.
 */
const NESTING_ROUTES = routes
  .filter((route) => route.path !== '/')
  .sort((a, b) => b.path.length - a.path.length);

/** Next's pathname for the project detail route. It belongs to `projects`. */
export const DETAIL_PATH = '/projects/[projectId]';

/*
 * THE RAIL MATCHES A SECTION, NOT A PAGE.
 *
 * This was an exact lookup, so `/projects/[projectId]` -- the pathname Next
 * hands the router on every project page -- resolved to null and the rail
 * showed no active tab at all on the one route that is most obviously
 * inside a section. A detail page IS the projects section, so it reads as
 * projects, at rest, the way the rail does on /projects itself.
 *
 * The match is on a SEGMENT boundary rather than a bare prefix: a section
 * owns `<path>/...` and nothing else, so a future `/aboutus` cannot be
 * captured by `/about`. An exact hit still wins first, which keeps the
 * three top-level paths a one-lookup answer and keeps `/` from being
 * treated as a nesting parent.
 *
 * Nothing else owns a subtree today, so in practice this is `/projects`;
 * it is written off `routes` rather than off DETAIL_PATH so that the next
 * nested route needs no edit here.
 */
export const routeIdForPath = (pathname: string): RouteId | null => {
  const exact = ROUTE_BY_PATH[pathname];
  if (exact !== undefined) return exact;
  const owner = NESTING_ROUTES.find((route) =>
    pathname.startsWith(`${route.path}/`),
  );
  return owner?.id ?? null;
};

/*
 * WHAT WENT WITH IT: `indicatorForPath` and DETAIL_INDICATOR = 0.62.
 *
 * The chrome used to pin the detail route's bead at 0.62 -- just below the
 * projects notch -- and that is a real frame from artboard 1d. But it is a
 * frame of a TRANSITION, not a resting state: Altimeter.d.ts documents
 * `indicator` as "0-1 override for the mid-travel state; suppresses the
 * active tab while the indicator moves", the component's prompt says "while
 * the indicator travels there is no active tab and every label sits at
 * muted grey", and board 1i labels its own indicator specimen "mid-travel
 * -- 45%". Freezing it made the suppression permanent, which is exactly the
 * missing active tab above.
 *
 * So the detail route hands the rail an `active` and no indicator, and
 * ChromeRoot has no caller for a mid-travel override. The PROP stays --
 * it is the component's, the specimens drive it, and whatever animates the
 * bead between notches one day will want it -- but the two chrome-side
 * helpers had nothing left to do and are gone rather than left dead.
 */

const PATH_BY_ROUTE = Object.fromEntries(
  routes.map((route) => [route.id, route.path]),
) as Record<RouteId, string>;

export const pathForRoute = (id: RouteId): string =>
  PATH_BY_ROUTE[id];

export type ChromeRootProps = {
  className?: string;
};

/*
 * THE READOUT IS OF THE MAP, NOT OF THE ROUTE.
 *
 * What a page declares through useSceneCamera is a request. What the globe
 * is actually pointed at is that request put through three transforms, in
 * scene/SceneRoot's own order:
 *
 *   resolveCamera   drops a declared camera that is the PREVIOUS route's
 *                   left over -- SceneRoot's effect runs before the page's,
 *                   so mid-navigation the raw context value is stale.
 *   forViewport     the mobile cameras. Below 650px /about is zoom 10.2 and
 *                   pitch 55, not the desktop entry.
 *   cameraForHover  the 8% nudge toward a hovered project's city. Resting a
 *                   pointer on a row moved the map ~2 degrees of longitude
 *                   while the pill went on reading the untouched centre --
 *                   at three decimals, which is a claim of ~100m.
 *
 * There is a fourth, frameCamera, and it is left out on purpose: it
 * resolves the globe's frame into a zoom and a padding and MOVES NOTHING
 * ELSE. The readout is of the centre, which a frame never touches, so
 * applying it here would cost a live viewport read and change nothing.
 *
 * They are pure functions of (pathname, declared, viewport, hover), which
 * is the whole reason the chrome can apply them: this derives the same
 * value from the same inputs rather than keeping a second copy of it.
 *
 * WHAT IT CANNOT SEE is the map. This is where the camera is GOING, and
 * it is exact only when the globe is standing still at the end of a
 * flight. Two things move the transform underneath it, and one of them
 * has no bound at all:
 *
 *   THE FLIGHT   applyCamera hands mapbox an easeTo of 800-900ms, so for
 *                the length of every move a derived readout is already
 *                at the destination while the globe is still on its way.
 *                Interpolating the ease here would be a second
 *                implementation of it, wrong in a new way, since easeTo
 *                does not move lng/lat linearly.
 *   THE SPIN     and this is the one that made the readout a lie. The
 *                rotation used to roll the BEARING, which nothing in the
 *                chrome reads, so a derived centre stayed correct on a
 *                spinning route. It walks the CENTRE MERIDIAN now, 1.5
 *                degrees a second on / and on the 404 -- so the map's
 *                real centre leaves the table's -122.700 immediately and
 *                is a hundred and eighty degrees away two minutes later,
 *                while the pill goes on printing the table.
 *
 * So the pill subscribes to `watchCamera` -- in LiveCoordPill, which is
 * the only component in the chrome that displays a centre -- and prefers
 * the live transform. This function stays, and is still load-bearing
 * twice over:
 * as the FALLBACK for every case with no map to read -- no token, the
 * fallback plate, unit tests, the server render -- and as the
 * DESTINATION, which is what `coordLabel` is asked about, because
 * whether the camera is the visitor's is a property of the route rather
 * than of the transform.
 */
export const liveCamera = (
  pathname: string,
  declared: CameraSpec | null,
  isMobile: boolean,
  hover: AnchorId | null,
): CameraSpec =>
  cameraForHover(
    forViewport(
      // Before any route has declared one, resolveCamera still answers:
      // the pathname's own table entry, which is where the scene is going.
      resolveCamera(pathname, declared),
      sceneIdForPath(pathname),
      isMobile,
    ),
    hover,
  );

export const ChromeRoot = ({ className }: ChromeRootProps) => {
  const { pathname, push } = useRouter();
  const { camera: declared } = useScene();
  const { hover } = useSceneHover();
  const isMobile = useIsMobile();
  const active = routeIdForPath(pathname);

  const camera = liveCamera(pathname, declared, isMobile, hover);
  /*
   * THE READOUT TRACKS THE GLOBE; THE CAPTION DESCRIBES THE ROUTE.
   *
   * Reading the transform also changes what the pill does during a
   * flight, and the new behaviour is the better one: it used to snap to
   * the destination on the frame the route changed and lead the globe
   * for the whole 800ms, and it now walks with it and arrives when it
   * does. A readout of an instrument should say where the instrument is.
   * The old behaviour was not a decision anybody made -- it was what
   * deriving the value happened to produce -- and the one argument for
   * it, that the number stops sooner, is an argument for a readout that
   * is wrong for most of a second.
   *
   * The caption does NOT follow the transform, and must not: `held` on
   * the detail route is a statement about whose camera it is, which
   * `spec.interactive` answers and a centre cannot. So coordLabel is
   * asked about the declared camera either way.
   *
   * WHAT MOVED, AND WHY IT HAD TO. The live centre used to be held HERE,
   * in ChromeRoot's own state. A rotating globe sets it once per
   * animation frame -- `setCenter` is `jumpTo`, and `jumpTo` fires
   * `move` -- so the rail, the altimeter, the eye and the mouth were all
   * rendered again at the display's refresh rate, for the life of the
   * tab, to show values none of them had been handed. The subscription
   * lives in LiveCoordPill now, which is the only thing in the chrome
   * that displays a centre; its header holds the two gates that bound
   * the rate inside that boundary. The DECISION above is unchanged --
   * the pill still tracks the globe through a flight -- and this
   * component is once again a function of the route, the viewport and
   * the hover alone.
   */
  const sheeted = active === ABOUT;

  return (
    <div
      className={cn(
        'pointer-events-none fixed inset-0 z-40',
        className,
      )}
    >
      <Altimeter
        active={active}
        className="pointer-events-auto absolute top-[48px] right-[48px] origin-top-right max-tablet:top-[44px] max-tablet:right-[20px] max-tablet:scale-[.78]"
        onNavigate={(id) => {
          void push(pathForRoute(id));
        }}
      />
      <div
        className={cn(
          'pointer-events-auto absolute right-[48px] z-[6] flex flex-col items-end gap-[14px] max-tablet:right-[20px] max-tablet:scale-[.86] max-tablet:gap-[12px]',
          sheeted
            ? 'bottom-[48px] origin-bottom-right max-tablet:top-[172px] max-tablet:bottom-auto max-tablet:origin-top-right'
            : 'bottom-[48px] origin-bottom-right max-tablet:bottom-[28px]',
        )}
      >
        <ThemeEye />
        <ContactMouth />
        <LiveCoordPill
          className={cn(sheeted && 'max-tablet:hidden')}
          fallback={camera.center}
          label={coordLabel(camera)}
        />
      </div>
    </div>
  );
};

export default ChromeRoot;
