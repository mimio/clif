import { handle } from 'redux-pack';
import { SHUFFLE_POLYGON } from './actions';

const initialState = {
  polygon: null,
  isLoading: true,
};

export function polygonReducer(state = initialState, action) {
  const { type, payload } = action;
  switch (type) {
    case SHUFFLE_POLYGON:
      return handle(state, action, {
        start: prevState => ({
          ...prevState,
          isLoading: true,
        }),
        success: prevState => ({
          ...prevState,
          polygon: payload,
          isLoading: false,
        }),
      });
    default:
      return state;
  }
}
