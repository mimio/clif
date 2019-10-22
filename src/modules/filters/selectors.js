import { createSelector } from 'reselect';

export const selectFilters = state => state.filters;

export const selectSearchValue = createSelector(
  selectFilters,
  filters => filters.search,
);
