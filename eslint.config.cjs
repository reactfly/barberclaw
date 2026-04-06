const js = require('@eslint/js');
const ts = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const reactHooks = require('eslint-plugin-react-hooks');
const globals = require('globals');

module.exports = [
  {
    ignores: [
      'dist',
      '.netlify/**',
      '*.log',
      'vite.config.ts.timestamp-*.mjs',
      'eslint.config.cjs',
      'components/**',
      'services/**',
      'index.tsx',
    ],
  },
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2020,
        ...globals.node,
      },
    },
    plugins: {
      '@typescript-eslint': ts,
      'react-hooks': reactHooks,
    },
    rules: {
      ...ts.configs.recommended.rules,
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'no-undef': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    files: ['vite.config.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2020,
      },
    },
  },
  {
    files: ['netlify/functions/**/*.js'],
    languageOptions: {
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.es2020,
      },
    },
  },
  {
    files: ['netlify/functions/**/*.cjs'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
        ...globals.es2020,
      },
    },
  },
];
