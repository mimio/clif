// Generates the static history-map data in public/history/ from features.ts.
// Run with `pnpm preprocess` (Node 22.18+ executes TypeScript directly).
//
// The app modules imported below are plain .ts files in a package without a
// "type" field, so Node warns that it has to sniff them for ESM syntax; the
// pnpm script silences that one warning with --disable-warning.
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { bbox } from '@turf/bbox';
import { lineString } from '@turf/helpers';
import type { Map as MapboxMap } from 'mapbox-gl';
import mapboxConfig from './mapboxConfig.js';
import { features, type HistoryFeature } from './features.ts';
import {
  WORK_SOURCE,
  WORK_PATH_SOURCE,
  WORK_LABEL_SOURCE,
} from '../constants/source.ts';
import {
  arrayToFeatureCollection,
  makeHoverCase,
  makeSelectedCase,
} from '../utils/geojson.ts';
import colors from '../styles/theme/colors.ts';

const featureLookup = features.reduce<Record<number, HistoryFeature>>(
  (acc, ft) => ({ ...acc, [ft.id]: ft }),
  {},
);

// Ascending by end date; a missing end date means "current", which sorts last.
const chronoFeatures = [...features].sort(
  (a, b) => (a.date.end ?? Infinity) - (b.date.end ?? Infinity),
);

const chronoFeatureIds = chronoFeatures.map(({ id }) => id);

const chronoCoords = chronoFeatures.map(
  ({ coordinates }) => coordinates,
);

const pathGeojson = lineString(chronoCoords);

const geojson = arrayToFeatureCollection(chronoFeatures);

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

// The layer type accepted by Map#addLayer, which allows inline sources.
type MapLayer = Parameters<MapboxMap['addLayer']>[0];

const mapLayers: MapLayer[] = [
  {
    id: WORK_PATH_SOURCE,
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
    id: WORK_SOURCE,
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
    id: WORK_LABEL_SOURCE,
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

const data: { name: string; json: unknown }[] = [
  { name: 'mapLayers', json: mapLayers },
  { name: 'mapLayerIds', json: mapLayerIds },
  { name: 'bounds', json: geojsonBounds },
  { name: 'featureLookup', json: featureLookup },
  { name: 'featureIds', json: chronoFeatureIds },
  { name: 'mapConfig', json: configWithBounds },
];

const outputDir = path.join(
  import.meta.dirname,
  '..',
  'public',
  'history',
);

await Promise.all(
  data.map(async ({ name, json }) => {
    const file = path.join(outputDir, `${name}.json`);
    await writeFile(file, JSON.stringify(json));
    console.log(
      `Successfully wrote ${path.relative(process.cwd(), file)}`,
    );
  }),
);
