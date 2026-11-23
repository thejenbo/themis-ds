import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { ThemeProvider } from '../../theme/ThemeProvider';
import { collectionModes } from '../../tokens/themes';
import { Heading } from '../Heading';
import { Text } from '../Text';
import { Code } from './Code';
import docs from './Code.docs';

const meta = {
  title: 'Typography/Code',
  component: Code,
  tags: ['autodocs'],
  parameters: { themis: docs, docs: { description: { component: docs.summary } } },
  args: { children: '<ThemeProvider theme={config.themes.light}>', language: 'tsx' },
  argTypes: { language: { control: 'inline-radio', options: ['text', 'json', 'tsx'] } },
  render: (args) => (
    <Text variant="body-base">
      Then pass a theme to <Code {...args} /> at the root of your app.
    </Text>
  ),
} satisfies Meta<typeof Code>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Use the controls to change the code and its language. */
export const Playground: Story = {};

/** At 87.5% of the text around it: in a heading, body text and a caption. */
export const InText: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16, maxWidth: 480 }}>
      <Heading level={3}>
        Export <Code>themis.theme.json</Code>
      </Heading>
      <Text variant="body-base">
        Save this as <Code>themis.theme.json</Code> in your project, then pass a theme to{' '}
        <Code language="tsx">{'<ThemeProvider theme={config.themes.light}>'}</Code>.
      </Text>
      <Text variant="caption">
        Set <Code>loadFont</Code> to <Code language="tsx">false</Code> when your app hosts Space Mono.
      </Text>
    </div>
  ),
  play: async ({ canvas }) => {
    const code = canvas.getAllByText('themis.theme.json')[1]!;
    await expect(getComputedStyle(code).fontFamily).toMatch(/^"?Space Mono"?/);
    await expect(getComputedStyle(code).backgroundColor).toBe('rgb(0, 0, 0)');
  },
};

/** Monokai and Space Mono in every color and font theme; only the corners follow the theme's radius. */
export const InEveryTheme: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 8 }}>
      {collectionModes.colorTheme.map((mode) => (
        <ThemeProvider key={mode} modes={{ colorTheme: mode, fontTheme: 'inkling' }}>
          <Text variant="body-base">
            {mode}: <Code language="tsx">{'<Button variant="outline">'}</Code>
          </Text>
        </ThemeProvider>
      ))}
    </div>
  ),
  play: async ({ canvas }) => {
    const codes = canvas.getAllByText('Button');
    const colors = new Set(codes.map((c) => getComputedStyle(c.closest('code')!).backgroundColor));
    await expect([...colors]).toEqual(['rgb(0, 0, 0)']);
  },
};
