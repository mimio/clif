import {
  SELECT_FEATURE,
  CLEAR_SELECTION,
  HOVER_FEATURE,
  UNHOVER_FEATURE,
} from './actions';

const initialState = {
  selectedFeature: null,
  hoveredFeature: {
    source: null,
    id: null,
  },
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
        selectedFeature: null,
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
    default:
      return state;
  }
}
