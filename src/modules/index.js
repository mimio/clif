import { combineReducers } from 'redux';

import { appReducer } from './app';
import { geojsonReducer } from './geojson';
import { mapReducer } from './map';

export default combineReducers({
  app: appReducer,
  geojson: geojsonReducer,
  map: mapReducer,
});
