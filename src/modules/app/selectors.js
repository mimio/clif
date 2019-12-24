import { get } from 'lodash-es';
import { createSelector } from 'reselect';

export const selectState = state => state.app;

export const selectProgress = createSelector(selectState, app =>
  get(app, 'progress'),
);

export const selectSelectedTab = createSelector(selectState, app =>
  get(app, 'selectedTab'),
);
