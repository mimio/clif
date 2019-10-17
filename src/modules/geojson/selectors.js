import { createSelector } from 'reselect';
import { arrayToFeatureCollection } from '../../utils/geojson';

export const selectGeoJsonState = state => state.geojson;

export const selectData = createSelector(
  selectGeoJsonState,
  state => state.data,
);

export const selectFeatureList = createSelector(selectData, data =>
  Object.values(data),
);

export const selectLookup = createSelector(selectData, data => data);

export const selectGeoJson = createSelector(
  selectFeatureList,
  features => arrayToFeatureCollection(Object.values(features)),
);
