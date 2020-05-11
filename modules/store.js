import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension/developmentOnly';
import { createStore, applyMiddleware, compose } from 'redux';
import { getMap } from 'utils/map';

import appReducer from './appReducer';

const rootReducer = (state, action) => appReducer(state, action);

function configureStore() {
  const middlewares = [thunk.withExtraArgument(getMap)];

  let composeFn = compose;

  if (process.env === 'development') {
    composeFn = composeWithDevTools;
  }

  const store = createStore(
    rootReducer,
    composeFn(applyMiddleware(...middlewares)),
  );

  return store;
}

export default configureStore;
