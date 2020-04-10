export const speeds = {
  short: '0.15s',
  long: '0.5s',
};

const { short } = speeds;

export default {
  linearHue: `box-shadow ${short} linear, color ${short} linear, background-color ${short} linear, opacity ${short} linear, fill ${short} linear, border-color ${short} linear`,
  easeOutSize: `transform ${short} ease-out, width ${short} ease-out, height ${short} ease-out`,
  speeds,
};
