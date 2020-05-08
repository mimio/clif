import { SET_SCREEN_SIZE } from './actions';

const initialState = {
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
    default:
      return state;
  }
}
