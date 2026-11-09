/// <reference types="vitest/config" />
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import stylex from '@stylexjs/unplugin';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    stylex.vite({
      // Readable class names in dev; atomic hashes in production builds.
      dev: process.env.NODE_ENV !== 'production',
      useCSSLayers: true,
      unstable_moduleResolution: { type: 'commonJS', rootDir: dirname },
    }),
    react(),
  ],

  // Library build: `npm run build` → dist/index.js + dist/themis.css
  build: {
    lib: {
      entry: path.resolve(dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: 'index',
      cssFileName: 'themis',
    },
    rollupOptions: {
      external: [/^react(-dom)?(\/.*)?$/, /^react-aria-components/, /^@stylexjs\/stylex/, /^@react-aria\//, /^@react-stately\//],
    },
    sourcemap: true,
  },

  // `npm test` runs every story as a browser test (interactions + axe a11y checks).
  test: {
    projects: [
      {
        extends: true,
        plugins: [storybookTest({ configDir: path.join(dirname, '.storybook') })],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
});
