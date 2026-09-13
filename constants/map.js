// Stays CommonJS JavaScript: makeHistoryData/mapboxConfig.js requires it, and
// that file cannot be rewritten (GitHub push protection flags its Mapbox token).
// Types come from JSDoc and are checked by tsc through checkJs.

/**
 * Camera tilt for the history map, in degrees. Kept in one place because it
 * must be passed both to the Map constructor and to every fitBounds() call:
 * since mapbox-gl v2.7, fitBounds resets pitch to 0 unless told otherwise.
 */
const MAP_PITCH = 60;

/** @type {{ top: number, left: number, right: number, bottom: number }} */
const BOUNDS_PADDING = {
  top: 200,
  left: 100,
  right: 130,
  bottom: 100,
};

/** @type {{ top: number, left: number, right: number, bottom: number }} */
const BOUNDS_PADDING_MOBILE = {
  top: 200,
  left: 60,
  right: 130,
  bottom: 260,
};

module.exports = {
  MAP_PITCH,
  BOUNDS_PADDING,
  BOUNDS_PADDING_MOBILE,
};
