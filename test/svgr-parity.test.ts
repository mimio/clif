import fs from 'node:fs';
import path from 'node:path';
import { transform } from '@svgr/core';
import jsxPlugin from '@svgr/plugin-jsx';
import svgoPlugin from '@svgr/plugin-svgo';
import { describe, expect, it } from 'vitest';
import { svgrOptions } from '../svgr.config.mjs';

/*
 * The two SVG pipelines have to produce the same component.
 *
 * Production compiles public/icons/*.svg through @svgr/webpack (the
 * turbopack rule in next.config.ts); Vitest compiles the same files through
 * vite-plugin-svgr. They are different packages with different defaults --
 * @svgr/webpack@8 runs [svgo, jsx], vite-plugin-svgr@5 runs [jsx] alone --
 * and when they drifted, every one of the fifteen icons rendered differently
 * under test than in a browser. Nothing caught it, because the icon
 * assertions only ask whether an <svg> element exists, which is true of an
 * <svg> with every path dropped.
 *
 * So this diffs the transforms directly rather than inspecting the DOM: it
 * is the comparison that fails loudly on the next default change in either
 * package, including a version bump that nobody reads the changelog for.
 *
 * If it fails, reconcile the two option sets -- vitest.config.mts's
 * svgrOptions against next.config.ts's turbopack rule -- rather than
 * relaxing the assertion.
 */
const ICON_DIR = path.join(process.cwd(), 'public', 'icons');

const icons = fs
  .readdirSync(ICON_DIR)
  .filter((file) => file.endsWith('.svg'))
  .sort();

const source = (file: string): string =>
  fs.readFileSync(path.join(ICON_DIR, file), 'utf8');

/** @svgr/webpack@8.1.0's defaults: `defaultPlugins: [svgo, jsx]`. */
const asProduction = (code: string, file: string): string =>
  transform.sync(
    code,
    { exportType: 'default' },
    {
      componentName: 'SvgIcon',
      filePath: file,
      caller: {
        name: '@svgr/webpack',
        defaultPlugins: [svgoPlugin, jsxPlugin],
      },
    },
  );

/*
 * The options vitest.config.mts actually applies, imported rather than
 * restated: edit svgr.config.mjs and this moves with it.
 */
const asVitest = (code: string, file: string): string =>
  transform.sync(code, svgrOptions, {
    componentName: 'SvgIcon',
    filePath: file,
    caller: { name: 'vite-plugin-svgr', defaultPlugins: [jsxPlugin] },
  });

describe('the SVG pipelines', () => {
  it('has icons to compare', () => {
    expect(icons.length).toBeGreaterThan(0);
  });

  it.each(icons)(
    'compiles %s identically in both pipelines',
    (file) => {
      const code = source(file);
      expect(asVitest(code, file)).toBe(asProduction(code, file));
    },
  );

  it('runs SVGO on the Vitest side', () => {
    // The symptom that started this: two icons ship an id="Capa_1" from
    // whatever drew them. SVGO strips it; without SVGO both kept it, and a
    // document rendering both had duplicate ids under test only.
    const carriesId = icons.filter((file) =>
      source(file).includes('id="Capa_1"'),
    );
    expect(carriesId.length).toBeGreaterThan(1);
    carriesId.forEach((file) => {
      expect(asVitest(source(file), file)).not.toContain('Capa_1');
    });
  });

  it('would notice if the plugin lists diverged again', () => {
    // The guard's own guard: drop SVGO the way vite-plugin-svgr's default
    // does and the comparison above must fail, not pass quietly.
    const file = icons.find((name) =>
      source(name).includes('id="Capa_1"'),
    ) as string;
    const withoutSvgo = transform.sync(
      source(file),
      { exportType: 'default' },
      {
        componentName: 'SvgIcon',
        filePath: file,
        caller: {
          name: 'vite-plugin-svgr',
          defaultPlugins: [jsxPlugin],
        },
      },
    );
    expect(withoutSvgo).not.toBe(asProduction(source(file), file));
  });
});
