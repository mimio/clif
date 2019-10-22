import { fetchData as apiFetchData } from 'api';
import { createSearchEngine } from '../../utils/search';

export const FETCH_DATA = 'geojson/fetch';
export const SELECT_FEATURE = 'geojson/selectFeature';
export const CLEAR_SELECTION = 'geojson/clearSelection';

export const fetchData = () => ({
  type: FETCH_DATA,
  promise: apiFetchData(),
  meta: {
    onSuccess: createSearchEngine,
  },
});

export const selectFeature = id => ({
  type: SELECT_FEATURE,
  payload: id,
});

export const clearSelection = () => ({
  type: CLEAR_SELECTION,
});
