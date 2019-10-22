import { handle } from 'redux-pack';
import {
  FETCH_DATA,
  SELECT_FEATURE,
  CLEAR_SELECTION,
} from './actions';

const initialState = {
  isLoading: true,
  error: null,
  data: {},
  selectedFeature: null,
};

export const geojsonReducer = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case FETCH_DATA:
      return handle(state, action, {
        start: prevState => ({
          ...prevState,
          isLoading: true,
        }),
        success: prevState => ({
          ...prevState,
          data: payload,
        }),
      });
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
    default:
      return state;
  }
};
