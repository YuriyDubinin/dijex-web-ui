/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

/** Вендорные библиотеки — отдельными чанками: они меняются реже кода сайта и дольше живут в кэше браузера. */
const VENDOR_CHUNKS: Record<string, string[]> = {
  react: ['react', 'react-dom', 'react-router', 'react-router-dom', 'scheduler'],
  motion: ['framer-motion'],
  i18n: ['i18next', 'react-i18next', 'i18next-resources-to-backend'],
  forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
};

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    strictPort: false,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          for (const [chunk, packages] of Object.entries(VENDOR_CHUNKS)) {
            if (packages.some((name) => id.includes(`/node_modules/${name}/`)))
              return `vendor-${chunk}`;
          }
          return undefined;
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
});
