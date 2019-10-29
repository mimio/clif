import { get } from 'lodash-es';
import { selectHoveredFeature } from './selectors';

export const SELECT_FEATURE = 'geojson/selectFeature';
export const CLEAR_SELECTION = 'geojson/clearSelection';
export const HOVER_FEATURE = 'geojson/hoverFeature';
export const UNHOVER_FEATURE = 'geojson/unhoverFeature';

export const selectFeature = id => ({
  type: SELECT_FEATURE,
  payload: id,
});

export const clearSelection = () => ({
  type: CLEAR_SELECTION,
});

export const unhoverFeature = () => (dispatch, getState, getMap) => {
  const map = getMap();
  const hovered = selectHoveredFeature(getState());

  if (hovered.id) map.setFeatureState(hovered, { hover: false });
  map.getCanvas().style.cursor = 'grab';
  return dispatch({
    type: UNHOVER_FEATURE,
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
