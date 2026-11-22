import * as stylex from '@stylexjs/stylex';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';

import { CodeBlock } from './CodeBlock';
import docs from './CodeBlock.docs';

const THEME_FILE = `{
  "version": 1,
  "themes": {
    "light": {
      "colors": { "brand": "#7406EB", "text": "#000000", "background": "#FFFFFF" },
      "borderWidth": "medium",
      "radius": "medium",
      "fonts": { "heading": "Playfair Display", "body": "Montserrat" },
      "isDefault": true
    }
  }
}`;

const USAGE = `import { ThemeProvider } from 'themis-ds';
import config from './themis.theme.json';

// Every Themis component inside takes the theme.
export function App({ children }) {
  return <ThemeProvider theme={config.themes.light}>{children}</ThemeProvider>;
}`;

const meta = {
  title: 'Typography/CodeBlock',
  component: CodeBlock,
  tags: ['autodocs'],
  parameters: { themis: docs, docs: { description: { component: docs.summary } } },
  args: { children: USAGE, language: 'tsx', 'aria-label': 'Usage' },
  argTypes: { language: { control: 'inline-radio', options: ['text', 'json', 'tsx'] } },
  render: (args) => (
    <div style={{ maxWidth: 640 }}>
      <CodeBlock {...args} />
    </div>
  ),
} satisfies Meta<typeof CodeBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Use the controls to change the code and its language. */
export const Playground: Story = {
  play: async ({ canvas }) => {
    // Monokai: tags and keywords pink, attributes and functions green, strings yellow, comments grey.
    const colour = (text: string) => getComputedStyle(canvas.getAllByText(text)[0]!).color;
    // The first ThemeProvider is the import (a name, blue); the second is the JSX tag.
    await expect(getComputedStyle(canvas.getAllByText('ThemeProvider')[1]!).color).toBe('rgb(255, 74, 141)');
    await expect(colour('theme')).toBe('rgb(166, 226, 46)');
    await expect(colour("'themis-ds'")).toBe('rgb(230, 219, 116)');
    await expect(colour('// Every Themis component inside takes the theme.')).toBe('rgb(149, 144, 119)');
  },
};

/** A theme file, as the config tool exports it: keys blue, strings yellow, booleans purple. */
export const Json: Story = {
  args: { children: THEME_FILE, language: 'json', 'aria-label': 'Theme file' },
  play: async ({ canvas }) => {
    const colour = (text: string) => getComputedStyle(canvas.getAllByText(text)[0]!).color;
    await expect(colour('"brand"')).toBe('rgb(102, 217, 239)');
    await expect(colour('"#7406EB"')).toBe('rgb(230, 219, 116)');
    await expect(colour('true')).toBe('rgb(174, 129, 255)');
  },
};

/** Capped in height, it scrolls; keyboard users can focus it (with the focus ring) and scroll with the arrow keys. */
export const Scrolling: Story = {
  args: { children: THEME_FILE, language: 'json', 'aria-label': 'Theme file' },
  render: (args) => (
    <div style={{ maxWidth: 360 }}>
      <CodeBlock {...args} xstyle={styles.capped} />
    </div>
  ),
  play: async ({ canvas }) => {
    const block = canvas.getByRole('region', { name: 'Theme file' });
    await userEvent.tab();
    await expect(block).toHaveFocus();
    await expect(getComputedStyle(block).outlineStyle).toBe('dashed');
    await expect(block.scrollHeight).toBeGreaterThan(block.clientHeight);
    await expect(block.scrollWidth).toBeGreaterThan(block.clientWidth);
  },
};

const styles = stylex.create({ capped: { maxHeight: '12rem' } });
