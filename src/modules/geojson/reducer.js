import { handle } from 'redux-pack';
import { FETCH_DATA } from './actions';

const initialState = {
  isLoading: true,
  error: null,
  data: null,
};

export const geojsonReducer = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case FETCH_DATA:
      return handle(state, action, {
        start: prevState => ({
          ...prevState,
          isLoading: true,
        }),
        success: prevState => ({
          ...prevState,
          data: payload,
        }),
      });
    default:
      return state;
  }
};
