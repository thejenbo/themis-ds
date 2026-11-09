import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent } from 'storybook/test';

import { Button } from './Button';
import docs from './Button.docs';

const meta = {
  title: 'Actions/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    themis: docs,
    docs: { description: { component: docs.summary } },
  },
  args: {
    children: 'Save changes',
    onPress: fn(),
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['primary', 'secondary'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default button. Use the controls to explore every prop. */
export const Playground: Story = {};

/** `primary` for the main action in a region, `secondary` for everything else. */
export const Variants: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 12 }}>
      <Button {...args} variant="primary">Primary</Button>
      <Button {...args} variant="secondary">Secondary</Button>
    </div>
  ),
};

/** `sm` for dense UIs, `md` by default, `lg` for prominent calls to action. */
export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <Button {...args} size="sm">Small</Button>
      <Button {...args} size="md">Medium</Button>
      <Button {...args} size="lg">Large</Button>
    </div>
  ),
};

/** Disabled buttons can't be focused or pressed. Prefer `isPending` while work is in progress. */
export const Disabled: Story = {
  args: { isDisabled: true },
  play: async ({ args, canvas }) => {
    await userEvent.click(canvas.getByRole('button'));
    await expect(args.onPress).not.toHaveBeenCalled();
  },
};

/** While pending, the button stays focusable, blocks presses and announces progress. */
export const Pending: Story = {
  args: { isPending: true },
  play: async ({ args, canvas }) => {
    await expect(canvas.getByRole('progressbar', { name: 'Loading' })).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button'));
    await expect(args.onPress).not.toHaveBeenCalled();
  },
};

/** Pairing: one primary action with a secondary cancel. */
export const PrimaryWithCancel: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12 }}>
      <Button variant="secondary">Cancel</Button>
      <Button variant="primary">Save changes</Button>
    </div>
  ),
};

/** Interaction test: keyboard activation with Enter and Space. */
export const KeyboardActivation: Story = {
  tags: ['test-only', '!autodocs'],
  play: async ({ args, canvas }) => {
    const button = canvas.getByRole('button');
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    await expect(args.onPress).toHaveBeenCalledTimes(2);
  },
};
