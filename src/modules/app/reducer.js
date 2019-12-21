import { SELECT_TAB } from './actions';

const initialState = {
  selectedTab: null,
};

export function appReducer(state = initialState, action) {
  const { type, payload } = action;
  switch (type) {
    case SELECT_TAB:
      return {
        ...state,
        selectedTab: payload,
      };
    default:
      return state;
  }
}
