import type { Meta, StoryObj } from '@storybook/react-vite';
import { type ReactNode, useState } from 'react';
import type { Key } from 'react-aria-components';
import { expect, fn, userEvent } from 'storybook/test';

import { ThemeProvider } from '../../theme/ThemeProvider';
import { collectionModes } from '../../tokens/themes';
import { Button } from '../Button';
import { SegmentedControl, SegmentedControlItem, type SegmentedControlSize } from './SegmentedControl';
import docs from './SegmentedControl.docs';

const SIZES: SegmentedControlSize[] = ['micro', 'small', 'medium'];

const units = (
  <>
    <SegmentedControlItem id="cm">cm</SegmentedControlItem>
    <SegmentedControlItem id="in">in</SegmentedControlItem>
    <SegmentedControlItem id="px">px</SegmentedControlItem>
  </>
);

const column = (children: ReactNode) => <div style={{ display: 'grid', gap: 12, justifyItems: 'start' }}>{children}</div>;

const meta = {
  title: 'Selection/SegmentedControl',
  component: SegmentedControl,
  subcomponents: { SegmentedControlItem },
  tags: ['autodocs'],
  parameters: {
    themis: docs,
    docs: { description: { component: docs.summary } },
  },
  args: {
    'aria-label': 'Units',
    defaultSelectedKey: 'cm',
    children: units,
    onSelectionChange: fn(),
  },
  argTypes: {
    size: { control: 'inline-radio', options: SIZES },
    children: { control: false },
  },
} satisfies Meta<typeof SegmentedControl>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default control. Use the controls to explore every prop, and the toolbar to switch themes. */
export const Playground: Story = {};

/** Interaction test: it's a radio group; clicking an item selects it and calls `onSelectionChange`. */
export const SelectsOnClick: Story = {
  tags: ['test-only', '!autodocs'],
  play: async ({ args, canvas }) => {
    await expect(canvas.getByRole('radiogroup', { name: 'Units' })).toBeInTheDocument();
    const cm = canvas.getByRole('radio', { name: 'cm' });
    const inch = canvas.getByRole('radio', { name: 'in' });
    await expect(cm).toBeChecked();
    await userEvent.click(inch);
    await expect(inch).toBeChecked();
    await expect(cm).not.toBeChecked();
    await expect(args.onSelectionChange).toHaveBeenLastCalledWith('in');
    // Clicking the selected item again keeps it selected.
    await userEvent.click(inch);
    await expect(inch).toBeChecked();
    await expect(getComputedStyle(cm).cursor).toBe('pointer');
    await expect(getComputedStyle(inch).cursor).toBe('default');
    // Only the outer corners are rounded, even when the items are passed in a Fragment.
    await expect(getComputedStyle(cm).borderTopRightRadius).toBe('0px');
    await expect(getComputedStyle(inch).borderTopLeftRadius).toBe('0px');
    // Small: the control has md corners (10px) and the inset fill sm (6px), so the two curves run parallel.
    await expect(getComputedStyle(canvas.getByRole('radiogroup', { name: 'Units' })).borderTopLeftRadius).toBe('10px');
    await expect(getComputedStyle(cm).borderTopLeftRadius).toBe('10px');
    await expect(getComputedStyle(inch.querySelector('[data-themis-part="surface"]')!).borderTopLeftRadius).toBe('6px');
    // 8px from each item's edge to its label (Figma, since 2026-11-20).
    const label = inch.querySelector('[data-themis-part="surface"] > span')!.getBoundingClientRect();
    const item = inch.getBoundingClientRect();
    await expect(Math.round(label.left - item.left)).toBe(8);
    await expect(Math.round(item.right - label.right)).toBe(8);
  },
};

/** Interaction test: Tab lands on the selected item, arrow keys move, Space selects; the ring sits above neighbours. */
export const Keyboard: Story = {
  tags: ['test-only', '!autodocs'],
  play: async ({ canvas }) => {
    const user = userEvent.setup();
    await user.tab();
    const cm = canvas.getByRole('radio', { name: 'cm' });
    await expect(cm).toHaveFocus();
    await expect(getComputedStyle(cm).outlineStyle).toBe('dashed');
    await expect(getComputedStyle(cm).zIndex).toBe('2');
    await user.keyboard('{ArrowRight}');
    const inch = canvas.getByRole('radio', { name: 'in' });
    await expect(inch).toHaveFocus();
    await user.keyboard(' ');
    await expect(inch).toBeChecked();
  },
};

/** 24, 32 and 40px tall, the same as Button. */
export const Sizes: Story = {
  render: (args) => column(SIZES.map((size) => <SegmentedControl key={size} {...args} size={size} aria-label={`Units (${size})`} />)),
};

