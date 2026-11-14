import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { ColorSwatch } from './ColorSwatch';
import docs from './ColorSwatch.docs';

const row = { display: 'flex', alignItems: 'center', gap: 16 } as const;

const meta = {
  title: 'Color/ColorSwatch',
  component: ColorSwatch,
  tags: ['autodocs'],
  parameters: { themis: docs, docs: { description: { component: docs.summary } } },
  args: { color: '#7A1FEB' },
} satisfies Meta<typeof ColorSwatch>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Use the controls for every prop, and the toolbar to switch themes. */
export const Playground: Story = {};

/** The Figma set: three sizes, solid and outline. */
export const SizesAndVariants: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 16 }}>
      {(['solid', 'outline'] as const).map((variant) => (
        <div key={variant} style={row}>
          {(['large', 'medium', 'small'] as const).map((size) => (
            <ColorSwatch key={size} {...args} size={size} variant={variant} aria-label={`${size} ${variant}`} />
          ))}
        </div>
      ))}
    </div>
  ),
  play: async ({ canvas }) => {
    const sizeOf = (name: string) => Math.round(canvas.getByRole('img', { name: new RegExp(`${name}$`) }).getBoundingClientRect().width);
    await expect(sizeOf('large solid')).toBe(40);
    await expect(sizeOf('medium solid')).toBe(32);
    await expect(sizeOf('small solid')).toBe(24);
    await expect(getComputedStyle(canvas.getByRole('img', { name: /large outline$/ })).borderTopStyle).toBe('solid');
    await expect(getComputedStyle(canvas.getByRole('img', { name: /large solid$/ })).borderTopStyle).toBe('none');
  },
};

/** Outline keeps colours close to the background visible. */
export const LightAndDark: Story = {
  render: () => (
    <div style={row}>
      <ColorSwatch color="#FFFFFF" />
      <ColorSwatch color="#FFFFFF" variant="outline" />
      <ColorSwatch color="#000000" />
      <ColorSwatch color="#000000" variant="outline" />
    </div>
  ),
};

/** See-through colours show a checkerboard behind them; opaque ones don't. */
export const Transparency: Story = {
  render: () => (
    <div style={row}>
      <ColorSwatch color="rgba(122, 31, 235, 1)" size="large" />
      <ColorSwatch color="rgba(122, 31, 235, 0.6)" size="large" />
      <ColorSwatch color="rgba(122, 31, 235, 0.2)" size="large" />
      <ColorSwatch color="rgba(122, 31, 235, 0)" size="large" variant="outline" />
    </div>
  ),
  play: async ({ canvas }) => {
    const [opaque, partial] = canvas.getAllByRole('img') as [HTMLElement, HTMLElement];
    await expect(getComputedStyle(opaque).backgroundImage).toBe('none');
    await expect(getComputedStyle(partial).backgroundImage).toContain('conic-gradient');
  },
};

/** Screen readers hear a description of the colour, or `colorName` when given, followed by any `aria-label`. */
export const Names: Story = {
  render: () => (
    <div style={row}>
      <ColorSwatch color="#1F4FEB" />
      <ColorSwatch color="#7A1FEB" colorName="Themis violet" />
      <ColorSwatch color="#EB1F4F" aria-label="Error" />
    </div>
  ),
  play: async ({ canvas }) => {
    const [described, named, labelled] = canvas.getAllByRole('img') as [HTMLElement, HTMLElement, HTMLElement];
    await expect(described.getAttribute('aria-label')).toMatch(/blue/i);
    await expect(named).toHaveAccessibleName(expect.stringContaining('Themis violet'));
    await expect(labelled).toHaveAccessibleName(expect.stringMatching(/, Error$/));
  },
};
