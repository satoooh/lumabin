import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig({
  build: {
    rollupOptions: {
      // Keep Node builtins and native modules external in main-process bundle.
      // `node:sqlite` must stay external to avoid Vite browser external shims during package build.
      external: ['sharp', /^@img\/sharp-.+$/, /^node:/],
    },
  },
});
