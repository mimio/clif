import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, globalIgnores } from 'eslint/config';
import js from '@eslint/js';
import nextVitals from 'eslint-config-next/core-web-vitals';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig([
  globalIgnores([
    '.next/**',
    '.vercel/**',
    'node_modules/**',
    'public/**',
  ]),
  js.configs.recommended,
  ...nextVitals,
  prettierRecommended,
  {
    files: ['**/*.{js,jsx,mjs,cjs}'],

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
      // Bare imports such as 'components/Button' resolve from the repo root,
      // matching baseUrl in jsconfig.json.
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
      'react/jsx-props-no-spreading': 1,
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
    },
  },
]);
