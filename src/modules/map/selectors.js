import { createSelector } from 'reselect';
import { get } from 'lodash-es';
import bbox from '@turf/bbox';

import {
  selectTrailGeoJson,
  selectWaypointsGeoJson,
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

export const selectMapLayers = createSelector(
  selectTrailGeoJson,
  selectWaypointsGeoJson,
  (trailData, waypointData) => [
    {
      id: 'trails',
      type: 'line',
      source: {
        type: 'geojson',
        data: trailData,
      },
      paint: {
        'line-width': [
          'case',
          ['boolean', ['feature-state', 'hover'], false],
          5,
          3,
        ],
        'line-color': [
          'case',
          ['boolean', ['feature-state', 'hover'], false],
          'white',
          ['get', 'color'],
        ],
      },
    },
    {
      id: 'waypoints',
      type: 'circle',
      source: {
        type: 'geojson',
        data: waypointData,
      },
      paint: {
        'circle-color': ['get', 'color'],
        'circle-radius': [
          'case',
          ['boolean', ['feature-state', 'hover'], false],
          10,
          5,
        ],
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
  map => map.selectedFeature,
);

export const selectSelectedFeature = createSelector(
  selectSelectedFeatureId,
  selectLookup,
  (id, lookup) => get(lookup, id, null),
);
