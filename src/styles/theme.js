import { get } from 'lodash-es';
import colors from './colors';
import widths from './widths';

const lookup = {
  ...colors,
  ...widths,
};

export default {
  get: prop => get(lookup, prop),
  colors,
};
