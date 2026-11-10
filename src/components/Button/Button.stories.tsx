import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { expect, fn, userEvent, waitFor } from 'storybook/test';

import { HeartIcon } from '../../docs/demo-icons';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { collectionModes } from '../../tokens/themes';
import { Button, type ButtonSize, type ButtonTone, type ButtonVariant } from './Button';
import docs from './Button.docs';


const VARIANTS: ButtonVariant[] = ['default', 'outline', 'subtle'];
const SIZES: ButtonSize[] = ['micro', 'small', 'medium'];
const TONES: ButtonTone[] = ['brand', 'neutral', 'danger'];

const row = (children: ReactNode) => (
  <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>{children}</div>
);

/** The State Layer pseudo-element of a button's Surface. */
const surfaceOf = (button: HTMLElement) => button.querySelector<HTMLElement>('[data-themis-part="surface"]')!;
const layerStyle = (button: HTMLElement) => getComputedStyle(surfaceOf(button), '::before');

const meta = {
  title: 'Actions/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    themis: docs,
    docs: { description: { component: docs.summary } },
  },
  args: {
    children: 'Click me',
    onPress: fn(),
  },
  argTypes: {
    variant: { control: 'inline-radio', options: VARIANTS },
    size: { control: 'inline-radio', options: SIZES },
    tone: { control: 'inline-radio', options: TONES },
    iconLeft: { control: false },
    iconRight: { control: false },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default button. Use the controls to explore every prop, and the toolbar to switch themes. */
export const Playground: Story = {};

/** `default` for the main action, `outline` for secondary actions, `subtle` for low-priority ones. */
export const Variants: Story = {
  render: (args) => row(VARIANTS.map((v) => <Button key={v} {...args} variant={v}>{v[0]!.toUpperCase() + v.slice(1)}</Button>)),
};

/**
 * All sizes share one label size, so height follows the typography tokens:
 * 24/32/40px on mobile and 28/36/44px from 768px wide.
 */
export const Sizes: Story = {
  render: (args) => row(SIZES.map((s) => <Button key={s} {...args} size={s}>{s[0]!.toUpperCase() + s.slice(1)}</Button>)),
};

/**
 * `brand` for most actions, `neutral` where the brand colour would compete, `danger` only for destructive actions.
 * Danger outline and subtle buttons keep a black label with a red icon.
 */
export const Tones: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 12 }}>
      {TONES.map((tone) => (
        <div key={tone}>
          {row(VARIANTS.map((v) => (
            <Button key={v} {...args} tone={tone} variant={v} iconLeft={<HeartIcon />}>
              {tone[0]!.toUpperCase() + tone.slice(1)} {v}
            </Button>
          )))}
        </div>
      ))}
    </div>
  ),
};

/** Icons are decorative and hidden from screen readers, so the label must make sense alone. */
export const WithIcons: Story = {
  render: (args) =>
    row(
      <>
        <Button {...args} iconLeft={<HeartIcon />}>Save</Button>
        <Button {...args} iconRight={<HeartIcon />}>Save</Button>
        <Button {...args} variant="outline" iconLeft={<HeartIcon />}>Save</Button>
        <Button {...args} variant="subtle" iconRight={<HeartIcon />}>Save</Button>
      </>,
    ),
  play: async ({ canvas }) => {
    const buttons = canvas.getAllByRole('button', { name: 'Save' });
    await expect(buttons).toHaveLength(4);
  },
};

/**
 * Every variant and size, mirroring the Figma "Button - Brand/Neutral/Danger" frames, in each colour theme.
 * Use the `tone` control to switch tone. Hover and focus come from interaction: hover a button or Tab to it.
 */
export const ThemeMatrix: Story = {
  tags: ['!autodocs'],
  parameters: { layout: 'fullscreen' },
  render: (args) => (
    <div style={{ display: 'grid', gap: 16 }}>
      {collectionModes.colorTheme.map((theme) => (
        <ThemeProvider key={theme} modes={{ colorTheme: theme }}>
          <div style={{ padding: 16, display: 'grid', gap: 12 }}>
            <strong>{theme}</strong>
            {SIZES.map((size) =>
              VARIANTS.map((variant) => (
                <div key={`${size}-${variant}`}>
                  {row(
                    <>
                      <Button {...args} size={size} variant={variant}>Click me</Button>
                      <Button {...args} size={size} variant={variant} iconRight={<HeartIcon />}>Click me</Button>
                      <Button {...args} size={size} variant={variant} iconLeft={<HeartIcon />}>Click me</Button>
                      <Button {...args} size={size} variant={variant} isDisabled>Click me</Button>
                    </>,
                  )}
                </div>
              )),
            )}
          </div>
        </ThemeProvider>
      ))}
    </div>
  ),
};

/** Disabled buttons can't be focused or pressed, and use the fixed system colours in every theme. */
export const Disabled: Story = {
  render: (args) => row(VARIANTS.map((v) => <Button key={v} {...args} variant={v} isDisabled>Click me</Button>)),
  play: async ({ args, canvas }) => {
    for (const button of canvas.getAllByRole('button')) {
      await expect(getComputedStyle(button).cursor).toBe('not-allowed');
      await userEvent.click(button);
    }
    await expect(args.onPress).not.toHaveBeenCalled();
  },
};

