// Camera tilt for the history map, in degrees. Kept in one place because it
// must be passed both to the Map constructor and to every fitBounds() call:
// since mapbox-gl v2.7, fitBounds resets pitch to 0 unless told otherwise.
export const MAP_PITCH = 60;

export type BoundsPadding = {
  top: number;
  left: number;
  right: number;
  bottom: number;
};

export const BOUNDS_PADDING: BoundsPadding = {
  top: 200,
  left: 100,
  right: 130,
  bottom: 100,
};

export const BOUNDS_PADDING_MOBILE: BoundsPadding = {
  top: 200,
  left: 60,
  right: 130,
  bottom: 260,
};
