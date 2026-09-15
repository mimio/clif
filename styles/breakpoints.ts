// Device thresholds for the JS side (the device selectors in
// modules/app/appSlice.ts): a width below MOBILE is a phone, below TABLET
// a tablet. They mirror the CSS breakpoints in styles/globals.css, shifted
// one class: MOBILE is the `tablet` breakpoint (650px, `max-tablet:`) and
// TABLET the `desktop` one (1000px, `max-desktop:`).
export const MOBILE = 650;
export const TABLET = 1000;

export const isMobile = (width: number | undefined): boolean =>
  width !== undefined && width < MOBILE;
export const isTablet = (width: number | undefined): boolean =>
  width !== undefined && width < TABLET;
