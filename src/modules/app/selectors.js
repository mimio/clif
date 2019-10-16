import { get } from 'lodash-es';
import { createSelector } from 'reselect';

export const selectAppState = state => state.app;
export const selectSidePanelOpen = createSelector(
  selectAppState,
  app => get(app, 'sidePanelOpen', true),
);
