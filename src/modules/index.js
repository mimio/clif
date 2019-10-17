import { combineReducers } from 'redux';

import { appReducer } from './app';
import { filterReducer } from './filters';
import { mapReducer } from './map';
import { geojsonReducer } from './geojson/reducer';

export default combineReducers({
  app: appReducer,
  filter: filterReducer,
  geojson: geojsonReducer,
  map: mapReducer,
});
