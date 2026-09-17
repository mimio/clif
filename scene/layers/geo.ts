/*
 * Great-circle geometry for the work path.
 *
 * The old map drew a plain GeoJSON LineString between its stops, which is
 * a straight line in the projection and therefore wrong on a globe: a
 * two-point line from Albany to Portland cuts through the sphere rather
 * than lying on it. Mapbox will not interpolate it for us on a globe
 * projection, so the arc is sampled here.
 *
 * Slerp on the unit sphere, plus the design's latitude bow -- artboard 1a
 * specifies a sin(k*pi) * 3.5-degree lift so the arc reads as an arc and
 * not as a chord that happens to bend.
 */
export type Point = [number, number];

const RAD = Math.PI / 180;
const DEG = 180 / Math.PI;

const toVector = ([lng, lat]: Point): [number, number, number] => {
  const phi = lat * RAD;
  const lambda = lng * RAD;
  const cosPhi = Math.cos(phi);
  return [
    cosPhi * Math.cos(lambda),
    cosPhi * Math.sin(lambda),
    Math.sin(phi),
  ];
};

const toPoint = ([x, y, z]: [number, number, number]): Point => [
  Math.atan2(y, x) * DEG,
  Math.atan2(z, Math.hypot(x, y)) * DEG,
];

/** Artboard 1a's arc lift, in degrees of latitude at the midpoint. */
export const WORK_PATH_BOW = 3.5;

/** Artboard 1a samples the path at 64 segments. */
export const WORK_PATH_SEGMENTS = 64;

/**
 * The great circle from `from` to `to`, sampled at `segments` + 1 points.
 * Both endpoints come back exactly; everything between is slerped and
 * then bowed north by `bow` degrees at the midpoint.
 */
export const greatCircle = (
  from: Point,
  to: Point,
  segments: number = WORK_PATH_SEGMENTS,
  bow: number = WORK_PATH_BOW,
): Point[] => {
  const a = toVector(from);
  const b = toVector(to);
  const dot = Math.min(
    1,
    Math.max(-1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]),
  );
  const omega = Math.acos(dot);
  const sinOmega = Math.sin(omega);

  const points: Point[] = [];
  for (let i = 0; i <= segments; i += 1) {
    const k = i / segments;
    if (i === 0) {
      points.push([...from] as Point);
    } else if (i === segments) {
      points.push([...to] as Point);
    } else {
      // Antipodal or coincident endpoints have no unique great circle;
      // a linear blend is the only defined answer and never happens for
      // the two cities this draws.
      const [p, q] =
        sinOmega === 0
          ? [1 - k, k]
          : [
              Math.sin((1 - k) * omega) / sinOmega,
              Math.sin(k * omega) / sinOmega,
            ];
      const point = toPoint([
        a[0] * p + b[0] * q,
        a[1] * p + b[1] * q,
        a[2] * p + b[2] * q,
      ]);
      point[1] += Math.sin(k * Math.PI) * bow;
      points.push(point);
    }
  }
  return points;
};

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
