export const emptyGeoJson = {
  type: 'FeatureCollection',
  features: [],
};

export const createGeoJsonFeature = ({
  coordinates,
  type,
  ...rest
}) => ({
  type: 'Feature',
  id: rest.id,
  geometry: { type, coordinates },
  properties: rest,
});

export const arrayToFeatureCollection = data => ({
  type: 'FeatureCollection',
  features: data.map(createGeoJsonFeature),
});
