import { createSelector } from 'reselect';
import { get } from 'lodash-es';
import bbox from '@turf/bbox';
import colors from 'styles/colors';
import {
  POINT,
  LINE,
  POLYGON,
  USER_LOCATION,
} from 'constants/sources';

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

export const selectUserLocation = createSelector(
  selectMapState,
  map => get(map, 'userLocation'),
);

export const selectUserLocationGeoJson = createSelector(
  selectUserLocation,
  location =>
    location
      ? {
          type: 'Point',
          coordinates: location,
        }
      : {
          type: 'FeatureCollection',
          features: [],
        },
);

export const selectMapLayers = createSelector(
  selectTrailGeoJson,
  selectWaypointsGeoJson,
  selectAreasGeoJson,
  selectUserLocationGeoJson,
  (trailData, waypointData, areasData, userLocationData) => [
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
    {
      id: USER_LOCATION,
      type: 'circle',
      source: {
        type: 'geojson',
        data: userLocationData,
      },
      paint: {
        'circle-color': colors.ultraLimeGreen,
        'circle-radius': 6,
        'circle-stroke-width': 8,
        'circle-stroke-color': colors.transparentLimeGreen,
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
