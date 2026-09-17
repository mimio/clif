import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { CameraSpec } from 'content/cameras';

/*
 * One camera, shared by the whole tree.
 *
 * Pages declare the camera they want through useSceneCamera(); SceneRoot
 * drives the map toward it; the chrome reads it to show where the camera is.
 * Nothing here touches mapbox-gl: the provider is a plain piece of state, so
 * every consumer of it is testable without a GL context.
 */
export type SceneContextValue = {
  /** The camera the current route asked for; null before any route has. */
  camera: CameraSpec | null;
  setCamera: (spec: CameraSpec | null) => void;
};

const noop = (): void => {};

export const SceneContext = createContext<SceneContextValue>({
  camera: null,
  setCamera: noop,
});

export const useScene = (): SceneContextValue =>
  useContext(SceneContext);

export type MapProviderProps = {
  children?: ReactNode;
};

export const MapProvider = ({ children }: MapProviderProps) => {
  const [camera, setCamera] = useState<CameraSpec | null>(null);
  const value = useMemo(() => ({ camera, setCamera }), [camera]);

  return (
    <SceneContext.Provider value={value}>
      {children}
    </SceneContext.Provider>
  );
};

export default MapProvider;
