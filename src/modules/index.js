import { combineReducers } from 'redux';

import { appReducer } from './app';
import { filterReducer } from './filters';
import { mapReducer } from './map';

export default combineReducers({
  app: appReducer,
  filter: filterReducer,
  map: mapReducer,
});
