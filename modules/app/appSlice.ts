import { createSelector, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { isMobile, isTablet } from 'styles/breakpoints';
import {
  MOBILE,
  TABLET,
  DESKTOP,
  type Device,
} from 'constants/devices';

export type ScreenSize = { x: number; y: number };

export type AppState = {
  screenSize: ScreenSize | null;
};

const initialState: AppState = {
  screenSize: null,
};

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    screenResized(state, action: PayloadAction<ScreenSize>) {
      state.screenSize = action.payload;
    },
  },
  // Selectors declared here receive the slice's own state and are published
  // as root-state selectors on `appSlice.selectors`, so the slice keeps
  // ownership of its shape.
  selectors: {
    selectScreenWidth: (state) => state.screenSize?.x,
  },
});

export const { screenResized } = appSlice.actions;

export const { selectScreenWidth } = appSlice.selectors;

// Derived values are computed rather than stored, so the slice holds only the
// measured size.
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
