import { configureStore } from '@reduxjs/toolkit';
import type { ThunkAction } from '@reduxjs/toolkit';

import { appSlice } from './app/appSlice';
import { mapSlice } from './map/mapSlice';
import setupMapListeners from './map/mapListeners';
import { thunkExtra, type ThunkExtra } from './extraArgument';
import { listenerMiddleware } from './listenerMiddleware';

// Listeners live on the shared middleware instance, not on a store, so they are
// registered once here. Clearing first keeps that true even if this module is
// re-evaluated (a Fast Refresh): RTK matches existing entries by function
// identity, and the closures below are new every time.
listenerMiddleware.clearListeners();
setupMapListeners();

// Every action the slices can produce. Thunks are typed against this union
// rather than a bare Action, so a thunk cannot dispatch something the store
// does not model — the same guarantee the pre-Toolkit store gave.
type RootAction =
  | ReturnType<
      (typeof appSlice.actions)[keyof typeof appSlice.actions]
    >
  | ReturnType<
      (typeof mapSlice.actions)[keyof typeof mapSlice.actions]
    >;

// The store is built per caller rather than exported as a module singleton.
// Nothing dispatches during a server render today, so no state actually leaks;
// this just removes the shared mutable module global that would make it
// possible.
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
        // First in the chain, so the state the listener compares against is
        // the one from before the reducers ran.
        .prepend(listenerMiddleware.middleware),
    // configureStore defaults this to true in every environment, where the
    // store it replaced composed the devtools enhancer only in development.
    devTools: process.env.NODE_ENV === 'development',
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];

// Thunks receive the injected dependencies as their extra argument.
export type AppThunk<ThunkReturnType = void> = ThunkAction<
  ThunkReturnType,
  RootState,
  ThunkExtra,
  RootAction
>;
