import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, waitFor } from 'storybook/test';

import { ThemeProvider } from '../../theme/ThemeProvider';
import { collectionModes } from '../../tokens/themes';
import { Slider } from './Slider';
import docs from './Slider.docs';

const column = { display: 'grid', gap: 32, maxWidth: 400 } as const;

const meta = {
  title: 'Inputs/Slider',
  component: Slider,
  tags: ['autodocs'],
  parameters: { themis: docs, docs: { description: { component: docs.summary } } },
  args: { label: 'Volume', defaultValue: 50, onChange: fn(), onChangeEnd: fn() },
  render: (args) => (
    <div style={{ maxWidth: 400, paddingTop: 16 }}>
      <Slider {...args} />
    </div>
  ),
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Drag the thumb or use the arrow keys. Use the controls for every prop, and the toolbar to switch themes. */
export const Playground: Story = {};

/** The Figma progress examples: 0, 25, 50, 75 and 100. */
export const Values: Story = {
  render: (args) => (
    <div style={column}>
      {[0, 25, 50, 75, 100].map((v) => (
        <Slider key={v} {...args} label={`Value ${v}`} defaultValue={v} />
      ))}
    </div>
  ),
  play: async ({ canvas }) => {
    // The thumb stays inside the track at both ends, and its centre is on the value.
    const geometry = (name: string) => {
      const input = canvas.getByRole('slider', { name });
      const thumb = input.closest('[data-themis-touch-target]')!.getBoundingClientRect();
      const track = thumb && input.closest('.react-aria-SliderTrack, [data-orientation]')!;
      return { thumb, track: (track as HTMLElement).getBoundingClientRect() };
    };
    const zero = geometry('Value 0');
    const full = geometry('Value 100');
    await expect(Math.round(zero.thumb.width)).toBe(28);
    // Pill = the track box plus half a thumb each side.
    await expect(Math.round(zero.thumb.left)).toBe(Math.round(zero.track.left - 14));
    await expect(Math.round(full.thumb.right)).toBe(Math.round(full.track.right + 14));
  },
};

/** Interaction test: arrow keys step, Home/End jump; the value bubble shows while focused; onChangeEnd fires. */
export const Keyboard: Story = {
  tags: ['test-only', '!autodocs'],
  play: async ({ args, canvas }) => {
    const user = userEvent.setup();
    await user.tab();
    const slider = canvas.getByRole('slider', { name: 'Volume' });
    await expect(slider).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    await expect(slider).toHaveValue('51');
    await expect(args.onChangeEnd).toHaveBeenLastCalledWith(51);
    await user.keyboard('{End}');
    await expect(slider).toHaveValue('100');
    // The label row shows the value, and the bubble is visible while keyboard-focused.
    await expect(canvas.getByText('100', { selector: 'output' })).toBeInTheDocument();
    const bubble = slider.closest('[data-themis-touch-target]')!.querySelector('[aria-hidden="true"]')!;
    await waitFor(() => expect(getComputedStyle(bubble).opacity).toBe('1'));
    await expect(bubble).toHaveTextContent('100');
    // The shared focus ring is on the thumb.
    await expect(getComputedStyle(slider.closest('[data-themis-touch-target]')!).outlineStyle).toBe('dashed');
  },
};

/** Interaction test: pressing the thumb grows it to 36px with the grabbing cursor; releasing ends the drag. */
export const Pointer: Story = {
  tags: ['test-only', '!autodocs'],
  play: async ({ args, canvas }) => {
    const slider = canvas.getByRole('slider', { name: 'Volume' });
    const thumb = slider.closest('[data-themis-touch-target]') as HTMLElement;
    const box = thumb.getBoundingClientRect();
    const at = { clientX: box.left + box.width / 2, clientY: box.top + box.height / 2, pointerId: 1, pointerType: 'mouse', bubbles: true, button: 0, buttons: 1 };
    thumb.dispatchEvent(new PointerEvent('pointerdown', at));
    await waitFor(() => expect(Math.round(thumb.getBoundingClientRect().width)).toBe(36));
    await expect(getComputedStyle(thumb).cursor).toBe('grabbing');
    // React Aria listens for the release on the window, matched by pointer id.
    window.dispatchEvent(new PointerEvent('pointerup', { ...at, buttons: 0 }));
    await waitFor(() => expect(Math.round(thumb.getBoundingClientRect().width)).toBeLessThan(36));
    await expect(args.onChangeEnd).toHaveBeenCalled();
  },
};

/** Units come from `formatOptions`: the label row, the bubble and screen readers all say "40%". */
export const Percent: Story = {
  args: { label: 'Opacity', minValue: 0, maxValue: 1, step: 0.05, defaultValue: 0.4, formatOptions: { style: 'percent' } },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('40%', { selector: 'output' })).toBeInTheDocument();
    await expect(canvas.getByRole('slider', { name: 'Opacity' })).toHaveAttribute('aria-valuetext', '40%');
  },
};

/** Controlled with `value` and `onChange`. */
export const Controlled: Story = {
  render: function Render(args) {
    const [value, setValue] = useState(30);
    return (
      <div style={column}>
        <Slider {...args} label="Brightness" value={value} onChange={setValue} />
        <span style={{ font: '16px sans-serif' }}>Brightness is {value}.</span>
      </div>
    );
  },
};

/** Disabled: grey fill and thumb, not-allowed cursor; it can't be changed. */
export const Disabled: Story = {
  args: { isDisabled: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('slider', { name: 'Volume' })).toBeDisabled();
  },
};

/** Each colour theme. */
export const ThemeMatrix: Story = {
  tags: ['!autodocs'],
  parameters: { layout: 'fullscreen' },
  render: (args) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
      {collectionModes.colorTheme.map((theme) => (
        <ThemeProvider key={theme} modes={{ colorTheme: theme }}>
          <div style={{ padding: 24, display: 'grid', gap: 24 }}>
            <Slider {...args} label={theme} />
            <Slider {...args} label={`${theme} (disabled)`} isDisabled />
          </div>
        </ThemeProvider>
      ))}
    </div>
  ),
};
