import { bindActionCreators, type ActionCreator } from 'redux';
import { useDispatch } from 'react-redux';
import { useMemo } from 'react';

// Binds a single action creator (plain or thunk) to the store's dispatch.
export default function useActions<C extends ActionCreator<unknown>>(
  actionCreator: C,
): C {
  const dispatch = useDispatch();
  return useMemo(
    () => bindActionCreators(actionCreator, dispatch),
    [actionCreator, dispatch],
  );
}
