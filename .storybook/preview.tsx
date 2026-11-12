import '../src/styles/base.css';

import type { Decorator, Preview } from '@storybook/react-vite';

import { ThemeProvider } from '../src/theme/ThemeProvider';
import { collectionModes, defaultModes, type Modes, type ThemeCollection } from '../src/tokens/themes';
import { ThemisDocsPage } from './blocks/ThemisDocsPage';

const collections = Object.keys(collectionModes) as ThemeCollection[];

// One toolbar global per multi-mode Figma collection, named after the collection.
const withTheme: Decorator = (Story, { globals }) => (
  <ThemeProvider modes={Object.fromEntries(collections.map((c) => [c, globals[c] ?? defaultModes[c]])) as Modes}>
    <div style={{ padding: 24 }}>
      <Story />
    </div>
  </ThemeProvider>
);

/**
 * Load the demo fonts (preview-head.html) before rendering any story. Fonts only start downloading once text uses
 * them, so without this a story can render, and a test measure it, in the fallback font; under the load of a full
 * test run that made size-based tests flaky. Capped at 5s so a slow network can't hang Storybook.
 */
const DEMO_FONTS = ['Montserrat', 'Playfair Display', 'Outfit'].flatMap((family) =>
  ['400', '600', '700'].map((weight) => `${weight} 16px "${family}"`),
).concat(['400 16px "Fredoka One"', '400 16px "Space Mono"', '700 16px "Space Mono"']);
const loadFonts = async () => {
  await Promise.race([
    Promise.all(DEMO_FONTS.map((f) => document.fonts.load(f).catch(() => []))),
    new Promise((resolve) => setTimeout(resolve, 5000)),
  ]);
  return {};
};

const preview: Preview = {
  decorators: [withTheme],
  loaders: [loadFonts],
  globalTypes: Object.fromEntries(
    collections.map((c) => [
      c,
      {
        description: `Mode of the "${c}" token collection`,
        toolbar: {
          title: c,
          icon: c === 'colorTheme' ? 'mirror' : 'component',
          items: collectionModes[c].map((m) => ({ value: m, title: `${c}: ${m}` })),
          dynamicTitle: true,
        },
      },
    ]),
  ),
  initialGlobals: { ...defaultModes },
  parameters: {
    layout: 'fullscreen',
    controls: { expanded: true, sort: 'requiredFirst' },
    docs: { page: ThemisDocsPage, toc: true },
    // Accessibility checks run on every story; violations fail `npm test`.
    a11y: { test: 'error' },
    options: {
      storySort: { order: ['Introduction', 'Foundations', 'Guides', '*'] },
    },
  },
};

export default preview;