/** `isFullWidth` stretches the control and gives every item the same width. */
export const FullWidth: Story = {
  args: { isFullWidth: true, 'aria-label': 'View', defaultSelectedKey: 'week' },
  render: (args) => (
    <div style={{ width: 360 }}>
      <SegmentedControl {...args}>
        <SegmentedControlItem id="day">Day</SegmentedControlItem>
        <SegmentedControlItem id="week">Week</SegmentedControlItem>
        <SegmentedControlItem id="month">Month</SegmentedControlItem>
      </SegmentedControl>
    </div>
  ),
  play: async ({ canvas }) => {
    const widths = canvas.getAllByRole('radio').map((r) => Math.round(r.getBoundingClientRect().width));
    await expect(new Set(widths).size).toBe(1);
  },
};

/** The whole control, or a single item, can be disabled. */
export const Disabled: Story = {
  render: (args) =>
    column(
      <>
        <SegmentedControl {...args} isDisabled aria-label="Units (disabled)" />
        <SegmentedControl {...args} aria-label="Units (px unavailable)">
          <SegmentedControlItem id="cm">cm</SegmentedControlItem>
          <SegmentedControlItem id="in">in</SegmentedControlItem>
          <SegmentedControlItem id="px" isDisabled>
            px
          </SegmentedControlItem>
        </SegmentedControl>
      </>,
    ),
  play: async ({ canvas }) => {
    const group = canvas.getByRole('radiogroup', { name: 'Units (disabled)' });
    for (const radio of group.querySelectorAll('button')) await expect(getComputedStyle(radio).cursor).toBe('not-allowed');
    const px = canvas.getAllByRole('radio', { name: 'px' })[1]!;
    await userEvent.click(px, { pointerEventsCheck: 0 });
    await expect(px).not.toBeChecked();
  },
};

/** Controlled with `selectedKey` and `onSelectionChange`. */
export const Controlled: Story = {
  render: function Render(args) {
    const [unit, setUnit] = useState<Key>('in');
    return column(
      <>
        <SegmentedControl
          {...args}
          selectedKey={unit}
          onSelectionChange={(key) => {
            setUnit(key);
            args.onSelectionChange?.(key);
          }}
        />
        <span>Showing sizes in {String(unit)}.</span>
      </>,
    );
  },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('radio', { name: 'px' }));
    await expect(canvas.getByText('Showing sizes in px.')).toBeInTheDocument();
  },
};

/** The control is exactly as tall as a Button of the same size. */
export const NextToButton: Story = {
  render: (args) =>
    column(
      SIZES.map((size) => (
        <div key={size} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <SegmentedControl {...args} size={size} aria-label={`Units (${size})`} />
          <Button size={size}>Apply</Button>
        </div>
      )),
    ),
  play: async ({ canvas }) => {
    for (const size of SIZES) {
      const control = canvas.getByRole('radiogroup', { name: `Units (${size})` }).getBoundingClientRect();
      const button = canvas.getAllByRole('button', { name: 'Apply' })[SIZES.indexOf(size)]!.getBoundingClientRect();
      await expect(control.height).toBe(button.height);
    }
  },
};

/** Every size, enabled and disabled, mirroring the Figma "Segmented Control" frame, in each colour theme. */
export const ThemeMatrix: Story = {
  tags: ['!autodocs'],
  parameters: { layout: 'fullscreen' },
  render: (args) => (
    <div style={{ display: 'grid', gap: 16 }}>
      {collectionModes.colorTheme.map((theme) => (
        <ThemeProvider key={theme} modes={{ colorTheme: theme }}>
          <div style={{ padding: 16, display: 'grid', gap: 12 }}>
            <strong>{theme}</strong>
            {SIZES.map((size) => (
              <div key={size} style={{ display: 'flex', gap: 16 }}>
                <SegmentedControl {...args} size={size} aria-label={`${theme} ${size}`}>
                  <SegmentedControlItem id="one">one</SegmentedControlItem>
                  <SegmentedControlItem id="two">two</SegmentedControlItem>
                  <SegmentedControlItem id="three">three</SegmentedControlItem>
                </SegmentedControl>
                <SegmentedControl {...args} size={size} isDisabled defaultSelectedKey="one" aria-label={`${theme} ${size} disabled`}>
                  <SegmentedControlItem id="one">one</SegmentedControlItem>
                  <SegmentedControlItem id="two">two</SegmentedControlItem>
                  <SegmentedControlItem id="three">three</SegmentedControlItem>
                </SegmentedControl>
              </div>
            ))}
          </div>
        </ThemeProvider>
      ))}
    </div>
  ),
  args: { defaultSelectedKey: 'one' },
};
