import colors from './colors';
import sizes from './sizes';
import transitions from './transitions';

const theme = {
  colors,
  sizes,
  transitions,
};

export const flatStanley = Object.values(theme).reduce(
  (acc, val) => ({ ...acc, ...val }),
  [],
);

export default theme;
