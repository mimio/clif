import { SELECT_TAB, SET_PROGRESS, SET_CURSOR } from './actions';

const initialState = {
  selectedTab: null,
  progress: 0,
  mouseCoordinates: [0, 0],
  isCursorActive: false,
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
    case SET_CURSOR: {
      const { x, y, isActive } = payload;
      return {
        ...state,
        mouseCoordinates: [x, y],
        isCursorActive: isActive,
      };
    }
    default:
      return state;
  }
}
