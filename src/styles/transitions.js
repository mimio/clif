export const speeds = {
  short: '0.15s',
  long: '0.5s',
};

const { short } = speeds;

export default {
  linearHue: `color ${short} linear, background-color ${short} linear, opacity ${short} linear, fill ${short} linear, border-color ${short} linear`,
  easeOutSize: `width ${short} ease-out, height ${short} ease-out`,
  speeds,
};
