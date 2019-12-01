import { SATELLITE_BASEMAP } from 'constants/map';
import {
  SELECT_FEATURE,
  CLEAR_SELECTION,
  HOVER_FEATURE,
  UNHOVER_FEATURE,
  MAP_LOADED,
  UPDATE_USER_LOCATION,
  SELECT_BASEMAP,
} from './actions';
import { config } from './config';

const initialState = {
  config,
  selectedFeature: {
    source: null,
    id: null,
  },
  hoveredFeature: {
    source: null,
    id: null,
  },
  userLocation: null,
  mapLoaded: false,
  selectedBasemap: SATELLITE_BASEMAP,
};

export function mapReducer(state = initialState, action) {
  const { type, payload } = action;
  switch (type) {
    case SELECT_FEATURE:
      return {
        ...state,
        selectedFeature: payload,
      };
    case CLEAR_SELECTION:
      return {
        ...state,
        selectedFeature: initialState.hoveredFeature,
      };
    case HOVER_FEATURE:
      return {
        ...state,
        hoveredFeature: payload,
      };
    case UNHOVER_FEATURE:
      return {
        ...state,
        hoveredFeature: initialState.hoveredFeature,
      };
    case MAP_LOADED:
      return {
        ...state,
        mapLoaded: true,
      };
    case UPDATE_USER_LOCATION:
      return {
        ...state,
        userLocation: payload,
      };
    case SELECT_BASEMAP:
      return {
        ...state,
        selectedBasemap: payload,
      };
    default:
      return state;
  }
}
