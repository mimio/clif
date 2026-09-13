// Google Analytics 4 via gtag.js.
//
// The previous implementation posted to Universal Analytics, which Google
// shut down in July 2023. Set NEXT_PUBLIC_GA_MEASUREMENT_ID to a GA4
// measurement id ("G-XXXXXXXXXX") to enable tracking; pages/_app.tsx loads
// the gtag script when it is set. Without it every call below is a no-op.
export const MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? '';

const enabled = (): boolean =>
  Boolean(MEASUREMENT_ID) &&
  typeof window !== 'undefined' &&
  typeof window.gtag === 'function';

// Sent on client-side route changes; gtag's `config` call reports the
// initial page view itself.
export const pageview = (url: string): void => {
  if (!enabled()) return;
  window.gtag?.('event', 'page_view', {
    page_path: url,
    page_location: window.location.href,
  });
};

export const event = (
  name: string,
  params: Record<string, unknown> = {},
): void => {
  if (!enabled()) return;
  window.gtag?.('event', name, params);
};