/** While pending, the button stays focusable, blocks presses and announces progress. Not designed in Figma yet. */
export const Pending: Story = {
  args: { isPending: true },
  play: async ({ args, canvas }) => {
    await expect(canvas.getByRole('progressbar', { name: 'Loading' })).toBeInTheDocument();
    await expect(getComputedStyle(canvas.getByRole('button')).cursor).toBe('progress');
    await userEvent.click(canvas.getByRole('button'));
    await expect(args.onPress).not.toHaveBeenCalled();
  },
};

/** Pairing: one default action with an outline cancel. */
export const DefaultWithCancel: Story = {
  render: (args) => row(
    <>
      <Button {...args} variant="outline">Cancel</Button>
      <Button {...args}>Save changes</Button>
    </>,
  ),
};

/**
 * Interaction test: the State Layer's direction is calculated from the brand colour.
 * light demo has a dark brand (lightening overlay); dark demo a light brand (darkening overlay).
 */
export const StateLayerDirection: Story = {
  tags: ['test-only', '!autodocs'],
  render: (args) => (
    <div style={{ display: 'grid', gap: 16 }}>
      {TONES.map((tone) => (
        <div key={tone} style={{ display: 'flex', gap: 16 }}>
          <ThemeProvider modes={{ colorTheme: 'light demo' }}>
            <Button {...args} tone={tone}>{tone === 'brand' ? 'Light theme' : `Light ${tone}`}</Button>
          </ThemeProvider>
          <ThemeProvider modes={{ colorTheme: 'dark demo' }}>
            <Button {...args} tone={tone}>{tone === 'brand' ? 'Dark theme' : `Dark ${tone}`}</Button>
          </ThemeProvider>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvas }) => {
    const light = canvas.getByRole('button', { name: 'Light theme' });
    const dark = canvas.getByRole('button', { name: 'Dark theme' });
    await expect(layerStyle(light).opacity).toBe('0');
    await userEvent.hover(light);
    await waitFor(() => expect(layerStyle(light).opacity).toBe('1'));
    // Lightness channel of the overlay: 1 = white overlay, 0 = black overlay.
    const overlayLightness = (el: HTMLElement) => /oklch\(\s*([\d.]+)/.exec(layerStyle(el).backgroundImage)?.[1];
    await expect(overlayLightness(light)).toBe('1');
    await expect(overlayLightness(dark)).toBe('0');
    // Neutral: black fill in light demo (lighten), white in dark demo (darken).
    await expect(overlayLightness(canvas.getByRole('button', { name: 'Light neutral' }))).toBe('1');
    await expect(overlayLightness(canvas.getByRole('button', { name: 'Dark neutral' }))).toBe('0');
    // Danger: dark red in light demo (lighten), light pink in dark demo (darken).
    await expect(overlayLightness(canvas.getByRole('button', { name: 'Light danger' }))).toBe('1');
    await expect(overlayLightness(canvas.getByRole('button', { name: 'Dark danger' }))).toBe('0');
  },
};

/**
 * Interaction test: danger outline/subtle icons use the error colour while the label stays `text`,
 * and fall back to the disabled colour (same as the label) when disabled.
 */
export const DangerIconColour: Story = {
  tags: ['test-only', '!autodocs'],
  render: (args) => row(
    <>
      <Button {...args} tone="danger" variant="outline" iconLeft={<HeartIcon />}>Delete</Button>
      <Button {...args} tone="danger" variant="outline" iconLeft={<HeartIcon />} isDisabled>Delete disabled</Button>
    </>,
  ),
  play: async ({ canvas }) => {
    const colours = (name: string) => {
      const [icon, label] = surfaceOf(canvas.getByRole('button', { name })).children as unknown as HTMLElement[];
      return { icon: getComputedStyle(icon!).color, label: getComputedStyle(label!).color };
    };
    const enabled = colours('Delete');
    await expect(enabled.icon).not.toBe(enabled.label);
    const disabled = colours('Delete disabled');
    await expect(disabled.icon).toBe(disabled.label);
  },
};

/** Interaction test: keyboard presses shrink the Surface but never the clickable area, and activate the button. */
export const KeyboardPress: Story = {
  tags: ['test-only', '!autodocs'],
  play: async ({ args, canvas }) => {
    const button = canvas.getByRole('button');
    await expect(getComputedStyle(button).cursor).toBe('pointer');
    const before = button.getBoundingClientRect();
    // One user-event instance, so the key held in one call is released in the next.
    const user = userEvent.setup();
    await user.tab();
    await expect(button).toHaveFocus();
    await user.keyboard('[Space>]');
    await waitFor(() => expect(getComputedStyle(surfaceOf(button)).transform).toMatch(/^matrix\(0\.96/));
    await expect(button.getBoundingClientRect().width).toBe(before.width);
    await user.keyboard('[/Space]');
    await expect(args.onPress).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(getComputedStyle(surfaceOf(button)).transform).toBe('none'));
  },
};

/** Interaction test: the focus ring is a dashed outline outside the button and doesn't change its size. */
export const FocusRing: Story = {
  tags: ['test-only', '!autodocs'],
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button');
    const before = button.getBoundingClientRect();
    await expect(getComputedStyle(button).outlineStyle).toBe('none');
    await userEvent.tab();
    await expect(getComputedStyle(button).outlineStyle).toBe('dashed');
    // The white backing ring must paint under the black dashes, or it hides them.
    await expect(getComputedStyle(button, '::before').zIndex).toBe('-1');
    const after = button.getBoundingClientRect();
    await expect([after.width, after.height]).toEqual([before.width, before.height]);
  },
};
