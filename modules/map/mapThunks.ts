import { nanoid } from '@reduxjs/toolkit';
import type {
  Map as MapboxMap,
  MapMouseEvent,
  Popup,
} from 'mapbox-gl';
import mapboxGl from 'mapbox-gl-ssr';
import {
  BOUNDS_PADDING,
  BOUNDS_PADDING_MOBILE,
  MAP_PITCH,
  POPUP_MAX_WIDTH,
} from 'constants/map';
import { featureLookup, historyBounds } from 'constants/history';
import { selectIsMobile } from 'modules/app/appSlice';
import type { AppThunk } from 'modules/store';
import {
  featureHovered,
  featureSelected,
  featureUnhovered,
  popupClosed,
  popupOpened,
  selectHoveredFeatureId,
  selectIsFeatureSelected,
  selectMapLoaded,
  selectNextFeatureId,
  selectPopupId,
  selectPrevFeatureId,
  selectSelectedFeatureId,
  selectionCleared,
} from './mapSlice';

// Map event handlers receive the Mapbox event; the prev/next controls pass
// a feature id directly.
export type FeatureRef = MapMouseEvent | number;

// Imperative one-off commands to the Mapbox instance live in thunks, per the
// style guide's "Use Thunks and Listeners for Other Async Logic": they read
// state, talk to the map and dispatch. Keeping the highlighting sync in a
// listener instead leaves these free of feature-state bookkeeping.
// https://redux.js.org/style-guide/#use-thunks-and-listeners-for-other-async-logic

export const fitBounds =
  (): AppThunk =>
  (_dispatch, getState, { getMap }) => {
    const map = getMap();
    if (!map) return;
    const state = getState();

    map.fitBounds(historyBounds, {
      padding:
        selectIsMobile(state) && selectIsFeatureSelected(state)
          ? BOUNDS_PADDING_MOBILE
          : BOUNDS_PADDING,
      pitch: MAP_PITCH,
      essential: true,
    });
  };

export const unhoverFeature =
  (): AppThunk =>
  (dispatch, getState, { getMap }) => {
    const map = getMap();
    if (!map || !selectMapLoaded(getState())) return;

    map.getCanvas().style.cursor = 'grab';
    dispatch(featureUnhovered());
  };

// The Popup is a live DOM object, so it is held here instead of in the store,
// which must only hold serializable values. The store keeps the id of the
// element the popup renders, which is what the React portal needs.
// https://redux.js.org/style-guide/#do-not-put-non-serializable-values-in-state-or-actions
let popup: Popup | undefined;
const removePopup = () => {
  if (popup?.isOpen()) popup.remove();
};

export const clearSelection =
  (): AppThunk =>
  (dispatch, getState, { getMap }) => {
    const map = getMap();
    if (!map || !selectMapLoaded(getState())) return;

    removePopup();
    dispatch(selectionCleared());
  };

const getId = (map: MapboxMap, ref: FeatureRef): number | null => {
  if (typeof ref === 'number') return ref;
  const id: unknown = map.queryRenderedFeatures(ref.point)[0]
    ?.properties?.id;
  if (typeof id === 'number') return id;
  if (typeof id === 'string' && id !== '') return Number(id);
  return null;
};

export const selectFeature =
  (ref: FeatureRef): AppThunk =>
  (dispatch, getState, { getMap }) => {
    const state = getState();
    const map = getMap();
    if (!map || !selectMapLoaded(state)) return;

    const isMobile = selectIsMobile(state);
    const prevPopupId = selectPopupId(state);
    const prevSelectedId = selectSelectedFeatureId(state);

    const id = getId(map, ref);
    if (id === null) return;
    const feature = featureLookup[id];
    if (!feature) return;

    // Before the dispatch, as it was before the rewrite: the camera is already
    // in motion by the time anything observes the new selection.
    map.flyTo({
      center: feature.coordinates,
      offset: [0, isMobile ? -60 : 180],
      zoom: 12,
      essential: true,
    });

    if (id !== prevSelectedId) dispatch(featureSelected(id));

    if ((id !== prevSelectedId || !prevPopupId) && !isMobile) {
      removePopup();
      // RTK's nanoid rather than crypto.randomUUID(), which is only defined in
      // secure contexts and so is missing when the dev server is opened over
      // plain http from another device.
      const popupId = nanoid();
      popup = new mapboxGl.Popup({
        closeButton: false,
        offset: 30,
        maxWidth: POPUP_MAX_WIDTH,
      })
        .once('close', () => dispatch(popupClosed()))
        .setLngLat(feature.coordinates)
        .setHTML(`<div id="${popupId}"></div>`)
        .addTo(map);
      dispatch(popupOpened(popupId));
    }
  };

export const selectNextFeature =
  (): AppThunk => (dispatch, getState) => {
    const nextFeatureId = selectNextFeatureId(getState());
    if (nextFeatureId !== null)
      dispatch(selectFeature(nextFeatureId));
  };

export const selectPrevFeature =
  (): AppThunk => (dispatch, getState) => {
    const prevFeatureId = selectPrevFeatureId(getState());
    if (prevFeatureId !== null)
      dispatch(selectFeature(prevFeatureId));
  };

export const hoverFeature =
  (ref: FeatureRef): AppThunk =>
  (dispatch, getState, { getMap }) => {
    const state = getState();
    const map = getMap();
    if (!map || !selectMapLoaded(state)) return;
    const hoveredId = selectHoveredFeatureId(state);

    const id = getId(map, ref);
    if (id === null) return;

    map.getCanvas().style.cursor = 'pointer';

    if (hoveredId !== id) dispatch(unhoverFeature());
    if (hoveredId === id) return;

    dispatch(featureHovered(id));
  };
