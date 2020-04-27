export const emptyGeoJson = {
  type: 'FeatureCollection',
  features: [],
};

export const createGeoJsonFeature = (properties) => {
  const { coordinates, id } = properties;
  return {
    type: 'Feature',
    id,
    geometry: { type: 'Point', coordinates },
    properties,
  };
};

export const arrayToFeatureCollection = (data) => ({
  type: 'FeatureCollection',
  features: data.map(createGeoJsonFeature),
});
