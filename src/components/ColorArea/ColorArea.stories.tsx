import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import type { Color } from 'react-aria-components';
import { parseColor } from 'react-aria-components';
import { expect, fn, userEvent } from 'storybook/test';

import { ColorSlider } from '../ColorSlider';
import { ColorSwatch } from '../ColorSwatch';
import { ColorArea } from './ColorArea';
import docs from './ColorArea.docs';

const meta = {
  title: 'Color/ColorArea',
  component: ColorArea,
  tags: ['autodocs'],
  parameters: { themis: docs, docs: { description: { component: docs.summary } } },
  args: { 'aria-label': 'Brand colour', defaultValue: 'hsl(345, 70%, 55%)', onChange: fn(), onChangeEnd: fn() },
  render: (args) => (
    <div style={{ maxWidth: 345 }}>
      <ColorArea {...args} />
    </div>
  ),
} satisfies Meta<typeof ColorArea>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Drag the thumb or use the arrow keys. Use the controls for every prop, and the toolbar to switch themes. */
export const Playground: Story = {};

/** With a hue ColorSlider and a ColorSwatch preview: every colour is reachable. */
export const WithHueSlider: Story = {
  render: () => {
    const [value, setValue] = useState<Color>(parseColor('hsl(345, 70%, 55%)'));
    return (
      <div style={{ display: 'grid', gap: 16, maxWidth: 345 }}>
        <ColorArea aria-label="Brand colour" value={value} onChange={setValue} />
        <ColorSlider channel="hue" aria-label="Brand hue" value={value} onChange={setValue} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ColorSwatch color={value} variant="outline" />
          <code>{value.toString('hex')}</code>
        </div>
      </div>
    );
  },
};

/** Interaction test: arrows change saturation (x) and lightness (y), the thumb shows the colour, callbacks fire. */
export const Keyboard: Story = {
  tags: ['test-only', '!autodocs'],
  play: async ({ args, canvas }) => {
    const user = userEvent.setup();
    await user.tab();
    const x = canvas.getByRole('slider');
    // React Aria keeps the y channel's input out of the accessibility tree on desktop (the x input announces both).
    const y = x.closest('[data-themis-touch-target]')!.querySelectorAll('input')[1] as HTMLInputElement;
    await expect(x).toHaveFocus();
    await expect(x).toHaveValue('70');
    await user.keyboard('{ArrowRight}');
    await expect(x).toHaveValue('71');
    await user.keyboard('{ArrowUp}');
    await expect(y).toHaveValue('56');
    await expect(args.onChangeEnd).toHaveBeenCalled();
    const thumb = x.closest('[data-themis-touch-target]') as HTMLElement;
    await expect(Math.round(thumb.getBoundingClientRect().width)).toBe(32);
    await expect(getComputedStyle(thumb).outlineStyle).toBe('dashed');
    const centre = thumb.querySelectorAll('span[aria-hidden="true"]')[1] as HTMLElement;
    const shown = parseColor(getComputedStyle(centre).backgroundColor).toFormat('hsl');
    await expect(Math.round(shown.getChannelValue('hue'))).toBe(345);
  },
};

/** Disabled: grey area and thumb, and it can't be focused. */
export const Disabled: Story = {
  args: { isDisabled: true },
  play: async ({ canvas }) => {
    for (const input of canvas.getByRole('slider').closest('[data-themis-touch-target]')!.querySelectorAll('input')) await expect(input).toBeDisabled();
  },
};
