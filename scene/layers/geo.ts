/*
 * The GeoJSON the scene's own layers are built from.
 *
 * WHAT USED TO BE HERE: `greatCircle`, a slerp on the unit sphere plus
 * artboard 1a's sin(k*pi) * 3.5-degree latitude bow, which sampled the
 * Albany -> Portland work path into 64 segments because mapbox will not
 * interpolate a two-point LineString on a globe -- a straight line in the
 * projection cuts through the sphere rather than lying on it.
 *
 * That path was the prototype's illustration of a mid band rather than
 * anything the site claims (see the note at the top of ./sets.ts), and it
 * was the only caller. The about route's chronological line IS a plain
 * LineString between its stops, on purpose: its six points are all within
 * a few degrees of one another except the first, and at that scale the
 * chord and the arc are the same line. So nothing is left that needs a
 * sampled great circle, and it went out with the layer set rather than
 * staying behind as geometry with no geometry to draw.
 */
export type Point = [number, number];

/** A GeoJSON LineString feature, ready for a geojson source. */
export const lineString = (
  coordinates: Point[],
): Record<string, unknown> => ({
  type: 'Feature',
  properties: {},
  geometry: { type: 'LineString', coordinates },
});

export type PointFeature = {
  center: Point;
  properties: Record<string, unknown>;
};

/** A GeoJSON FeatureCollection of points. */
export const pointCollection = (
  features: PointFeature[],
): Record<string, unknown> => ({
  type: 'FeatureCollection',
  features: features.map((feature) => ({
    type: 'Feature',
    properties: feature.properties,
    geometry: { type: 'Point', coordinates: feature.center },
  })),
});
