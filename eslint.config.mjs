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
 *   L0 styles/                  design tokens, the type faces, the theme id
 *   L1 components/primitives/   Text PageWord Button Glyph Icon Pill Chip Rule
 *   L2 components/composed/     SceneStage ProjectTable Sheet Scrubber …
 *   L3 components/chrome/       Altimeter ThemeEye ContactMouth CoordPill …
 *   L4 pagesComponents/<route>/ and pages/
 *
 * L(n) may import L(<n), content/ and utils/. pages/ may import anything.
 * Every layer has a block below; a layer with no block would be governed
 * only by the base config, which carries the mapbox restriction and nothing
 * else, so leaving one out silently exempts it.
 *
 * content/, utils/ and styles/ are leaves: data, helpers and tokens. They
 * know nothing about the component stack, the routes or the scene, and they
 * share one block.
 *
 * scene/ is a service sibling rather than a rung on the ladder. The upper
 * three -- chrome, the route components and pages -- may use it, because the
 * scene owns numbers the foreground has to agree with: scene/enter derives
 * the type's entrance delay from the camera move that route actually makes,
 * which is the whole reason it exists. The lower layers and the leaves may
 * not touch it, and nothing outside scene/ may touch scene/mapbox/**, which
 * is where mapbox-gl itself is loaded.
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
    files: ['content/**', 'utils/**', 'styles/**'],
    rules: {
      'no-restricted-imports': restrict(
        upward(
          'content/, utils/ and styles/',
          'components',
          'pagesComponents',
          'pages',
          'scene',
        ),
      ),
    },
  },
  {
    /*
     * The route components. pages/ is the only direction barred to them:
     * a route component that reaches back into its own page inverts the
     * composition, and pages/ is where the data and the camera call live.
     *
     * scene/ is deliberately open, here and in the chrome. Four routes take
     * their foreground timing from scene/enter and their viewport reads from
     * scene/useViewport; closing that door would put the artboards' 800ms and
     * 900ms back into four files by hand, which is the drift scene/enter was
     * written to end.
     *
     * pagesComponents/specimens/** is covered by this block too, and that is
     * intentional rather than an oversight: a specimen board's job is to
     * display the layers, so it reaches across all of them the way test/**
     * does. It is a development harness and is not in the production build --
     * next.config.ts drops the page from pageExtensions unless
     * NEXT_PUBLIC_SPECIMENS is set -- so what it imports costs a visitor
     * nothing.
     */
    files: ['pagesComponents/**'],
    rules: {
      'no-restricted-imports': restrict(
        upward('pagesComponents', 'pages'),
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
