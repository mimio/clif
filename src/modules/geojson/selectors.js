import { get } from 'lodash-es';
import { createSelector } from 'reselect';
import { arrayToFeatureCollection } from 'utils/geojson';
import { POINT, LINE, POLYGON } from 'constants/sources';

import {
  selectSearchResults,
  selectSearchValue,
} from '../filters/selectors';

export const selectGeoJsonState = state => state.geojson;

export const selectData = createSelector(selectGeoJsonState, state =>
  get(state, 'data', {}),
);

export const selectFeatureList = createSelector(selectData, data =>
  Object.values(data),
);

export const selectFilteredResults = createSelector(
  selectSearchValue,
  selectSearchResults,
  selectFeatureList,
  (value, results, features) =>
    !value
      ? features
      : features.filter(feat => results.includes(feat.id)),
);

export const selectLookup = createSelector(selectData, data => data);

const makeFilteredGeojson = (data, geometryType) => {
  const filtered = data.filter(
    ({ source }) => source === geometryType,
  );
  return arrayToFeatureCollection(filtered);
};

export const selectTrailGeoJson = createSelector(
  selectFeatureList,
  data => makeFilteredGeojson(data, LINE),
);

export const selectWaypointsGeoJson = createSelector(
  selectFeatureList,
  data => makeFilteredGeojson(data, POINT),
);

export const selectAreasGeoJson = createSelector(
  selectFeatureList,
  data => makeFilteredGeojson(data, POLYGON),
);

export const selectGeoJson = createSelector(
  selectFilteredResults,
  features => arrayToFeatureCollection(Object.values(features)),
);
