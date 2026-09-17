/*
 * The camera, read back off the map.
 *
 * scene/camera.ts answers where the camera is GOING: it is pure, and the
 * chrome derives the destination from the same inputs SceneRoot uses.
 * This answers where it IS, which only the map knows during the flight,
 * because easeTo does not interpolate lng/lat linearly.
 *
 * It exists as its own module because the layer rule keeps everything
 * outside scene/ away from scene/mapbox/**, and rightly so -- that is
 * where mapbox-gl is loaded. A consumer wants the camera, not the
 * library, and this is the seam that says so.
 */
export {
  type CameraListener,
  watchCamera,
} from 'scene/mapbox/instance';
