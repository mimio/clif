import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { AnchorId } from 'content/anchors';
import type { CameraSpec } from 'content/cameras';
import {
  DEFAULT_VIEW,
  mergeView,
  sameView,
  type SceneView,
  type SceneViewPatch,
} from 'scene/view';

/*
 * One camera, shared by the whole tree.
 *
 * Pages declare the camera they want through useSceneCamera(); SceneRoot
 * drives the map toward it; the chrome reads it to show where the camera is.
 * Nothing here touches mapbox-gl: the provider is a plain piece of state, so
 * every consumer of it is testable without a GL context.
 *
 * `hover` is the second, smaller channel: the anchor city a hovered project
 * is lighting. It runs both ways -- a project table sets it, and the map's
 * own site points set it when the pointer is on the globe rather than on
 * the table -- which is why it lives here and inside neither one.
 *
 * `view` is the third: everything a route declares about the scene that is
 * not where the camera is -- see scene/view.ts.
 *
 * `stopRequest` is the fourth, and it is the only one that runs UPWARDS
 * only. The other three are things the page tells the scene; this is the
 * scene telling the page that somebody clicked a work-history stop on the
 * map. It cannot be a piece of scene state like `hover`, because the
 * selected stop is not state the scene owns: it lives in the URL, so the
 * only thing the map can do is ask, and the route answers by navigating.
 *
 * SO IT IS A MAILBOX, not a value. The route reads the request, turns it
 * into a push, and posts null back. That round trip is what makes a
 * second click on the SAME stop work -- a plain `selected` value would
 * already equal that stop and the route would have nothing to react to --
 * and it is why the field can be read without the route having to
 * remember which requests it has already served.
 *
 * Every field but `camera` is optional, so a consumer can still build a
 * context value out of `{ camera, setCamera }` alone.
 */
export type SceneContextValue = {
  /** The camera the current route asked for; null before any route has. */
  camera: CameraSpec | null;
  setCamera: (spec: CameraSpec | null) => void;
  /** The anchor city a hovered project is nudging the camera toward. */
  hover?: AnchorId | null;
  setHover?: (anchor: AnchorId | null) => void;
  /** What the current route says about the scene besides the camera. */
  view?: SceneView;
  setView?: (view: SceneView) => void;
  /** The history stop a map click is asking for, by id, or null for none. */
  stopRequest?: number | null;
  requestStop?: (id: number | null) => void;
};

const noop = (): void => {};

export const SceneContext = createContext<SceneContextValue>({
  camera: null,
  setCamera: noop,
});

export const useScene = (): SceneContextValue =>
  useContext(SceneContext);

export type SceneHover = {
  hover: AnchorId | null;
  setHover: (anchor: AnchorId | null) => void;
};

/**
 * The hover channel, with the outside-a-provider case resolved. Hovering
 * without a provider is a no-op rather than a crash: a project table is
 * rendered on its own in the specimen harness and in its unit tests.
 */
export const useSceneHover = (): SceneHover => {
  const { hover, setHover } = useScene();
  return { hover: hover ?? null, setHover: setHover ?? noop };
};

/** The live scene view, with the outside-a-provider case resolved. */
export const useSceneViewValue = (): SceneView =>
  useScene().view ?? DEFAULT_VIEW;

export type StopRequest = {
  stopRequest: number | null;
  requestStop: (id: number | null) => void;
};

/**
 * The map's request channel, with the outside-a-provider case resolved.
 *
 * Asking without a provider is a no-op rather than a crash, for the
 * reason useSceneHover gives: the about page is rendered on its own in
 * the specimen harness and in its unit tests, where there is no scene to
 * be clicked and nothing to answer.
 */
export const useStopRequest = (): StopRequest => {
  const { stopRequest, requestStop } = useScene();
  return {
    stopRequest: stopRequest ?? null,
    requestStop: requestStop ?? noop,
  };
};

/**
 * A route's statement about the scene beyond the camera. Call it with
 * only the fields the route cares about; the rest keep their defaults,
 * and the declaration is dropped when the route unmounts.
 *
 * The patch may be an inline object: it is compared by value.
 */
export const useSceneView = (patch: SceneViewPatch): void => {
  const { setView } = useScene();
  const { labels, selectedStop } = mergeView(patch);

  useEffect(() => {
    if (!setView) return undefined;
    setView({ labels, selectedStop });
    return () => setView(DEFAULT_VIEW);
  }, [setView, labels, selectedStop]);
};

export type MapProviderProps = {
  children?: ReactNode;
};

export const MapProvider = ({ children }: MapProviderProps) => {
  const [camera, setCamera] = useState<CameraSpec | null>(null);
  const [hover, setHoverState] = useState<AnchorId | null>(null);
  const [view, setViewState] = useState<SceneView>(DEFAULT_VIEW);
  const [stopRequest, setStopRequest] = useState<number | null>(null);

  // Stable, because the map's own interaction handlers are registered
  // once per layer set and close over it.
  const setHover = useCallback((anchor: AnchorId | null) => {
    setHoverState(anchor);
  }, []);

  // Stable for the same reason, and for one more: it is a dependency of
  // SceneRoot's layer-set memo, so an identity that churned would rebuild
  // every set on every render and re-sync the map with it.
  const requestStop = useCallback((id: number | null) => {
    setStopRequest(id);
  }, []);

  // Value-compared, so a route can declare its view inline without the
  // object identity churning on every render.
  const setView = useCallback((next: SceneView) => {
    setViewState((current) =>
      sameView(current, next) ? current : next,
    );
  }, []);

  const value = useMemo(
    () => ({
      camera,
      setCamera,
      hover,
      setHover,
      view,
      setView,
      stopRequest,
      requestStop,
    }),
    [
      camera,
      hover,
      setHover,
      view,
      setView,
      stopRequest,
      requestStop,
    ],
  );

  return (
    <SceneContext.Provider value={value}>
      {children}
    </SceneContext.Provider>
  );
};

export default MapProvider;
