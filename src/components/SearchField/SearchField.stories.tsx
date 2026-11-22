import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor } from 'storybook/test';

import { SearchField } from './SearchField';
import docs from './SearchField.docs';

const meta = {
  title: 'Inputs/SearchField',
  component: SearchField,
  tags: ['autodocs'],
  parameters: { themis: docs, docs: { description: { component: docs.summary } } },
  args: { label: 'Search projects', placeholder: 'Name or owner', onChange: fn(), onSubmit: fn(), onClear: fn() },
  render: (args) => (
    <div style={{ maxWidth: 320 }}>
      <SearchField {...args} />
    </div>
  ),
} satisfies Meta<typeof SearchField>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Use the controls for every prop, and the toolbar to switch themes. */
export const Playground: Story = {};

/** Type to show the clear button; click it, or press Escape, to clear. Enter submits. */
export const Clearing: Story = {
  play: async ({ canvas, canvasElement, args }) => {
    const input = canvas.getByRole('searchbox', { name: 'Search projects' });
    const clear = canvasElement.querySelector('button')!;
    await expect(clear).toHaveAttribute('aria-label', 'Clear search');
    // Hidden (but keeping its space) until there's something to clear.
    await expect(getComputedStyle(clear).visibility).toBe('hidden');
    await userEvent.type(input, 'color');
    await expect(getComputedStyle(clear).visibility).toBe('visible');
    // A pointer, so it's clearly clickable; filled in background-inverse.
    await expect(getComputedStyle(clear).cursor).toBe('pointer');
    await expect(getComputedStyle(clear.firstElementChild!).backgroundColor).toBe('rgb(0, 0, 0)');
    await userEvent.click(clear);
    await expect(input).toHaveValue('');
    await expect(args.onClear).toHaveBeenCalled();
    await expect(input).toHaveFocus();
    await userEvent.type(input, 'button{Enter}');
    await expect(args.onSubmit).toHaveBeenCalledWith('button');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(input).toHaveValue(''));
  },
};

/** The Figma states: empty, filled, without the icon, with help text, invalid and disabled. */
export const States: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 24, maxWidth: 320 }}>
      <SearchField label="Empty" placeholder="Search" />
      <SearchField label="Filled" defaultValue="color" />
      <SearchField label="Without the icon" defaultValue="color" hideIcon />
      <SearchField label="With help" placeholder="Search" description="Search by name or category." />
      <SearchField label="Invalid" defaultValue="!!" isInvalid errorMessage="Use letters and numbers only." />
      <SearchField label="Disabled" defaultValue="color" isDisabled />
    </div>
  ),
  play: async ({ canvas }) => {
    // The same 40px box as TextInput.
    const box = canvas.getByRole('searchbox', { name: 'Filled' }).parentElement!;
    await expect(Math.round(box.getBoundingClientRect().height)).toBe(40);
    // The icon starts the box; without it, the text does.
    const withIcon = canvas.getByRole('searchbox', { name: 'Filled' }).getBoundingClientRect().left - box.getBoundingClientRect().left;
    const noIconBox = canvas.getByRole('searchbox', { name: 'Without the icon' }).parentElement!;
    const withoutIcon = canvas.getByRole('searchbox', { name: 'Without the icon' }).getBoundingClientRect().left - noIconBox.getBoundingClientRect().left;
    await expect(withIcon).toBeGreaterThan(withoutIcon + 20);
  },
};
