import { defineConfig } from 'vite';

const mainProcessExternalPackages = [
  '@aws-sdk/client-s3',
  '@aws-sdk/s3-request-presigner',
  'sharp',
  /^@img\/sharp-.+$/,
  /^node:/,
];

// https://vitejs.dev/config
export default defineConfig({
  build: {
    rollupOptions: {
      // Keep Node-first packages external in the main-process bundle.
      // AWS SDK patch releases can mix ESM and CJS helper exports in ways Vite should not flatten.
      // `node:sqlite` must stay external to avoid Vite browser external shims during package build.
      external: mainProcessExternalPackages,
    },
  },
});
