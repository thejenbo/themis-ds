import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { expect, fn, userEvent } from 'storybook/test';

import { HeartIcon } from '../../docs/demo-icons';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { collectionModes } from '../../tokens/themes';
import { Button } from '../Button';
import { IconButton, type IconButtonSize, type IconButtonTone, type IconButtonVariant } from './IconButton';
import docs from './IconButton.docs';

const VARIANTS: IconButtonVariant[] = ['default', 'outline', 'subtle'];
const SIZES: IconButtonSize[] = ['micro', 'small', 'medium'];
const TONES: IconButtonTone[] = ['brand', 'neutral', 'danger'];

const row = (children: ReactNode) => (
  <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>{children}</div>
);

const meta = {
  title: 'Actions/IconButton',
  component: IconButton,
  tags: ['autodocs'],
  parameters: {
    themis: docs,
    docs: { description: { component: docs.summary } },
  },
  args: {
    'aria-label': 'Add to favourites',
    children: <HeartIcon />,
    onPress: fn(),
  },
  argTypes: {
    variant: { control: 'inline-radio', options: VARIANTS },
    size: { control: 'inline-radio', options: SIZES },
    tone: { control: 'inline-radio', options: TONES },
    children: { control: false },
  },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default icon button. Use the controls to explore every prop, and the toolbar to switch themes. */
export const Playground: Story = {};

/** Interaction test: the accessible name comes from `aria-label`, and pressing it fires `onPress`. */
export const AccessibleName: Story = {
  tags: ['test-only', '!autodocs'],
  play: async ({ args, canvas }) => {
    // The accessible name comes from aria-label; the icon itself is hidden from screen readers.
    const button = canvas.getByRole('button', { name: 'Add to favourites' });
    await userEvent.click(button);
    await expect(args.onPress).toHaveBeenCalledOnce();
    await expect(getComputedStyle(button).cursor).toBe('pointer');
  },
};

/** `default` for the main action, `outline` for secondary actions, `subtle` for toolbars and row actions. */
export const Variants: Story = {
  render: (args) => row(VARIANTS.map((v) => <IconButton key={v} {...args} variant={v} aria-label={`Like (${v})`} />)),
};

/** 24, 32 and 40px squares. Micro uses the small radius. */
export const Sizes: Story = {
  render: (args) => row(SIZES.map((s) => <IconButton key={s} {...args} size={s} aria-label={`Like (${s})`} />)),
};

/** Same tones as Button. Figma only has brand so far; neutral and danger reuse Button's tone colours. */
export const Tones: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 12 }}>
      {TONES.map((tone) => (
        <div key={tone}>
          {row(VARIANTS.map((v) => <IconButton key={v} {...args} tone={tone} variant={v} aria-label={`Like (${tone} ${v})`} />))}
        </div>
      ))}
    </div>
  ),
};

/** Every variant and size, mirroring the Figma "Icon Button" frame, in each colour theme. */
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
                  VARIANTS.map((variant) => (
                    <div key={variant} style={{ display: 'flex', gap: 8 }}>
                      <IconButton {...args} size={size} variant={variant} aria-label={`Like (${theme} ${size} ${variant})`} />
                      <IconButton {...args} size={size} variant={variant} aria-label={`Like (${theme} ${size} ${variant} disabled)`} isDisabled />
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

/** An IconButton is exactly as tall as a Button of the same size, so they line up in a row. */
export const NextToButton: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 12 }}>
      {SIZES.map((size) => (
        <div key={size} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Button size={size} variant="outline">Cancel</Button>
          <Button size={size}>Save</Button>
          <IconButton {...args} size={size} variant="subtle" aria-label={`More options (${size})`} />
        </div>
      ))}
    </div>
  ),
  play: async ({ canvas }) => {
    for (const size of SIZES) {
      const icon = canvas.getByRole('button', { name: `More options (${size})` }).getBoundingClientRect();
      await expect(icon.width).toBe(icon.height);
      const label = canvas.getAllByRole('button', { name: 'Save' })[SIZES.indexOf(size)]!.getBoundingClientRect();
      await expect(icon.height).toBe(label.height);
    }
  },
};

/** Disabled icon buttons can't be pressed and use the fixed system colours in every theme. */
export const Disabled: Story = {
  render: (args) => row(VARIANTS.map((v) => <IconButton key={v} {...args} variant={v} aria-label={`Like (${v})`} isDisabled />)),
  play: async ({ args, canvas }) => {
    for (const button of canvas.getAllByRole('button')) {
      await expect(getComputedStyle(button).cursor).toBe('not-allowed');
      await userEvent.click(button);
    }
    await expect(args.onPress).not.toHaveBeenCalled();
  },
};

/** While pending, the icon is replaced by a spinner and presses are ignored. Not designed in Figma yet. */
export const Pending: Story = {
  args: { isPending: true },
  play: async ({ args, canvas }) => {
    await expect(canvas.getByRole('progressbar', { name: 'Loading' })).toBeInTheDocument();
    // While pending, React Aria adds the progress label to the name, so screen readers announce both.
    await userEvent.click(canvas.getByRole('button', { name: 'Add to favourites Loading' }));
    await expect(args.onPress).not.toHaveBeenCalled();
  },
};

/** Interaction test: the focus ring around a micro icon button follows its smaller radius. */
export const MicroFocusRing: Story = {
  tags: ['test-only', '!autodocs'],
  args: { size: 'micro' },
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button');
    await userEvent.tab();
    await expect(getComputedStyle(button).outlineStyle).toBe('dashed');
    const ring = parseFloat(getComputedStyle(button, '::before').borderTopLeftRadius);
    const element = parseFloat(getComputedStyle(button).borderTopLeftRadius);
    // Ring radius = element radius + 2px offset + 2px ring width.
    await expect(ring).toBe(element + 4);
  },
};
