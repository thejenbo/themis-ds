import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Form, type Key } from 'react-aria-components';
import { expect, fn, screen, userEvent, waitFor } from 'storybook/test';

import { ThemeProvider } from '../../theme/ThemeProvider';
import { collectionModes } from '../../tokens/themes';
import { Button } from '../Button';
import { TextInput } from '../TextInput';
import { Icon } from '../Icon';
import { Select, SelectItem, SelectSeparator } from './Select';
import docs from './Select.docs';

const roles = (
  <>
    <SelectItem id="viewer">Viewer</SelectItem>
    <SelectItem id="commenter">Commenter</SelectItem>
    <SelectItem id="editor">Editor</SelectItem>
    <SelectItem id="admin">Admin</SelectItem>
    <SelectItem id="owner" isDisabled>
      Owner
    </SelectItem>
  </>
);

const meta = {
  title: 'Inputs/Select',
  component: Select,
  subcomponents: { SelectItem, SelectSeparator },
  tags: ['autodocs'],
  parameters: { themis: docs, docs: { description: { component: docs.summary }, story: { inline: false, height: '360px' } } },
  args: { label: 'Role', children: roles, onChange: fn() },
  argTypes: { children: { control: false } },
  render: (args) => (
    <div style={{ maxWidth: 320, minHeight: 320 }}>
      <Select {...args} />
    </div>
  ),
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Use the controls for every prop, and the toolbar to switch themes. */
export const Playground: Story = { args: { description: 'Editors can change everything except billing.', placeholder: 'Choose a role' } };

const onAddTheme = fn();

/**
 * An "Add new…" option after a `SelectSeparator`. Give it an `icon` and an `onAction`: choosing it runs the action
 * and leaves the chosen option as it was. Offer the same action somewhere else too (e.g. a menu), since screen
 * readers announce it as an option.
 */
export const AddNewOption: Story = {
  args: { label: 'Theme', defaultValue: 'dark' },
  render: (args) => (
    <div style={{ maxWidth: 320, minHeight: 320 }}>
      <Select {...args}>
        <SelectItem id="light">light</SelectItem>
        <SelectItem id="dark">dark</SelectItem>
        <SelectSeparator />
        <SelectItem id="add-theme" icon={<Icon name="plus" />} onAction={onAddTheme}>
          Add new theme
        </SelectItem>
      </Select>
    </div>
  ),
  play: async ({ args, canvas }) => {
    onAddTheme.mockClear();
    const box = canvas.getByRole('button', { name: /Theme/ });
    await userEvent.click(box);
    const separator = await screen.findByRole('separator');
    // Figma "Dropdown Divider": 1px in the border colour.
    await expect(separator.getBoundingClientRect().height).toBe(1);
    // Figma "iconLeft": a 16px icon, 8px before the label.
    const addOption = screen.getByRole('option', { name: 'Add new theme' });
    const icon = addOption.querySelector('svg')!;
    const label = icon.parentElement!.nextElementSibling!;
    await expect(Math.round(icon.getBoundingClientRect().width)).toBe(16);
    await expect(Math.round(label.getBoundingClientRect().left - icon.getBoundingClientRect().right)).toBe(8);
    await userEvent.click(addOption);
    await expect(onAddTheme).toHaveBeenCalledTimes(1);
    await expect(args.onChange).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    await expect(box).toHaveTextContent('dark');

    // Keyboard: the arrow keys skip the divider, and Enter runs the action.
    await userEvent.keyboard('{ArrowDown}');
    await screen.findByRole('listbox');
    await userEvent.keyboard('{End}{Enter}');
    await expect(onAddTheme).toHaveBeenCalledTimes(2);
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());

    // Typing a letter on the closed box jumps between themes, but never runs the action.
    box.focus();
    await userEvent.keyboard('a');
    await expect(onAddTheme).toHaveBeenCalledTimes(2);
    await expect(box).toHaveTextContent('dark');
  },
};

/** Open, with an option chosen, mirroring the Figma "opened" variant. */
export const Open: Story = {
  args: { defaultOpen: true, defaultValue: 'editor' },
  play: async () => {
    const options = await screen.findAllByRole('option');
    // Figma: 32px options, 4px apart; the chosen one has a ✓; the list is as wide as the box.
    await expect(Math.round(options[0]!.getBoundingClientRect().height)).toBe(32);
    await expect(Math.round(options[1]!.getBoundingClientRect().top - options[0]!.getBoundingClientRect().bottom)).toBe(4);
    await expect(screen.getByRole('option', { name: 'Editor' })).toHaveAttribute('aria-selected', 'true');
  },
};

