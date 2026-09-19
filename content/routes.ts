/*
 * The three top-level routes. The third one is `about`: the old site called
 * it `history`, the design prototypes label it `about`, and the design
 * inventory records that the id was never renamed to match. It is renamed
 * here, and /history 308s to /about in next.config.ts.
 *
 * ITS LABEL IS `about me`, AND ONLY ITS LABEL. The word on the page, the
 * altimeter's tab, the <title> and the unfurl all read `about me`; the id,
 * the path and the scene are still `about`. That split is on purpose --
 * the id is the key of a camera table, a SceneId, a data-scene attribute
 * and a layer set, and none of those are things a visitor reads, so
 * renaming them would be churn with a redirect at the end of it. Anything
 * a visitor DOES read comes from `label` below, which is why it is the one
 * string that changed.
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
  { id: ABOUT, path: '/about', label: 'about me' },
];

export const routeIds: RouteId[] = routes.map((route) => route.id);

export const projectPath = (projectId: string): string =>
  `/projects/${projectId}`;
