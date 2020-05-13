import { combineReducers } from 'redux';

import { appReducer } from './app/reducer';
import { mapReducer } from './map/reducer';

export default combineReducers({
  app: appReducer,
  map: mapReducer,
});
