import { UPDATE_SEARCH } from './actions';

const initialState = {
  search: '',
};
export function filterReducer(state = initialState, action) {
  const { type, payload } = action;
  switch (type) {
    case UPDATE_SEARCH:
      return {
        ...state,
        search: payload,
      };
    default:
      return state;
  }
}
