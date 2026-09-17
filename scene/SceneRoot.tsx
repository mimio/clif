import { useEffect, useRef } from 'react';
import { useScene } from 'scene/MapProvider';
import { applyCamera, ensureMap } from 'scene/mapbox/instance';
import { cn } from 'utils/cn';

/*
 * The globe. One instance, mounted once in pages/_app.tsx behind everything
 * else at z-index 0, and never unmounted -- that is the whole point of the
 * rewrite. Route changes move the camera; they do not rebuild the map.
 *
 * Without a Mapbox token this renders an empty, correctly sized container and
 * the rest of the app carries on. That is the path `pnpm dev` takes with no
 * .env.local, and the path unit tests take.
 */
export type SceneRootProps = {
  className?: string;
};

export const SceneRoot = ({ className }: SceneRootProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { camera } = useScene();

  useEffect(() => {
    void ensureMap(containerRef.current).then(() =>
      applyCamera(camera),
    );
  }, [camera]);

  return (
    <div
      aria-hidden="true"
      className={cn('clif-scene', className)}
      data-testid="scene-root"
      ref={containerRef}
    />
  );
};

export default SceneRoot;
