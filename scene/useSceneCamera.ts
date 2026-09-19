import { useEffect } from 'react';
import type { CameraSpec } from 'content/cameras';
import { useScene } from 'scene/MapProvider';

/*
 * A route's one statement about the scene. Call it once per page with a
 * stable spec -- memoise anything derived, or the effect will run every
 * render -- and the scene eases there over SCENE_MOVE_MS. Passing null leaves
 * the camera wherever it is, which is what /404 wants after a deep link.
 */
export const useSceneCamera = (spec: CameraSpec | null): void => {
  const { setCamera } = useScene();

  useEffect(() => {
    setCamera(spec);
  }, [setCamera, spec]);
};

export default useSceneCamera;
