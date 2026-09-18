import {
  type CSSProperties,
  useEffect,
  useId,
  useMemo,
  useState,
} from 'react';
import type { CameraSpec, Viewport } from 'content/cameras';
import type { GlobeGeometry } from 'scene/globe';
import { watchGlobe } from 'scene/mapbox/instance';
import {
  STAR_SPACE_EDGE,
  starInk,
  starRadius,
  stars,
  starSpace,
} from 'scene/stars';
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
 * So this field sits over the canvas instead and cuts its own hole,
 * which is the one thing being outside the map costs. scene/stars.ts's
 * `starSpace` says where the hole is, and the mask below fades the field
 * in across the band between the globe's limb and the design's own
 * atmosphere reach rather than cutting it at either edge -- so a star
 * near the planet dims into the halo the way mapbox's do, instead of
 * ending at a circle.
 *
 * THE HOLE IS READ OFF THE MAP, NOT OFF THE ROUTE. `spec` is where the
 * camera is going; during the 800-900ms flight the globe is somewhere
 * between, growing along a curve that no CSS transition on a radius
 * follows -- and getting that wrong in the forgiving direction still
 * paints stars over the planet for half a second on the way back from a
 * terrain route. `watchGlobe` reports the transform instead, and reports
 * it only when the disc has actually moved, so the hello route's
 * rotation costs nothing at all.
 */

export type StarFieldProps = {
  palette: Palette;
  viewport: Viewport | null;
  /**
   * Where the globe is: the route's own camera, already framed. With
   * `follow` set it seeds the first paint and the transform takes over;
   * without it, it is the whole answer.
   */
  camera: CameraSpec;
  /**
   * Whether the hole follows the live map.
   *
   * Set wherever the field is over the real scene, which is the only
   * place the two can disagree. The /specimens board draws a half-scale
   * globe of its own in a box of its own, behind which the live scene is
   * still mounted -- it holds the camera it was handed, or the map
   * behind the page would reframe a patch that has nothing to do with
   * it.
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

export const StarField = ({
  palette,
  viewport,
  camera,
  follow,
}: StarFieldProps) => {
  /*
   * Unique per mount. The mask and its gradient are named by id, which
   * is a document-wide name, and this component does not own the
   * document: /specimens draws a half-scale field of its own on a board
   * behind which the live scene is still mounted, so a constant would
   * leave that one masked by the real globe.
   */
  const id = useId();
  const maskId = `${id}-space`;
  const fadeId = `${id}-limb`;

  const [geometry, setGeometry] = useState<GlobeGeometry>(() => ({
    zoom: camera.zoom,
    padding: camera.padding,
  }));

  useEffect(
    () => (follow ? watchGlobe(setGeometry) : undefined),
    [follow],
  );

  /*
   * The stars themselves change with the palette and the viewport and
   * with nothing else, so the element is built once per change of those
   * two and handed back by reference. React skips a subtree whose
   * element it has already seen, which is what keeps a flight's worth of
   * geometry updates from re-rendering 160 circles sixty times a second.
   */
  const field = useMemo(
    () => (
      <g mask={`url(#${maskId})`}>
        {stars.map((star, at) => (
          <circle
            cx={`${star.at[0] * 100}%`}
            cy={`${star.at[1] * 100}%`}
            fill={starInk(palette, star)}
            key={at}
            r={starRadius(star, viewport)}
          />
        ))}
      </g>
    ),
    [maskId, palette, viewport],
  );

  // Stars would be noise over a bright ground, which is the same reason
  // scene/theme.ts sends mapbox a star-intensity of zero on a light
  // theme. The two have to agree or the sky is half there.
  if (palette.light) return null;

  const space = starSpace(geometry, viewport);

  return (
    <svg
      aria-hidden="true"
      className="clif-stars"
      data-testid="scene-stars"
      focusable="false"
      height="100%"
      style={STAR_BOX}
      width="100%"
    >
      <defs>
        {/*
         * Black out to the limb, white at the reach: the mask is a
         * luminance mask, so black hides and the ramp between them is
         * the halo fading the field back in. The stop sits at the
         * limb's share of the reach -- 1/1.34 -- because the gradient
         * is in the circle's own units and the circle is the reach.
         */}
        <radialGradient id={fadeId}>
          <stop offset="0" stopColor="#000" />
          <stop offset={1 / STAR_SPACE_EDGE} stopColor="#000" />
          <stop offset="1" stopColor="#fff" />
        </radialGradient>
        <mask
          height="100%"
          id={maskId}
          maskUnits="userSpaceOnUse"
          width="100%"
          x="0"
          y="0"
        >
          <rect fill="#fff" height="100%" width="100%" x="0" y="0" />
          <circle
            cx={space.cx}
            cy={space.cy}
            fill={`url(#${fadeId})`}
            r={space.r}
          />
        </mask>
      </defs>
      {field}
    </svg>
  );
};

export default StarField;
