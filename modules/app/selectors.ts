import { createSelector } from 'reselect';
import { isMobile, isTablet } from 'styles/breakpoints';
import {
  MOBILE,
  TABLET,
  DESKTOP,
  type Device,
} from 'constants/devices';
import type { RootState } from 'modules/store';

export const selectState = (state: RootState) => state.app;

export const selectScreenWidth = createSelector(
  selectState,
  (app) => app.screenSize?.x,
);

export const selectDevice = createSelector(
  selectScreenWidth,
  (width): Device => {
    if (isMobile(width)) return MOBILE;
    if (isTablet(width)) return TABLET;
    return DESKTOP;
  },
);

export const selectIsMobile = createSelector(
  selectDevice,
  (device) => device === MOBILE,
);
