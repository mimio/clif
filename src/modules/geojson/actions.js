import { fetchData as apiFetchData } from 'api';
import { createSearchEngine } from '../../utils/search';

export const FETCH_DATA = 'geojson/fetch';

export const fetchData = () => ({
  type: FETCH_DATA,
  promise: apiFetchData(),
  meta: {
    onSuccess: createSearchEngine,
  },
});
