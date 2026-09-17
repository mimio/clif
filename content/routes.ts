/*
 * The three top-level routes. The third one is `about`: the old site called
 * it `history`, the design prototypes label it `about`, and the design
 * inventory records that the id was never renamed to match. It is renamed
 * here, and /history 308s to /about in next.config.ts.
 */
export const HELLO = 'hello';
export const PROJECTS = 'projects';
export const ABOUT = 'about';

export type RouteId = typeof HELLO | typeof PROJECTS | typeof ABOUT;

export type Route = {
  id: RouteId;
  path: string;
  /** Shown by the altimeter on hover, and as the page word. */
  label: string;
};

// Order is the altimeter's order, top notch first.
export const routes: Route[] = [
  { id: HELLO, path: '/', label: 'hello' },
  { id: PROJECTS, path: '/projects', label: 'projects' },
  { id: ABOUT, path: '/about', label: 'about' },
];

export const routeIds: RouteId[] = routes.map((route) => route.id);

export const projectPath = (projectId: string): string =>
  `/projects/${projectId}`;
