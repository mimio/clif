import { HELLO } from 'constants/tabs';

const initialState = {
  selectedTab: HELLO,
};

export function appReducer(state = initialState, action) {
  const { type } = action;
  switch (type) {
    default:
      return state;
  }
}
