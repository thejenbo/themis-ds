import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent } from 'storybook/test';

import { ColorRangeSlider } from './ColorRangeSlider';
import docs from './ColorRangeSlider.docs';

const meta = {
  title: 'Color/ColorRangeSlider',
  component: ColorRangeSlider,
  tags: ['autodocs'],
  parameters: { themis: docs, docs: { description: { component: docs.summary } } },
  args: { channel: 'hue', label: 'Hues', defaultValue: [30, 90], onChange: fn(), onChangeEnd: fn() },
  render: (args) => (
    <div style={{ maxWidth: 400 }}>
      <ColorRangeSlider {...args} />
    </div>
  ),
} satisfies Meta<typeof ColorRangeSlider>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Drag either thumb or use the arrow keys. Use the controls for every prop. */
export const Playground: Story = {};

/** Other channels take their colours from `color`: a lightness range of a violet, and an opacity range. */
export const OtherChannels: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 32, maxWidth: 400 }}>
      <ColorRangeSlider channel="lightness" color="hsl(270, 80%, 50%)" label="Lightness" defaultValue={[20, 80]} />
      <ColorRangeSlider channel="alpha" color="hsl(270, 80%, 50%)" label="Opacity" defaultValue={[0.25, 1]} />
    </div>
  ),
};

/** Interaction test: each thumb moves on its own, they can't cross, and the callbacks get `[start, end]`. */
export const Keyboard: Story = {
  tags: ['test-only', '!autodocs'],
  play: async ({ args, canvas }) => {
    const user = userEvent.setup();
    const [start, end] = canvas.getAllByRole('slider') as [HTMLElement, HTMLElement];
    await expect(start).toHaveAccessibleName(expect.stringContaining('Start'));
    await expect(end).toHaveAccessibleName(expect.stringContaining('End'));
    await user.tab();
    await expect(start).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    await expect(args.onChangeEnd).toHaveBeenLastCalledWith([31, 90]);
    // End takes the start thumb only as far as the end thumb.
    await user.keyboard('{End}');
    await expect(start).toHaveValue('90');
    await user.tab();
    await expect(end).toHaveFocus();
    await user.keyboard('{Home}');
    await expect(end).toHaveValue('90');
    await user.keyboard('{End}');
    await expect(args.onChangeEnd).toHaveBeenLastCalledWith([90, 360]);
    // Each thumb is filled with the colour at its end.
    const fill = (input: HTMLElement) => getComputedStyle(input.closest('[data-themis-touch-target]')!.querySelector('span[aria-hidden="true"]')!).backgroundColor;
    await expect(fill(end)).toBe('rgb(255, 0, 0)');
    await expect(fill(start)).not.toBe(fill(end));
  },
};

/**
 * `showSwatches`: each end's colour in a swatch above its thumb, e.g. for the two stops of a gradient. Below, the
 * gradient between them.
 */
export const Swatches: Story = {
  render: () => {
    const [range, setRange] = useState<[number, number]>([200, 320]);
    const stop = (hue: number) => `hsl(${hue}, 100%, 50%)`;
    return (
      <div style={{ display: 'grid', gap: 16, maxWidth: 400 }}>
        <ColorRangeSlider channel="hue" label="Gradient stops" showSwatches value={range} onChange={setRange} />
        <ColorRangeSlider channel="hue" aria-label="Gradient stops, no label" showSwatches defaultValue={[30, 90]} />
        <div style={{ height: 32, borderRadius: 4, background: `linear-gradient(to right, ${stop(range[0])}, ${stop(range[1])})` }} />
      </div>
    );
  },
  play: async ({ canvas }) => {
    const [start, end] = canvas.getAllByRole('slider') as [HTMLElement, HTMLElement];
    const swatch = (input: HTMLElement) => input.closest('[data-themis-touch-target]')!.querySelectorAll('span[aria-hidden="true"]')[1] as HTMLElement;
    // One swatch per thumb, filled with that end's colour, 24px, above the thumb.
    await expect(getComputedStyle(swatch(start)).backgroundColor).toBe(getComputedStyle(start.closest('[data-themis-touch-target]')!.querySelector('span')!).backgroundColor);
    await expect(getComputedStyle(swatch(end)).backgroundColor).not.toBe(getComputedStyle(swatch(start)).backgroundColor);
    await expect(Math.round(swatch(start).getBoundingClientRect().width)).toBe(24);
    // The swatches stay clear of the label row and inside the component.
    const label = canvas.getByText('Gradient stops');
    await expect(swatch(start).getBoundingClientRect().top).toBeGreaterThanOrEqual(label.getBoundingClientRect().bottom);
    const unlabelled = canvas.getAllByRole('slider')[2]!;
    const group = unlabelled.closest('[role="group"]')!;
    await expect(swatch(unlabelled).getBoundingClientRect().top).toBeGreaterThanOrEqual(group.getBoundingClientRect().top);
  },
};

/** Without a `label`, it's named after its channel. */
export const NoLabel: Story = {
  args: { label: undefined },
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('slider')[0]!).toHaveAccessibleName(expect.stringContaining('Hue range'));
  },
};

/** Disabled: grey track and thumbs, and they can't be focused. */
export const Disabled: Story = {
  args: { isDisabled: true },
  play: async ({ canvas }) => {
    for (const thumb of canvas.getAllByRole('slider')) await expect(thumb).toBeDisabled();
  },
};
