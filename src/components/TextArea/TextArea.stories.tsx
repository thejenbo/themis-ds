import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Form } from 'react-aria-components';
import { expect, fn, userEvent, waitFor } from 'storybook/test';

import { ThemeProvider } from '../../theme/ThemeProvider';
import { collectionModes } from '../../tokens/themes';
import { Button } from '../Button';
import { TextInput } from '../TextInput';
import { TextArea } from './TextArea';
import docs from './TextArea.docs';

const LONG =
  'Bug is a small black cat who supervises every design review from the top of the bookshelf. She approves of dashed focus rings, generous padding and anything that makes a crinkly sound.';

const meta = {
  title: 'Inputs/TextArea',
  component: TextArea,
  tags: ['autodocs'],
  parameters: { themis: docs, docs: { description: { component: docs.summary } } },
  args: { label: 'Bio', placeholder: 'A sentence or two about you', onChange: fn() },
  render: (args) => (
    <div style={{ maxWidth: 320 }}>
      <TextArea {...args} />
    </div>
  ),
} satisfies Meta<typeof TextArea>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Type to see the box grow; after `maxRows` lines it scrolls. */
export const Playground: Story = { args: { description: 'Shown on your public profile.', characterLimit: 150 } };

/** Interaction test: 130px to start, grows with the text, scrolls after maxRows; the ring shows inside on focus. */
export const Grows: Story = {
  tags: ['test-only', '!autodocs'],
  args: { maxRows: 6 },
  play: async ({ canvas }) => {
    const field = canvas.getByRole('textbox', { name: 'Bio' });
    const box = field.parentElement!;
    await expect(Math.round(box.getBoundingClientRect().height)).toBe(130);
    await userEvent.click(field);
    const before = getComputedStyle(box, '::before');
    await expect(before.outlineStyle).toBe('dashed');
    await expect([parseFloat(before.top), parseFloat(before.borderTopWidth)]).toEqual([2, 2]);
    // Enter adds lines; the box grows past 130px.
    await userEvent.type(field, 'one{Enter}two{Enter}three{Enter}four{Enter}five{Enter}six');
    await waitFor(() => expect(box.getBoundingClientRect().height).toBeGreaterThan(130));
    await expect(field).toHaveValue('one\ntwo\nthree\nfour\nfive\nsix');
    const sixLines = box.getBoundingClientRect().height;
    // Past maxRows (6 × 24px), it stops growing and scrolls inside.
    await userEvent.type(field, '{Enter}seven{Enter}eight');
    await waitFor(() => expect(getComputedStyle(field).overflowY).toBe('auto'));
    await expect(box.getBoundingClientRect().height).toBe(sixLines);
    await expect(field.clientHeight).toBe(6 * 24);
  },
};

/** Interaction test: typing past the limit turns the count and border red, marks the field invalid and announces it. */
export const CharacterLimit: Story = {
  tags: ['test-only', '!autodocs'],
  args: { characterLimit: 10, description: 'Keep it short.' },
  play: async ({ canvas }) => {
    const field = canvas.getByRole('textbox', { name: 'Bio' });
    await expect(field).toHaveAccessibleDescription(/Keep it short\. +0 of 10 characters/);
    await userEvent.type(field, 'twelve chars');
    await expect(canvas.getByText('12/10')).toBeInTheDocument();
    await expect(field).toHaveAttribute('aria-invalid', 'true');
    await waitFor(() => expect(canvas.getByText('2 characters over the limit')).toBeInTheDocument());
  },
};

/** Interaction test: isRequired shows its message on submit. */
export const Validation: Story = {
  tags: ['test-only', '!autodocs'],
  render: (args) => (
    <Form style={{ display: 'grid', gap: 16, maxWidth: 320 }} onSubmit={(e) => e.preventDefault()}>
      <TextArea {...args} isRequired errorMessage="Tell us a little about yourself." />
      <Button type="submit">Save</Button>
    </Form>
  ),
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(canvas.getByText('Tell us a little about yourself.')).toBeInTheDocument());
  },
};

/** The Figma states: empty, filled, with help text and a count, over the limit, invalid, disabled. */
export const States: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 24, maxWidth: 320 }}>
      <TextArea {...args} label="Empty" placeholder="placeholder" />
      <TextArea {...args} label="Filled" defaultValue="textarea content" />
      <TextArea {...args} label="With help and a count" defaultValue="textarea content" description="here's some helpful context!" characterLimit={150} />
      <TextArea {...args} label="Over the limit" defaultValue={LONG} description="here's some helpful context!" characterLimit={150} errorMessage="a helpful error message :-)" />
      <TextArea {...args} label="Invalid" isInvalid errorMessage="a helpful error message :-)" />
      <TextArea {...args} label="Disabled" defaultValue="textarea content" isDisabled />
    </div>
  ),
};

/** Controlled, next to a TextInput: the same box, text and spacing. */
export const InAForm: Story = {
  render: function Render(args) {
    const [message, setMessage] = useState('');
    return (
      <div style={{ display: 'grid', gap: 16, maxWidth: 400 }}>
        <TextInput label="Subject" placeholder="What's it about?" />
        <TextArea {...args} label="Message" placeholder="How can we help?" value={message} onChange={setMessage} characterLimit={500} />
      </div>
    );
  },
};

/** Each color theme. */
export const ThemeMatrix: Story = {
  tags: ['!autodocs'],
  parameters: { layout: 'fullscreen' },
  render: (args) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
      {collectionModes.colorTheme.map((theme) => (
        <ThemeProvider key={theme} modes={{ colorTheme: theme }}>
          <div style={{ padding: 24, display: 'grid', gap: 16 }}>
            <TextArea {...args} label={theme} defaultValue="textarea content" characterLimit={150} />
            <TextArea {...args} label="Invalid" isInvalid errorMessage="a helpful error message :-)" />
            <TextArea {...args} label="Disabled" defaultValue="textarea content" isDisabled />
          </div>
        </ThemeProvider>
      ))}
    </div>
  ),
};
