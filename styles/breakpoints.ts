import facepaint from 'facepaint';

export const MOBILE = 650;
export const TABLET = 1000;

export const isMobile = (width: number | undefined): boolean =>
  width !== undefined && width < MOBILE;
export const isTablet = (width: number | undefined): boolean =>
  width !== undefined && width < TABLET;

export const desktop = (ttl: string): string => `
  @media (min-width: ${TABLET}px) {
    ${ttl};
  }
`;

export const tablet = (ttl: string): string => `
  @media (max-width: ${TABLET}px) {
    ${ttl};
  }
`;

export const mobile = (ttl: string): string => `
  @media (max-width: ${MOBILE}px) {
    ${ttl};
  }
`;

export const breakpoints = [TABLET, MOBILE];

export const mq = facepaint(
  breakpoints.map((bp) => `@media (max-width: ${bp}px)`),
);
