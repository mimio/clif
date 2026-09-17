import { useRouter } from 'next/router';
import Altimeter from 'components/chrome/Altimeter';
import ContactMouth from 'components/chrome/ContactMouth';
import CoordPill from 'components/chrome/CoordPill';
import ThemeEye from 'components/chrome/ThemeEye';
import { cameras } from 'content/cameras';
import {
  ABOUT,
  HELLO,
  PROJECTS,
  routes,
  type RouteId,
} from 'content/routes';
import { useScene } from 'scene/MapProvider';
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

export const ChromeRoot = ({ className }: ChromeRootProps) => {
  const { pathname, push } = useRouter();
  const { camera } = useScene();
  const active = routeIdForPath(pathname);
  // Before the first route declares a camera, the readout shows where the
  // scene starts rather than blanking.
  const { center } = camera ?? cameras.hello;
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
          label={pathname === DETAIL_PATH ? 'held' : 'camera'}
          lat={center[1]}
          lng={center[0]}
        />
      </div>
    </div>
  );
};

export default ChromeRoot;
