import { get } from 'lodash-es';
import { createSelector } from 'reselect';

export const selectApp = state => state.app;

export const selectProgress = createSelector(selectApp, app =>
  get(app, 'progress'),
);

export const selectSelectedTab = createSelector(selectApp, app =>
  get(app, 'selectedTab'),
);
