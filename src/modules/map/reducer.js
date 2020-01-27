import {
  CLEAR_SELECTION,
  HOVER_FEATURE,
  MAP_LOADED,
  SELECT_FEATURE,
  UNHOVER_FEATURE,
} from './types';
import { config } from './config';

const initialState = {
  config,
  selectedFeatureId: null,
  hoveredFeatureId: null,
  mapLoaded: false,
  popupId: null,
};

export function mapReducer(state = initialState, action) {
  const { type, payload } = action;
  switch (type) {
    case SELECT_FEATURE:
      return {
        ...state,
        selectedFeatureId: payload.id,
        popupId: payload.popupId,
      };
    case CLEAR_SELECTION:
      return {
        ...state,
        selectedFeatureId: initialState.selectedFeatureId,
      };
    case HOVER_FEATURE:
      return {
        ...state,
        hoveredFeatureId: payload,
      };
    case UNHOVER_FEATURE:
      return {
        ...state,
        hoveredFeatureId: initialState.hoveredFeatureId,
      };
    case MAP_LOADED:
      return {
        ...state,
        mapLoaded: true,
      };
    default:
      return state;
  }
}
