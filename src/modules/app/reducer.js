import {
  SELECT_TAB,
  SET_PROGRESS,
  SET_MOUSE_COORDS,
} from './actions';

const initialState = {
  selectedTab: null,
  progress: 0,
  mouseCoordinates: [0, 0],
};

export function appReducer(state = initialState, action) {
  const { type, payload } = action;
  switch (type) {
    case SELECT_TAB:
      return {
        ...state,
        selectedTab: payload,
      };
    case SET_PROGRESS:
      return {
        ...state,
        progress: payload,
      };
    case SET_MOUSE_COORDS:
      return {
        ...state,
        mouseCoordinates: payload,
      };
    default:
      return state;
  }
}
