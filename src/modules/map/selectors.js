import { createSelector } from 'reselect';
import { get } from 'lodash-es';
import bbox from '@turf/bbox';
import colors from 'styles/colors';
import { POINT, LINE, POLYGON } from 'constants/featureTypes';

import {
  selectTrailGeoJson,
  selectWaypointsGeoJson,
  selectAreasGeoJson,
  selectLookup,
} from '../geojson';
import { config } from './config';

export const selectMapState = state => state.map;

export const selectMapConfig = createSelector(
  selectTrailGeoJson,
  geojson => {
    if (!geojson) return null;
    return {
      ...config,
      bounds: bbox(geojson),
    };
  },
);

export const selectMapLoaded = createSelector(selectMapState, map =>
  get(map, 'mapLoaded', false),
);

const makeStateCase = (value, fallbackValue) => [
  'case',
  [
    'any',
    ['boolean', ['feature-state', 'hover'], false],
    ['boolean', ['feature-state', 'selected'], false],
  ],
  value,
  fallbackValue,
];

export const selectMapLayers = createSelector(
  selectTrailGeoJson,
  selectWaypointsGeoJson,
  selectAreasGeoJson,
  (trailData, waypointData, areasData) => [
    {
      id: LINE,
      type: 'line',
      source: {
        type: 'geojson',
        data: trailData,
      },
      paint: {
        'line-width': makeStateCase(5, 3),
        'line-color': makeStateCase(
          colors.ultraLimeGreen,
          colors.darkLimeGreen,
        ),
      },
    },
    {
      id: POINT,
      type: 'circle',
      source: {
        type: 'geojson',
        data: waypointData,
      },
      paint: {
        'circle-color': 'transparent',
        'circle-radius': 6,
        'circle-stroke-color': makeStateCase(
          colors.ultraLimeGreen,
          colors.limeGreen,
        ),
        'circle-stroke-width': makeStateCase(8, 6),
      },
    },
    {
      id: POLYGON,
      type: 'fill',
      source: {
        type: 'geojson',
        data: areasData,
      },
      paint: {
        'fill-color': colors.limeGreen,
        'fill-opacity': makeStateCase(0.8, 0.5),
      },
    },
  ],
);

export const selectHoveredFeature = createSelector(
  selectMapState,
  map => get(map, 'hoveredFeature'),
);

export const selectHoveredFeatureId = createSelector(
  selectHoveredFeature,
  feat => get(feat, 'id'),
);

export const selectSelectedFeatureId = createSelector(
  selectMapState,
  map => get(map, 'selectedFeature.id'),
);

export const selectSelectedFeature = createSelector(
  selectSelectedFeatureId,
  selectLookup,
  (id, lookup) => get(lookup, id, {}),
);
