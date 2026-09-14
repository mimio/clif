const base = 'map/';
export const CLEAR_SELECTION = `${base}clearSelection`;
export const HOVER_FEATURE = `${base}hoverFeature`;
export const SELECT_FEATURE = `${base}selectFeature`;
export const SET_POPUP_ID = `${base}setPopupId`;
export const UNHOVER_FEATURE = `${base}unhoverFeature`;
export const SET_MAP_LOADED = `${base}loaded`;
export const RESET_MAP = `${base}reset`;

export type MapAction =
  | { type: typeof CLEAR_SELECTION }
  | { type: typeof HOVER_FEATURE; payload: number }
  | { type: typeof SELECT_FEATURE; payload: number }
  | { type: typeof SET_POPUP_ID; payload: string | null }
  | { type: typeof UNHOVER_FEATURE }
  | { type: typeof SET_MAP_LOADED; payload: boolean }
  | { type: typeof RESET_MAP };
