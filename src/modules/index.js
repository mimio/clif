import { combineReducers } from 'redux';

import { appReducer } from './app';
import { polygonReducer } from './polygon';

export default combineReducers({
  app: appReducer,
  polygon: polygonReducer,
});
