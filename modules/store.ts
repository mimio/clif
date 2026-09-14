import { configureStore } from '@reduxjs/toolkit';
import type { Action, ThunkAction } from '@reduxjs/toolkit';

import { appSlice } from './app/appSlice';
import { mapSlice } from './map/mapSlice';
import setupMapListeners from './map/mapListeners';
import { thunkExtra, type ThunkExtra } from './extraArgument';
import { listenerMiddleware } from './listenerMiddleware';

// Listeners are attached to the shared middleware instance once, not per
// store, so that a second makeStore() call does not register them twice.
setupMapListeners();

// The store is built per caller rather than exported as a module singleton, so
// a server render can never hand one request's state to the next.
// https://redux.js.org/usage/nextjs
export const makeStore = () =>
  configureStore({
    // configureStore calls combineReducers for a plain object of slice
    // reducers; combineSlices is only needed for lazy-loaded slices.
    reducer: {
      [appSlice.reducerPath]: appSlice.reducer,
      [mapSlice.reducerPath]: mapSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        // Thunks reach the Mapbox instance through the injected accessor
        // rather than importing it.
        thunk: { extraArgument: thunkExtra },
      })
        // Ahead of the serializability check, which would otherwise reject the
        // functions carried by the listener middleware's own actions.
        .prepend(listenerMiddleware.middleware),
    // configureStore wires up the Redux DevTools Extension itself, outside
    // production, so there is no compose() dance to hand-roll.
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];

// Thunks receive the injected dependencies as their extra argument.
export type AppThunk<ThunkReturnType = void> = ThunkAction<
  ThunkReturnType,
  RootState,
  ThunkExtra,
  Action<string>
>;
