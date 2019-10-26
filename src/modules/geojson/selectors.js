import { createSelector } from 'reselect';
import { arrayToFeatureCollection } from 'utils/geojson';
import { get } from 'lodash-es';
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
      : features.filter(feat => results.includes(feat.UID)),
);

export const selectSelectedFeatureId = createSelector(
  selectGeoJsonState,
  geojson => geojson.selectedFeature,
);

export const selectLookup = createSelector(selectData, data => data);

export const selectSelectedFeature = createSelector(
  selectSelectedFeatureId,
  selectLookup,
  (id, lookup) => get(lookup, id, null),
);

export const selectTrailGeoJson = createSelector(
  selectFeatureList,
  data => {
    const geojson = {
      type: 'FeatureCollection',
      features: data
        .filter(el => el.type === 'LineString')
        .map(({ coordinates, type, ...rest }) => ({
          type: 'Feature',
          geometry: { type, coordinates },
          properties: rest,
        })),
    };
    return geojson;
  },
);

export const selectWaypointsGeoJson = createSelector(
  selectFeatureList,
  data => {
    const geojson = {
      type: 'FeatureCollection',
      features: data
        .filter(el => el.type === 'Point')
        .map(({ coordinates, type, ...rest }) => ({
          type: 'Feature',
          geometry: { type, coordinates },
          properties: rest,
        })),
    };
    return geojson;
  },
);

export const selectGeoJson = createSelector(
  selectFilteredResults,
  features => arrayToFeatureCollection(Object.values(features)),
);
