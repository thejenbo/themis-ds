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
      // In test runs, insert each module's styles as soon as it executes. Otherwise styles arrive through the
      // shared dev stylesheet, which can lag behind under a full parallel run, so a test may measure an unstyled
      // component (that made size-based tests flaky).
      runtimeInjection: Boolean(process.env.VITEST),
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
      external: [/^react(-dom)?(\/.*)?$/, /^react-aria-components/, /^react-aria(\/|$)/, /^@stylexjs\/stylex/, /^@react-aria\//, /^@react-stately\//, /^lucide(\/|$)/],
    },
    sourcemap: true,
  },

  // `npm test` runs the unit tests and every story as a browser test (interactions + axe a11y checks).
  test: {
    projects: [
      // Plain logic (the theme engine): src/**/*.test.ts, in Node.
      {
        extends: true,
        test: { name: 'unit', include: ['src/**/*.test.ts'], environment: 'node' },
      },
      // The config tool (apps/config): the whole app in a real browser, its flows and the bugs caught so far.
      {
        extends: true,
        resolve: { alias: { 'themis-ds': path.join(dirname, 'src/index.ts') } },
        test: {
          name: 'config',
          include: ['apps/config/src/**/*.test.tsx'],
          browser: {
            enabled: true,
            headless: true,
            // The tool is laid out for desktop (preview plus a 350px sidebar).
            viewport: { width: 1440, height: 1000 },
            provider: playwright({}),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
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
