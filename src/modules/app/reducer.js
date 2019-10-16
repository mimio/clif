import { TOGGLE_SIDE_PANEL } from './actions';

const initialState = {
  sidePanelOpen: true,
};

export function appReducer(state = initialState, action) {
  const { type } = action;
  switch (type) {
    case TOGGLE_SIDE_PANEL:
      return {
        ...state,
        sidePanelOpen: !state.sidePanelOpen,
      };
    default:
      return state;
  }
}
