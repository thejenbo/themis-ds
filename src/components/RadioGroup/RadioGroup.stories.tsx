import type { Meta, StoryObj } from '@storybook/react-vite';
import { Form } from 'react-aria-components';
import { expect, fn, userEvent, waitFor } from 'storybook/test';

import { ThemeProvider } from '../../theme/ThemeProvider';
import { collectionModes } from '../../tokens/themes';
import { Button } from '../Button';
import { Radio, RadioGroup } from './RadioGroup';
import docs from './RadioGroup.docs';

const delivery = [
  <Radio key="standard" value="standard">Standard (3–5 days)</Radio>,
  <Radio key="express" value="express">Express (next day)</Radio>,
  <Radio key="pickup" value="pickup">Pick up in store</Radio>,
];

const meta = {
  title: 'Inputs/RadioGroup',
  component: RadioGroup,
  subcomponents: { Radio },
  tags: ['autodocs'],
  parameters: { themis: docs, docs: { description: { component: docs.summary } } },
  args: { label: 'Delivery', children: delivery, onChange: fn() },
  argTypes: { children: { control: false } },
  render: (args) => <RadioGroup {...args} />,
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Click an option or its label, or Tab in and use the arrow keys. */
export const Playground: Story = { args: { defaultValue: 'standard', description: 'Free over €50.' } };

/** Interaction test: clicking a label chooses; one Tab stop; arrows move and choose; ring around the row. */
export const Keyboard: Story = {
  tags: ['test-only', '!autodocs'],
  play: async ({ args, canvas }) => {
    await expect(canvas.getByRole('radiogroup', { name: 'Delivery' })).toBeInTheDocument();
    await userEvent.click(canvas.getByText('Express (next day)'));
    await expect(args.onChange).toHaveBeenLastCalledWith('express');
    await expect(canvas.getByRole('radio', { name: 'Express (next day)' })).toBeChecked();
    // Back out, then Tab in: focus lands on the chosen option, and the ring wraps the whole row.
    await userEvent.click(document.body);
    const user = userEvent.setup();
    await user.tab();
    const express = canvas.getByRole('radio', { name: 'Express (next day)' });
    await expect(express).toHaveFocus();
    const row = express.closest('label')!;
    await waitFor(() => expect(getComputedStyle(row).outlineStyle).toBe('dashed'));
    await user.keyboard('{ArrowDown}');
    await expect(args.onChange).toHaveBeenLastCalledWith('pickup');
    await expect(canvas.getByRole('radio', { name: 'Pick up in store' })).toHaveFocus();
  },
};

/** Interaction test: Figma sizes: 28px circle, 12px dot, 8px to the label, 16px between rows. */
export const Measurements: Story = {
  tags: ['test-only', '!autodocs'],
  args: { defaultValue: 'standard' },
  play: async ({ canvas }) => {
    const rows = canvas.getAllByRole('radio').map((r) => r.closest('label')!);
    const first = rows[0]!;
    const second = rows[1]!;
    const circle = first.querySelector('[aria-hidden]')!;
    const c = circle.getBoundingClientRect();
    await expect([Math.round(c.width), Math.round(c.height)]).toEqual([28, 28]);
    await waitFor(() => expect(getComputedStyle(circle, '::after').transform).toBe('matrix(1, 0, 0, 1, 0, 0)'));
    await expect(getComputedStyle(circle, '::after').width).toBe('12px');
    const label = first.lastElementChild!.getBoundingClientRect();
    await expect(Math.round(label.left - c.right)).toBe(8);
    await expect(Math.round(second.getBoundingClientRect().top - first.getBoundingClientRect().bottom)).toBe(16);
    // The unchosen options have no dot showing.
    await expect(getComputedStyle(second.querySelector('[aria-hidden]')!, '::after').transform).toBe('matrix(0, 0, 0, 0, 0, 0)');
  },
};

/** Interaction test: isRequired shows its message on submit. */
export const Validation: Story = {
  tags: ['test-only', '!autodocs'],
  render: (args) => (
    <Form style={{ display: 'grid', gap: 16 }} onSubmit={(e) => e.preventDefault()}>
      <RadioGroup {...args} isRequired errorMessage="Choose how you'd like it delivered." />
      <Button type="submit">Continue</Button>
    </Form>
  ),
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Continue' }));
    await waitFor(() => expect(canvas.getByText("Choose how you'd like it delivered.")).toBeInTheDocument());
  },
};

/** The Figma states, stacked and side by side: default, with help text, invalid, disabled. */
export const States: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(18rem, 1fr))', gap: 32 }}>
      {(['vertical', 'horizontal'] as const).map((orientation) => (
        <div key={orientation} style={{ display: 'grid', gap: 24, alignContent: 'start' }}>
          <RadioGroup {...args} orientation={orientation} label="label" defaultValue="b">
            <Radio value="a">choose me!</Radio>
            <Radio value="b">no, choose me!</Radio>
          </RadioGroup>
          <RadioGroup {...args} orientation={orientation} label="label" defaultValue="b" description="here's some helpful context!">
            <Radio value="a">choose me!</Radio>
            <Radio value="b">no, choose me!</Radio>
          </RadioGroup>
          <RadioGroup {...args} orientation={orientation} label="label" defaultValue="b" isInvalid description="here's some helpful context!" errorMessage="a helpful error message :-)">
            <Radio value="a">choose me!</Radio>
            <Radio value="b">no, choose me!</Radio>
          </RadioGroup>
          <RadioGroup {...args} orientation={orientation} label="label" defaultValue="b" isDisabled description="here's some helpful context!">
            <Radio value="a">choose me!</Radio>
            <Radio value="b">no, choose me!</Radio>
          </RadioGroup>
        </div>
      ))}
    </div>
  ),
};

/** One option disabled; long labels wrap under themselves, with the circle on the first line. */
export const LongLabels: Story = {
  render: (args) => (
    <div style={{ maxWidth: 280 }}>
      <RadioGroup {...args} label="Plan" defaultValue="team">
        <Radio value="solo">Solo: one person, unlimited projects, community support</Radio>
        <Radio value="team">Team: up to 20 people, shared libraries and priority support</Radio>
        <Radio value="enterprise" isDisabled>
          Enterprise: contact sales
        </Radio>
      </RadioGroup>
    </div>
  ),
};

/** Without a visible label (Figma "Radio Button Group"), when the question is shown elsewhere. */
export const WithoutVisibleLabel: Story = {
  args: { label: undefined, 'aria-label': 'Delivery', orientation: 'horizontal', defaultValue: 'standard' },
};

/** Each colour theme. */
export const ThemeMatrix: Story = {
  tags: ['!autodocs'],
  parameters: { layout: 'fullscreen' },
  render: (args) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
      {collectionModes.colorTheme.map((theme) => (
        <ThemeProvider key={theme} modes={{ colorTheme: theme }}>
          <div style={{ padding: 24, display: 'grid', gap: 24 }}>
            <RadioGroup {...args} label={theme} defaultValue="express" />
            <RadioGroup {...args} label="Disabled" defaultValue="express" isDisabled />
          </div>
        </ThemeProvider>
      ))}
    </div>
  ),
};
