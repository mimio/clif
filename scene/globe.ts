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

/** The focal length, in pixels, for a viewport this tall. */
const focalLength = (height: number): number => FOCAL_RATIO * height;

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
