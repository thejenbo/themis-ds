import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Form, type Key } from 'react-aria-components';
import { expect, fn, screen, userEvent, waitFor } from 'storybook/test';

import { ThemeProvider } from '../../theme/ThemeProvider';
import { collectionModes } from '../../tokens/themes';
import { Button } from '../Button';
import { Select, SelectItem } from '../Select';
import { ComboBox, ComboBoxItem } from './ComboBox';
import docs from './ComboBox.docs';

const COUNTRIES = ['Australia', 'Brazil', 'Canada', 'Denmark', 'Japan', 'Kenya', 'Mexico', 'Netherlands', 'New Zealand', 'Norway', 'Portugal', 'Spain'];
const countries = COUNTRIES.map((c) => (
  <ComboBoxItem key={c} id={c.toLowerCase()}>
    {c}
  </ComboBoxItem>
));

const meta = {
  title: 'Inputs/ComboBox',
  component: ComboBox,
  subcomponents: { ComboBoxItem },
  tags: ['autodocs'],
  parameters: { themis: docs, docs: { description: { component: docs.summary }, story: { inline: false, height: '360px' } } },
  args: { label: 'Country', placeholder: 'Search or choose a country', children: countries, onChange: fn(), onInputChange: fn() },
  argTypes: { children: { control: false } },
  render: (args) => (
    <div style={{ maxWidth: 320, minHeight: 320 }}>
      <ComboBox {...args} />
    </div>
  ),
} satisfies Meta<typeof ComboBox>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Type to filter, or press the caret / Down arrow to see every option. */
export const Playground: Story = { args: { description: 'Used for tax and shipping.' } };

/** Interaction test: typing filters (anywhere in the name, ignoring case); choosing fills the box and calls onChange. */
export const Filters: Story = {
  tags: ['test-only', '!autodocs'],
  play: async ({ args, canvas }) => {
    const input = canvas.getByRole('combobox', { name: 'Country' });
    await userEvent.type(input, 'AN');
    const listbox = await screen.findByRole('listbox');
    const names = () => screen.getAllByRole('option').map((o) => o.textContent);
    await waitFor(() => expect(names()).toEqual(['Canada', 'Japan', 'Netherlands', 'New Zealand']));
    // The list lines up with the whole box, 4px below it.
    const box = input.parentElement!.getBoundingClientRect();
    await waitFor(() => {
      const l = listbox.parentElement!.getBoundingClientRect();
      expect(Math.round(l.width)).toBe(Math.round(box.width));
      expect(Math.round(l.left)).toBe(Math.round(box.left));
      expect(Math.round(l.top - box.bottom)).toBe(4);
    });
    await userEvent.click(screen.getByRole('option', { name: 'Japan' }));
    await expect(args.onChange).toHaveBeenLastCalledWith('japan');
    await expect(input).toHaveValue('Japan');
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
  },
};

/** Interaction test: when nothing matches, the list says "no results found :-(". */
export const NoResults: Story = {
  tags: ['test-only', '!autodocs'],
  play: async ({ canvas }) => {
    await userEvent.type(canvas.getByRole('combobox', { name: 'Country' }), 'xyz');
    await waitFor(() => expect(screen.getByText('no results found :-(')).toBeInTheDocument());
    // React Aria gives the empty state an option role so screen readers announce it; no country is offered.
    await expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['no results found :-(']);
  },
};

/** Interaction test: Down arrow shows every option; arrows move without leaving the box; Enter chooses; focus ring on focus. */
export const Keyboard: Story = {
  tags: ['test-only', '!autodocs'],
  play: async ({ args, canvas }) => {
    const user = userEvent.setup();
    await user.tab();
    const input = canvas.getByRole('combobox', { name: 'Country' });
    await expect(input).toHaveFocus();
    await waitFor(() => expect(getComputedStyle(input.parentElement!).outlineStyle).toBe('dashed'));
    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(screen.getAllByRole('option')).toHaveLength(COUNTRIES.length));
    await user.keyboard('{ArrowDown}');
    // Focus stays in the text box; the highlighted option is announced through aria-activedescendant.
    await expect(input).toHaveFocus();
    await waitFor(() => expect(input.getAttribute('aria-activedescendant')).toBeTruthy());
    await user.keyboard('{Enter}');
    await waitFor(() => expect(args.onChange).toHaveBeenCalled());
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
  },
};

