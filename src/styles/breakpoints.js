import facepaint from 'facepaint';

export const breakpoints = [576, 768, 992, 1200];
export const mq = facepaint(
  breakpoints.map(bp => `@media (min-width: ${bp}px)`),
);
