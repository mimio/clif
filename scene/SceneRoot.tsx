import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import type { CameraSpec, SceneId } from 'content/cameras';
import {
  cameraForHover,
  dashRuns,
  forViewport,
  moveDurationFor,
  resolveCamera,
  sceneIdForPath,
  spinRateFor,
  terrainFor,
} from 'scene/camera';
import { layerSetsFor, WORK_PATH_DASH } from 'scene/layers/sets';
import {
  useScene,
  useSceneHover,
  useSceneViewValue,
} from 'scene/MapProvider';
import {
  applyBasemapConfig,
  applyCamera,
  applyColorTheme,
  applyFog,
  applyInteractivity,
  applyTerrain,
  ensureMap,
  getStyleStatus,
  setAnimation,
  syncLayers,
  watchStyleStatus,
} from 'scene/mapbox/instance';
import {
  type BasemapConfig,
  basemapConfig,
  configChanges,
  createThemePainter,
  livePalette,
  subscribeTheme,
} from 'scene/theme';
import { useIsMobile, useReducedMotion } from 'scene/useViewport';
import { showLabels } from 'scene/view';
import type { Palette } from 'styles/tokens/palette';
import { cn } from 'utils/cn';

/*
 * The globe. One instance, mounted once in pages/_app.tsx behind everything
 * else at z-index 0, and never unmounted -- that is the whole point of the
 * rewrite. Route changes move the camera; they do not rebuild the map.
 *
 * Everything this component does is a projection of four inputs onto the
 * map: the pathname, the camera the page declared, the live palette, and
 * the two environment reads (viewport, reduced motion). It holds no scene
 * state of its own beyond "what did I last apply", so there is no order in
 * which effects can run that leaves the map disagreeing with the route.
 *
 * Without a Mapbox token `ensureMap` resolves null, and this renders a
 * static plate built out of the same tokens the globe would have worn.
 * The foreground is untouched either way. That is the path `pnpm dev`
 * takes with no .env.local, and the path the unit tests take.
 */
export type SceneRootProps = {
  className?: string;
};

/** 'pending' until we know; the plate only shows once there is no map. */
type SceneState = 'pending' | 'live' | 'fallback';

/**
 * The static stand-in for the globe. It is not a picture of the scene --
 * it is the scene's palette, arranged as a lit sphere, so a token-less
 * build still reads as the design rather than as a hole.
 *
 * z-index -1 and pointer-events none are not decoration. The plate is the
 * only thing this component paints, it is the size of the viewport, and
 * it must be incapable of covering the foreground or eating a click --
 * including before styles/ gives .clif-scene its own fixed, z-0 box, and
 * on /specimens, where the scene is behind a page it has nothing to do
 * with. A negative z-index puts it behind in-flow content in both cases.
 */
const FallbackPlate = () => (
  <div
    aria-hidden="true"
    className="clif-scene-plate"
    data-testid="scene-fallback"
    style={{
      position: 'absolute',
      inset: 0,
      zIndex: -1,
      pointerEvents: 'none',
      overflow: 'hidden',
      background: 'var(--surface-ground)',
    }}
  >
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '58%',
        width: 'min(76vh, 76vw)',
        height: 'min(76vh, 76vw)',
        transform: 'translate(-50%, -50%)',
        borderRadius: '50%',
        background:
          'radial-gradient(circle at 34% 30%, var(--map-land), var(--map-deep) 68%)',
        boxShadow:
          '0 0 0 1px var(--clif-yellow-30), 0 0 90px 10px var(--map-atmosphere, rgba(255, 229, 32, 0.12))',
      }}
    />
  </div>
);

