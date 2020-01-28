import { createSelector } from 'reselect';
import { get } from 'lodash-es';
import {
  WORK_SOURCE,
  WORK_LABEL_SOURCE,
  WORK_PATH_SOURCE,
} from 'constants/source';
import colors from 'styles/colors';
import {
  selectGeoJson,
  selectLookup,
  selectGeoJsonBounds,
  selectWorkPathGeoJson,
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

const makeSelectedCase = (selectedValue, defaultValue) => [
  'case',
  ['boolean', ['feature-state', 'selected'], false],
  selectedValue,
  defaultValue,
];

export const selectMapLayers = createSelector(
  selectGeoJson,
  selectWorkPathGeoJson,
  (data, lineData) => [
    {
      id: WORK_PATH_SOURCE,
      type: 'line',
      source: {
        type: 'geojson',
        data: lineData,
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
        data,
      },
      paint: {
        'circle-color': colors.ctaBackground1,
        'circle-radius': 8,
        'circle-stroke-width': makeSelectedCase(10, 8),
        'circle-stroke-color': colors.ctaBackground1,
        'circle-stroke-opacity': makeHoverCase(0.3, 0.2),
      },
    },
    {
      id: WORK_LABEL_SOURCE,
      type: 'symbol',
      source: {
        type: 'geojson',
        data,
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
  ],
);

export const selectHoveredFeatureId = createSelector(
  selectMapState,
  map => get(map, 'hoveredFeatureId'),
);

export const selectSelectedFeatureId = createSelector(
  selectMapState,
  map => get(map, 'selectedFeatureId'),
);

export const selectIsFeatureSelected = createSelector(
  selectSelectedFeatureId,
  id => !!id,
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
