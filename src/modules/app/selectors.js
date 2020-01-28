import { get } from 'lodash-es';
import { createSelector } from 'reselect';
import { isMobile, isTablet } from 'styles/breakpoints';
import { MOBILE, TABLET, DESKTOP } from 'constants/devices';

export const selectState = state => state.app;

export const selectIsCursorActive = createSelector(selectState, app =>
  get(app, 'isCursorActive'),
);

export const selectScreenWidth = createSelector(selectState, app =>
  get(app, 'screenSize.x'),
);

export const selectDevice = createSelector(
  selectScreenWidth,
  width => {
    if (isMobile(width)) return MOBILE;
    if (isTablet(width)) return TABLET;
    return DESKTOP;
  },
);

export const selectIsMobile = createSelector(
  selectDevice,
  device => device === MOBILE,
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
