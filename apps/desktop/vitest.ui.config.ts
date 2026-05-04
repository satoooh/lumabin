/// <reference types="vitest/config" />
import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['tests/ui/setup.ts'],
    include: ['tests/ui/**/*.smoke.test.tsx'],
    css: true,
    restoreMocks: true,
    clearMocks: true,
  },
});
