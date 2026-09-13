import type { Reducer } from 'redux';
import { SET_SCREEN_SIZE, type AppAction } from './actions';

export type AppState = {
  screenSize: { x: number; y: number } | null;
};

const initialState: AppState = {
  screenSize: null,
};

export const appReducer: Reducer<AppState, AppAction> = (
  state = initialState,
  action,
) => {
  switch (action.type) {
    case SET_SCREEN_SIZE:
      return { ...state, screenSize: action.payload };
    default:
      return state;
  }
};
