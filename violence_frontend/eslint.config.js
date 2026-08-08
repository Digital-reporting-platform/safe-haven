import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.es2020,
        React: 'readonly',
        Deno: 'readonly',
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        Element: 'readonly',
        HTMLElement: 'readonly',
        EventTarget: 'readonly',
        queueMicrotask: 'readonly',
        AbortController: 'readonly',
        PointerEvent: 'readonly',
        navigate: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'react/display-name': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react/no-unescaped-entities': 'off',
      'jsx-a11y/click-events-have-key-events': 'off',
      'jsx-a11y/no-static-element-interactions': 'off',
      'jsx-a11y/label-has-associated-control': 'off',
      'jsx-a11y/anchor-has-content': 'off',
      'react-hooks/purity': 'off',
      'no-case-declarations': 'off',
      'jsx-a11y/anchor-is-valid': 'off',
      'no-unused-vars': 'off',
      'no-prototype-builtins': 'off',
      'no-useless-assignment': 'off',
      'no-sparse-arrays': 'off',
      'no-undef': 'off',
      'no-empty': 'off',
    },
    settings: {
      react: {
        version: '18.3.1',
      },
    },
  },
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '*.config.js',
      '*.config.ts',
      'build/**',
      'coverage/**',
      'public/**',
      '**/*.min.js',
      '**/*.bundle.js',
      '**/vendor/**',
    ],
  },
];
