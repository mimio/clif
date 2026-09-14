import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from './store';

// Pre-typed versions of the React Redux hooks, defined in their own file so
// components never repeat the store types and so importing them cannot pull
// the store into a cycle.
// https://react-redux.js.org/using-react-redux/usage-with-typescript
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
