const path = require('path');

module.exports = {
  extends: ['airbnb', 'prettier'],
  parser: 'babel-eslint',
  plugins: ['prettier'],
  settings: {
    'import/resolver': {
      node: {
        moduleDirectory: [
          path.resolve(__dirname, 'node_modules'),
          path.resolve(__dirname, '.'),
        ],
      },
    },
  },
  env: {
    browser: true,
  },
  rules: {
    semi: 2,
    // warning bc nextjs paradigm tends to create lots of these errors
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
};
