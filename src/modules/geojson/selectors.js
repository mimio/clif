import { createSelector } from 'reselect';
import { arrayToFeatureCollection } from 'utils/geojson';
import { POINT, LINE, POLYGON } from 'constants/featureTypes';

import {
  selectSearchResults,
  selectSearchValue,
} from '../filters/selectors';

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
  selectSearchResults,
  selectFeatureList,
  (value, results, features) =>
    !value
      ? features
      : features.filter(feat => results.includes(feat.id)),
);

export const selectLookup = createSelector(selectData, data => data);

const makeGeojson = (data, geometryType) => ({
  type: 'FeatureCollection',
  features: data
    .filter(({ type }) => type === geometryType)
    .map(({ coordinates, type, ...rest }) => ({
      type: 'Feature',
      id: rest.id,
      geometry: { type, coordinates },
      properties: rest,
    })),
});

export const selectTrailGeoJson = createSelector(
  selectFeatureList,
  data => makeGeojson(data, LINE),
);

export const selectWaypointsGeoJson = createSelector(
  selectFeatureList,
  data => makeGeojson(data, POINT),
);

export const selectAreasGeoJson = createSelector(
  selectFeatureList,
  data => makeGeojson(data, POLYGON),
);

export const selectGeoJson = createSelector(
  selectFilteredResults,
  features => arrayToFeatureCollection(Object.values(features)),
);
