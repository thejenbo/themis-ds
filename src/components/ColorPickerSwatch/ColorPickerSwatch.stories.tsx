import type { Meta, StoryObj } from '@storybook/react-vite';
import { ColorSwatchPicker } from 'react-aria-components';
import { expect, fn, userEvent } from 'storybook/test';

import { ColorPickerSwatch, ColorPickerSwatchItem } from './ColorPickerSwatch';
import docs from './ColorPickerSwatch.docs';

const meta = {
  title: 'Color/ColorPickerSwatch',
  component: ColorPickerSwatch,
  tags: ['autodocs'],
  parameters: { themis: docs, docs: { description: { component: docs.summary } } },
  args: { color: '#7A1FEB', 'aria-label': 'Pick a color', onPress: fn() },
} satisfies Meta<typeof ColorPickerSwatch>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Use the controls for every prop. Tab to it to see the focus ring; press and hold to see it shrink. */
export const Playground: Story = {};

/** Figma's set: three sizes, enabled and disabled. Disabled shows the disabled grey instead of the colour. */
export const SizesAndStates: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, auto)', gap: 16, justifyContent: 'start', alignItems: 'center' }}>
      {(['large', 'medium', 'small'] as const).map((size) => <ColorPickerSwatch key={size} {...args} size={size} aria-label={`Pick a color (${size})`} />)}
      {(['large', 'medium', 'small'] as const).map((size) => (
        <ColorPickerSwatch key={`d-${size}`} {...args} size={size} isDisabled aria-label={`Pick a color (${size}, disabled)`} />
      ))}
    </div>
  ),
  play: async ({ canvas }) => {
    const width = (name: string) => Math.round(canvas.getByRole('button', { name: new RegExp(`\\(${name}\\)`) }).getBoundingClientRect().width);
    await expect([width('large'), width('medium'), width('small')]).toEqual([40, 32, 24]);
    await expect(canvas.getByRole('button', { name: /large, disabled/ })).toBeDisabled();
  },
};

/** Interaction test: named by the colour and what it does; Enter presses it; no hover tint. */
export const Keyboard: Story = {
  tags: ['test-only', '!autodocs'],
  play: async ({ args, canvas }) => {
    const button = canvas.getByRole('button', { name: /purple.*Pick a color|Pick a color/i });
    await expect(button).toHaveAccessibleName(expect.stringMatching(/, Pick a color$/));
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await expect(getComputedStyle(button).outlineStyle).toBe('dashed');
    await userEvent.keyboard('{Enter}');
    await expect(args.onPress).toHaveBeenCalled();
  },
};

/** ColorPickerSwatchItem: choosable colours in a React Aria ColorSwatchPicker. Arrow keys move; the chosen one is selected. */
export const InASwatchPicker: Story = {
  render: () => (
    <ColorSwatchPicker aria-label="Recent colors" defaultValue="#1F4FEB" style={{ display: 'flex', gap: 16 }}>
      {['#7A1FEB', '#1F4FEB', '#EB1F4F', '#2E7D32'].map((c) => (
        <ColorPickerSwatchItem key={c} color={c} />
      ))}
    </ColorSwatchPicker>
  ),
  play: async ({ canvas }) => {
    const options = canvas.getAllByRole('option');
    await expect(options).toHaveLength(4);
    await expect(options[1]).toHaveAttribute('aria-selected', 'true');
    await userEvent.click(options[2]!);
    await expect(options[2]).toHaveAttribute('aria-selected', 'true');
  },
};
