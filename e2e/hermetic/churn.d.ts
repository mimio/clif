/*
 * The counters e2e/hermetic/chrome-churn.spec.ts installs in the page.
 *
 * `__REACT_DEVTOOLS_GLOBAL_HOOK__` is React's own seam: react-dom looks
 * for it once, as it is evaluated, and reports every commit to it -- in a
 * production build as well as a development one, which is how the
 * DevTools extension works against a deployed site. The spec fills it
 * with a counter rather than with DevTools.
 */
declare global {
  interface Window {
    __CHURN__?: {
      commits: number;
      pill: number;
      path: number;
      elsewhere: number;
      rail: number;
      seen: Set<unknown>;
      on: boolean;
    };
    __REACT_DEVTOOLS_GLOBAL_HOOK__?: unknown;
  }
}

export {};
