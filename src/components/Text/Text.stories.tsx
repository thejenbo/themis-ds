import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { ThemeProvider } from '../../theme/ThemeProvider';
import { collectionModes } from '../../tokens/themes';
import { Heading } from '../Heading';
import { Text, type TextVariant } from './Text';
import docs from './Text.docs';

const VARIANTS: { variant: TextVariant; name: string }[] = [
  { variant: 'body-large', name: 'Body Large' },
  { variant: 'body-large-bold', name: 'Body Large Bold' },
  { variant: 'body-medium', name: 'Body Medium' },
  { variant: 'body-medium-bold', name: 'Body Medium Bold' },
  { variant: 'body-base', name: 'Body Base' },
  { variant: 'body-bold', name: 'Body Base Bold' },
  { variant: 'label', name: 'Label' },
  { variant: 'caption', name: 'Caption' },
];

const meta = {
  title: 'Typography/Text',
  component: Text,
  tags: ['autodocs'],
  parameters: { themis: docs, docs: { description: { component: docs.summary } } },
  args: { children: 'Changes on this device will upload when you reconnect.', variant: 'body-base' },
  argTypes: {
    variant: { control: 'select', options: VARIANTS.map((v) => v.variant) },
    as: { control: 'select', options: [undefined, 'p', 'span', 'div', 'strong', 'em', 'small', 'label'] },
  },
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Use the controls, and resize the window past 768px to see the desktop scale. */
export const Playground: Story = {};

/** Every style, mirroring the Figma "Typography Styles" frame. */
export const Styles: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12, justifyItems: 'start' }}>
      {VARIANTS.map(({ variant, name }) => (
        <Text key={variant} variant={variant}>
          {name}
        </Text>
      ))}
    </div>
  ),
  play: async ({ canvas }) => {
    const style = (name: string) => getComputedStyle(canvas.getByText(name));
    await expect(style('Body Base').fontFamily).toContain('Montserrat');
    await expect(style('Body Base').fontWeight).toBe('400');
    await expect(style('Body Base Bold').fontWeight).toBe('700');
    await expect(style('Label').fontWeight).toBe('600');
    // Label is the same size on every screen; caption is 12/16.
    await expect(style('Label').fontSize).toBe('16px');
    await expect(style('Caption').fontSize).toBe('12px');
    await expect(style('Caption').lineHeight).toBe('16px');
    await expect(parseFloat(style('Body Large').fontSize)).toBeGreaterThan(parseFloat(style('Body Medium').fontSize));
    // Body styles are paragraphs; label and caption are inline.
    await expect(canvas.getByText('Body Base').tagName).toBe('P');
    await expect(canvas.getByText('Label').tagName).toBe('SPAN');
  },
};

/** Headings and text together, as on a page. */
export const OnAPage: Story = {
  render: () => (
    <article style={{ display: 'grid', gap: 12, maxWidth: 560 }}>
      <Heading level={1}>Website redesign</Heading>
      <Text variant="body-large">A fresh look for the marketing site, launching in spring.</Text>
      <Heading level={2} size="base">
        Goals
      </Heading>
      <Text>
        Make it easier for new visitors to understand what we do, and for returning customers to find their account.{' '}
        <Text as="strong" variant="body-bold">
          The launch date is fixed.
        </Text>
      </Text>
      <Text variant="caption">Last updated 2 hours ago by Taylor Brooks</Text>
    </article>
  ),
};

/** Color is inherited, so text follows each color theme. */
export const ThemeMatrix: Story = {
  tags: ['!autodocs'],
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
      {collectionModes.colorTheme.map((theme) => (
        <ThemeProvider key={theme} modes={{ colorTheme: theme }}>
          <div style={{ padding: 16, display: 'grid', gap: 8 }}>
            <Heading level={2} size="md">
              {theme}
            </Heading>
            <Text>Body text inherits the theme&apos;s text color.</Text>
            <Text variant="caption">Caption</Text>
          </div>
        </ThemeProvider>
      ))}
    </div>
  ),
};
