import { SET_SCREEN_SIZE, SET_CURSOR } from './actions';

const initialState = {
  mouseCoordinates: [0, 0],
  isCursorActive: false,
  screenSize: null,
};

export function appReducer(state = initialState, action) {
  const { type, payload } = action;
  switch (type) {
    case SET_SCREEN_SIZE:
      return {
        ...state,
        screenSize: payload,
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
