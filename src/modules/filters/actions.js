import { clearSelection } from '../map';

export const UPDATE_SEARCH = 'search/update';

export const updateSearch = string => dispatch => {
  dispatch(clearSelection());
  dispatch({
    type: UPDATE_SEARCH,
    payload: string,
  });
};
