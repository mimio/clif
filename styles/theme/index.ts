import borders from './borders';
import colors from './colors';
import gradients from './gradients';
import sizes from './sizes';
import transitions from './transitions';

const theme = {
  borders,
  colors,
  gradients,
  sizes,
  transitions,
};

export type AppTheme = typeof theme;

// Every theme value keyed by name, for getStyle().
export const flatStanley = {
  ...borders,
  ...colors,
  ...gradients,
  ...sizes,
  ...transitions,
};

export type StyleKey = keyof typeof flatStanley;

export default theme;
