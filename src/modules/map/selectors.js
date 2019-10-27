import { createSelector } from 'reselect';
import {
  selectTrailGeoJson,
  selectWaypointsGeoJson,
} from '../geojson';

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
        'line-width': 3,
        'line-color': ['get', 'color'],
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
        'circle-radius': 5,
      },
    },
  ],
);
