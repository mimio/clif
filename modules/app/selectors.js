import get from 'lodash.get';
import { createSelector } from 'reselect';
import { isMobile, isTablet } from 'styles/breakpoints';
import { MOBILE, TABLET, DESKTOP } from 'constants/devices';

export const selectState = (state) => state.app;

export const selectScreenWidth = createSelector(selectState, (app) =>
  get(app, 'screenSize.x'),
);

export const selectDevice = createSelector(
  selectScreenWidth,
  (width) => {
    if (isMobile(width)) return MOBILE;
    if (isTablet(width)) return TABLET;
    return DESKTOP;
  },
);

export const selectIsMobile = createSelector(
  selectDevice,
  (device) => device === MOBILE,
);
