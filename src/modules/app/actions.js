const base = 'app';
export const SET_SCREEN_SIZE = `${base}-setScreenSize`;
export const SET_CURSOR = `${base}-setCursor`;

export const setCursor = payload => ({
  type: SET_CURSOR,
  payload,
});

export const setScreenSize = (x, y) => ({
  type: SET_SCREEN_SIZE,
  payload: { x, y },
});
