import { middleware as reduxPackMiddleware } from 'redux-pack';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension/developmentOnly';
import { createStore, applyMiddleware, compose } from 'redux';
import { getMap } from 'utils/map';

import appReducer from './modules';

const rootReducer = (state, action) => appReducer(state, action);

function configureStore() {
  const middlewares = [
    thunk.withExtraArgument(getMap),
    reduxPackMiddleware,
  ];

  let composeFn = compose;

  if (__DEV__) {
    composeFn = composeWithDevTools;
  }

  const store = createStore(
    rootReducer,
    composeFn(applyMiddleware(...middlewares)),
  );

  return store;
}

export default configureStore();
