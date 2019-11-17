export const speeds = {
  short: '0.15s',
  long: '0.5s',
};

const { short, long } = speeds;

export default {
  hue: `color ${short} linear, background-color ${short} linear, opacity ${short} linear, fill ${short} linear, border-color ${short} linear`,
  shadow: `box-shadow ${short} linear`,
  size: `width ${long} ease-out, height ${long} ease-out`,
  speeds,
};
