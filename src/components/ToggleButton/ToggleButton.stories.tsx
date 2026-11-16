import type { Meta, StoryObj } from '@storybook/react-vite';
import { type ReactNode, useState } from 'react';
import { expect, fn, userEvent } from 'storybook/test';

import { ThemeProvider } from '../../theme/ThemeProvider';
import { collectionModes } from '../../tokens/themes';
import { Button } from '../Button';
import { ToggleButton, type ToggleButtonSize } from './ToggleButton';
import { Icon } from '../Icon';
import docs from './ToggleButton.docs';

const SIZES: ToggleButtonSize[] = ['micro', 'small', 'medium'];

const row = (children: ReactNode) => (
  <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>{children}</div>
);

const meta = {
  title: 'Actions/ToggleButton',
  component: ToggleButton,
  tags: ['autodocs'],
  parameters: {
    themis: docs,
    docs: { description: { component: docs.summary } },
  },
  args: {
    children: 'In stock only',
    onChange: fn(),
  },
  argTypes: {
    size: { control: 'inline-radio', options: SIZES },
    isSelected: { control: 'boolean' },
    iconLeft: { control: false },
    iconRight: { control: false },
  },
} satisfies Meta<typeof ToggleButton>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default toggle button. Use the controls to explore every prop, and the toolbar to switch themes. */
export const Playground: Story = {};

/** Interaction test: pressing flips `aria-pressed` and calls `onChange`; the label stays the same. */
export const TogglesOnPress: Story = {
  tags: ['test-only', '!autodocs'],
  play: async ({ args, canvas }) => {
    const button = canvas.getByRole('button', { name: 'In stock only' });
    await expect(button).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(button);
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    await expect(args.onChange).toHaveBeenLastCalledWith(true);
    await userEvent.click(button);
    await expect(button).toHaveAttribute('aria-pressed', 'false');
    await expect(args.onChange).toHaveBeenLastCalledWith(false);
    await expect(getComputedStyle(button).cursor).toBe('pointer');
  },
};

/** Interaction test: Space and Enter toggle it from the keyboard, with the focus ring showing. */
export const Keyboard: Story = {
  tags: ['test-only', '!autodocs'],
  play: async ({ canvas }) => {
    const user = userEvent.setup();
    const button = canvas.getByRole('button', { name: 'In stock only' });
    await user.tab();
    await expect(getComputedStyle(button).outlineStyle).toBe('dashed');
    await user.keyboard(' ');
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    await user.keyboard('{Enter}');
    await expect(button).toHaveAttribute('aria-pressed', 'false');
  },
};

/** Off is outlined, on is filled. The label doesn't change; the look and `aria-pressed` do. */
export const OffAndOn: Story = {
  render: (args) =>
    row(
      <>
        <ToggleButton {...args} isSelected={false}>
          Off
        </ToggleButton>
        <ToggleButton {...args} isSelected>
          On
        </ToggleButton>
      </>,
    ),
};

/** 24, 32 and 40px tall, the same as Button. */
export const Sizes: Story = {
  render: (args) =>
    row(
      SIZES.map((size) => (
        <ToggleButton key={size} {...args} size={size} defaultSelected={size === 'small'}>
          {`Bold (${size})`}
        </ToggleButton>
      )),
    ),
};

/** Optional icons before or after the label. Decorative: the label alone must make sense. */
export const WithIcons: Story = {
  render: (args) =>
    row(
      <>
        <ToggleButton {...args} iconLeft={<Icon name="check" />}>
          Icon left
        </ToggleButton>
        <ToggleButton {...args} iconRight={<Icon name="check" />} defaultSelected>
          Icon right
        </ToggleButton>
      </>,
    ),
};

/** Controlled: the parent owns the state through `isSelected` and `onChange`. */
export const Controlled: Story = {
  render: function Render(args) {
    const [on, setOn] = useState(false);
    return (
      <div style={{ display: 'grid', gap: 12, justifyItems: 'start' }}>
        <ToggleButton
          {...args}
          isSelected={on}
          onChange={(v) => {
            setOn(v);
            args.onChange?.(v);
          }}
        />
        <span>Showing {on ? 'in-stock items only' : 'all items'}.</span>
      </div>
    );
  },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'In stock only' }));
    await expect(canvas.getByText('Showing in-stock items only.')).toBeInTheDocument();
  },
};

/** Disabled toggles keep showing whether they are on or off, using the fixed system colours. */
export const Disabled: Story = {
  render: (args) =>
    row(
      <>
        <ToggleButton {...args} isDisabled>
          Off
        </ToggleButton>
        <ToggleButton {...args} isDisabled defaultSelected>
          On
        </ToggleButton>
      </>,
    ),
  play: async ({ args, canvas }) => {
    for (const button of canvas.getAllByRole('button')) {
      await expect(getComputedStyle(button).cursor).toBe('not-allowed');
      const before = button.getAttribute('aria-pressed');
      await userEvent.click(button);
      await expect(button).toHaveAttribute('aria-pressed', before);
    }
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};

/** A ToggleButton is exactly as tall as a Button of the same size, so they line up in a row. */
export const NextToButton: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 12 }}>
      {SIZES.map((size) => (
        <div key={size} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <ToggleButton {...args} size={size}>{`Filter (${size})`}</ToggleButton>
          <Button size={size}>Apply</Button>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvas }) => {
    for (const size of SIZES) {
      const toggle = canvas.getByRole('button', { name: `Filter (${size})` }).getBoundingClientRect();
      const button = canvas.getAllByRole('button', { name: 'Apply' })[SIZES.indexOf(size)]!.getBoundingClientRect();
      await expect(toggle.height).toBe(button.height);
    }
  },
};

/** Every size, on and off, enabled and disabled, mirroring the Figma "Toggle Button" frame, in each colour theme. */
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
              <div key={size}>
                {row(
                  [false, true].map((on) => (
                    <div key={String(on)} style={{ display: 'flex', gap: 8 }}>
                      <ToggleButton {...args} size={size} isSelected={on}>
                        Toggle me
                      </ToggleButton>
                      <ToggleButton {...args} size={size} isSelected={on} isDisabled>
                        Toggle me
                      </ToggleButton>
                    </div>
                  )),
                )}
              </div>
            ))}
          </div>
        </ThemeProvider>
      ))}
    </div>
  ),
};
