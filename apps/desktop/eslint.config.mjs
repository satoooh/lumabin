import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import { defineConfig } from 'eslint/config';
import importX, { createNodeResolver } from 'eslint-plugin-import-x';
import globals from 'globals';

export default defineConfig([
  {
    ignores: ['.tmp/**', '.vite/**', 'out/**', 'dist/**', 'node_modules/**'],
  },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
    },
  },
  js.configs.recommended,
  ...typescript.configs['flat/recommended'],
  importX.flatConfigs.recommended,
  importX.flatConfigs.electron,
  importX.flatConfigs.typescript,
  {
    settings: {
      'import-x/resolver-next': [
        createNodeResolver({
          extensions: ['.ts', '.tsx', '.cts', '.mts', '.js', '.jsx', '.mjs', '.cjs', '.json', '.node'],
        }),
      ],
    },
  },
  {
    files: ['vite.*.config.ts', 'vitest.*.config.ts', 'forge.config.ts'],
    rules: {
      'import-x/no-unresolved': 'off',
    },
  },
]);
