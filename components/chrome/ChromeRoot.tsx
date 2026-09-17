import { useRouter } from 'next/router';
import type { AnchorId } from 'content/anchors';
import type { CameraSpec } from 'content/cameras';
import Altimeter from 'components/chrome/Altimeter';
import ContactMouth from 'components/chrome/ContactMouth';
import CoordPill from 'components/chrome/CoordPill';
import ThemeEye from 'components/chrome/ThemeEye';
import {
  ABOUT,
  HELLO,
  PROJECTS,
  routes,
  type RouteId,
} from 'content/routes';
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
 * The chrome. Mounted once in pages/_app.tsx above every page, fixed at
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
const ROUTE_BY_PATH: Record<string, RouteId> = {
  '/': HELLO,
  '/projects': PROJECTS,
  '/about': ABOUT,
};

/** Next's pathname for the project detail route, which has no notch. */
export const DETAIL_PATH = '/projects/[projectId]';

/**
 * The rail's active notch for a pathname, or null where the rail has no
 * notch to sit on -- the detail route, which uses an explicit indicator, and
 * /404.
 */
export const routeIdForPath = (pathname: string): RouteId | null =>
  ROUTE_BY_PATH[pathname] ?? null;

/** 1d pins the detail route's indicator below the projects notch. */
export const DETAIL_INDICATOR = 0.62;

/** The rail's position for a pathname, or null when a notch owns it. */
export const indicatorForPath = (pathname: string): number | null =>
  pathname === DETAIL_PATH ? DETAIL_INDICATOR : null;

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
 * They are pure functions of (pathname, declared, viewport, hover), which
 * is the whole reason the chrome can apply them: this derives the same
 * value from the same inputs rather than keeping a second copy of it.
 *
 * WHAT IT STILL CANNOT SEE is the flight. applyCamera hands mapbox an
 * easeTo of 800-900ms; this snaps to the destination on the frame the route
 * changes, so for the length of every move the pill is ahead of the globe.
 * Closing that needs the map's live transform, and scene/mapbox/instance.ts
 * publishes no camera-change seam (getMap() exists, but there is nothing to
 * subscribe to and no notification when the map is first created, and the
 * chrome may not reach into scene/mapbox/** anyway). Interpolating the ease
 * here would be a second implementation of the flight, wrong in a different
 * way. So the pill reads the camera's DESTINATION exactly, and the gap that
 * is left is a whole-frame one rather than a silently wrong decimal.
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
  const { center } = camera;
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
        indicator={indicatorForPath(pathname)}
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
        <CoordPill
          className={cn(sheeted && 'max-tablet:hidden')}
          label={coordLabel(camera)}
          lat={center[1]}
          lng={center[0]}
        />
      </div>
    </div>
  );
};

export default ChromeRoot;
