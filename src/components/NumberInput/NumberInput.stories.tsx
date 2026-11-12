import type { Meta, StoryObj } from '@storybook/react-vite';
import { Form } from 'react-aria-components';
import { expect, fn, userEvent, waitFor } from 'storybook/test';

import { ThemeProvider } from '../../theme/ThemeProvider';
import { collectionModes } from '../../tokens/themes';
import { Button } from '../Button';
import { TextInput } from '../TextInput';
import { NumberInput } from './NumberInput';
import docs from './NumberInput.docs';

const meta = {
  title: 'Inputs/NumberInput',
  component: NumberInput,
  tags: ['autodocs'],
  parameters: { themis: docs, docs: { description: { component: docs.summary } } },
  args: { label: 'Guests', placeholder: '0', minValue: 1, maxValue: 8, onChange: fn() },
  render: (args) => (
    <div style={{ maxWidth: 240 }}>
      <NumberInput {...args} />
    </div>
  ),
} satisfies Meta<typeof NumberInput>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Type a number, use the buttons, or Up/Down arrows. */
export const Playground: Story = { args: { defaultValue: 2, description: 'Up to 8 guests.' } };

/** Interaction test: the buttons step and grey out at the limits; the box stays 40px. */
export const Steppers: Story = {
  tags: ['test-only', '!autodocs'],
  args: { defaultValue: 7 },
  play: async ({ args, canvas }) => {
    const input = canvas.getByRole('textbox', { name: 'Guests' });
    await expect(Math.round(input.closest('[role=group]')!.getBoundingClientRect().height)).toBe(40);
    const up = canvas.getByRole('button', { name: 'Increase Guests' });
    const down = canvas.getByRole('button', { name: 'Decrease Guests' });
    // Out of the tab order: the arrow keys do the same.
    await expect(up).toHaveAttribute('tabindex', '-1');
    await userEvent.click(up);
    await expect(args.onChange).toHaveBeenLastCalledWith(8);
    await expect(input).toHaveValue('8');
    await waitFor(() => expect(up).toBeDisabled());
    // Greyed out at the limit, like Select's disabled caret.
    await expect(getComputedStyle(up).color).not.toBe(getComputedStyle(down).color);
    await userEvent.click(down);
    await expect(input).toHaveValue('7');
    await expect(up).not.toBeDisabled();
  },
};

/** Interaction test: arrows step; typing past the limit is clamped on blur; the ring shows on focus. */
export const Keyboard: Story = {
  tags: ['test-only', '!autodocs'],
  args: { defaultValue: 2 },
  play: async ({ args, canvas }) => {
    const user = userEvent.setup();
    await user.tab();
    const input = canvas.getByRole('textbox', { name: 'Guests' });
    await expect(input).toHaveFocus();
    await waitFor(() => expect(getComputedStyle(input.closest('[role=group]')!, '::before').outlineStyle).toBe('dashed'));
    await user.keyboard('{ArrowUp}');
    await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith(3));
    await user.clear(input);
    await user.type(input, '20');
    await user.tab();
    await expect(input).toHaveValue('8');
    await expect(args.onChange).toHaveBeenLastCalledWith(8);
  },
};

/** Interaction test: isRequired shows its message on submit. */
export const Validation: Story = {
  tags: ['test-only', '!autodocs'],
  render: (args) => (
    <Form style={{ display: 'grid', gap: 16, maxWidth: 240 }} onSubmit={(e) => e.preventDefault()}>
      <NumberInput {...args} isRequired errorMessage="Enter the number of guests." />
      <Button type="submit">Continue</Button>
    </Form>
  ),
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Continue' }));
    await waitFor(() => expect(canvas.getByText('Enter the number of guests.')).toBeInTheDocument());
  },
};

/** The Figma states: empty, filled, with help text, invalid, disabled. */
export const States: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 24, maxWidth: 240 }}>
      <NumberInput {...args} label="Empty" />
      <NumberInput {...args} label="Filled" defaultValue={2} />
      <NumberInput {...args} label="With help" defaultValue={2} description="here's some helpful context!" />
      <NumberInput {...args} label="Invalid" defaultValue={2} isInvalid errorMessage="a helpful error message :-)" description="here's some helpful context!" />
      <NumberInput {...args} label="Disabled" defaultValue={2} isDisabled />
      <NumberInput {...args} label="At the maximum" defaultValue={8} />
    </div>
  ),
};

/** `formatOptions`: percent, currency and fixed decimals, formatted for the locale. */
export const Formats: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 24, maxWidth: 240 }}>
      <NumberInput label="Discount" defaultValue={0.15} step={0.05} minValue={0} maxValue={1} formatOptions={{ style: 'percent' }} />
      <NumberInput label="Price" defaultValue={24.5} minValue={0} formatOptions={{ style: 'currency', currency: 'EUR' }} />
      <NumberInput label="Rating" defaultValue={4.5} step={0.5} minValue={0} maxValue={5} formatOptions={{ minimumFractionDigits: 1 }} />
    </div>
  ),
};

/** Lines up with a TextInput: the same box, height and text. */
export const WithTextInput: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, maxWidth: 480, alignItems: 'start' }}>
      <TextInput label="Name on booking" placeholder="Bug" />
      <NumberInput {...args} defaultValue={2} />
    </div>
  ),
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
            <NumberInput {...args} label={theme} defaultValue={2} />
            <NumberInput {...args} label="Invalid" defaultValue={2} isInvalid errorMessage="a helpful error message :-)" />
            <NumberInput {...args} label="Disabled" defaultValue={2} isDisabled />
          </div>
        </ThemeProvider>
      ))}
    </div>
  ),
};
