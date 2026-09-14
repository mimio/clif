import { createListenerMiddleware } from '@reduxjs/toolkit';
import type { AppDispatch, RootState } from './store';
import { thunkExtra, type ThunkExtra } from './extraArgument';

// Created here rather than in store.ts so a feature module can reach
// startAppListening without importing the store at runtime, which would be a
// cycle. Feature modules export a setup function rather than registering at
// their own module scope: store.ts clears this instance before calling them,
// so anything registered outside that sequence would be dropped.
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
