const createGeoJsonFeature = (properties) => {
  const { coordinates, id } = properties;
  return {
    type: 'Feature',
    id,
    geometry: { type: 'Point', coordinates },
    properties,
  };
};

const arrayToFeatureCollection = (data) => ({
  type: 'FeatureCollection',
  features: data.map(createGeoJsonFeature),
});

const makeHoverCase = (hoverValue, defaultValue) => [
  'case',
  ['boolean', ['feature-state', 'hover'], false],
  hoverValue,
  defaultValue,
];

const makeSelectedCase = (selectedValue, defaultValue) => [
  'case',
  ['boolean', ['feature-state', 'selected'], false],
  selectedValue,
  defaultValue,
];

module.exports = {
  arrayToFeatureCollection,
  makeHoverCase,
  makeSelectedCase,
};
