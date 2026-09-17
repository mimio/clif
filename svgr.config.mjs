/*
 * The SVG transform options Vitest uses, in a file of their own so the
 * parity test can assert against the options the config actually applies
 * rather than against a second copy of them.
 *
 * A guard that restates what it is guarding is not a guard: edit
 * vitest.config.mts and a private copy in the test would keep passing.
 *
 * Production's side is not here because it is not ours to state --
 * @svgr/webpack supplies `defaultPlugins: [svgo, jsx]` itself, and
 * test/svgr-parity.test.ts names that so a change to it also fails.
 */
/** @type {import('@svgr/core').Config} */
export const svgrOptions = {
  // types/assets.d.ts declares `*.svg` as a default export, not the named
  // { ReactComponent }.
  exportType: 'default',
  // vite-plugin-svgr's caller default is [jsx] alone. @svgr/webpack runs
  // SVGO first, so naming the list here is what puts it back.
  plugins: ['@svgr/plugin-svgo', '@svgr/plugin-jsx'],
};

/*
 * vite-plugin-svgr claims only `*.svg?react` by default. Everything else
 * falls through to Vite's asset handling as a data: URL, which renders as an
 * element whose tag name is the whole URL. next.config.ts's turbopack rule
 * matches plain `*.svg`, so this has to as well.
 */
export const svgrInclude = '**/*.svg';
