import { createSelector } from 'reselect';
import { get } from 'lodash-es';
import { WORK_SOURCE } from 'constants/source';
import {
  selectGeoJson,
  selectLookup,
  selectGeoJsonBounds,
} from '../geojson/selectors';

export const selectMapState = state => state.map;

export const selectMapLoaded = createSelector(selectMapState, map =>
  get(map, 'mapLoaded', false),
);

export const selectMapConfig = createSelector(
  selectMapState,
  selectGeoJsonBounds,
  ({ config }, bounds) => ({
    ...config,
    bounds,
  }),
);

const makeHoverCase = (hoverValue, defaultValue) => [
  'case',
  ['boolean', ['feature-state', 'hover'], false],
  hoverValue,
  defaultValue,
];

// const makeSelectedCase = (selectedValue, defaultValue) => [
//   'case',
//   ['boolean', ['feature-state', 'selected'], false],
//   selectedValue,
//   defaultValue,
// ];

export const selectMapLayers = createSelector(selectGeoJson, data => [
  {
    id: WORK_SOURCE,
    type: 'symbol',
    source: {
      type: 'geojson',
      data,
    },
    layout: {
      'icon-image': 'marker',
      'icon-allow-overlap': false,
      'icon-size': 1.2,
    },
    paint: {
      'icon-opacity': makeHoverCase(0.7, 1),
    },
  },
]);

export const selectHoveredFeatureId = createSelector(
  selectMapState,
  map => get(map, 'hoveredFeatureId'),
);

export const selectSelectedFeatureId = createSelector(
  selectMapState,
  map => get(map, 'selectedFeatureId'),
);

export const selectSelectedFeature = createSelector(
  selectSelectedFeatureId,
  selectLookup,
  (id, lookup) => get(lookup, id, {}),
);

export const selectPopupId = createSelector(
  selectMapState,
  map => map.popupId,
);
