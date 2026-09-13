export const SET_SCREEN_SIZE = 'app-setScreenSize';

export const setScreenSize = (x: number, y: number) => ({
  type: SET_SCREEN_SIZE as typeof SET_SCREEN_SIZE,
  payload: { x, y },
});

export type AppAction = ReturnType<typeof setScreenSize>;
