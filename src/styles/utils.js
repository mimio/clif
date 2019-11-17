import { get } from 'lodash-es';
import { flatStanley } from './theme';

const GRID_SIZE = 4;

export const size = integer => `${integer * GRID_SIZE}px`;

export const getStyle = key => get(flatStanley, key);

export const getProp = p => (key, callback) => {
  const val = get(p, key);
  return callback ? callback(val) : val;
};
