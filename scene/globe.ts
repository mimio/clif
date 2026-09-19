import {
  ARTBOARD_DESKTOP,
  type CameraPadding,
  type Viewport,
} from 'content/cameras';

/*
 * How big the globe is on screen, and what zoom makes it a given size.
 *
 * The artboards state the globe as a FRACTION OF THE VIEWPORT -- 1a's
 * orbit scene is a sphere of radius `h * 0.44` centred at `w * 0.66, h *
 * 0.5` -- and mapbox takes a zoom. Nothing in mapbox-gl converts between
 * the two, so this does, and it is the only place that knows the shape of
 * mapbox's globe projection.
 *
 *
 * THE CLOSED FORM, AND WHY THE OBVIOUS ONE IS WRONG
 *
 * The tempting answer is that the globe's radius is the mercator world
 * wrapped into a sphere: `worldSize / (2 * PI)` with `worldSize = 512 *
 * 2^zoom`. That is the radius of the sphere IN THE WORLD, and it is not
 * what is painted, because mapbox renders the globe through a PERSPECTIVE
 * camera. A sphere seen in perspective silhouettes along its tangent
 * cone, not along its equator, so the disc on screen is bigger than the
 * sphere's own radius -- about 31% bigger at zoom 0, about 5% at zoom
 * 2.2, and SMALLER than it past zoom ~2.6. Sizing the globe off
 * `worldSize / (2 * PI)` therefore misses by a factor that changes with
 * both the zoom and the viewport, which is why this is arithmetic rather
 * than one number.
 *
 * The real geometry, with every quantity in CSS pixels:
 *
 *   f    the focal length, `0.5 / tan(fov / 2) * height`. mapbox's
 *        default fov is 2 * atan(1/3), so `0.5 / tan(fov / 2)` is exactly
 *        1.5 and f = 1.5 * height.
 *   d    the distance from the camera to the centre of the screen, which
 *        in globe mode is where the near face of the sphere sits.
 *        mapbox scales it so the globe's scale matches mercator's at
 *        latitude 45, i.e. d = f * cos(45deg) = f / sqrt(2). It is a
 *        function of the viewport HEIGHT alone -- not of the zoom, and
 *        not of the width.
 *   R    the sphere's own radius, `512 * 2^zoom / (2 * PI)`.
 *
 * The camera is then `d + R` from the sphere's centre, and the tangent
 * cone's half-angle theta has `sin(theta) = R / (d + R)`. The silhouette
 * lands at `f * tan(theta)` from the projection centre:
 *
 *   r = f * R / sqrt((d + R)^2 - R^2) = f * R / sqrt(d^2 + 2 * d * R)
 *
 * Inverting it for R is a quadratic in R:
 *
 *   f^2 R^2 - 2 r^2 d R - r^2 d^2 = 0
 *   R = d * r * (r + hypot(r, f)) / f^2
 *
 * and zoom follows from R.
 *
 *
 * THIS IS MEASURED, NOT ASSUMED. e2e/hermetic/globe-frame.spec.ts drives
 * the real mapbox-gl and finds the painted limb by bisection -- the
 * outermost screen point whose `unproject` still round-trips through
 * `project`, which is exactly the edge of the sphere, because off the
 * globe `unproject` clamps to the horizon and the round trip stops
 * closing. Against that, the form above is accurate to about 0.005% from
 * zoom 0 to zoom 3 at every viewport tried.
 *
 * WHERE IT STOPS BEING EXACT. mapbox interpolates the globe toward
 * mercator across the projection's own range, zoom 3 to 5, and `d` drifts
 * with it. Past zoom 3 this form slowly under-reads: at zoom 3.35 -- the
 * framed zoom for a 2000px-tall window, the tallest anything realistic
 * asks for -- it is 0.057% out, half a pixel in 880. Every camera in
 * content/cameras.ts that uses a frame resolves below zoom 3.4 for any
 * viewport under about 2000px tall, so the error is never visible; a
 * scene that wanted a frame up at zoom 5 would need a different solver.
 */

/** mapbox's tile size in CSS pixels, which sets `worldSize`. */
const TILE_SIZE = 512;

/** `0.5 / tan(fov / 2)` for mapbox's default 2 * atan(1/3) field of view. */
const FOCAL_RATIO = 1.5;

/** mapbox matches the globe's scale to mercator's at latitude 45. */
const SCALE_MATCH_LATITUDE_COS = Math.SQRT1_2;

/**
 * The lowest zoom a camera is allowed to resolve to.
 *
 * scene/mapbox/instance.ts constructs the map with `minZoom: 0`, so
 * mapbox would clamp anything below this anyway and the camera would
 * silently not be the one that was asked for. Clamping here means the
 * spec and the map agree about what happened -- and it is what keeps a
 * degenerate viewport, whose framed radius is zero and whose zoom is
 * therefore negative infinity, from being handed to easeTo.
 */
