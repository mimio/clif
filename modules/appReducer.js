import { combineReducers } from 'redux';

import { appReducer } from './app/reducer';
import { geojsonReducer } from './geojson/reducer';
import { mapReducer } from './map/reducer';

export default combineReducers({
  app: appReducer,
  geojson: geojsonReducer,
  map: mapReducer,
});
