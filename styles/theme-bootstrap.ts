/*
 * Theme identity and the blocking bootstrap script.
 *
 * The eight themes are the design system's; `yellow` is the default and is
 * byte-identical to :root. The stored id is read before first paint by the
 * script below, which pages/_document.page.tsx injects into <head>, so the
 * document never paints one theme and then swaps to another.
 *
 * The logic lives here rather than inline in _document.tsx because this is
 * the part worth testing: _document.tsx stays a trivial shell.
 */
export const THEME_IDS = [
  'yellow',
  'lime',
  'rust',
  'teal',
  'pink',
  'cream',
  'paper',
  'chalk',
] as const;

export type ThemeId = (typeof THEME_IDS)[number];

export const DEFAULT_THEME: ThemeId = 'yellow';

export const THEME_STORAGE_KEY = 'oneglobe.theme';

export const isThemeId = (value: unknown): value is ThemeId =>
  THEME_IDS.includes(value as ThemeId);

/** The stored theme, or null when nothing valid is stored. */
export const readStoredTheme = (): ThemeId | null => {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isThemeId(stored) ? stored : null;
  } catch {
    // Private mode and blocked site data both throw on access.
    return null;
  }
};

/** Sets the attribute the tokens key off, and remembers the choice. */
export const applyTheme = (id: ThemeId): void => {
  document.documentElement.dataset.theme = id;
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, id);
  } catch {
    // A theme that cannot be remembered still applies for this visit.
  }
};

/* ---- the theme-change contract ---------------------------------------
 *
 * One event name, one dispatcher, one subscriber, defined HERE because
 * this module already owns theme identity and every layer may import it.
 * They used to live twice over -- once in scene/theme.ts and once in
 * components/chrome/ThemeEye.tsx -- and renaming the constant in either
 * copy left the whole unit suite and every theme e2e test green. Nothing
 * would have broken, which is the problem: the MutationObserver below is a
 * complete second path, so a drifted event name does not stop repaints, it
 * just turns a whole tier into dead code that no test misses.
 */

/** The event the theme lens dispatches when it swaps themes. */
export const THEME_EVENT = 'oneglobe:theme';

/** Tells every listener which theme is now live. */
export const announceThemeEvent = (id: ThemeId): void => {
  window.dispatchEvent(
    new CustomEvent(THEME_EVENT, { detail: { id } }),
  );
};

/**
 * Two sources, because neither alone is complete: the lens dispatches
 * THEME_EVENT, and the attribute is the truth even when something else --
 * the bootstrap script, a devtools edit, the specimen harness -- sets it
 * without an event. attributeFilter alone implies attributes: true.
 */
export const subscribeTheme = (
  onChange: () => void,
): (() => void) => {
  window.addEventListener(THEME_EVENT, onChange);
  const watcher = new MutationObserver(onChange);
  watcher.observe(document.documentElement, {
    attributeFilter: ['data-theme'],
  });
  return () => {
    watcher.disconnect();
    window.removeEventListener(THEME_EVENT, onChange);
  };
};

/*
 * Runs synchronously in <head>, before any stylesheet resolves, so there is
 * no flash of the default theme. Kept to one expression and one try/catch:
 * anything that throws here would block the whole document.
 */
export const themeBootstrapScript = `(function(){try{var i=${JSON.stringify(
  THEME_IDS,
)};var t=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});document.documentElement.dataset.theme=i.indexOf(t)<0?${JSON.stringify(
  DEFAULT_THEME,
)}:t;}catch(e){document.documentElement.dataset.theme=${JSON.stringify(
  DEFAULT_THEME,
)};}})();`;
