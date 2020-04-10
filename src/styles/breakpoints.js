import facepaint from 'facepaint';

export const MOBILE = 650;
export const TABLET = 1000;

export const isMobile = width => width < MOBILE;
export const isTablet = width => width < TABLET;

export const desktop = ttl => `
  @media (min-width: ${TABLET}px) {
    ${ttl};
  }
`;

export const tablet = ttl => `
  @media (max-width: ${TABLET}px) {
    ${ttl};
  }
`;

export const mobile = ttl => `
  @media (max-width: ${MOBILE}px) {
    ${ttl};
  }
`;

export const breakpoints = [TABLET, MOBILE];

export const mq = facepaint(
  breakpoints.map(bp => `@media (max-width: ${bp}px)`),
);
