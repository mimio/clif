const createBreakpoint = bp => ttl => `
  @media (max-width: ${bp}px) {
    ${ttl}
  }
`;

export const MOBILE_BREAKPOINT = 650;
export const TABLET_BREAKPOINT = 1000;

export const isMobile = width => width < MOBILE_BREAKPOINT;
export const isTablet = width => width < TABLET_BREAKPOINT;

export const mobile = createBreakpoint(MOBILE_BREAKPOINT);
export const tablet = createBreakpoint(TABLET_BREAKPOINT);
