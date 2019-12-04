import { get } from 'lodash-es';
import { createSelector } from 'reselect';
import { arrayToFeatureCollection } from 'utils/geojson';
import { POINT, LINE, POLYGON } from 'constants/sources';

import {
  selectSearchResults,
  selectSearchValue,
} from '../filters/selectors';

export const selectGeoJsonState = state => state.geojson;


// todo: this is where all the fixing of data coming from their
// api is at - we should get them to fix it on their end
// should prolly be in reducer ;) 
// start data-fixing --------------------------------------------
export const selectData = createSelector(
  selectGeoJsonState,
  state => {
    const data = get(state, 'data', {});
    return Object.entries(data).reduce((acc, [id, feat]) => {
      acc[id] = {
        id,
        ...feat
      };
      return acc;
    }, {});
  },
);


const types = {
  'point': POINT,
  'line': LINE,
  'area': POLYGON
};

const parseCoordinates = coords => Array.isArray(coords) ? coords.map(c => parseFloat(c)) : parseFloat(coords);

export const selectRawFeatureList = createSelector(selectData, data => Object.values(data));

export const selectFeatureList = createSelector(selectData, data => Object.entries(data).map(([id, feat]) => ({
      ...feat,
      id,
      type: types[feat.type],
      coordinates: feat.type === 'area' ? [feat.coordinates.map(parseCoordinates)] : feat.coordinates.map(parseCoordinates)
    })));
// end data-fixing --------------------------------------------

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
  const filtered = data.filter(({ type }) => type === geometryType);
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

