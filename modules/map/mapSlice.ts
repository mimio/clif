import { createSelector, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import {
  featureIds as orderedIds,
  featureLookup,
} from 'constants/history';

type MapState = {
  selectedFeatureId: number | null;
  hoveredFeatureId: number | null;
  mapLoaded: boolean;
  popupId: string | null;
};

const initialState: MapState = {
  selectedFeatureId: null,
  hoveredFeatureId: null,
  mapLoaded: false,
  popupId: null,
};

export const mapSlice = createSlice({
  name: 'map',
  initialState,
  // Actions are named for what happened, not for the field they write, so the
  // same event can drive both the store and the listener that syncs Mapbox.
  reducers: {
    mapLoaded(state) {
      state.mapLoaded = true;
    },
    mapReset() {
      return initialState;
    },
    featureSelected(state, action: PayloadAction<number>) {
      state.selectedFeatureId = action.payload;
    },
    selectionCleared(state) {
      state.selectedFeatureId = initialState.selectedFeatureId;
    },
    featureHovered(state, action: PayloadAction<number>) {
      state.hoveredFeatureId = action.payload;
    },
    featureUnhovered(state) {
      state.hoveredFeatureId = initialState.hoveredFeatureId;
    },
    // Only the generated element id lives in the store; the Popup instance
    // itself is not serializable and stays in the thunk module.
    popupOpened(state, action: PayloadAction<string>) {
      state.popupId = action.payload;
    },
    popupClosed(state) {
      state.popupId = initialState.popupId;
    },
  },
  selectors: {
    selectMapLoaded: (state) => state.mapLoaded,
    selectHoveredFeatureId: (state) => state.hoveredFeatureId,
    selectSelectedFeatureId: (state) => state.selectedFeatureId,
    selectPopupId: (state) => state.popupId,
  },
});

export const {
  mapLoaded,
  mapReset,
  featureSelected,
  selectionCleared,
  featureHovered,
  featureUnhovered,
  popupOpened,
  popupClosed,
} = mapSlice.actions;

export const {
  selectMapLoaded,
  selectHoveredFeatureId,
  selectSelectedFeatureId,
  selectPopupId,
} = mapSlice.selectors;

export const selectIsFeatureSelected = createSelector(
  selectSelectedFeatureId,
  (id) => id !== null,
);

export const selectSelectedFeature = createSelector(
  selectSelectedFeatureId,
  (id) => (id === null ? undefined : featureLookup[id]),
);

export const selectIsFirstFeatureSelected = createSelector(
  selectSelectedFeatureId,
  (id) => id !== null && orderedIds.indexOf(id) === 0,
);

export const selectIsLastFeatureSelected = createSelector(
  selectSelectedFeatureId,
  (id) =>
    id !== null && orderedIds.indexOf(id) === orderedIds.length - 1,
);

export const selectPrevFeatureId = createSelector(
  selectSelectedFeatureId,
  selectIsFirstFeatureSelected,
  (id, bail): number | null => {
    if (id === null || bail) return id;
    return orderedIds[orderedIds.indexOf(id) - 1] ?? null;
  },
);

export const selectNextFeatureId = createSelector(
  selectSelectedFeatureId,
  selectIsLastFeatureSelected,
  (id, bail): number | null => {
    if (id === null || bail) return id;
    return orderedIds[orderedIds.indexOf(id) + 1] ?? null;
  },
);
