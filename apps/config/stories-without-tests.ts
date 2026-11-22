import path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { Plugin } from 'vite';

const STUB = path.join(path.dirname(fileURLToPath(import.meta.url)), 'src/components-page/storybook-test-stub.ts');

/**
 * Gives the component stories a stand-in for `storybook/test` (see storybook-test-stub.ts). Only for imports from
 * `.stories.tsx` files: Storybook's own runtime, which the components page also loads, needs the real one.
 */
export function storiesWithoutTests(): Plugin {
  return {
    name: 'themis:stories-without-tests',
    enforce: 'pre',
    resolveId(id, importer) {
      if (id === 'storybook/test' && importer && /\.stories\.tsx$/.test(importer)) return STUB;
      return null;
    },
  };
}
