import { createSelector } from 'reselect';
import bbox from '@turf/bbox';
import {
  selectTrailGeoJson,
  selectWaypointsGeoJson,
} from '../geojson';
import { config } from './config';

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
        generateId: true, // https://github.com/mapbox/mapbox-gl-js/pull/7043
      },
      paint: {
        'line-width': 3,
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
        generateId: true,
      },
      paint: {
        'circle-color': ['get', 'color'],
        'circle-radius': 5,
      },
    },
  ],
);
