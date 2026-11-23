import type { Meta, StoryObj } from '@storybook/react-vite';
import { type ReactNode, useState } from 'react';
import { expect, fn, userEvent } from 'storybook/test';

import { ThemeProvider } from '../../theme/ThemeProvider';
import { collectionModes } from '../../tokens/themes';
import { Button } from '../Button';
import { Switch, type SwitchSize } from './Switch';
import docs from './Switch.docs';

const SIZES: SwitchSize[] = ['micro', 'small', 'medium'];

const row = (children: ReactNode) => (
  <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>{children}</div>
);

const meta = {
  title: 'Selection/Switch',
  component: Switch,
  tags: ['autodocs'],
  parameters: {
    themis: docs,
    docs: { description: { component: docs.summary } },
  },
  args: {
    children: 'Email notifications',
    onChange: fn(),
  },
  argTypes: {
    size: { control: 'inline-radio', options: SIZES },
    labelPosition: { control: 'inline-radio', options: ['right', 'left'] },
    isSelected: { control: 'boolean' },
    description: { control: 'text' },
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default switch. Use the controls to explore every prop, and the toolbar to switch themes. */
export const Playground: Story = {};

/** Interaction test: clicking the switch or its label toggles it and calls `onChange`. */
export const TogglesOnClick: Story = {
  tags: ['test-only', '!autodocs'],
  play: async ({ args, canvas }) => {
    const control = canvas.getByRole('switch', { name: 'Email notifications' });
    await expect(control).not.toBeChecked();
    await userEvent.click(control);
    await expect(control).toBeChecked();
    await expect(args.onChange).toHaveBeenLastCalledWith(true);
    // The label text is part of the clickable area.
    await userEvent.click(canvas.getByText('Email notifications'));
    await expect(control).not.toBeChecked();
    await expect(args.onChange).toHaveBeenLastCalledWith(false);
    await expect(getComputedStyle(canvas.getByText('Email notifications').closest('label')!).cursor).toBe('pointer');
  },
};

/** Interaction test: Space toggles it from the keyboard, with the focus ring around the track. */
export const Keyboard: Story = {
  tags: ['test-only', '!autodocs'],
  play: async ({ canvas, canvasElement }) => {
    const user = userEvent.setup();
    const control = canvas.getByRole('switch');
    await user.tab();
    await expect(control).toHaveFocus();
    const track = canvasElement.querySelector('[data-themis-touch-target]')!;
    await expect(getComputedStyle(track).outlineStyle).toBe('dashed');
    await user.keyboard(' ');
    await expect(control).toBeChecked();
  },
};

/** Off: outlined track, brand thumb on the left, ×. On: filled track, white thumb on the right, ✓. */
export const OffAndOn: Story = {
  render: (args) =>
    row(
      <>
        <Switch {...args} isSelected={false}>
          Off
        </Switch>
        <Switch {...args} isSelected>
          On
        </Switch>
      </>,
    ),
};

/** 24, 32 and 40px tall, the same as Button. */
export const Sizes: Story = {
  render: (args) =>
    row(
      SIZES.map((size) => (
        <Switch key={size} {...args} size={size} defaultSelected>
          {`Wi-Fi (${size})`}
        </Switch>
      )),
    ),
};

/** Helper text under the label, read out by screen readers as the switch's description. */
export const WithDescription: Story = {
  args: { description: 'We\'ll only email you about your account.' },
  play: async ({ canvas }) => {
    const control = canvas.getByRole('switch', { name: 'Email notifications' });
    await expect(control).toHaveAccessibleDescription('We\'ll only email you about your account.');
  },
};

/** `labelPosition="left"` in a settings list. In a grid or a full-width block, the text grows so switches line up on the right. */
export const SettingsList: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 16, width: 360 }}>
      {[
        ['Email notifications', 'Account and security emails.'],
        ['Push notifications', 'Messages and reminders on this device.'],
        ['Weekly summary', undefined],
      ].map(([label, description]) => (
        <Switch key={label} {...args} labelPosition="left" description={description}>
          {label}
        </Switch>
      ))}
    </div>
  ),
};

/** Controlled: the parent owns the state through `isSelected` and `onChange`. */
export const Controlled: Story = {
  render: function Render(args) {
    const [on, setOn] = useState(true);
    return (
      <div style={{ display: 'grid', gap: 12, justifyItems: 'start' }}>
        <Switch
          {...args}
          isSelected={on}
          onChange={(v) => {
            setOn(v);
            args.onChange?.(v);
          }}
        >
          Dark mode
        </Switch>
        <span>Dark mode is {on ? 'on' : 'off'}.</span>
      </div>
    );
  },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('switch', { name: 'Dark mode' }));
    await expect(canvas.getByText('Dark mode is off.')).toBeInTheDocument();
  },
};

/** Disabled switches keep showing on or off, using the fixed system colors. */
export const Disabled: Story = {
  render: (args) =>
    row(
      <>
        <Switch {...args} isDisabled description="Managed by your organization.">
          Off
        </Switch>
        <Switch {...args} isDisabled defaultSelected description="Managed by your organization.">
          On
        </Switch>
      </>,
    ),
  play: async ({ args, canvas }) => {
    for (const control of canvas.getAllByRole('switch')) {
      const before = (control as HTMLInputElement).checked;
      await userEvent.click(control, { pointerEventsCheck: 0 });
      await expect((control as HTMLInputElement).checked).toBe(before);
    }
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};

/** The track is exactly as tall as a Button of the same size. */
export const NextToButton: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 12 }}>
      {SIZES.map((size) => (
        <div key={size} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Switch {...args} size={size} aria-label={`Auto-save (${size})`} children={undefined} />
          <Button size={size}>Save</Button>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement, canvas }) => {
    const tracks = canvasElement.querySelectorAll('label [data-themis-touch-target]');
    const buttons = canvas.getAllByRole('button', { name: 'Save' });
    for (let i = 0; i < SIZES.length; i++) {
      await expect(tracks[i]!.getBoundingClientRect().height).toBe(buttons[i]!.getBoundingClientRect().height);
    }
  },
};

/** Every size, on and off, enabled and disabled, mirroring the Figma "Switch" frame, in each color theme. */
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
                  [true, false].map((on) => (
                    <div key={String(on)} style={{ display: 'flex', gap: 24 }}>
                      <Switch {...args} size={size} isSelected={on}>
                        label
                      </Switch>
                      <Switch {...args} size={size} isSelected={on} isDisabled>
                        label
                      </Switch>
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