export const GLOBE_MIN_ZOOM = 0;

/** A zoom the map will actually adopt. */
export const clampGlobeZoom = (zoom: number): number =>
  zoom > GLOBE_MIN_ZOOM ? zoom : GLOBE_MIN_ZOOM;

/** The sphere's own radius in pixels -- what it would measure flat. */
export const globeWorldRadius = (zoom: number): number =>
  (TILE_SIZE * 2 ** zoom) / (2 * Math.PI);

/** The zoom at which the sphere's own radius is `radius` pixels. */
export const globeZoomForWorldRadius = (radius: number): number =>
  Math.log2((2 * Math.PI * radius) / TILE_SIZE);

/**
 * The focal length, in pixels, for a viewport this tall.
 *
 * Exported because it is not only the globe's: mapbox sizes its own
 * stars through the same camera, and scene/stars.ts has to measure them
 * to sit beside them. This file is where the field of view is known.
 */
export const focalLength = (height: number): number =>
  FOCAL_RATIO * height;

/** Camera to the centre of the screen, in pixels. Height decides it. */
const cameraToCenter = (height: number): number =>
  focalLength(height) * SCALE_MATCH_LATITUDE_COS;

/**
 * The radius of the painted disc, in CSS pixels: half the width of the
 * globe as it lands on screen.
 */
export const globeScreenRadius = (
  zoom: number,
  height: number,
): number => {
  const f = focalLength(height);
  const d = cameraToCenter(height);
  const r = globeWorldRadius(zoom);
  return (f * r) / Math.sqrt(d * d + 2 * d * r);
};

/**
 * The zoom that paints a disc of `radius` CSS pixels in a viewport this
 * tall -- the exact inverse of globeScreenRadius, and the one the cameras
 * table's frames are resolved through.
 *
 * Unclamped on purpose: a frame may sit a fixed number of zoom steps off
 * the one it solves for (the 404 does), so clamping belongs after that
 * offset rather than here.
 */
export const globeZoomForScreenRadius = (
  radius: number,
  height: number,
): number => {
  const f = focalLength(height);
  const d = cameraToCenter(height);
  const world =
    (d * radius * (radius + Math.hypot(radius, f))) / (f * f);
  return globeZoomForWorldRadius(world);
};

/**
 * The globe's ANGULAR radius, in radians: half the angle the sphere
 * subtends at the camera, which is the angle mapbox's atmosphere shader
 * measures its falloff from.
 *
 * The silhouette lands at `f * tan(theta)` from the projection centre, so
 * this is simply the inverse of globeScreenRadius's last step. It is
 * separate from that function because the atmosphere wants the ANGLE and
 * the frame wants the PIXELS, and going pixels -> angle -> pixels through
 * a caller that only has one of them is how the two drift apart.
 *
 * It is the whole reason `horizon-blend` cannot be a constant: mapbox's
 * glow decays with the angle BEYOND this one, while the design states its
 * halo in globe RADII. A small globe subtends a small angle, so the same
 * horizon-blend spreads the halo over proportionally more radii -- 1.73x
 * more at 1f's mobile frame than at 1a's desktop one. See
 * scene/theme.ts's horizonBlendFor.
 */
export const globeLimbAngle = (
  zoom: number,
  height: number,
): number =>
  Math.atan(globeScreenRadius(zoom, height) / focalLength(height));

/* ---- where the globe lands ------------------------------------------- */

/**
 * The globe's placement, as only the map knows it during a flight.
 *
 * Three fields because three things move the silhouette and they are
 * independent: the zoom decides how big the sphere is, the padding
 * decides where the projection puts it, and the PITCH tilts the camera
 * off the sphere's own normal, which slides the silhouette down the
 * frame. The bearing and the centre turn the planet inside it without
 * moving it.
 */
export type GlobeGeometry = {
  zoom: number;
  pitch: number;
  padding: CameraPadding;
};

/**
 * Where the sphere's centre sits in the camera's own frame, in pixels.
 *
 * At pitch 0 it is straight down the view axis at `d + R`. Pitching
 * orbits the camera about the point at the centre of the screen -- which
 * stays on the axis at `d` -- so the centre swings off the axis by the
 * pitch, and the whole of it is:
 *
 *   C = (0, -R sin(pitch), -(d + R cos(pitch)))
 *
 * THIS IS MEASURED, NOT ASSUMED. mapbox keeps the same quantity on its
 * transform as `globeCenterInViewSpace`, and e2e/hermetic/globe-stars
 * .spec.ts reads it off the live map and compares: the form above
 * reproduces it to every digit the transform prints, at pitch 0 on `/`
 * and at pitch 25 on `/projects`. The bearing does not enter it, and
 * that is measured too -- /projects carries a bearing of -12 and its
 * centre still has x exactly zero, because the bearing turns the planet
 * about the axis through that very point.
 */
