import { get } from 'lodash-es';
import { createSelector } from 'reselect';

export const selectState = state => state.app;

export const selectIsCursorActive = createSelector(selectState, app =>
  get(app, 'isCursorActive'),
);

export const selectMouseCoordinates = createSelector(
  selectState,
  app => get(app, 'mouseCoordinates'),
);

export const selectNormalizedMouseCoordinates = createSelector(
  selectMouseCoordinates,
  ([x, y]) => {
    const { innerWidth, innerHeight } = window;
    const _x = (x - innerWidth / 2) / (innerWidth / 2);
    const _y = -(y - innerHeight / 2) / (innerHeight / 2);
    return [_x, _y];
  },
);
