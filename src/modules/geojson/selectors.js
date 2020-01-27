import bbox from '@turf/bbox';
import { get } from 'lodash-es';
import { createSelector } from 'reselect';
import { arrayToFeatureCollection } from 'utils/geojson';

export const selectState = state => state.geojson;

export const selectData = createSelector(selectState, state =>
  get(state, 'data', []),
);

export const selectFeatureList = createSelector(selectData, data =>
  Object.values(data),
);

export const selectLookup = createSelector(selectData, data =>
  data.reduce((acc, ft) => ({ ...acc, [ft.id]: ft }), {}),
);

export const selectGeoJson = createSelector(
  selectFeatureList,
  features => arrayToFeatureCollection(features),
);

export const selectGeoJsonWithoutOutliers = createSelector(
  selectFeatureList,
  features =>
    arrayToFeatureCollection(
      features.filter(({ outlier }) => !outlier),
    ),
);

export const selectAreFeaturesEmpty = createSelector(
  selectFeatureList,
  list => list.length === 0,
);

export const selectIsInitialized = createSelector(
  selectState,
  state => state.updateCount > 0,
);

export const selectGeoJsonBounds = createSelector(
  selectGeoJsonWithoutOutliers,
  selectAreFeaturesEmpty,
  (geojson, isEmpty) => {
    if (isEmpty) return null;
    return bbox(geojson);
  },
);