/** Interaction test: the caret button opens the full list. */
export const CaretOpens: Story = {
  tags: ['test-only', '!autodocs'],
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button'));
    await waitFor(() => expect(screen.getAllByRole('option')).toHaveLength(COUNTRIES.length));
  },
};

/** With `allowsCustomValue`, free text is kept; without it, leaving the field puts back the last choice. */
export const CustomValue: Story = {
  args: { label: 'Tag', placeholder: 'Type a tag', allowsCustomValue: true, children: ['design', 'research', 'engineering'].map((t) => <ComboBoxItem key={t} id={t}>{t}</ComboBoxItem>) },
  play: async ({ canvas }) => {
    const input = canvas.getByRole('combobox', { name: 'Tag' });
    await userEvent.type(input, 'marketing');
    await userEvent.tab();
    await expect(input).toHaveValue('marketing');
  },
};

/** Interaction test: isRequired shows its message on submit. */
export const Validation: Story = {
  tags: ['test-only', '!autodocs'],
  render: (args) => (
    <Form style={{ display: 'grid', gap: 16, maxWidth: 320 }} onSubmit={(e) => e.preventDefault()}>
      <ComboBox {...args} isRequired errorMessage="Choose a country." />
      <Button type="submit">Continue</Button>
    </Form>
  ),
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Continue' }));
    await waitFor(() => expect(canvas.getByText('Choose a country.')).toBeInTheDocument());
  },
};

/** The Figma states: placeholder, chosen, with help text, invalid, disabled. */
export const States: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 24, maxWidth: 320 }}>
      <ComboBox {...args} label="Empty" placeholder="placeholder" />
      <ComboBox {...args} label="Chosen" defaultSelectedKey="japan" />
      <ComboBox {...args} label="With help" defaultSelectedKey="japan" description="here's some helpful context!" />
      <ComboBox {...args} label="Invalid" isInvalid errorMessage="a helpful error message :-)" description="here's some helpful context!" />
      <ComboBox {...args} label="Disabled" isDisabled defaultSelectedKey="japan" />
    </div>
  ),
};

/** Next to a Select: the same box, the same list. */
export const WithSelect: Story = {
  render: function Render(args) {
    const [size, setSize] = useState<Key | null>('m');
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: 16, maxWidth: 480, alignItems: 'start', minHeight: 320 }}>
        <ComboBox {...args} />
        <Select label="Size" value={size} onChange={setSize}>
          <SelectItem id="s">Small</SelectItem>
          <SelectItem id="m">Medium</SelectItem>
          <SelectItem id="l">Large</SelectItem>
        </Select>
      </div>
    );
  },
  play: async ({ canvas }) => {
    const combo = canvas.getByRole('combobox', { name: 'Country' }).parentElement!.getBoundingClientRect();
    const select = canvas.getByRole('button', { name: /Size/ }).getBoundingClientRect();
    await expect(Math.round(combo.height)).toBe(Math.round(select.height));
  },
};

/** Each colour theme, with an option chosen. */
export const ThemeMatrix: Story = {
  tags: ['!autodocs'],
  parameters: { layout: 'fullscreen' },
  render: (args) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
      {collectionModes.colorTheme.map((theme) => (
        <ThemeProvider key={theme} modes={{ colorTheme: theme }}>
          <div style={{ padding: 24, minHeight: 320 }}>
            <ComboBox {...args} label={theme} defaultSelectedKey="japan" />
          </div>
        </ThemeProvider>
      ))}
    </div>
  ),
};