export const globeCenterInView = (
  zoom: number,
  pitch: number,
  height: number,
): [number, number, number] => {
  const radians = (pitch * Math.PI) / 180;
  const r = globeWorldRadius(zoom);
  return [
    0,
    -r * Math.sin(radians),
    -(cameraToCenter(height) + r * Math.cos(radians)),
  ];
};

/**
 * The silhouette the globe is drawn as, in CSS pixels, and everything a
 * screen point needs to be measured against it.
 *
 * TWO CENTRES, AND THEY ARE NOT THE SAME POINT. `axis` is where the
 * camera's own view axis lands -- the middle of the canvas, shifted by
 * half the padding, which is where the point at the centre of the map
 * is drawn. `cx, cy` is where the SPHERE's centre lands, which at any
 * pitch is further down the frame. Confusing the two is what put accent
 * stars on the planet: measured at /projects' pitch of 25 they are 91
 * pixels apart.
 *
 * AND `cx, cy, r` IS A CIRCLE THROUGH A SHAPE THAT IS NOT ONE. A sphere
 * off the view axis silhouettes as a conic, not a circle -- at
 * /projects the painted limb runs 217.8px wide and 223.8px tall about
 * that centre. The circle is right to within a quarter of a percent
 * there and exact at pitch 0, which is all a stand-in sphere on the
 * /specimens board needs; anything deciding whether a POINT is on the
 * planet wants `limbRadii`, which is exact at any pitch.
 */
export type GlobeLimb = {
  /** Where the view axis lands: the padded projection centre. */
  axis: { x: number; y: number };
  /** Where the silhouette's own centre lands, and its radius there. */
  cx: number;
  cy: number;
  r: number;
  /** The focal length, and the direction and half-angle of the cone. */
  focal: number;
  at: readonly [number, number, number];
  tanLimb: number;
};

/**
 * The silhouette this camera paints in this box.
 *
 * `axis` is scene/camera.ts's `paddingFor` read backwards. That function
 * turns a fraction of the viewport into the padding mapbox takes; this
 * turns the padding back into pixels, because a camera read off the map
 * carries the padding and not the fraction it came from. Both sides of
 * the round trip are held together by test/scene-stars.test.tsx.
 *
 * A null viewport is the server's and jsdom's answer, and it is treated
 * the way scene/theme.ts's fogFor treats it: the artboard, which is the
 * box the table's own numbers were resolved at.
 */
export const globeLimb = (
  geometry: GlobeGeometry,
  viewport: Viewport | null,
): GlobeLimb => {
  const box = viewport ?? ARTBOARD_DESKTOP;
  const { padding } = geometry;
  const focal = focalLength(box.height);
  const at = globeCenterInView(
    geometry.zoom,
    geometry.pitch,
    box.height,
  );
  const away = Math.hypot(at[1], at[2]);
  const radius = globeWorldRadius(geometry.zoom);
  /*
   * The tangent cone, as globeScreenRadius derives it: sin(theta) is
   * R / |C|, so its tangent is R over the other leg. At pitch 0 this is
   * globeScreenRadius to the digit, and the two are held together by
   * test/scene-globe.test.ts.
   */
  const tanLimb = radius / Math.sqrt(away * away - radius * radius);
  const axis = {
    x: box.width / 2 + (padding.left - padding.right) / 2,
    y: box.height / 2 + (padding.top - padding.bottom) / 2,
  };
  return {
    axis,
    cx: axis.x + (focal * at[0]) / -at[2],
    cy: axis.y - (focal * at[1]) / -at[2],
    r: focal * tanLimb,
    focal,
    at: [at[0] / away, at[1] / away, at[2] / away],
    tanLimb,
  };
};

/**
 * How far a screen point sits from the globe's centre, in limb radii:
 * below 1 it is on the planet, and 1 is exactly the silhouette.
 *
 * It is an ANGLE underneath, not a screen distance, because a sphere the
 * camera is pitched away from does not silhouette as a circle about any
 * screen point. The point is turned back into the direction the globe's
 * own camera would draw it at, and compared with the direction of the
 * sphere's centre; `tan` of each puts the ratio back into the screen
 * radii the design states its atmosphere in, and makes the silhouette
 * exactly 1 whatever the pitch.
 */
export const limbRadii = (
  limb: GlobeLimb,
  x: number,
  y: number,
): number => {
  const vx = x - limb.axis.x;
  const vy = -(y - limb.axis.y);
  const vz = -limb.focal;
  const length = Math.hypot(vx, vy, vz);
  const along =
    (vx * limb.at[0] + vy * limb.at[1] + vz * limb.at[2]) / length;
  // Clamped because a dot product of unit vectors can leave the domain
  // of acos by an ulp, and Math.acos answers NaN when it does.
  const angle = Math.acos(Math.min(1, Math.max(-1, along)));
  return Math.tan(angle) / limb.tanLimb;
};
