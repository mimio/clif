const fs = require('fs');
const helpers = require('@turf/helpers');
const bboxModule = require('@turf/bbox');
const mapboxConfig = require('./mapboxConfig');
const features = require('./features');
const sources = require('../constants/source');
const geojsonUtils = require('../utils/geojson');
const colors = require('../styles/theme/colors');

const bbox = bboxModule.default;
const { makeHoverCase, makeSelectedCase } = geojsonUtils;

const featureLookup = features.reduce(
  (acc, ft) => ({ ...acc, [ft.id]: ft }),
  {},
);

const chronoFeatures = features.sort(
  (a, b) => a.date.end > b.date.end,
);

const chronoFeatureIds = chronoFeatures.map(({ id }) => id);

const chronoCoords = chronoFeatures.map(
  ({ coordinates }) => coordinates,
);

const pathGeojson = helpers.lineString(chronoCoords);

const geojson = geojsonUtils.arrayToFeatureCollection(chronoFeatures);

const filteredGeojson = {
  ...geojson,
  features: geojson.features.filter(
    (feature) => !feature.properties.outlier,
  ),
};

const geojsonBounds = bbox(filteredGeojson);

const configWithBounds = {
  ...mapboxConfig,
  bounds: geojsonBounds,
};

const mapLayers = [
  {
    id: sources.WORK_PATH_SOURCE,
    type: 'line',
    source: {
      type: 'geojson',
      data: pathGeojson,
    },
    paint: {
      'line-color': colors.text2,
      'line-opacity': 0.5,
      'line-width': 1,
    },
  },
  {
    id: sources.WORK_SOURCE,
    type: 'circle',
    source: {
      type: 'geojson',
      data: geojson,
    },
    paint: {
      'circle-color': colors.ctaBackground1,
      'circle-radius': makeSelectedCase(8, 6),
      'circle-stroke-width': makeSelectedCase(
        10,
        makeHoverCase(8, 5),
      ),
      'circle-stroke-color': colors.ctaBackground1,
      'circle-stroke-opacity': makeHoverCase(0.3, 0.2),
    },
  },
  {
    id: sources.WORK_LABEL_SOURCE,
    type: 'symbol',
    source: {
      type: 'geojson',
      data: geojson,
    },
    paint: {
      'text-color': colors.text2,
    },
    layout: {
      'text-field': '{company}',
      'text-font': ['Andale Mono Regular'],
      'text-anchor': 'left',
      'text-offset': [1.5, 0.3],
      'text-transform': 'uppercase',
    },
  },
];

const mapLayerIds = mapLayers.map((layer) => layer.id);

const data = [
  { name: 'mapLayers', json: mapLayers },
  { name: 'mapLayerIds', json: mapLayerIds },
  { name: 'bounds', json: geojsonBounds },
  { name: 'featureLookup', json: featureLookup },
  { name: 'featureIds', json: chronoFeatureIds },
  { name: 'mapConfig', json: configWithBounds },
];

const basepath = './public/history';

data.forEach(({ name, json }) => {
  const string = JSON.stringify(json);
  const path = `${basepath}/${name}.json`;
  fs.writeFile(path, string, (err) => {
    if (err) {
      console.log('Error writing file', err);
    } else {
      console.log(`Successfully wrote ${path}`);
    }
  });
});