export const SceneRoot = ({ className }: SceneRootProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { pathname } = useRouter();
  const { camera: declared } = useScene();
  const { hover, setHover } = useSceneHover();
  const view = useSceneViewValue();
  const isMobile = useIsMobile();
  const reduced = useReducedMotion();

  const [state, setState] = useState<SceneState>('pending');
  const [palette, setPalette] = useState<Palette>(livePalette);

  // What was last applied, so a move knows where it came from and the
  // basemap config only sends what changed.
  const lastScene = useRef<SceneId | null>(null);
  const lastConfig = useRef<BasemapConfig | null>(null);
  const lastTarget = useRef<CameraSpec | null>(null);

  const sceneId = sceneIdForPath(pathname);

  const spec = useMemo(
    () =>
      forViewport(
        resolveCamera(pathname, declared),
        sceneId,
        isMobile,
      ),
    [pathname, declared, sceneId, isMobile],
  );

  const target = useMemo(
    () => cameraForHover(spec, hover),
    [spec, hover],
  );

  const sets = useMemo(
    () =>
      layerSetsFor(sceneId, {
        palette,
        hover,
        // Both the viewport and the route can veto map type; neither
        // outranks the other.
        labels: showLabels(view, isMobile),
        selectedStop: view.selectedStop,
        dash: dashRuns(spec, reduced),
        onHoverAnchor: setHover,
        // A tap is the touch equivalent of a hover: it lights the city.
        onSelectAnchor: setHover,
      }),
    [
      sceneId,
      palette,
      hover,
      isMobile,
      view,
      spec,
      reduced,
      setHover,
    ],
  );

  /*
   * One map, created on the first mount and never again. ensureMap is
   * idempotent, which is what makes React 19's double-invoked effects
   * safe here.
   *
   * 'live' means the map object exists, not that its style has loaded --
   * the camera can be driven straight away and everything with a style
   * precondition defers itself inside scene/mapbox/instance.ts. What
   * SceneRoot does care about is the stylesheet failing outright, which
   * is what a token that cannot fetch it looks like: there will never be
   * a basemap, so the scene falls back to the same static plate it shows
   * with no token at all.
   */
  useEffect(() => {
    let cancelled = false;
    const stopWatching = watchStyleStatus((next) => {
      if (!cancelled && next === 'failed') setState('fallback');
    });
    void ensureMap(containerRef.current).then((map) => {
      if (cancelled) return;
      if (!map) setState('fallback');
      else
        setState(getStyleStatus() === 'failed' ? 'fallback' : 'live');
    });
    return () => {
      cancelled = true;
      stopWatching();
    };
  }, []);

  /*
   * Theming tier 1. The painter debounces, and refuses to repaint unless
   * palette.key changed -- setColorTheme reloads every tile by design.
   * The camera holds through all of it: a theme change is the one scene
   * change with no camera move.
   */
  useEffect(() => {
    const painter = createThemePainter((next, lut) => {
      applyColorTheme(lut);
      // Identity matters: `palette` is a dependency of the scene pass, so
      // handing back an equal-but-new object on every paint would re-run
      // the whole pass -- and re-issue a camera move -- for a theme that
      // did not change. The key is what changing means here.
      setPalette((current) =>
        current.key === next.key ? current : next,
      );
    });
    const unsubscribe = subscribeTheme(painter.request);
    painter.request();
    // The first paint is not a change and should not wait out the debounce.
    painter.flush();
    return () => {
      unsubscribe();
      painter.cancel();
    };
  }, [state]);

  /*
   * Everything else, in one pass. Splitting it would only create orders in
   * which the map is half-moved.
   */
  useEffect(() => {
    if (state !== 'live') return;

    /*
     * The camera moves only when the camera changed.
     *
     * This pass re-runs for things that are not the camera -- a repaint,
     * a route declaring labels off, a stop being selected -- and an
     * unconditional easeTo would answer each of those with a 600ms move
     * to where the camera already is. Everything below is a setter and
     * idempotent; a move is not.
     */
    if (target !== lastTarget.current) {
      const from = lastScene.current;
      lastScene.current = sceneId;
      lastTarget.current = target;
      applyCamera(target, moveDurationFor(from, sceneId, reduced));
    }

    applyFog(spec, palette);
    applyTerrain(terrainFor(spec));
    applyInteractivity(spec.interactive);

    // Tier 2: only the properties that actually changed.
    const next = basemapConfig(spec.fog, spec.zoom, palette.light);
    applyBasemapConfig(configChanges(next, lastConfig.current));
    lastConfig.current = next;

    // Tier 3 rides along with the layer diff.
    syncLayers(sets, palette);

    setAnimation(
      spinRateFor(spec, reduced),
      dashRuns(spec, reduced),
      [WORK_PATH_DASH],
    );
  }, [state, target, spec, sets, palette, reduced, sceneId]);

  return (
    <div
      aria-hidden="true"
      className={cn('clif-scene', className)}
      data-scene={sceneId}
      data-scene-state={state}
      data-testid="scene-root"
      ref={containerRef}
    >
      {state === 'fallback' ? <FallbackPlate /> : null}
    </div>
  );
};

export default SceneRoot;
