// Device thresholds for the JS side (the device selectors in
// modules/app/appSlice.ts). The CSS side is the `tablet` and `desktop`
// breakpoints in styles/globals.css, which must stay in step with these:
// a width below MOBILE is a phone, below TABLET a tablet.
export const MOBILE = 650;
export const TABLET = 1000;

export const isMobile = (width: number | undefined): boolean =>
  width !== undefined && width < MOBILE;
export const isTablet = (width: number | undefined): boolean =>
  width !== undefined && width < TABLET;
