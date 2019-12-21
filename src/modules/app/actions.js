import { selectNextTab, selectIsLastTab } from './selectors';

const base = 'app';
export const SELECT_TAB = `${base}-selectTab`;
export const SET_TAB_PROGRESS = `${base}-setTabProgress`;

export const selectTab = tab => ({ type: SELECT_TAB, payload: tab });

export const setTabProgress = progress => (dispatch, getState) => {
  const state = getState();
  const nextTab = selectNextTab(state);
  const isLastTab = selectIsLastTab(state);
  if (progress === 100 && !isLastTab) {
    return dispatch({ type: SELECT_TAB, payload: nextTab });
  }
  return dispatch({ type: SET_TAB_PROGRESS, payload: progress });
};
