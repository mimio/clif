import { get } from 'lodash-es';
import uuid from 'uuid/v4';
import { Popup } from 'mapbox-gl';
import sizes from 'styles/sizes';
import { WORK_SOURCE } from 'constants/source';
import {
  selectLookup,
  selectGeoJsonBounds,
} from '../geojson/selectors';
import {
  selectHoveredFeatureId,
  selectMapLoaded,
  selectSelectedFeatureId,
} from './selectors';
import {
  CLEAR_SELECTION,
  HOVER_FEATURE,
  MAP_LOADED,
  SELECT_FEATURE,
  UNHOVER_FEATURE,
} from './types';

export const mapLoaded = () => ({
  type: MAP_LOADED,
});

const BOUNDS_PADDING = 100;
export const fitBounds = () => (_, getState, getMap) => {
  const state = getState();
  const map = getMap();
  const bounds = selectGeoJsonBounds(state);

  if (bounds) {
    map.fitBounds(bounds, {
      padding: BOUNDS_PADDING,
      maxZoom: 8,
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

const getId = val => {
  try {
    return get(val, 'features[0].id', val);
  } catch (err) {
    // do nothing
    console.log(err);
    return null;
  }
};

export const selectFeature = e => (dispatch, getState, getMap) => {
  const state = getState();
  if (!selectMapLoaded(state)) return null;
  const map = getMap();

  const selectedId = selectSelectedFeatureId(state);

  const id = getId(e);
  if (!id) return null;
  const feature = selectLookup(state)[id];

  if (selectedId !== id) {
    dispatch(clearSelection());
  }

  removePopup();

  const popupId = uuid();
  popup = new Popup({
    closeButton: false,
    offset: 18,
    maxWidth: sizes.popupWidth,
  })
    .setLngLat(feature.coordinates)
    .setHTML(`<div id="${popupId}"></div>`)
    .addTo(map);

  map.setFeatureState(
    { source: WORK_SOURCE, id },
    { selected: true },
  );

  return dispatch({
    type: SELECT_FEATURE,
    payload: { id, popupId },
  });
};

export const hoverFeature = e => (dispatch, getState, getMap) => {
  const state = getState();
  if (!selectMapLoaded(state)) return null;
  const map = getMap();
  const hoveredId = selectHoveredFeatureId(state);

  const id = getId(e);

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
