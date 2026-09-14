import { combineReducers, type Reducer } from 'redux';

import { appReducer, type AppState } from './app/reducer';
import type { AppAction } from './app/actions';
import { mapReducer, type MapState } from './map/reducer';
import type { MapAction } from './map/types';

// Each slice reducer narrows its action parameter to its own union, but at
// runtime every dispatched action reaches every slice. Redux's combineReducers
// infers a `never` preloaded-state shape for narrowed reducers, so widen them
// back to the default UnknownAction at the boundary.
const rootReducer = combineReducers({
  app: appReducer as Reducer<AppState>,
  map: mapReducer as Reducer<MapState>,
});

export type RootState = ReturnType<typeof rootReducer>;

// Every action the app dispatches; thunks and the store's dispatch are typed
// against this union rather than UnknownAction.
export type RootAction = AppAction | MapAction;

export default rootReducer;
