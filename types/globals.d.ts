declare global {
  interface Window {
    // Google Analytics 4, loaded by pages/_app.tsx when configured.
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export {};
