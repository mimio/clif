import colors from './colors';
import gradients from './gradients';
import sizes from './sizes';
import transitions from './transitions';

const theme = {
  colors,
  gradients,
  sizes,
  transitions,
};

export const flatStanley = Object.values(theme).reduce(
  (acc, val) => ({ ...acc, ...val }),
  [],
);

export default theme;
