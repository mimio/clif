const base = 'app';
export const SELECT_TAB = `${base}-selectTab`;

export const selectTab = tab => ({ type: SELECT_TAB, payload: tab });
