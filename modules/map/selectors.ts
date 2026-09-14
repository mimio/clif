import { createSelector } from 'reselect';
import {
  featureIds as orderedIds,
  featureLookup,
} from 'constants/history';
import type { RootState } from 'modules/store';

export const selectMapState = (state: RootState) => state.map;

export const selectMapLoaded = createSelector(
  selectMapState,
  (map) => map.mapLoaded,
);

export const selectHoveredFeatureId = createSelector(
  selectMapState,
  (map) => map.hoveredFeatureId,
);

export const selectSelectedFeatureId = createSelector(
  selectMapState,
  (map) => map.selectedFeatureId,
);

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

export const selectPopupId = createSelector(
  selectMapState,
  (map) => map.popupId,
);
