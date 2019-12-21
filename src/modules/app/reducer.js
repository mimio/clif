import { SELECT_TAB, SET_TAB_PROGRESS } from './actions';

const initialState = {
  selectedTab: null,
  tabProgress: 0,
};

export function appReducer(state = initialState, action) {
  const { type, payload } = action;
  switch (type) {
    case SELECT_TAB:
      return {
        ...state,
        selectedTab: payload,
        tabProgress: 0,
      };
    case SET_TAB_PROGRESS:
      return {
        ...state,
        tabProgress: payload,
      };
    default:
      return state;
  }
}
