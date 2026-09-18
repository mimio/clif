import {
  type CSSProperties,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useRouter } from 'next/router';
import type { CameraSpec, SceneId } from 'content/cameras';
import {
  awaitingRefinement,
  cameraForHover,
  forViewport,
  frameCamera,
  moveDurationFor,
  resolveCamera,
  sameCamera,
  sceneIdForPath,
  spinRateFor,
  terrainFor,
} from 'scene/camera';
import { layerSetsFor } from 'scene/layers/sets';
import StarField from 'scene/StarField';
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
  batchScene,
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
import {
  useIsMobile,
  useReducedMotion,
  useViewportSize,
} from 'scene/useViewport';
import { showLabels } from 'scene/view';
import type { Palette } from 'styles/tokens/palette';
import { cn } from 'utils/cn';

/*
 * The globe. One instance, mounted once in pages/_app.page.tsx behind everything
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

/*
 * The container's box, and why it is here rather than in styles/.
 *
 * mapbox-gl measures the container's clientWidth/clientHeight when it
 * constructs the map. Hand it a box of zero height and it does not
 * complain: it falls back to a 300px canvas and paints a strip. The globe
 * had never once been visible because .clif-scene was referenced here and
 * defined nowhere -- the container measured 1440x0 and the map rendered
 * 1440x300 behind the foreground, on every route.
 *
 * Nothing caught it, and the reason is worth keeping: the fallback plate
 * carries inline styles so it was correctly sized, and with no route to
 * api.mapbox.com every local check fell through to the plate and looked
 * right. A missing rule in a file this component does not own is exactly
 * the kind of thing that fails silently and at a distance.
 *
 * So the box is not styling and is not separable from the component that
 * constructs the map -- it is a precondition of that construction, and it
 * lives with it. Inline also makes it the one form a jsdom test can
 * actually read back, so the precondition is asserted rather than assumed.
 * .clif-scene stays as a hook for anything styles/ wants to add later;
 * z-0 is the order pages/_app.page.tsx documents, under the page at z-10 and
 * the chrome at z-40.
 */
const SCENE_BOX: CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 0,
  overflow: 'hidden',
};

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
  const viewport = useViewportSize();
  const reduced = useReducedMotion();

  const [state, setState] = useState<SceneState>('pending');
  const [palette, setPalette] = useState<Palette>(livePalette);

  // What was last applied, so a move knows where it came from and the
  // basemap config only sends what changed.
  const lastScene = useRef<SceneId | null>(null);
  const lastConfig = useRef<BasemapConfig | null>(null);
  const lastTarget = useRef<CameraSpec | null>(null);

  const sceneId = sceneIdForPath(pathname);

  /*
   * The whole camera pipeline, in the order the comment on liveCamera in
   * components/chrome/ChromeRoot.tsx lists it: the route's camera, the
   * breakpoint's variant, then the frame resolved against the box that is
   * actually on screen. The last step is why a resize re-frames rather
   * than leaving yesterday's pixels of padding behind -- `viewport` moves
   * and this memo, the pass below and the easeTo all follow it.
   */
  const spec = useMemo(
    () =>
      frameCamera(
        forViewport(
          resolveCamera(pathname, declared),
          sceneId,
          isMobile,
        ),
        viewport,
      ),
    [pathname, declared, sceneId, isMobile, viewport],
  );

  const target = useMemo(
    () => cameraForHover(spec, hover),
    [spec, hover],
  );

  /*
   * A route whose centre only the page knows is not ready to be flown
   * to until the page has said where. Memoised alongside `spec` because
   * it is a function of the same inputs.
   */
  const unresolved = useMemo(
    () => awaitingRefinement(pathname, declared),
    [pathname, declared],
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
        onHoverAnchor: setHover,
        // A tap is the touch equivalent of a hover: it lights the city.
        onSelectAnchor: setHover,
      }),
    [sceneId, palette, hover, isMobile, view, setHover],
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
    /*
     * 'failed' is provisional, so the plate has to be too.
     *
     * mapbox fires its import failure and THEN style.load, and a source
     * 401 arrives before style.load as well -- so a scene can be plated
     * and then get a perfectly good style a moment later. With no route
     * back, the plate sat over a working globe for the life of the tab
     * while flush() went on painting the map underneath it.
     */
    // No `cancelled` guard here, unlike the promise below: the cleanup
    // unsubscribes synchronously, so there is no window in which this
    // can run after the component is gone.
    const stopWatching = watchStyleStatus((next) => {
      if (next === 'failed') setState('fallback');
      if (next === 'ready') setState('live');
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
    if (state !== 'live') {
      // Nothing drives a scene that is not live. setAnimation is only
      // reachable from this pass, so without this the rAF loop started
      // by a previous route would run forever behind the plate.
      setAnimation(null);
      return;
    }

    /*
     * The camera moves only when the camera changed.
     *
     * This pass re-runs for things that are not the camera -- a repaint,
     * a route declaring labels off, a stop being selected -- and an
     * unconditional easeTo would answer each of those with a 600ms move
     * to where the camera already is. Everything below is a setter and
     * idempotent; a move is not.
     *
     * Compared by value, not by reference. forViewport, cameraAt and
     * cameraForHover all build fresh objects, so on mobile every route
     * change looked like two changes and fired a second easeTo to the
     * place the first was already flying to.
     *
     * And a route whose centre only the page knows does not move at all
     * until it has it: flying to the table's placeholder and re-aiming
     * is two moves to the wrong place and back.
     */
    if (
      !unresolved &&
      (lastTarget.current === null ||
        !sameCamera(target, lastTarget.current))
    ) {
      const from = lastScene.current;
      lastScene.current = sceneId;
      lastTarget.current = target;
      applyCamera(target, moveDurationFor(from, sceneId, reduced));
    }

    /*
     * One pass, one flush. These are wants, not commands: batching them
     * lets the scene apply them in the order mapbox needs rather than
     * the order they are written -- specifically, every layer removal
     * ahead of every setTerrain, because doing those two out of order in
     * one tick throws from inside mapbox and takes the tree down.
     */
    batchScene(() => {
      applyFog(spec, palette, viewport);
      applyTerrain(terrainFor(spec));
      applyInteractivity(spec.interactive);

      // Tier 2: only the properties that actually changed.
      const next = basemapConfig(spec.fog, palette.light);
      applyBasemapConfig(configChanges(next, lastConfig.current));
      lastConfig.current = next;

      // Tier 3 rides along with the layer diff.
      syncLayers(sets, palette);
    });

    setAnimation(spinRateFor(spec, reduced));
  }, [
    state,
    target,
    spec,
    sets,
    palette,
    reduced,
    sceneId,
    unresolved,
    // The atmosphere is resolved against the viewport, not just the
    // camera: see fogFor in scene/theme.ts. A resize has to re-solve it.
    viewport,
  ]);

  return (
    <div
      aria-hidden="true"
      className={cn('clif-scene', className)}
      data-scene={sceneId}
      data-scene-state={state}
      data-testid="scene-root"
      ref={containerRef}
      style={SCENE_BOX}
    >
      {state === 'fallback' ? <FallbackPlate /> : null}
      {/*
       * Only over a live map. The field cuts itself out of the globe's
       * disc and reads that disc off the transform, so with no map there
       * is nothing for it to agree with -- and the plate above draws a
       * sphere of its own, at its own size, which is not the one
       * scene/stars.ts would be masking against.
       */}
      {state === 'live' ? (
        <StarField
          camera={target}
          follow
          palette={palette}
          viewport={viewport}
        />
      ) : null}
    </div>
  );
};

export default SceneRoot;
