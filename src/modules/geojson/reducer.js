import data from './features';

const initialState = {
  data,
};

export const geojsonReducer = (state = initialState, action) => {
  const { type } = action;

  switch (type) {
    default:
      return state;
  }
};
