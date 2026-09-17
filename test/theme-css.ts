import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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

/** Every declaration in the rule whose selector list contains `selector`. */
export const themeBlock = (
  selector: string,
): Record<string, string> => {
  for (const [, selectors, body] of WITHOUT_COMMENTS.matchAll(
    /([^{}]+)\{([^{}]*)\}/g,
  )) {
    const list = selectors.split(',').map((one) => one.trim());
    if (!list.includes(selector)) continue;
    const declarations: Record<string, string> = {};
    for (const line of body.split(';')) {
      const at = line.indexOf(':');
      if (at < 0) continue;
      declarations[line.slice(0, at).trim()] = line
        .slice(at + 1)
        .trim();
    }
    return declarations;
  }
  throw new Error(`no rule for ${selector} in themes.css`);
};

export const THEME_SELECTORS = [
  ':root',
  "[data-theme='lime']",
  "[data-theme='rust']",
  "[data-theme='teal']",
  "[data-theme='pink']",
  "[data-theme='cream']",
  "[data-theme='paper']",
  "[data-theme='chalk']",
] as const;

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
