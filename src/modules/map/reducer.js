import {
  CLEAR_SELECTION,
  HOVER_FEATURE,
  SET_MAP_LOADED,
  SELECT_FEATURE,
  UNHOVER_FEATURE,
  SET_POPUP_ID,
  RESET_MAP,
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
        selectedFeatureId: payload,
      };
    case SET_POPUP_ID:
      return {
        ...state,
        popupId: payload,
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
    case SET_MAP_LOADED:
      return {
        ...state,
        mapLoaded: payload,
      };
    case RESET_MAP:
      return initialState;
    default:
      return state;
  }
}
