import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Form } from 'react-aria-components';
import { expect, fn, userEvent, waitFor } from 'storybook/test';

import { ThemeProvider } from '../../theme/ThemeProvider';
import { collectionModes } from '../../tokens/themes';
import { Button } from '../Button';
import { RadioGroup, Radio } from '../RadioGroup';
import { Checkbox } from './Checkbox';
import docs from './Checkbox.docs';

const meta = {
  title: 'Inputs/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  parameters: { themis: docs, docs: { description: { component: docs.summary } } },
  args: { children: 'Email me about new features', onChange: fn() },
  render: (args) => (
    <div style={{ maxWidth: 340 }}>
      <Checkbox {...args} />
    </div>
  ),
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Click the box or its label, or Tab to it and press Space. */
export const Playground: Story = { args: { description: 'About once a month. Unsubscribe any time.' } };

/** Interaction test: clicking the label toggles it; Space toggles; the check draws in; ring around the row. */
export const Toggles: Story = {
  tags: ['test-only', '!autodocs'],
  play: async ({ args, canvas }) => {
    const checkbox = canvas.getByRole('checkbox', { name: 'Email me about new features' });
    const row = checkbox.closest('label')!;
    const mark = row.querySelector('path')!;
    await expect(getComputedStyle(mark).strokeDashoffset).toBe('1px');
    await userEvent.click(canvas.getByText('Email me about new features'));
    await expect(args.onChange).toHaveBeenLastCalledWith(true);
    await expect(checkbox).toBeChecked();
    await waitFor(() => expect(getComputedStyle(mark).strokeDashoffset).toBe('0px'));
    await userEvent.click(document.body);
    const user = userEvent.setup();
    await user.tab();
    await expect(checkbox).toHaveFocus();
    await waitFor(() => expect(getComputedStyle(row).outlineStyle).toBe('dashed'));
    await user.keyboard(' ');
    await expect(args.onChange).toHaveBeenLastCalledWith(false);
  },
};

/** Interaction test: 24px box, 8px to the label, the label's first line centered on the box. */
export const Measurements: Story = {
  tags: ['test-only', '!autodocs'],
  play: async ({ canvas }) => {
    const row = canvas.getByRole('checkbox').closest('label')!;
    const box = row.querySelector('[aria-hidden]')!.getBoundingClientRect();
    const label = row.lastElementChild!.getBoundingClientRect();
    await expect([Math.round(box.width), Math.round(box.height)]).toEqual([24, 24]);
    await expect(Math.round(label.left - box.right)).toBe(8);
    await expect(Math.round(label.top)).toBe(Math.round(box.top));
  },
};

/** Interaction test: isRequired shows its message on submit, 4px below; the box doesn't turn red. */
export const Validation: Story = {
  tags: ['test-only', '!autodocs'],
  args: { children: 'I agree to the terms' },
  render: (args) => (
    <Form style={{ display: 'grid', gap: 16, maxWidth: 340 }} onSubmit={(e) => e.preventDefault()}>
      <Checkbox {...args} isRequired errorMessage="Agree to the terms to continue." />
      <Button type="submit">Create account</Button>
    </Form>
  ),
  play: async ({ canvas }) => {
    const checkbox = canvas.getByRole('checkbox', { name: 'I agree to the terms' });
    const box = checkbox.closest('label')!.querySelector('[aria-hidden]')!;
    const borderBefore = getComputedStyle(box).borderColor;
    await userEvent.click(canvas.getByRole('button', { name: 'Create account' }));
    const error = await canvas.findByText('Agree to the terms to continue.');
    await expect(checkbox).toHaveAccessibleDescription(/Agree to the terms to continue\./);
    await expect(Math.round(error.getBoundingClientRect().top - checkbox.closest('label')!.getBoundingClientRect().bottom)).toBe(4);
    await expect(getComputedStyle(box).borderColor).toBe(borderBefore);
  },
};

/** The Figma states, plus indeterminate and a long label. */
export const States: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 24, maxWidth: 340 }}>
      <Checkbox {...args}>please send me lots and lots and lots of emails</Checkbox>
      <Checkbox {...args} defaultSelected>
        please send me lots and lots and lots of emails
      </Checkbox>
      <Checkbox {...args} isIndeterminate>
        Some of them (indeterminate)
      </Checkbox>
      <Checkbox {...args} isInvalid errorMessage="helpful error message :-)">
        please send me lots and lots and lots of emails
      </Checkbox>
      <Checkbox {...args} isDisabled>
        please send me lots and lots and lots of emails
      </Checkbox>
      <Checkbox {...args} isDisabled defaultSelected>
        please send me lots and lots and lots of emails
      </Checkbox>
    </div>
  ),
};

/** "Select all": indeterminate while only some are ticked. */
export const SelectAll: Story = {
  render: function Render() {
    const all = ['Comments', 'Mentions', 'Weekly summary'];
    const [chosen, setChosen] = useState<string[]>(['Mentions']);
    const toggle = (name: string, on: boolean) => setChosen((c) => (on ? [...c, name] : c.filter((x) => x !== name)));
    return (
      <div style={{ display: 'grid', gap: 16 }}>
        <Checkbox
          isSelected={chosen.length === all.length}
          isIndeterminate={chosen.length > 0 && chosen.length < all.length}
          onChange={(on) => setChosen(on ? all : [])}
        >
          All notifications
        </Checkbox>
        <div style={{ display: 'grid', gap: 16, paddingInlineStart: 32 }}>
          {all.map((name) => (
            <Checkbox key={name} isSelected={chosen.includes(name)} onChange={(on) => toggle(name, on)}>
              {name}
            </Checkbox>
          ))}
        </div>
      </div>
    );
  },
  play: async ({ canvas }) => {
    const all = canvas.getByRole('checkbox', { name: 'All notifications' });
    const box = all.closest('label')!;
    const offset = (name: string) => getComputedStyle(box.querySelector(`svg[data-themis-icon="${name}"] path`)!).strokeDashoffset;
    // Some ticked: the dash shows, the check doesn't.
    await expect(offset('minus')).toBe('0px');
    await expect(offset('check')).toBe('1px');
    // Untick the last one: the dash draws out, and the check never appears on the way.
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Mentions' }));
    await expect(offset('check')).toBe('1px');
    await waitFor(() => expect(offset('minus')).toBe('1px'));
    // Tick them all: the check draws in and the dash stays hidden.
    await userEvent.click(all);
    await waitFor(() => expect(offset('check')).toBe('0px'));
    await expect(offset('minus')).toBe('1px');
  },
};

/** Next to a RadioGroup: the same label style, spacing and states. */
export const WithRadios: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 24 }}>
      <RadioGroup label="Delivery" defaultValue="standard">
        <Radio value="standard">Standard (3–5 days)</Radio>
        <Radio value="express">Express (next day)</Radio>
      </RadioGroup>
      <Checkbox defaultSelected>Leave it with a neighbor if I'm out</Checkbox>
    </div>
  ),
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
            <Checkbox {...args}>{theme}</Checkbox>
            <Checkbox {...args} defaultSelected>
              Ticked
            </Checkbox>
            <Checkbox {...args} isIndeterminate>
              Indeterminate
            </Checkbox>
            <Checkbox {...args} isDisabled defaultSelected>
              Disabled
            </Checkbox>
          </div>
        </ThemeProvider>
      ))}
    </div>
  ),
};
