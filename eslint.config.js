const eslintPluginPrettier = require('eslint-plugin-prettier');
const tsEslint = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');

/** @type {import("eslint").Linter.FlatConfig[]} */
module.exports = [
  {
    ignores: ['dist', 'node_modules'],
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tsEslint,
      prettier: eslintPluginPrettier,
    },
    rules: {
      ...tsEslint.configs.recommended.rules,
      'prettier/prettier': 'error',
    },
  },
];
