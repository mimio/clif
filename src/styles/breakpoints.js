import facepaint from 'facepaint';

export const breakpoints = [1200, 1201];
export const mq = facepaint(
  breakpoints.map(bp => `@media (min-width: ${bp}px)`),
);
