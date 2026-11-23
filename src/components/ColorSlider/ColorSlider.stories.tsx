import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, waitFor } from 'storybook/test';

import { ColorSwatch } from '../ColorSwatch';
import { ColorSlider } from './ColorSlider';
import docs from './ColorSlider.docs';

const column = { display: 'grid', gap: 32, maxWidth: 400 } as const;

const meta = {
  title: 'Color/ColorSlider',
  component: ColorSlider,
  tags: ['autodocs'],
  parameters: { themis: docs, docs: { description: { component: docs.summary } } },
  args: { channel: 'hue', label: 'Hue', defaultValue: 'hsl(0, 100%, 50%)', onChange: fn(), onChangeEnd: fn() },
  render: (args) => (
    <div style={{ maxWidth: 400 }}>
      <ColorSlider {...args} />
    </div>
  ),
} satisfies Meta<typeof ColorSlider>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Drag the thumb or use the arrow keys. Use the controls for every prop, and the toolbar to switch themes. */
export const Playground: Story = {};

/** One slider per channel of the same color. Alpha shows a checkerboard behind its colors. */
export const Channels: Story = {
  render: () => {
    const [value, setValue] = useState('hsla(270, 80%, 50%, 0.8)');
    return (
      <div style={column}>
        <ColorSwatch color={value} size="large" variant="outline" />
        {(['hue', 'saturation', 'lightness', 'alpha'] as const).map((channel) => (
          <ColorSlider key={channel} channel={channel} label={channel.charAt(0).toUpperCase() + channel.slice(1)} value={value} onChange={(c) => setValue(c.toString('hsla'))} />
        ))}
      </div>
    );
  },
  play: async ({ canvas }) => {
    // The alpha track's pill has the checkerboard under its colors; the hue track's doesn't.
    const pill = (name: string) => canvas.getByRole('slider', { name }).closest('[data-themis-touch-target]')!.parentElement!.parentElement!;
    await expect(getComputedStyle(pill('Alpha')).backgroundImage).toContain('conic-gradient');
    await expect(getComputedStyle(pill('Hue')).backgroundImage).not.toContain('conic-gradient');
  },
};

/** With no `label`, the slider is named after its channel. The thumb stays inside the track at both ends. */
export const NoLabel: Story = {
  args: { label: undefined },
  render: (args) => (
    <div style={column}>
      <ColorSlider {...args} defaultValue="hsl(0, 100%, 50%)" />
      <ColorSlider {...args} defaultValue="hsl(360, 100%, 50%)" />
    </div>
  ),
  play: async ({ canvas }) => {
    const [start, end] = canvas.getAllByRole('slider', { name: 'Hue' }) as [HTMLElement, HTMLElement];
    const box = (input: HTMLElement) => input.closest('[data-themis-touch-target]')!.getBoundingClientRect();
    const pill = (input: HTMLElement) => input.closest('[data-themis-touch-target]')!.parentElement!.parentElement!.getBoundingClientRect();
    await expect(Math.round(box(start).width)).toBe(28);
    await expect(Math.round(box(start).left)).toBe(Math.round(pill(start).left));
    await expect(Math.round(box(end).right)).toBe(Math.round(pill(end).right));
  },
};

/** Interaction test: keys change the hue, the thumb fills with the new color, and the callbacks fire. */
export const Keyboard: Story = {
  tags: ['test-only', '!autodocs'],
  play: async ({ args, canvas }) => {
    const user = userEvent.setup();
    await user.tab();
    const slider = canvas.getByRole('slider', { name: 'Hue' });
    await expect(slider).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    await expect(slider).toHaveValue('1');
    await expect(args.onChangeEnd).toHaveBeenCalled();
    await user.keyboard('{End}');
    await expect(slider).toHaveValue('360');
    await user.keyboard('{Home}');
    await expect(canvas.getByText('0°', { selector: 'output' })).toBeInTheDocument();
    const thumb = slider.closest('[data-themis-touch-target]') as HTMLElement;
    const fill = thumb.querySelector('span[aria-hidden="true"]') as HTMLElement;
    await expect(getComputedStyle(fill).backgroundColor).toBe('rgb(255, 0, 0)');
    await expect(getComputedStyle(thumb).outlineStyle).toBe('dashed');
    await user.keyboard('{PageUp}');
    await waitFor(() => expect(getComputedStyle(fill).backgroundColor).not.toBe('rgb(255, 0, 0)'));
  },
};

/** Disabled: gray track and thumb, and it can't be focused. */
export const Disabled: Story = {
  args: { isDisabled: true, defaultValue: 'hsl(180, 100%, 50%)' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('slider', { name: 'Hue' })).toBeDisabled();
  },
};
