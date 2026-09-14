import { createListenerMiddleware } from '@reduxjs/toolkit';
import type { AppDispatch, RootState } from './store';
import { thunkExtra, type ThunkExtra } from './extraArgument';

// Created here rather than in store.ts so that feature modules can register
// listeners without importing the store at runtime, which would be a cycle.
// https://redux-toolkit.js.org/api/createListenerMiddleware#typescript-usage
export const listenerMiddleware = createListenerMiddleware({
  extra: thunkExtra,
});

// Pre-typed `startListening`, the listener equivalent of the pre-typed hooks.
export const startAppListening =
  listenerMiddleware.startListening.withTypes<
    RootState,
    AppDispatch,
    ThunkExtra
  >();
