import type { Reducer } from 'redux';
import {
  CLEAR_SELECTION,
  HOVER_FEATURE,
  SET_MAP_LOADED,
  SELECT_FEATURE,
  UNHOVER_FEATURE,
  SET_POPUP_ID,
  RESET_MAP,
  type MapAction,
} from './types';

export type MapState = {
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

export const mapReducer: Reducer<MapState, MapAction> = (
  state = initialState,
  action,
) => {
  switch (action.type) {
    case SELECT_FEATURE:
      return { ...state, selectedFeatureId: action.payload };
    case SET_POPUP_ID:
      return { ...state, popupId: action.payload };
    case CLEAR_SELECTION:
      return {
        ...state,
        selectedFeatureId: initialState.selectedFeatureId,
      };
    case HOVER_FEATURE:
      return { ...state, hoveredFeatureId: action.payload };
    case UNHOVER_FEATURE:
      return {
        ...state,
        hoveredFeatureId: initialState.hoveredFeatureId,
      };
    case SET_MAP_LOADED:
      return { ...state, mapLoaded: action.payload };
    case RESET_MAP:
      return initialState;
    default:
      return state;
  }
};
