import { createSelector } from 'reselect';
import { getSearchEngine } from 'utils/search';
import { arrayToFeatureCollection } from 'utils/geojson';
import { selectSearchValue } from '../filters';

export const selectGeoJsonState = state => state.geojson;

export const selectData = createSelector(
  selectGeoJsonState,
  state => state.data,
);

export const selectFeatureList = createSelector(selectData, data =>
  Object.values(data),
);

export const selectFilteredResults = createSelector(
  selectSearchValue,
  selectFeatureList,
  (searchValue, features) => {
    const engine = getSearchEngine();
    if (!engine || !searchValue) return features;
    const results = engine.search(searchValue).map(feat => feat.UID);
    return features.filter(feat => results.includes(feat.UID));
  },
);

export const selectLookup = createSelector(selectData, data => data);

export const selectGeoJson = createSelector(
  selectFilteredResults,
  features => arrayToFeatureCollection(Object.values(features)),
);
