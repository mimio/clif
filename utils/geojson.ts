import type { ExpressionSpecification } from 'mapbox-gl';
import type { Feature, FeatureCollection, Point } from 'geojson';

type PointProperties = {
  id: number;
  coordinates: [number, number];
};

export const createGeoJsonFeature = <P extends PointProperties>(
  properties: P,
): Feature<Point, P> => {
  const { coordinates, id } = properties;
  return {
    type: 'Feature',
    id,
    geometry: { type: 'Point', coordinates },
    properties,
  };
};

export const arrayToFeatureCollection = <P extends PointProperties>(
  data: P[],
): FeatureCollection<Point, P> => ({
  type: 'FeatureCollection',
  features: data.map(createGeoJsonFeature),
});

type CaseValue = number | ExpressionSpecification;

export const makeHoverCase = (
  hoverValue: CaseValue,
  defaultValue: CaseValue,
): ExpressionSpecification => [
  'case',
  ['boolean', ['feature-state', 'hover'], false],
  hoverValue,
  defaultValue,
];

export const makeSelectedCase = (
  selectedValue: CaseValue,
  defaultValue: CaseValue,
): ExpressionSpecification => [
  'case',
  ['boolean', ['feature-state', 'selected'], false],
  selectedValue,
  defaultValue,
];
