import { defineConfig } from 'eslint/config';
import prettierPlugin from 'eslint-plugin-prettier';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import reactPlugin from 'eslint-plugin-react';
import importPlugin from 'eslint-plugin-import';
import globals from 'globals';
import babelParser from '@babel/eslint-parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default defineConfig([
  {
    extends: compat.extends('prettier'),

    plugins: {
      prettier: prettierPlugin,
      'jsx-a11y': jsxA11yPlugin,
      react: reactPlugin,
      import: importPlugin,
    },

    languageOptions: {
      globals: {
        ...globals.browser,
      },
      parser: babelParser,
    },

    settings: {
      'import/resolver': {
        node: {
          moduleDirectory: [
            '/Users/cliftoncampbell/Development/clif/node_modules',
            '/Users/cliftoncampbell/Development/clif',
          ],
        },
      },
    },

    rules: {
      semi: 2,
      'jsx-a11y/anchor-is-valid': 1,
      'global-require': 1,
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
