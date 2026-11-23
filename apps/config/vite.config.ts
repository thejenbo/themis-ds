import path from 'node:path';
import { fileURLToPath } from 'node:url';

import stylex from '@stylexjs/unplugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

import { storiesWithoutTests } from './stories-without-tests';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(dirname, '../..');

/**
 * The Themis config tool. It uses the design system from source (`themis-ds` → `src/index.ts`), so changes to
 * components show up here straight away. Run with `npm run config` from the repo root.
 */
export default defineConfig({
  root: dirname,
  // Where the built tool is served from: `/` locally, `/themis-ds/` on GitHub Pages (set by the deploy workflow).
  base: process.env.CONFIG_BASE ?? '/',
  plugins: [
    stylex.vite({
      dev: process.env.NODE_ENV !== 'production',
      useCSSLayers: true,
      unstable_moduleResolution: { type: 'commonJS', rootDir: repoRoot },
    }),
    react(),
    // The components page renders stories but never runs their tests: skip Storybook's test library there.
    storiesWithoutTests(),
  ],
  resolve: {
    alias: {
      'themis-ds': path.join(repoRoot, 'src/index.ts'),
    },
  },
  server: { port: 5174 },
  build: { outDir: path.join(dirname, 'dist'), emptyOutDir: true },
});
