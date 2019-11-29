import { get } from 'lodash-es';
import { createSelector } from 'reselect';
import { selectSelectedFeature } from '../map';

export const selectAppState = state => state.app;
export const selectSidePanelOpen = createSelector(
  selectAppState,
  app => get(app, 'sidePanelOpen', true),
);

export const selectShowDetailView = createSelector(
  selectSelectedFeature,
  feature => !!feature.id,
);
