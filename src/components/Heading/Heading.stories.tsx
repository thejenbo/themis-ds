import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { Heading, type HeadingLevel, type HeadingSize } from './Heading';
import docs from './Heading.docs';

const SIZES: HeadingSize[] = ['xl', 'lg', 'md', 'base', 'sm', 'xs'];

const meta = {
  title: 'Typography/Heading',
  component: Heading,
  tags: ['autodocs'],
  parameters: { themis: docs, docs: { description: { component: docs.summary } } },
  args: { children: 'Project overview', level: 2 },
  argTypes: {
    level: { control: 'inline-radio', options: [1, 2, 3, 4, 5, 6] },
    size: { control: 'inline-radio', options: [undefined, ...SIZES] },
  },
} satisfies Meta<typeof Heading>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Use the controls, and resize the window past 768px to see the desktop scale. */
export const Playground: Story = {};

/** Each level with its default size, mirroring the Figma "Typography Styles" frame. */
export const Levels: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      {([1, 2, 3, 4, 5, 6] as HeadingLevel[]).map((level) => (
        <Heading key={level} level={level}>
          Heading {SIZES[level - 1]!.toUpperCase()}
        </Heading>
      ))}
    </div>
  ),
  play: async ({ canvas }) => {
    const sizes = [1, 2, 3, 4, 5, 6].map((level) => {
      const h = canvas.getByRole('heading', { level });
      return parseFloat(getComputedStyle(h).fontSize);
    });
    // Each level is smaller than the one above, in the heading font, with no margins.
    for (let i = 1; i < sizes.length; i++) await expect(sizes[i]!).toBeLessThan(sizes[i - 1]!);
    const h1 = canvas.getByRole('heading', { level: 1 });
    await expect(getComputedStyle(h1).fontFamily).toContain('Playfair Display');
    await expect(getComputedStyle(h1).fontWeight).toBe('700');
    await expect(getComputedStyle(canvas.getByRole('heading', { level: 4 })).fontWeight).toBe('600');
    await expect(getComputedStyle(h1).marginTop).toBe('0px');
  },
};

/** Level and size are separate: an h2 that looks like Heading Base, for a card title. */
export const LevelAndSize: Story = {
  args: { level: 2, size: 'base', children: 'Card title' },
  play: async ({ canvas }) => {
    const h = canvas.getByRole('heading', { level: 2, name: 'Card title' });
    await expect(h.tagName).toBe('H2');
  },
};
