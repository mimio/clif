import { useRouter } from 'next/router';
import Altimeter from 'components/chrome/Altimeter';
import ContactMouth from 'components/chrome/ContactMouth';
import CoordPill from 'components/chrome/CoordPill';
import ThemeEye from 'components/chrome/ThemeEye';
import { cameras } from 'content/cameras';
import { ABOUT, HELLO, PROJECTS, type RouteId } from 'content/routes';
import { useScene } from 'scene/MapProvider';
import { cn } from 'utils/cn';

/*
 * The chrome. Mounted once in pages/_app.tsx above every page, fixed at
 * z-index 40, and never unmounted: the rail and the readout are instruments,
 * and an instrument that remounts is not one.
 *
 * Layout: the altimeter top-right, and a bottom-right stack of
 * eye / mouth / coordinate pill. On the mobile about route the pill yields to
 * the sheet and only the eye and mouth remain.
 */
const ROUTE_BY_PATH: Record<string, RouteId> = {
  '/': HELLO,
  '/projects': PROJECTS,
  '/about': ABOUT,
};

/**
 * The rail's active notch for a pathname, or null where the rail has no
 * notch to sit on -- the detail route, which uses an explicit indicator, and
 * /404.
 */
export const routeIdForPath = (pathname: string): RouteId | null =>
  ROUTE_BY_PATH[pathname] ?? null;

/** 1d pins the detail route's indicator below the projects notch. */
export const DETAIL_INDICATOR = 0.62;

export type ChromeRootProps = {
  className?: string;
};

export const ChromeRoot = ({ className }: ChromeRootProps) => {
  const { pathname } = useRouter();
  const { camera } = useScene();
  const active = routeIdForPath(pathname);
  // Before the first route declares a camera, the readout shows where the
  // scene starts rather than blanking.
  const { center } = camera ?? cameras.hello;

  return (
    <div className={cn('clif-chrome', className)}>
      <Altimeter active={active} />
      <div className="clif-chrome-stack">
        <ThemeEye />
        <ContactMouth />
        <CoordPill lat={center[1]} lng={center[0]} />
      </div>
    </div>
  );
};

export default ChromeRoot;
