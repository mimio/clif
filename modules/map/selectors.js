import { createSelector } from 'reselect';
import get from 'lodash.get';
import featureLookup from 'public/history/featureLookup';
import featureIds from 'public/history/featureIds';

export const selectMapState = (state) => state.map;

export const selectMapLoaded = createSelector(selectMapState, (map) =>
  get(map, 'mapLoaded', false),
);

export const selectHoveredFeatureId = createSelector(
  selectMapState,
  (map) => get(map, 'hoveredFeatureId'),
);

export const selectSelectedFeatureId = createSelector(
  selectMapState,
  (map) => get(map, 'selectedFeatureId'),
);

export const selectIsFeatureSelected = createSelector(
  selectSelectedFeatureId,
  (id) => !!id,
);

export const selectSelectedFeature = createSelector(
  selectSelectedFeatureId,
  (id) => featureLookup[id],
);

export const selectIsFirstFeatureSelected = createSelector(
  selectSelectedFeatureId,
  (id) => featureIds.indexOf(id) === 0,
);

export const selectIsLastFeatureSelected = createSelector(
  selectSelectedFeatureId,
  (id) => featureIds.indexOf(id) === featureIds.length - 1,
);

export const selectPrevFeatureId = createSelector(
  selectSelectedFeatureId,
  selectIsFirstFeatureSelected,
  (id, bail) => {
    if (bail) return id;
    return featureIds[featureIds.indexOf(id) - 1];
  },
);

export const selectNextFeatureId = createSelector(
  selectSelectedFeatureId,
  selectIsLastFeatureSelected,
  (id, bail) => {
    if (bail) return id;
    return featureIds[featureIds.indexOf(id) + 1];
  },
);

export const selectPopupId = createSelector(
  selectMapState,
  (map) => map.popupId,
);
