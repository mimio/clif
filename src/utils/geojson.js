export const emptyGeoJson = {
  type: 'FeatureCollection',
  features: [],
};

export const createGeoJsonFeature = ({
  Longitude,
  Latitude,
  ...rest
}) => ({
  type: 'Feature',
  geometry: {
    coordinates: [parseFloat(Longitude), parseFloat(Latitude)],
    type: 'Point',
  },
  properties: {
    ...rest,
  },
});

export const arrayToFeatureCollection = data => ({
  type: 'FeatureCollection',
  features: data.map(createGeoJsonFeature),
});
