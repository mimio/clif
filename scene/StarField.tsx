import { type CSSProperties, useEffect, useRef } from 'react';
import type { CameraSpec, Viewport } from 'content/cameras';
import { clampDpr } from 'scene/budget';
import { watchSky } from 'scene/mapbox/instance';
import { paintedStars, type SkyView, starInk } from 'scene/stars';
import type { Palette } from 'styles/tokens/palette';

/*
 * The accent stars, over the map's own canvas.
 *
 * WHY IT IS DOM AND NOT MAPBOX. mapbox paints its stars first, before
 * any layer -- `Atmosphere.drawStars` runs at the head of the opaque
 * pass, straight onto the space colour the frame was cleared with -- so
 * the globe's tiles and then its glow land on top of them and the
 * occlusion is free. Nothing in a style can join that pass: a custom
 * layer draws in the translucent pass, after the atmosphere, and would
 * need a shader, a buffer and a stub of its own to be testable at all.
 * `star-intensity` is the only dial the fog exposes and it takes a
 * number, not a colour.
 *
 * So this field sits over the canvas instead, and pays for it twice:
 * once in the occlusion, which it does itself by fading each star across
 * the band between the globe's limb and the design's atmosphere reach,
 * and once in the motion, which it also does itself -- scene/stars.ts
 * rebuilds mapbox's own star rotation so the two fields turn together.
 *
 * WHY A CANVAS AND NOT SVG. The field is three thousand two hundred
 * stars on a sphere, of which about 157 are in frame at any moment, and
 * on the hello route every one of them moves on every frame the spin
 * writes. That is a particle field, and a particle field in the DOM is
 * thousands of attribute writes a second; in a canvas it is one clear
 * and a few dozen fills. It is also why this component holds no state:
 * `watchSky` reports and this paints, with no React render in between.
 *
 * It is the second WebGL-shaped surface in the frame, so it honours the
 * same device-pixel-ratio clamp scene/budget.ts argues for -- the cost
 * of a full-bleed canvas is quadratic in the ratio, and 1.5 is where
 * that stops being worth it.
 */

export type StarFieldProps = {
  palette: Palette;
  viewport: Viewport | null;
  /**
   * Where the camera is until the map says otherwise: the route's own
   * camera, already framed. With `follow` set it paints the first frame
   * and the transform takes over; without it, it is the whole answer.
   */
  camera: CameraSpec;
  /**
   * Whether the field follows the live map.
   *
   * Set wherever the field is over the real scene, which is the only
   * place the two can disagree. The /specimens board draws a half-scale
   * sky of its own in a box of its own, behind which the live scene is
   * still mounted -- it holds the camera it was handed, or the map
   * behind the page would re-aim a patch that has nothing to do with it.
   */
  follow: boolean;
};

/*
 * Above the canvas, under everything else.
 *
 * The scene's container is where mapbox appends its own DOM, so this is
 * a sibling of `.mapboxgl-canvas-container` and needs the z-index to
 * clear it -- mapbox's own stack is z-index 0 upwards, and the plate in
 * scene/SceneRoot.tsx goes to -1 for the opposite reason. pointer-events
 * none is not decoration either: the map is draggable on every route but
 * the detail, and a full-bleed sibling that ate the drag would be a
 * scene you cannot turn.
 */
const STAR_BOX: CSSProperties = {
  position: 'absolute',
  inset: 0,
  zIndex: 1,
  pointerEvents: 'none',
};

/** The camera a route declares, in the terms the sky is turned by. */
const skyFor = (camera: CameraSpec): SkyView => ({
  center: camera.center,
  bearing: camera.bearing,
  pitch: camera.pitch,
  zoom: camera.zoom,
  padding: camera.padding,
});

export const StarField = ({
  palette,
  viewport,
  camera,
  follow,
}: StarFieldProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  /** Where the camera is now: seeded from the route, fed by the map. */
  const viewRef = useRef<SkyView>(skyFor(camera));

  /** The latest paint, so the subscription below never has to be rebuilt. */
  const paintRef = useRef<() => void>(() => {});

  /*
   * The paint, rebuilt after every render and run once to show it.
   *
   * No dependency list on purpose. A new palette, a resize and -- when
   * this is not following the map -- a new camera all change what should
   * be on the canvas and none of them change the subscription, so the
   * cheap thing is to rebuild the closure that draws rather than the one
   * that listens.
   */
  useEffect(() => {
    if (!follow) viewRef.current = skyFor(camera);
    /*
     * The context is fetched per paint rather than once, and the
     * subscription does not depend on having one. `getContext` hands
     * back the same object every time, so it costs nothing -- and a
     * browser that will not give us a 2D context (or a jsdom, which has
     * none at all) should leave the field unpainted, not leave the
     * transform unwatched.
     */
    paintRef.current = () => {
      const canvas = canvasRef.current;
      const context = canvas?.getContext('2d') ?? null;
      if (canvas === null || context === null) return;
      const box = viewport;
      const width = box?.width ?? canvas.clientWidth;
      const height = box?.height ?? canvas.clientHeight;
      const ratio = clampDpr(window.devicePixelRatio || 1);
      if (
        canvas.width !== Math.round(width * ratio) ||
        canvas.height !== Math.round(height * ratio)
      ) {
        canvas.width = Math.round(width * ratio);
        canvas.height = Math.round(height * ratio);
      }
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, width, height);
      for (const star of paintedStars(viewRef.current, box)) {
        context.fillStyle = starInk(palette, star.ink, star.alpha);
        context.beginPath();
        context.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        context.fill();
      }
    };
    paintRef.current();
  });

  /*
   * And the subscription, opened once. It feeds the ref and paints; it
   * never needs rebuilding, because the paint it runs is always the
   * latest one.
   *
   * IN THE MAP'S OWN FRAME, NOT THE NEXT ONE. This used to coalesce onto
   * a requestAnimationFrame, on the argument that painting inside
   * mapbox's render was work in the wrong place and that a field
   * trailing the globe by one frame was not a thing anyone could see.
   * The second half of that is false, and the first half buys nothing.
   *
   * It buys nothing because `move` is dispatched once per frame mapbox
   * renders, so during a flight there is already exactly one report, one
   * rAF and one paint per frame. Coalescing removed no work at all; it
   * only moved every paint a frame later than the transform it was
   * computed from.
   *
   * And it is visible, because the mask is cut against the globe. A
   * frame late is a field drawn against a SMALLER globe than the one
   * beside it, so on a hard zoom in the stars nearest the limb are left
   * sitting on the planet: measured on an easeTo from the hello camera
   * to zoom 9, about 125 pixels of accent on the globe at zoom 2.9,
   * where the same camera held still paints none.
   *
   * So it paints now, in the frame the report came from. The rare case
   * the old code was really collapsing -- several `move`s inside one
   * frame, from a gesture and a render together -- is two paints instead
   * of one, which is the cheaper mistake by a wide margin.
   */
  useEffect(() => {
    if (!follow) return undefined;
    return watchSky((view) => {
      viewRef.current = view;
      paintRef.current();
    });
  }, [follow]);

  // Stars would be noise over a bright ground, which is the same reason
  // scene/theme.ts sends mapbox a star-intensity of zero on a light
  // theme. The two have to agree or the sky is half there.
  if (palette.light) return null;

  return (
    <canvas
      aria-hidden="true"
      className="clif-stars"
      data-testid="scene-stars"
      ref={canvasRef}
      style={STAR_BOX}
    />
  );
};

export default StarField;
