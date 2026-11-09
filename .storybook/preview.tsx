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

const preview: Preview = {
  decorators: [withTheme],
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