/** Interaction test: clicking opens the list, choosing an option closes it, shows the choice and calls onChange. */
export const ChoosesAnOption: Story = {
  tags: ['test-only', '!autodocs'],
  play: async ({ args, canvas }) => {
    const box = canvas.getByRole('button', { name: /Role/ });
    await expect(box).toHaveTextContent('Select an option');
    await userEvent.click(box);
    const listbox = await screen.findByRole('listbox');
    // As wide as the box, 4px below it.
    const b = box.getBoundingClientRect();
    // Measured once React Aria has positioned the list (and the 4px opening slide has finished).
    await waitFor(() => {
      const l = listbox.parentElement!.getBoundingClientRect();
      expect(Math.round(l.width)).toBe(Math.round(b.width));
      expect(Math.round(l.top - b.bottom)).toBe(4);
    });
    await userEvent.click(screen.getByRole('option', { name: 'Admin' }));
    await expect(args.onChange).toHaveBeenLastCalledWith('admin');
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
    await expect(box).toHaveTextContent('Admin');
  },
};

/** Interaction test: keyboard opens it, arrows skip disabled options, typing jumps, Escape closes. */
export const Keyboard: Story = {
  tags: ['test-only', '!autodocs'],
  play: async ({ args, canvas }) => {
    const user = userEvent.setup();
    await user.tab();
    const box = canvas.getByRole('button', { name: /Role/ });
    await expect(box).toHaveFocus();
    await waitFor(() => expect(getComputedStyle(box, '::before').outlineStyle).toBe('dashed'));
    await user.keyboard('{ArrowDown}');
    await screen.findByRole('listbox');
    await user.keyboard('a');
    await waitFor(() => expect(screen.getByRole('option', { name: 'Admin' })).toHaveFocus());
    // Owner is disabled, so ArrowDown stays on Admin.
    await user.keyboard('{ArrowDown}');
    await expect(screen.getByRole('option', { name: 'Admin' })).toHaveFocus();
    await user.keyboard('{Enter}');
    await expect(args.onChange).toHaveBeenLastCalledWith('admin');
    await waitFor(() => expect(box).toHaveFocus());
    await user.keyboard('{ArrowDown}');
    await screen.findByRole('listbox');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
    await expect(box).toHaveTextContent('Admin');
  },
};

/** Interaction test: isRequired shows its message on submit. */
export const Validation: Story = {
  tags: ['test-only', '!autodocs'],
  render: (args) => (
    <Form style={{ display: 'grid', gap: 16, maxWidth: 320 }} onSubmit={(e) => e.preventDefault()}>
      <Select {...args} isRequired errorMessage="Choose a role." />
      <Button type="submit">Invite</Button>
    </Form>
  ),
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Invite' }));
    await waitFor(() => expect(canvas.getByText('Choose a role.')).toBeInTheDocument());
  },
};

/** The Figma states: placeholder, chosen, with help text, invalid, disabled. */
export const States: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 24, maxWidth: 320 }}>
      <Select label="Empty" placeholder="placeholder">
        {roles}
      </Select>
      <Select label="Chosen" defaultValue="editor">
        {roles}
      </Select>
      <Select label="With help" defaultValue="editor" description="here's some helpful context!">
        {roles}
      </Select>
      <Select label="Invalid" isInvalid errorMessage="a helpful error message :-)" description="here's some helpful context!">
        {roles}
      </Select>
      <Select label="Disabled" isDisabled defaultValue="editor">
        {roles}
      </Select>
    </div>
  ),
};

/** Next to a TextInput: the boxes are the same 40px height and style. */
export const InAForm: Story = {
  render: function Render() {
    const [role, setRole] = useState<Key | null>('viewer');
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px', gap: 16, maxWidth: 480, alignItems: 'start', minHeight: 300 }}>
        <TextInput label="Email" type="email" placeholder="name@example.com" />
        <Select label="Role" value={role} onChange={setRole}>
          {roles}
        </Select>
      </div>
    );
  },
  play: async ({ canvas }) => {
    const input = canvas.getByRole('textbox', { name: 'Email' }).parentElement!.getBoundingClientRect();
    const select = canvas.getByRole('button', { name: /Role/ }).getBoundingClientRect();
    await expect(Math.round(select.height)).toBe(Math.round(input.height));
    await expect(Math.round(select.top)).toBe(Math.round(input.top));
  },
};

/** Each colour theme, open. */
export const ThemeMatrix: Story = {
  tags: ['!autodocs'],
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
      {collectionModes.colorTheme.map((theme) => (
        <ThemeProvider key={theme} modes={{ colorTheme: theme }}>
          <div style={{ padding: 24, minHeight: 320 }}>
            <Select label={theme} defaultOpen defaultValue="editor">
              {roles}
            </Select>
          </div>
        </ThemeProvider>
      ))}
    </div>
  ),
};
