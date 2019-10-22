import { createSelector } from 'reselect';
import { getSearchEngine } from 'utils/search';

export const selectFilters = state => state.filters;

export const selectSearchValue = createSelector(
  selectFilters,
  filters => filters.search,
);

export const selectSearchResults = createSelector(
  selectSearchValue,
  value => {
    const engine = getSearchEngine();
    if (!engine) return [];
    const results = engine.search(value);

    return results.map(feat => feat.UID);
  },
);
