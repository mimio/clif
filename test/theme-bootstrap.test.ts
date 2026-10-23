import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  applyTheme,
  DEFAULT_THEME,
  isThemeId,
  readStoredTheme,
  THEME_IDS,
  THEME_STORAGE_KEY,
  themeBootstrapScript,
} from 'styles/theme-bootstrap';

afterEach(() => {
  vi.restoreAllMocks();
  window.localStorage.clear();
  delete document.documentElement.dataset.theme;
});

describe('theme identity', () => {
  it('is eight themes, defaulting to yellow', () => {
    expect(THEME_IDS).toHaveLength(8);
    expect(DEFAULT_THEME).toBe('yellow');
  });

  it('recognises its own ids and nothing else', () => {
    expect(isThemeId('chalk')).toBe(true);
    expect(isThemeId('magenta')).toBe(false);
    expect(isThemeId(null)).toBe(false);
  });
});

describe('readStoredTheme', () => {
  it('returns null when nothing is stored', () => {
    expect(readStoredTheme()).toBeNull();
  });

  it('returns null for a value that is not a theme', () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'magenta');
    expect(readStoredTheme()).toBeNull();
  });

  it('returns the stored theme', () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'teal');
    expect(readStoredTheme()).toBe('teal');
  });

  it('survives storage being unavailable', () => {
    // localStorage's methods live on Storage.prototype, so spying on the
    // instance would not intercept them.
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(readStoredTheme()).toBeNull();
  });
});

describe('applyTheme', () => {
  it('sets the attribute and remembers the choice', () => {
    applyTheme('rust');
    expect(document.documentElement.dataset.theme).toBe('rust');
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe(
      'rust',
    );
  });

  it('still applies when the choice cannot be stored', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    applyTheme('pink');
    expect(document.documentElement.dataset.theme).toBe('pink');
  });
});

describe('themeBootstrapScript', () => {
  const run = () => {
    Function(themeBootstrapScript)();
  };

  it('falls back to the default with nothing stored', () => {
    run();
    expect(document.documentElement.dataset.theme).toBe(
      DEFAULT_THEME,
    );
  });

  it('applies a stored theme before paint', () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'lime');
    run();
    expect(document.documentElement.dataset.theme).toBe('lime');
  });

  it('ignores a stored value that is not a theme', () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'magenta');
    run();
    expect(document.documentElement.dataset.theme).toBe(
      DEFAULT_THEME,
    );
  });

  it('falls back to the default when storage throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    run();
    expect(document.documentElement.dataset.theme).toBe(
      DEFAULT_THEME,
    );
  });
});
