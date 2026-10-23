import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { THEME_IDS } from 'styles/theme-bootstrap';

/*
 * Reads styles/tokens/themes.css as text.
 *
 * The token layer is CSS, so the only way to assert anything about it from
 * a unit test is to parse the file. That is the point: styles/tokens/
 * palette.ts hard-codes the yellow theme for SSR, and nothing but a test
 * that reads the stylesheet can notice when the two drift apart.
 */
const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);

export const THEMES_CSS_PATH = path.join(
  root,
  'styles/tokens/themes.css',
);

export const THEMES_CSS = readFileSync(THEMES_CSS_PATH, 'utf8');

const WITHOUT_COMMENTS = THEMES_CSS.replace(/\/\*[\s\S]*?\*\//g, '');

const declarationsOf = (body: string): Record<string, string> => {
  const declarations: Record<string, string> = {};
  for (const line of body.split(';')) {
    const at = line.indexOf(':');
    if (at < 0) continue;
    declarations[line.slice(0, at).trim()] = line
      .slice(at + 1)
      .trim();
  }
  return declarations;
};

/** Every rule in themes.css, as [selector list, declarations]. */
const rules = (): [string[], Record<string, string>][] =>
  [...WITHOUT_COMMENTS.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(
    ([, selectors, body]) => [
      selectors.split(',').map((one) => one.trim()),
      declarationsOf(body),
    ],
  );

/** Every declaration in the rule whose selector list contains `selector`. */
export const themeBlock = (
  selector: string,
): Record<string, string> => {
  for (const [list, declarations] of rules()) {
    if (list.includes(selector)) return declarations;
  }
  throw new Error(`no rule for ${selector} in themes.css`);
};

/*
 * The theme scopes themes.css ACTUALLY declares, keyed by id.
 *
 * This is the whole point of parsing the file. A hand-written list of
 * selectors in a test can only ever agree with itself: a ninth theme
 * block, or a block missing a token, would sail past it. This reads what
 * ships, so test/styles-tokens.test.ts can hold it against THEME_IDS and
 * against PALETTE_KEYS.
 *
 * The bare `[data-theme]` crossfade rule at the tail is not a scope and
 * does not match: the pattern requires a quoted id.
 */
export const themeScopes = (): Map<
  string,
  Record<string, string>
> => {
  const scopes = new Map<string, Record<string, string>>();
  for (const [list, declarations] of rules()) {
    for (const selector of list) {
      const id = /^\[data-theme=['"]([^'"]+)['"]\]$/.exec(selector);
      if (id) scopes.set(id[1], declarations);
    }
  }
  return scopes;
};

/*
 * One selector per shipped theme, derived from THEME_IDS rather than
 * written out. yellow resolves through the selector list it shares with
 * :root, so every id has a block to look up.
 */
export const THEME_SELECTORS = THEME_IDS.map(
  (id) => `[data-theme='${id}']`,
);

/** Every .css file under styles/, as [relative path, contents]. */
export const styleSheets = (): [string, string][] => {
  const dir = path.join(root, 'styles');
  const walk = (at: string): string[] =>
    readdirSync(at, { withFileTypes: true }).flatMap((entry) => {
      const full = path.join(at, entry.name);
      if (entry.isDirectory()) return walk(full);
      return entry.name.endsWith('.css') ? [full] : [];
    });
  return walk(dir).map((full) => [
    path.relative(root, full),
    readFileSync(full, 'utf8'),
  ]);
};
