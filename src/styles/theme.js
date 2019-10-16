import { get } from 'lodash-es';
import colors from './colors';
import sizes from './sizes';

const GRID_SIZE = 4;

const lookup = {
  ...colors,
  ...sizes,
};

export default {
  get: prop => get(lookup, prop),
  size: num => `${GRID_SIZE * num}px`,
  colors,
};
