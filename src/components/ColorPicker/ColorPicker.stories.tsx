import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { type Color, parseColor } from 'react-aria-components';
import { expect, fn, screen, userEvent, waitFor } from 'storybook/test';

import { ColorPicker } from './ColorPicker';
import docs from './ColorPicker.docs';

const meta = {
  title: 'Color/ColorPicker',
  component: ColorPicker,
  tags: ['autodocs'],
  parameters: { themis: docs, docs: { description: { component: docs.summary }, story: { inline: false, height: '760px' } } },
  args: { 'aria-label': 'Brand color', defaultValue: '#7A1FEB', onChange: fn(), onChangeEnd: fn() },
} satisfies Meta<typeof ColorPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Press the swatch. Use the controls for every prop, and the toolbar to switch themes. */
export const Playground: Story = {};

/** Starts open with every part: the advanced sliders and recent colours (Figma's fullest variant). */
export const Everything: Story = {
  args: { showAdvanced: true, defaultAdvancedOpen: true, recentColors: ['#7A1FEB', '#1F4FEB', '#EB1F4F'] },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: /Brand color/ }));
    await expect(await screen.findByRole('dialog')).toBeInTheDocument();
  },
};

/**
 * Recent colours are kept by the app: `onChangeEnd` adds the finished colour, and the list is passed back in. Up to 6
 * show; unused slots are empty placeholders.
 */
export const RecentColors: Story = {
  render: function Render(args) {
    const [value, setValue] = useState<Color>(parseColor('#7A1FEB'));
    const [recent, setRecent] = useState<string[]>(['#7A1FEB']);
    return (
      <ColorPicker
        {...args}
        defaultValue={undefined}
        value={value}
        onChange={setValue}
        onChangeEnd={(c) => {
          const hex = c.toString('hex');
          setRecent((r) => [hex, ...r.filter((x) => x !== hex)].slice(0, 6));
        }}
        recentColors={recent}
      />
    );
  },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: /Brand color/ }));
    const dialog = await screen.findByRole('dialog');
    // One recent colour (the current one, chosen) and five placeholders.
    const options = await screen.findAllByRole('option');
    await expect(options).toHaveLength(1);
    await expect(options[0]).toHaveAttribute('aria-selected', 'true');
    // Moving the hue and letting go adds the new colour to the front of the list.
    const hue = screen.getByRole('slider', { name: 'Hue' });
    hue.focus();
    await userEvent.keyboard('{PageUp}');
    await waitFor(() => expect(screen.getAllByRole('option')).toHaveLength(2));
    await expect(dialog).toContainElement(screen.getAllByRole('option')[0]!);
  },
};

/** "Advanced" shows Saturation, Brightness and Hue sliders. It's a disclosure button: it announces expanded/collapsed. */
export const Advanced: Story = {
  args: { showAdvanced: true },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: /Brand color/ }));
    const advanced = await screen.findByRole('button', { name: 'Advanced' });
    await expect(advanced).toHaveAttribute('aria-expanded', 'false');
    // Closed: just the hue slider (and the area's two).
    await expect(screen.queryByRole('slider', { name: 'Brightness' })).not.toBeInTheDocument();
    await userEvent.click(advanced);
    await expect(advanced).toHaveAttribute('aria-expanded', 'true');
    for (const name of ['Saturation', 'Brightness', 'Hue']) await expect(screen.getByRole('slider', { name })).toBeInTheDocument();
  },
};

/** Clicking outside or pressing Escape closes it, and focus goes back to the swatch. */
export const ClosesOutside: Story = {
  tags: ['test-only', '!autodocs'],
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole('button', { name: /Brand color/ });
    await userEvent.click(trigger);
    await screen.findByRole('dialog');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
    await userEvent.click(trigger);
    await screen.findByRole('dialog');
    await userEvent.click(document.body);
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  },
};

/** Disabled: the swatch shows the disabled grey and can't be pressed. */
export const Disabled: Story = {
  args: { isDisabled: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button')).toBeDisabled();
  },
};
