import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vitest/config';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

// next.config.ts's `*.glsl` rule (raw-loader + glslify-loader) is a Turbopack
// rule, and Vitest never reads next.config.ts. Neither shader uses a
// `#pragma glslify:` directive, so handing back the raw text is enough.
const glslRaw = (): Plugin => ({
  name: 'glsl-raw',
  transform(code, id) {
    if (!id.endsWith('.glsl')) return null;
    return {
      code: `export default ${JSON.stringify(code)};`,
      map: null,
    };
  },
});

// tsconfig.json maps "*" to "./*", a bare wildcard rooted at the repo.
// vite-tsconfig-paths handles that mapping inconsistently, so the top-level
// directories are aliased explicitly instead. `public/` is in the list
// because SVGs under public/icons are imported as modules, not as URLs.
const srcDirs = [
  'components',
  'content',
  'e2e',
  'pages',
  'pagesComponents',
  'public',
  'scene',
  'scripts',
  'styles',
  'test',
  'types',
  'utils',
];

export default defineConfig({
  plugins: [
    react(),
    // types/assets.d.ts declares `*.svg` as a default-exported component, so
    // svgr has to match that rather than emit the named { ReactComponent }.
    // `include` has to be widened too: the plugin only claims `*.svg?react`
    // by default, and everything else falls through to Vite's asset handling
    // as a data: URL -- which renders as an element whose tag name is the
    // whole URL. next.config.ts's turbopack rule matches plain `*.svg`, so
    // this is what keeps the two resolvers agreeing.
    svgr({
      include: '**/*.svg',
      svgrOptions: { exportType: 'default' },
    }),
    glslRaw(),
  ],
  resolve: {
    alias: srcDirs.map((dir) => ({
      find: new RegExp(`^${dir}/`),
      replacement: `${path.join(rootDir, dir)}/`,
    })),
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.ts'],
    include: ['test/**/*.test.{ts,tsx}'],
    env: {
      // Left deliberately empty: unit tests exercise the no-token fallback
      // path, and pinning it here keeps a developer's exported token from
      // quietly switching them onto the real Mapbox path.
      NEXT_PUBLIC_MAPBOX_TOKEN: '',
    },
    coverage: {
      provider: 'v8',
      // Vitest 5 removed the `all` flag: every file matching `include` is
      // reported whether or not a test touched it, which is what `all: true`
      // used to buy. The 100% thresholds below therefore cover the whole
      // included tree, not just the files some test happened to import.
      reporter: ['text', 'lcov'],
      include: [
        'components/**',
        'content/**',
        'pages/**',
        'pagesComponents/**',
        'scene/**',
        'styles/**/*.ts',
        'utils/**',
      ],
      exclude: [
        // Wraps mapbox-gl, WebGL and the network; covered by e2e instead.
        'scene/mapbox/**',
        // three.js against a real GL context, which jsdom does not have. It
        // moved in beside its only consumer, whose own index.tsx stays
        // covered; the e2e suite covers the no-WebGL image fallback.
        'components/composed/ScreenshotPlane/GlitchImage.tsx',
        // next/font/local is a build-time Next construct, mocked in tests.
        'styles/fonts.ts',
        // Trivial Document shell; all its logic lives in theme-bootstrap.ts.
        'pages/_document.tsx',
        // Dev-only harness, never built into production.
        'pages/specimens.tsx',
        // Dev-only harness sections, one file per lane.
        'pagesComponents/specimens/**',
        // Node build scripts, exercised by running them, not by unit tests.
        'scripts/**',
        // Playwright specs and fixtures run in their own runner.
        'e2e/**',
        // Tooling config, not application code.
        '*.config.*',
        // Ambient declarations emit no runtime code.
        '**/*.d.ts',
      ],
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
      },
    },
  },
});
