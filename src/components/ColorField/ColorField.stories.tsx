import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, screen, userEvent, waitFor } from 'storybook/test';

import { ColorField } from './ColorField';
import docs from './ColorField.docs';

const meta = {
  title: 'Color/ColorField',
  component: ColorField,
  tags: ['autodocs'],
  parameters: { themis: docs, docs: { description: { component: docs.summary }, story: { inline: false, height: '820px' } } },
  args: { label: 'Color', defaultValue: '#7A1FEB', onChange: fn(), onChangeEnd: fn() },
  render: (args) => (
    <div style={{ maxWidth: 360 }}>
      <ColorField {...args} />
    </div>
  ),
} satisfies Meta<typeof ColorField>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Type a code and press Enter, or press the swatch to pick. Use the controls for every prop. */
export const Playground: Story = {};

/** Figma's states: default, errored (with a message) and disabled. */
export const States: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 24, maxWidth: 360 }}>
      <ColorField {...args} label="Default" />
      <ColorField {...args} label="With help" description="Used for links and buttons." />
      <ColorField {...args} label="Errored" isInvalid errorMessage="This color is too light for text." />
      <ColorField {...args} label="Disabled" isDisabled />
    </div>
  ),
};

/** Interaction test: forgiving codes are read on Enter; unreadable ones show the error and keep the colour. */
export const Typing: Story = {
  tags: ['test-only', '!autodocs'],
  play: async ({ args, canvas }) => {
    const input = canvas.getByRole('textbox', { name: 'Color' });
    await expect(input).toHaveValue('#7A1FEB');
    await userEvent.clear(input);
    await userEvent.type(input, '1f4feb{Enter}');
    await expect(input).toHaveValue('#1F4FEB');
    await expect(args.onChangeEnd).toHaveBeenCalled();
    // The swatch shows the new colour.
    await expect(canvas.getByRole('button', { name: /Pick a color/ })).toHaveAccessibleName(expect.stringMatching(/blue/i));
    await userEvent.clear(input);
    await userEvent.type(input, 'not a color{Enter}');
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(canvas.getByText('Enter a color code, e.g. #7A1FEB')).toBeInTheDocument();
    // Leaving the field without fixing it keeps the last colour in the swatch.
    await expect(canvas.getByRole('button', { name: /Pick a color/ })).toHaveAccessibleName(expect.stringMatching(/blue/i));
  },
};

/** More than one format: the format button switches what the code is shown and read in. "122 31 235" works in RGB. */
export const Formats: Story = {
  args: { formats: ['hex', 'rgb', 'hsl', 'hsb'] },
  play: async ({ canvas }) => {
    const input = canvas.getByRole('textbox', { name: 'Color' });
    await userEvent.click(canvas.getByRole('button', { name: /Color format/ }));
    await userEvent.click(await screen.findByRole('option', { name: 'RGB' }));
    await expect(input).toHaveValue('rgb(122, 31, 235)');
    await userEvent.clear(input);
    await userEvent.type(input, '31 79 235{Enter}');
    await expect(input).toHaveValue('rgb(31, 79, 235)');
    await userEvent.click(canvas.getByRole('button', { name: /Color format/ }));
    await userEvent.click(await screen.findByRole('option', { name: 'HSL' }));
    await expect(input).toHaveValue('hsl(226, 84%, 52%)');
  },
};

/** The swatch opens the picker; picking updates the code. Recent colours come from the app. */
export const WithPicker: Story = {
  render: function Render(args) {
    const [recent, setRecent] = useState<string[]>(['#7A1FEB', '#1F4FEB']);
    return (
      <div style={{ maxWidth: 360 }}>
        <ColorField
          {...args}
          showAdvanced
          recentColors={recent}
          onChangeEnd={(c) => {
            const hex = c.toString('hex');
            setRecent((r) => [hex, ...r.filter((x) => x !== hex)].slice(0, 6));
          }}
        />
      </div>
    );
  },
  play: async ({ canvas }) => {
    const input = canvas.getByRole('textbox', { name: 'Color' });
    await userEvent.click(canvas.getByRole('button', { name: /Pick a color/ }));
    await screen.findByRole('dialog');
    await userEvent.click(screen.getByRole('option', { name: /blue/i }));
    await waitFor(() => expect(input).toHaveValue('#1F4FEB'));
  },
};
