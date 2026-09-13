import { withExtraArgument } from 'redux-thunk';
import { composeWithDevTools } from '@redux-devtools/extension';
import {
  legacy_createStore as createStore,
  applyMiddleware,
  compose,
} from 'redux';
import { getMap } from 'utils/map';

import appReducer from './appReducer';

const rootReducer = (state, action) => appReducer(state, action);

function configureStore() {
  const middlewares = [withExtraArgument(getMap)];

  const composeFn =
    process.env.NODE_ENV === 'development'
      ? composeWithDevTools
      : compose;

  return createStore(
    rootReducer,
    composeFn(applyMiddleware(...middlewares)),
  );
}

export default configureStore;
