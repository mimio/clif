import ua from 'universal-analytics';

const enabled = !__DEV__;
let visitor;

export const init = (tracking) => {
  if (enabled) {
    visitor = ua(tracking, { https: !__DEV__ });
  }
};

const getViewportDimesions = () =>
  `${Math.max(
    document.documentElement.clientWidth,
    window.innerWidth || 0,
  )}x${Math.max(
    document.documentElement.clientHeight,
    window.innerHeight || 0,
  )}`;

export const pageview = (payload) => {
  if (enabled) {
    visitor
      .pageview({
        ...payload,
        dp: window.location.pathname,
        dh: window.location.origin,
        vp: getViewportDimesions(),
      })
      .send();
  }
};

export const event = (payload) => {
  if (enabled) {
    visitor.event(payload);
  }
};

export const timing = (category, action, time) => {
  if (enabled) {
    visitor.timing(category, action, time).send();
  }
};
