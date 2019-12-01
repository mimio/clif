import { get } from 'lodash-es';
import { USER_LOCATION } from 'constants/sources';
import {
  selectHoveredFeature,
  selectSelectedFeature,
  selectMapConfig,
  selectUserLocation,
  selectUserLocationGeoJson,
} from './selectors';

export const SELECT_FEATURE = 'geojson/selectFeature';
export const CLEAR_SELECTION = 'geojson/clearSelection';
export const HOVER_FEATURE = 'geojson/hoverFeature';
export const UNHOVER_FEATURE = 'geojson/unhoverFeature';
export const UPDATE_USER_LOCATION = 'geojson/setUserLocation';
export const MAP_LOADED = 'map/loaded';

export const mapLoaded = () => ({
  type: MAP_LOADED,
});

export const setUserLocationSource = () => (_, getState, getMap) => {
  const state = getState();
  const map = getMap();

  const userLocationGeojson = selectUserLocationGeoJson(state);
  map.getSource(USER_LOCATION).setData(userLocationGeojson);
};

export const setUserLocation = location => dispatch => {
  dispatch({
    type: UPDATE_USER_LOCATION,
    payload: location,
  });
  dispatch(setUserLocationSource());
};

export const panToUser = () => (_, getState, getMap) => {
  const state = getState();
  const map = getMap();

  const userLocation = selectUserLocation(state);
  map.panTo(userLocation);
};

export const unhoverFeature = () => (dispatch, getState, getMap) => {
  const map = getMap();
  const hovered = selectHoveredFeature(getState());

  if (hovered.id) map.setFeatureState(hovered, { hover: false });

  map.getCanvas().style.cursor = 'grab';
  return dispatch({
    type: UNHOVER_FEATURE,
  });
};

export const clearSelection = () => (dispatch, getState, getMap) => {
  const map = getMap();
  const selected = selectSelectedFeature(getState());

  if (selected.id) map.setFeatureState(selected, { selected: false });

  return dispatch({
    type: CLEAR_SELECTION,
  });
};

export const selectFeature = e => (dispatch, getState, getMap) => {
  const map = getMap();
  const selected = selectSelectedFeature(getState());

  let feature;
  try {
    feature = get(e, 'features[0]', {
      source: e.source,
      id: e.id,
    });
  } catch (err) {
    // do nothing
    console.log(err);
  }

  if (!feature) return null;

  const payload = { source: feature.source, id: feature.id };
  if (selected.id !== feature.id) dispatch(clearSelection());
  if (feature.id === selected.id) return null;

  map.setFeatureState(payload, { selected: true });

  return dispatch({
    type: SELECT_FEATURE,
    payload,
  });
};

export const hoverFeature = e => (dispatch, getState, getMap) => {
  const map = getMap();
  const hovered = selectHoveredFeature(getState());

  let feature;
  try {
    feature = get(e, 'features[0]', {
      source: e.source,
      id: e.id,
    });
  } catch (err) {
    // do nothing
    console.log(err);
  }

  if (!feature) return null;

  map.getCanvas().style.cursor = 'pointer';

  const payload = { source: feature.source, id: feature.id };
  if (hovered.id !== feature.id) dispatch(unhoverFeature());
  if (feature.id === hovered.id) return null;

  map.setFeatureState(payload, { hover: true });

  return dispatch({
    type: HOVER_FEATURE,
    payload,
  });
};

export const resetMap = () => (dispatch, getState, getMap) => {
  const map = getMap();
  const { bounds, fitBoundsOptions } = selectMapConfig(getState());
  map.fitBounds(bounds, fitBoundsOptions);
};
