import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { AnchorId } from 'content/anchors';
import type { CameraSpec } from 'content/cameras';

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
 * Both hover fields are optional, so a consumer can still build a context
 * value out of `{ camera, setCamera }` alone.
 */
export type SceneContextValue = {
  /** The camera the current route asked for; null before any route has. */
  camera: CameraSpec | null;
  setCamera: (spec: CameraSpec | null) => void;
  /** The anchor city a hovered project is nudging the camera toward. */
  hover?: AnchorId | null;
  setHover?: (anchor: AnchorId | null) => void;
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

export type MapProviderProps = {
  children?: ReactNode;
};

export const MapProvider = ({ children }: MapProviderProps) => {
  const [camera, setCamera] = useState<CameraSpec | null>(null);
  const [hover, setHoverState] = useState<AnchorId | null>(null);

  // Stable, because the map's own interaction handlers are registered
  // once per layer set and close over it.
  const setHover = useCallback((anchor: AnchorId | null) => {
    setHoverState(anchor);
  }, []);

  const value = useMemo(
    () => ({ camera, setCamera, hover, setHover }),
    [camera, hover, setHover],
  );

  return (
    <SceneContext.Provider value={value}>
      {children}
    </SceneContext.Provider>
  );
};

export default MapProvider;
