import { get } from 'lodash-es';
import { createSelector } from 'reselect';
import { orderedTabs } from 'constants/tabs';

export const selectApp = state => state.app;

export const selectTabProgress = createSelector(selectApp, app =>
  get(app, 'tabProgress'),
);

export const selectSelectedTab = createSelector(selectApp, app =>
  get(app, 'selectedTab'),
);

export const selectTabIndex = createSelector(
  selectSelectedTab,
  selectedTab => orderedTabs.indexOf(selectedTab),
);

export const selectIsLastTab = createSelector(
  selectTabIndex,
  index => index === orderedTabs.length - 1,
);

export const selectNextTab = createSelector(
  [selectTabIndex, selectIsLastTab],
  (index, isLastTab) => orderedTabs[isLastTab ? index : index + 1],
);

export const selectAppProgress = createSelector(
  [selectTabProgress, selectTabIndex],
  (progress, index) =>
    ((progress + index * 100) / (orderedTabs.length * 100)) * 100,
);
