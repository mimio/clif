import get from 'lodash.get';
import { flatStanley } from './theme';

export const getStyle = (key) => get(flatStanley, key);

export const getProp = (key, callback) => (p) => {
  const val = get(p, key);
  return callback ? callback(val) : val;
};

export const getBool = (key, ifTrue, ifFalse) => (p) =>
  get(p, key) ? ifTrue || '' : ifFalse || '';
