import { orderedTabs } from 'constants/tabs';
import { selectSelectedTab, selectProgress } from './selectors';

const base = 'app';
export const SELECT_TAB = `${base}-selectTab`;
export const SET_PROGRESS = `${base}-setProgress`;
export const SET_CURSOR = `${base}-setCursor`;

export const setCursor = payload => ({
  type: SET_CURSOR,
  payload,
});

const getTabFromProgress = progress => {
  if (progress === 100) return orderedTabs[orderedTabs.length - 1];
  const step = 100 / orderedTabs.length;
  const index = Math.floor(progress / step);
  return orderedTabs[index];
};

export const selectTab = tab => (dispatch, getState) => {
  const state = getState();
  const selectedTab = selectSelectedTab(state);
  if (tab !== selectedTab) {
    dispatch({ type: SELECT_TAB, payload: tab });

    const progress =
      100 * (orderedTabs.indexOf(tab) / orderedTabs.length);
    dispatch({ type: SET_PROGRESS, payload: progress });
  }
};

export const setProgress = progress => (dispatch, getState) => {
  const state = getState();
  dispatch({ type: SET_PROGRESS, payload: progress });

  const tab = getTabFromProgress(progress);
  const selectedTab = selectSelectedTab(state);
  if (tab !== selectedTab) {
    dispatch({ type: SELECT_TAB, payload: tab });
  }
};

export const addProgress = progress => (dispatch, getState) => {
  const state = getState();
  const currentProgress = selectProgress(state);
  let nextProgress = currentProgress + progress;
  if (nextProgress < 0) nextProgress = 0;
  if (nextProgress > 100) nextProgress = 100;
  if (nextProgress === currentProgress) return;
  dispatch(setProgress(nextProgress));
};
