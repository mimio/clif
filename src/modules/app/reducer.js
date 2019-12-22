import { SELECT_TAB, SET_PROGRESS } from './actions';

const initialState = {
  selectedTab: null,
  progress: 0,
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
    default:
      return state;
  }
}
