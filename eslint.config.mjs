import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, globalIgnores } from 'eslint/config';
import js from '@eslint/js';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

/*
 * Layer rule. The app is five layers deep and each one may only reach
 * downwards:
 *
 *   L0 styles/tokens/*.css      design tokens
 *   L1 components/primitives/   Text PageWord Button Glyph Icon Pill Chip Rule
 *   L2 components/composed/     SceneStage ProjectTable Sheet Scrubber …
 *   L3 components/chrome/       Altimeter ThemeEye ContactMouth CoordPill …
 *   L4 pagesComponents/<route>/ and pages/
 *
 * L(n) may import L(<n), content/ and utils/. pages/ may import anything.
 * scene/ sits outside the stack: only pages/ and the chrome (which reads the
 * live camera) reach into it, and nothing outside scene/ may touch
 * scene/mapbox/**, which is where mapbox-gl itself is loaded.
 */
const group = (dir) => [dir, `${dir}/**`];

const MAPBOX_ONLY_IN_SCENE = {
  group: group('scene/mapbox'),
  message:
    'mapbox-gl is only reachable through scene/: import from scene/ instead.',
};

const restrict = (...groups) => [
  'error',
  { patterns: [MAPBOX_ONLY_IN_SCENE, ...groups] },
];

const upward = (from, ...dirs) => ({
  group: dirs.flatMap(group),
  message: `Layer rule: ${from} may only import lower layers, content/ and utils/.`,
});

export default defineConfig([
  globalIgnores([
    '.next/**',
    '.vercel/**',
    'coverage/**',
    'node_modules/**',
    'playwright-report/**',
    'public/**',
    'test-results/**',
  ]),
  js.configs.recommended,
  ...nextVitals,
  ...nextTypescript,
  prettierRecommended,
  {
    files: ['**/*.{js,jsx,mjs,cjs,ts,tsx,mts}'],

    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },

    settings: {
      // Bare imports such as 'components/primitives/Button' resolve from the
      // repo root, matching the "*" path mapping in tsconfig.json.
      'import/resolver': {
        node: {
          moduleDirectory: [
            path.join(rootDir, 'node_modules'),
            rootDir,
          ],
        },
      },
    },

    rules: {
      semi: 2,
      'jsx-a11y/anchor-is-valid': 1,
      'react/prop-types': 0,
      'react/jsx-filename-extension': 0,
      'react/destructuring-assignment': 0,
      'react/forbid-prop-types': 0,
      'react/jsx-wrap-multilines': 0,
      'import/prefer-default-export': 0,
      'no-nested-ternary': 0,
      'no-underscore-dangle': 0,
      camelcase: 0,
      'no-plusplus': 0,
      'react/static-property-placement': 0,
      'react/state-in-constructor': 0,
      'react/prefer-stateless-function': 0,

      'import/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: true,
          optionalDependencies: false,
          peerDependencies: false,
        },
      ],

      'no-param-reassign': 1,

      'no-restricted-imports': restrict(),
    },
  },

  // --- layer rule -------------------------------------------------------
  {
    files: ['components/primitives/**'],
    rules: {
      'no-restricted-imports': restrict(
        upward(
          'components/primitives',
          'components/composed',
          'components/chrome',
          'pagesComponents',
          'pages',
          'scene',
        ),
      ),
    },
  },
  {
    files: ['components/composed/**'],
    rules: {
      'no-restricted-imports': restrict(
        upward(
          'components/composed',
          'components/chrome',
          'pagesComponents',
          'pages',
          'scene',
        ),
      ),
    },
  },
  {
    files: ['components/chrome/**'],
    rules: {
      'no-restricted-imports': restrict(
        upward('components/chrome', 'pagesComponents', 'pages'),
      ),
    },
  },
  {
    files: ['content/**', 'utils/**'],
    rules: {
      'no-restricted-imports': restrict(
        upward(
          'content/ and utils/',
          'components',
          'pagesComponents',
          'pages',
          'scene',
        ),
      ),
    },
  },
  {
    files: ['scene/**'],
    rules: {
      // scene/ owns scene/mapbox/**, so only the upward half applies here.
      'no-restricted-imports': [
        'error',
        {
          patterns: [upward('scene', 'pagesComponents', 'pages')],
        },
      ],
    },
  },

  // --- test files -------------------------------------------------------
  {
    files: ['test/**', '**/*.test.{ts,tsx,js,jsx}'],
    languageOptions: {
      globals: {
        ...globals.vitest,
      },
    },
    rules: {
      // Tests reach across every layer on purpose.
      'no-restricted-imports': 0,
    },
  },
]);
