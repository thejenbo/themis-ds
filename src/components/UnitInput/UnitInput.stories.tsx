import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Form, type Key } from 'react-aria-components';
import { expect, fn, screen, userEvent, waitFor } from 'storybook/test';

import { ThemeProvider } from '../../theme/ThemeProvider';
import { collectionModes } from '../../tokens/themes';
import { Button } from '../Button';
import { TextInput } from '../TextInput';
import { UnitInput, UnitInputItem } from './UnitInput';
import docs from './UnitInput.docs';

const weights = [
  <UnitInputItem key="kg" id="kg">kg</UnitInputItem>,
  <UnitInputItem key="lb" id="lb">lbs</UnitInputItem>,
  <UnitInputItem key="st" id="st">stone</UnitInputItem>,
];

const meta = {
  title: 'Inputs/UnitInput',
  component: UnitInput,
  subcomponents: { UnitInputItem },
  tags: ['autodocs'],
  parameters: { themis: docs, docs: { description: { component: docs.summary }, story: { inline: false, height: '300px' } } },
  args: { label: 'Weight', placeholder: '0', defaultUnit: 'kg', children: weights, onChange: fn(), onUnitChange: fn() },
  argTypes: { children: { control: false } },
  render: (args) => (
    <div style={{ maxWidth: 320, minHeight: 260 }}>
      <UnitInput {...args} />
    </div>
  ),
} satisfies Meta<typeof UnitInput>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Type a number, or press the unit to change it. */
export const Playground: Story = { args: { description: 'Used to work out your dose.', minValue: 0 } };

/** Interaction test: typing a number, then choosing a unit; the unit button is named "Weight unit". */
export const ChoosesAUnit: Story = {
  tags: ['test-only', '!autodocs'],
  play: async ({ args, canvas }) => {
    const number = canvas.getByRole('textbox', { name: 'Weight' });
    await userEvent.type(number, '72');
    await userEvent.tab();
    await expect(args.onChange).toHaveBeenLastCalledWith(72);
    const unit = canvas.getByRole('button', { name: /Weight unit/ });
    await userEvent.click(unit);
    const listbox = await screen.findByRole('listbox');
    // The list lines up with the whole box, 4px below it.
    const box = number.closest('[role=group]')!.getBoundingClientRect();
    await waitFor(() => {
      const l = listbox.parentElement!.getBoundingClientRect();
      expect(Math.round(l.width)).toBe(Math.round(box.width));
      expect(Math.round(l.left)).toBe(Math.round(box.left));
      expect(Math.round(l.top - box.bottom)).toBe(4);
    });
    await userEvent.click(screen.getByRole('option', { name: 'lbs' }));
    await expect(args.onUnitChange).toHaveBeenLastCalledWith('lb');
    await expect(unit).toHaveTextContent('lbs');
  },
};

/** Interaction test: the divider doesn't move when the unit changes, and the box stays 40px. */
export const StableDivider: Story = {
  tags: ['test-only', '!autodocs'],
  play: async ({ canvas }) => {
    const unit = canvas.getByRole('button', { name: /Weight unit/ });
    const before = unit.getBoundingClientRect();
    await expect(Math.round(unit.parentElement!.closest('[role=group]')!.getBoundingClientRect().height)).toBe(40);
    await userEvent.click(unit);
    await userEvent.click(await screen.findByRole('option', { name: 'stone' }));
    await waitFor(() => expect(unit).toHaveTextContent('stone'));
    await expect(unit.getBoundingClientRect().left).toBe(before.left);
  },
};

/** Interaction test: Tab goes number → unit; arrows step the number; each half shows its own ring. */
export const Keyboard: Story = {
  tags: ['test-only', '!autodocs'],
  args: { defaultValue: 5 },
  play: async ({ args, canvas }) => {
    const user = userEvent.setup();
    await user.tab();
    const number = canvas.getByRole('textbox', { name: 'Weight' });
    await expect(number).toHaveFocus();
    const ring = number.closest('[data-themis-number]')!;
    await waitFor(() => expect(getComputedStyle(ring, '::before').outlineStyle).toBe('dashed'));
    await user.keyboard('{ArrowUp}');
    await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith(6));
    await user.tab();
    const unit = canvas.getByRole('button', { name: /Weight unit/ });
    await expect(unit).toHaveFocus();
    await waitFor(() => expect(getComputedStyle(unit, '::before').outlineStyle).toBe('dashed'));
    await expect(getComputedStyle(ring, '::before').content).toBe('none');
    await user.keyboard('{ArrowDown}');
    await screen.findByRole('listbox');
    await user.keyboard('{ArrowDown}{Enter}');
    await waitFor(() => expect(args.onUnitChange).toHaveBeenLastCalledWith('lb'));
  },
};

/** Interaction test: min/max validation shows its message on submit. */
export const Validation: Story = {
  tags: ['test-only', '!autodocs'],
  render: (args) => (
    <Form style={{ display: 'grid', gap: 16, maxWidth: 320 }} onSubmit={(e) => e.preventDefault()}>
      <UnitInput {...args} isRequired errorMessage="Enter your weight." />
      <Button type="submit">Continue</Button>
    </Form>
  ),
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Continue' }));
    await waitFor(() => expect(canvas.getByText('Enter your weight.')).toBeInTheDocument());
  },
};

/** The Figma states: empty, filled, with help text, invalid, disabled. */
export const States: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 24, maxWidth: 320 }}>
      <UnitInput {...args} label="Empty" />
      <UnitInput {...args} label="Filled" defaultValue={72} />
      <UnitInput {...args} label="With help" defaultValue={72} description="here's some helpful context!" />
      <UnitInput {...args} label="Invalid" defaultValue={72} isInvalid errorMessage="a helpful error message :-)" description="here's some helpful context!" />
      <UnitInput {...args} label="Disabled" defaultValue={72} isDisabled />
      <UnitInput {...args} label="No unit yet" defaultUnit={null} />
    </div>
  ),
  play: async ({ canvas }) => {
    // The divider before the unit is the box's border colour: red when invalid, grey when disabled (as in Figma).
    for (const name of ['Invalid', 'Disabled', 'Filled']) {
      const box = canvas.getByRole('textbox', { name }).closest('[role="group"]')!;
      const unit = box.querySelector('button')!;
      await expect(getComputedStyle(unit).borderLeftColor).toBe(getComputedStyle(box).borderTopColor);
    }
  },
};

/** Lines up with a TextInput: the same box, height and text. */
export const WithTextInput: Story = {
  render: function Render(args) {
    const [unit, setUnit] = useState<Key | null>('cm');
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, maxWidth: 560, alignItems: 'start', minHeight: 260 }}>
        <TextInput label="Name" placeholder="Bug" />
        <UnitInput {...args} label="Height" unit={unit} onUnitChange={setUnit} formatOptions={{ maximumFractionDigits: 1 }}>
          <UnitInputItem id="cm">cm</UnitInputItem>
          <UnitInputItem id="in">in</UnitInputItem>
        </UnitInput>
      </div>
    );
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
          <div style={{ padding: 24, display: 'grid', gap: 16 }}>
            <UnitInput {...args} label={theme} defaultValue={72} />
            <UnitInput {...args} label="Invalid" defaultValue={72} isInvalid errorMessage="a helpful error message :-)" />
            <UnitInput {...args} label="Disabled" defaultValue={72} isDisabled />
          </div>
        </ThemeProvider>
      ))}
    </div>
  ),
};
