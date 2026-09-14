import { withExtraArgument, type ThunkAction } from 'redux-thunk';
import { composeWithDevTools } from '@redux-devtools/extension';
import {
  legacy_createStore as createStore,
  applyMiddleware,
} from 'redux';
import { getMap, type GetMap } from 'utils/map';

import rootReducer, {
  type RootAction,
  type RootState,
} from './appReducer';

export type { RootAction, RootState };

// Thunks receive getMap() as their extra argument so they can drive the
// Mapbox instance directly.
export type AppThunk<Result = void> = ThunkAction<
  Result,
  RootState,
  GetMap,
  RootAction
>;

function configureStore() {
  const middleware = withExtraArgument<RootState, RootAction, GetMap>(
    getMap,
  );

  const enhancer = applyMiddleware(middleware);
  const composed: typeof enhancer =
    process.env.NODE_ENV === 'development'
      ? composeWithDevTools(enhancer)
      : enhancer;

  return createStore(rootReducer, composed);
}

export type AppStore = ReturnType<typeof configureStore>;
export type AppDispatch = AppStore['dispatch'];

export default configureStore;
