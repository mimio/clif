import { fetchData as apiFetchData } from 'api';

export const FETCH_DATA = 'geojson/fetch';

export const fetchData = () => ({
  type: FETCH_DATA,
  promise: apiFetchData(),
});
