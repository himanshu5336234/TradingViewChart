import css from '@eslint/css';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import js from '@eslint/js';
import json from '@eslint/json';
import markdown from '@eslint/markdown';

// ESLint Flat Config (v9+)
// Updated with 'ignores' to replace the deprecated .eslintignore file

export default defineConfig([
  //  This block tells ESLint to skip these paths completely
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'coverage/**',
      '/build/**',
      '/chart/**',
      '*/.min.js', // use **/ to match minified files anywhere
    ],
  },
  {
    files: ['*/.{js,mjs,cjs}'],
    plugins: { js },
    extends: ['js/recommended'],
    rules: {
      'no-console': ['error', { allow: ['warn', 'error'] }], //  Disallow ALL console.* calls
      'no-debugger': 'error', //  Disallow debugger statements
      'sort-imports': [
      'warn',
      {
        ignoreCase: false,
        ignoreDeclarationSort: false,
        ignoreMemberSort: false,
        memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
        allowSeparatedGroups: true,
      },
    ],
    },
  },
  // CommonJS modules
  {
    files: ['*/.js'],
    languageOptions: {
      sourceType: 'module',
    },
  },

  // Define browser globals (instead of env: { browser: true })
  {
    files: ['*/.{js,mjs,cjs}'],
    languageOptions: {
      globals: globals.browser,
    },
  },

  // JSON file support
  {
    files: ['*/.json'],
    plugins: { json },
    language: 'json/json',
    extends: ['json/recommended'],
  },
  {
    files: ['*/.jsonc'],
    plugins: { json },
    language: 'json/jsonc',
    extends: ['json/recommended'],
  },
  {
    files: ['*/.json5'],
    plugins: { json },
    language: 'json/json5',
    extends: ['json/recommended'],
  },

  // Markdown file support
  {
    files: ['*/.md'],
    plugins: { markdown },
    language: 'markdown/gfm',
    extends: ['markdown/recommended'],
  },



  // CSS file support
  {
    files: ['*/.css'],
    plugins: { css },
    language: 'css/css',
    extends: ['css/recommended'],
  },
]);