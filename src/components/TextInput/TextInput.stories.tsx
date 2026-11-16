import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Form } from 'react-aria-components';
import { expect, fn, userEvent, waitFor } from 'storybook/test';

import { ThemeProvider } from '../../theme/ThemeProvider';
import { collectionModes } from '../../tokens/themes';
import { Button } from '../Button';
import { TextInput } from './TextInput';
import { Icon } from '../Icon';
import docs from './TextInput.docs';

const column = { display: 'grid', gap: 24, maxWidth: 320 } as const;

/** Placeholder icon until the icon library exists. */

const meta = {
  title: 'Inputs/TextInput',
  component: TextInput,
  tags: ['autodocs'],
  parameters: { themis: docs, docs: { description: { component: docs.summary } } },
  args: { label: 'Project name', onChange: fn() },
  render: (args) => (
    <div style={{ maxWidth: 320 }}>
      <TextInput {...args} />
    </div>
  ),
} satisfies Meta<typeof TextInput>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Use the controls for every prop, and the toolbar to switch themes. */
export const Playground: Story = {
  args: { description: 'Shown on the project card.', placeholder: 'e.g. Website redesign', characterLimit: 40 },
};

/** The Figma states: empty with a placeholder, filled, with help text and a count, invalid, over the limit, disabled. */
export const States: Story = {
  render: () => (
    <div style={column}>
      <TextInput label="Empty" placeholder="placeholder" />
      <TextInput label="Filled" defaultValue="input content" />
      <TextInput label="With help and count" defaultValue="input content" description="here's some helpful context!" characterLimit={150} />
      <TextInput label="With icon" defaultValue="input content" icon={<Icon name="check" />} />
      <TextInput label="Invalid" defaultValue="input content" isInvalid errorMessage="a helpful error message :-)" description="here's some helpful context!" />
      <TextInput label="Over the limit" defaultValue="This title is far too long" characterLimit={10} description="here's some helpful context!" />
      <TextInput label="Disabled" defaultValue="input content" isDisabled description="here's some helpful context!" />
      <TextInput label="Optional field" isOptional placeholder="placeholder" />
    </div>
  ),
  play: async ({ canvas }) => {
    // Figma: 40px box, 4px below the label.
    const input = canvas.getByRole('textbox', { name: 'Filled' });
    const box = input.parentElement!.getBoundingClientRect();
    await expect(Math.round(box.height)).toBe(40);
    // Disabled: the label keeps the text colour (only the box goes grey) and the border is border-disabled.
    const disabled = canvas.getByRole('textbox', { name: 'Disabled' });
    await expect(disabled).toBeDisabled();
    await expect(getComputedStyle(canvas.getByText('Disabled')).color).toBe(getComputedStyle(canvas.getByText('Filled')).color);
    await expect(getComputedStyle(disabled.parentElement!).borderColor).toBe('rgb(51, 51, 51)');
    await expect(canvas.getByText('(optional)')).toBeInTheDocument();
  },
};

/** Interaction test: the label, description and count are linked; focusing shows the ring. */
export const Linked: Story = {
  tags: ['test-only', '!autodocs'],
  args: { label: 'Email', type: 'email', description: 'We only use it for receipts.', characterLimit: 50 },
  play: async ({ args, canvas }) => {
    const input = canvas.getByRole('textbox', { name: 'Email' });
    await expect(input).toHaveAttribute('type', 'email');
    await expect(input).toHaveAccessibleDescription(/We only use it for receipts\. +0 of 50 characters/);
    await userEvent.click(input);
    // The ring sits inside the box (Figma): 2px in from the border, 2px wide, corners following the box.
    {
      const before = getComputedStyle(input.parentElement!, '::before');
      await expect(before.outlineStyle).toBe('dashed');
      await expect([parseFloat(before.top), parseFloat(before.left), parseFloat(before.borderTopWidth)]).toEqual([2, 2, 2]);
      await expect(before.zIndex).toBe('1');
    }
    await userEvent.type(input, 'taylor@example.com');
    await expect(args.onChange).toHaveBeenLastCalledWith('taylor@example.com');
    await expect(canvas.getByText('18/50')).toBeInTheDocument();
  },
};

/** Interaction test: typing past the limit turns the count and border red, marks the field invalid and announces it. */
export const CharacterLimit: Story = {
  tags: ['test-only', '!autodocs'],
  args: { label: 'Title', characterLimit: 5 },
  play: async ({ canvas }) => {
    const input = canvas.getByRole('textbox', { name: 'Title' });
    await userEvent.type(input, 'Hello');
    await expect(input).not.toHaveAttribute('aria-invalid');
    await userEvent.type(input, '!!');
    // Not cut off: both extra characters are kept.
    await expect(input).toHaveValue('Hello!!');
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(canvas.getByText('2 characters over the limit')).toBeInTheDocument();
    // The count and the border both switch to the error colour; the label stays the text colour.
    const count = canvas.getByText('7/5').parentElement!;
    const border = getComputedStyle(input.parentElement!).borderTopColor;
    await expect(getComputedStyle(count).color).toBe(border);
    await expect(border).not.toBe(getComputedStyle(canvas.getByText('Title')).color);
  },
};

/** Interaction test: required and email validation show their messages when the form is submitted. */
export const Validation: Story = {
  tags: ['test-only', '!autodocs'],
  render: () => (
    <Form style={column} onSubmit={(e) => e.preventDefault()}>
      <TextInput label="Email" type="email" isRequired errorMessage={(v) => (v.validationDetails.valueMissing ? 'Enter your email address.' : 'Enter an email address like name@example.com.')} />
      <Button type="submit">Save</Button>
    </Form>
  ),
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Save' }));
    const input = canvas.getByRole('textbox', { name: 'Email' });
    await waitFor(() => expect(input).toHaveAccessibleDescription('Enter your email address.'));
    await userEvent.type(input, 'nope');
    await userEvent.click(canvas.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(canvas.getByText('Enter an email address like name@example.com.')).toBeInTheDocument());
  },
};

/** Controlled with `value` and `onChange`. */
export const Controlled: Story = {
  render: function Render(args) {
    const [value, setValue] = useState('Website redesign');
    return (
      <div style={column}>
        <TextInput {...args} value={value} onChange={setValue} characterLimit={30} />
        <span style={{ font: '16px sans-serif' }}>Value: {value}</span>
      </div>
    );
  },
};

/** Each colour theme. */
export const ThemeMatrix: Story = {
  tags: ['!autodocs'],
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
      {collectionModes.colorTheme.map((theme) => (
        <ThemeProvider key={theme} modes={{ colorTheme: theme }}>
          <div style={{ padding: 24, display: 'grid', gap: 16 }}>
            <TextInput label={theme} placeholder="placeholder" description="here's some helpful context!" characterLimit={150} />
            <TextInput label="Invalid" defaultValue="input content" isInvalid errorMessage="a helpful error message :-)" />
            <TextInput label="Disabled" defaultValue="input content" isDisabled />
          </div>
        </ThemeProvider>
      ))}
    </div>
  ),
};
