export const emptyGeoJson = {
  type: 'FeatureCollection',
  features: [],
};

export const createGeoJsonFeature = ({
  coordinates,
  ...properties
}) => {
  const { source, id } = properties;
  return {
    type: 'Feature',
    id,
    geometry: { type: source, coordinates },
    properties,
  };
};

export const arrayToFeatureCollection = data => ({
  type: 'FeatureCollection',
  features: data.map(createGeoJsonFeature),
});
