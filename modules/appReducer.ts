import { combineReducers, type Reducer } from 'redux';

import { appReducer, type AppState } from './app/reducer';
import { mapReducer, type MapState } from './map/reducer';

// Each slice reducer narrows its action parameter to its own union, but at
// runtime every dispatched action reaches every slice. Redux's combineReducers
// infers a `never` preloaded-state shape for narrowed reducers, so widen them
// back to the default UnknownAction at the boundary.
const rootReducer = combineReducers({
  app: appReducer as Reducer<AppState>,
  map: mapReducer as Reducer<MapState>,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
