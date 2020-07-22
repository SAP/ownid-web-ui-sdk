module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    'import',
    '@typescript-eslint',
    'eslint-comments',
    'jest',
    'promise',
    'unicorn',
  ],
  extends: [
    'airbnb-typescript/base',
    'plugin:@typescript-eslint/recommended',
    'plugin:eslint-comments/recommended',
    'plugin:jest/recommended',
    'plugin:promise/recommended',
    'plugin:unicorn/recommended',
    'prettier',
    'prettier/@typescript-eslint',
  ],
  env: {
    node: true,
    browser: true,
    jest: true,
  },
  parserOptions: {
    project: './tsconfig.json',
  },
  rules: {
    'class-methods-use-this': 'off',
    'import/prefer-default-export': 'off',
    '@typescript-eslint/no-explicit-any': 'error',
    'unicorn/prevent-abbreviations': 'off',
    'unicorn/prefer-query-selector': 'off',
    'jest/no-standalone-expect': 'off',
    'no-useless-constructor': 'off',
    '@typescript-eslint/no-useless-constructor': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/ban-ts-ignore': 'off',
    'promise/catch-or-return': 'off',
    'promise/always-return': 'off',
    'unicorn/no-null': 'off',
    '@typescript-eslint/ban-types': 'warn',
    'no-plusplus': 'off',
  },
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts'],
    },
    'import/resolver': {
      // use <root>/tsconfig.json
      typescript: {
        alwaysTryTypes: true,
        directory: './tsconfig.json', // always try to resolve types under `<roo/>@types` directory even it doesn't contain any source code, like `@types/unist`
      },
    },
  },
};
