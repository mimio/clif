import { createSelector } from 'reselect';
import { selectTrailGeoJson } from '../geojson';

export const selectMapLayers = createSelector(
  selectTrailGeoJson,
  trailData => ({
    id: 'lines',
    type: 'line',
    source: {
      type: 'geojson',
      data: trailData,
    },
    paint: {
      'line-width': 3,
      'line-color': ['get', 'color'],
    },
  }),
);
