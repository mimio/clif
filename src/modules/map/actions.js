import { get } from 'lodash-es';
import uuid from 'uuid/v4';
import { Popup } from 'mapbox-gl';
import sizes from 'styles/theme/sizes';
import { WORK_SOURCE } from 'constants/source';
import { BOUNDS_PADDING, BOUNDS_PADDING_MOBILE } from 'constants/map';
import { selectIsMobile } from '../app/selectors';
import {
  selectLookup,
  selectGeoJsonBounds,
} from '../geojson/selectors';
import {
  selectHoveredFeatureId,
  selectMapLoaded,
  selectSelectedFeatureId,
  selectPopupId,
  selectNextFeatureId,
  selectPrevFeatureId,
  selectIsFeatureSelected,
} from './selectors';
import {
  CLEAR_SELECTION,
  HOVER_FEATURE,
  SET_MAP_LOADED,
  SELECT_FEATURE,
  UNHOVER_FEATURE,
  SET_POPUP_ID,
  RESET_MAP,
} from './types';

export const setMapLoaded = isLoaded => ({
  type: SET_MAP_LOADED,
  payload: isLoaded,
});

export const fitBounds = () => (_, getState, getMap) => {
  const state = getState();
  const map = getMap();
  const bounds = selectGeoJsonBounds(state);
  const isMobile = selectIsMobile(state);
  const isFeatureSelected = selectIsFeatureSelected(state);

  if (bounds) {
    map.fitBounds(bounds, {
      padding:
        isMobile && isFeatureSelected
          ? BOUNDS_PADDING_MOBILE
          : BOUNDS_PADDING,
    });
  }
};

export const unhoverFeature = () => (dispatch, getState, getMap) => {
  if (!selectMapLoaded(getState())) return null;
  const map = getMap();
  const hoveredId = selectHoveredFeatureId(getState());

  if (hoveredId)
    map.setFeatureState(
      { source: WORK_SOURCE, id: hoveredId },
      { hover: false },
    );

  map.getCanvas().style.cursor = 'grab';
  return dispatch({
    type: UNHOVER_FEATURE,
  });
};

let popup;
const removePopup = () => {
  if (popup && popup.isOpen()) {
    popup.remove();
  }
};

export const clearSelection = () => (dispatch, getState, getMap) => {
  if (!selectMapLoaded(getState())) return null;
  const map = getMap();
  const selectedId = selectSelectedFeatureId(getState());

  removePopup();

  if (selectedId)
    map.setFeatureState(
      { source: WORK_SOURCE, id: selectedId },
      { selected: false },
    );

  return dispatch({
    type: CLEAR_SELECTION,
  });
};

const getId = (map, e) => {
  if (typeof e === 'number' || typeof e === 'string') return e;
  try {
    const features = map.queryRenderedFeatures(e.point);
    return get(features, '[0].properties.id', null);
  } catch (err) {
    console.log(err);
    return e;
  }
};

export const setPopupId = id => ({
  type: SET_POPUP_ID,
  payload: id,
});

export const selectFeature = e => (dispatch, getState, getMap) => {
  const state = getState();
  if (!selectMapLoaded(state)) return null;
  const map = getMap();

  const isMobile = selectIsMobile(state);
  const prevPopupId = selectPopupId(state);
  const prevSelectedId = selectSelectedFeatureId(state);

  const id = getId(map, e);
  if (!id) return null;
  const feature = selectLookup(state)[id];

  map.flyTo({
    center: feature.coordinates,
    offset: [0, isMobile ? -60 : 180],
    zoom: 12,
  });

  if (id !== prevSelectedId) {
    if (prevSelectedId) {
      map.setFeatureState(
        { source: WORK_SOURCE, id: prevSelectedId },
        { selected: false },
      );
    }
    map.setFeatureState(
      { source: WORK_SOURCE, id },
      { selected: true },
    );
    dispatch({
      type: SELECT_FEATURE,
      payload: id,
    });
  }

  if ((id !== prevSelectedId || !prevPopupId) && !isMobile) {
    removePopup();
    const popupId = uuid();
    popup = new Popup({
      closeButton: false,
      offset: 30,
      maxWidth: sizes.popupWidth,
    })
      .once('close', () => dispatch(setPopupId(null)))
      .setLngLat(feature.coordinates)
      .setHTML(`<div id="${popupId}"></div>`)
      .addTo(map);
    dispatch(setPopupId(popupId));
  }
  return null;
};

export const selectNextFeature = () => (dispatch, getState) => {
  const state = getState();
  const nextFeatureId = selectNextFeatureId(state);
  return dispatch(selectFeature(nextFeatureId));
};

export const selectPrevFeature = () => (dispatch, getState) => {
  const state = getState();
  const prevFeatureId = selectPrevFeatureId(state);
  return dispatch(selectFeature(prevFeatureId));
};

export const hoverFeature = e => (dispatch, getState, getMap) => {
  const state = getState();
  if (!selectMapLoaded(state)) return null;
  const map = getMap();
  const hoveredId = selectHoveredFeatureId(state);

  const id = getId(map, e);

  if (!id) return null;

  map.getCanvas().style.cursor = 'pointer';

  if (hoveredId !== id) dispatch(unhoverFeature());
  if (hoveredId === id) return null;

  map.setFeatureState({ source: WORK_SOURCE, id }, { hover: true });

  return dispatch({
    type: HOVER_FEATURE,
    payload: id,
  });
};

export const resetMap = () => ({
  type: RESET_MAP,
});
