import * as stylex from '@stylexjs/stylex';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { expect, fn, userEvent } from 'storybook/test';

import { ThemeProvider } from '../../theme/ThemeProvider';
import { color } from '../../tokens/colorTheme.stylex';
import { collectionModes } from '../../tokens/themes';
import { Button } from '../Button';
import type { ButtonTone } from '../Button';
import { IconButton, type IconButtonProps, type IconButtonSize, type IconButtonVariant } from './IconButton';
import { Icon } from '../Icon';
import docs from './IconButton.docs';

const VARIANTS: IconButtonVariant[] = ['default', 'outline', 'subtle'];
const SIZES: IconButtonSize[] = ['micro', 'small', 'medium'];
const TONES: ButtonTone[] = ['brand', 'neutral', 'danger', 'warning', 'success'];

/** Story args typed as a standard tone, so stories can override `variant` freely. */
const std = (args: IconButtonProps) => args as Exclude<IconButtonProps, { tone: 'neutral-inverse' }>;

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
    children: <Icon name="heart" />,
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
  render: (args) => row(VARIANTS.map((v) => <IconButton key={v} {...std(args)} variant={v} aria-label={`Like (${v})`} />)),
};

/** 24, 32 and 40px squares. Micro uses the small radius. */
export const Sizes: Story = {
  render: (args) => row(SIZES.map((s) => <IconButton key={s} {...std(args)} size={s} aria-label={`Like (${s})`} />)),
};

/** Same tones as Button. Figma has danger, warning and success in subtle only; the other variants reuse Button's. */
export const Tones: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 12 }}>
      {TONES.map((tone) => (
        <div key={tone}>
          {row(VARIANTS.map((v) => <IconButton key={v} {...std(args)} tone={tone} variant={v} aria-label={`Like (${tone} ${v})`} />))}
        </div>
      ))}
    </div>
  ),
};

/**
 * Subtle icon buttons for other surfaces: `neutral` on the page background, `neutral-inverse` on brand or dark fills
 * (e.g. a Modal header). Both hover with a see-through tint, so the surface shows through.
 */
export const OnSurfaces: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        {SIZES.map((size) => (
          <IconButton key={size} {...std(args)} variant="subtle" tone="neutral" size={size} aria-label={`Close (neutral ${size})`} />
        ))}
        <IconButton {...std(args)} variant="subtle" tone="neutral" aria-label="Close (neutral disabled)" isDisabled />
      </div>
      <div {...stylex.props(demo.brandSurface)}>
        {SIZES.map((size) => (
          <IconButton key={size} {...args} variant="subtle" tone="neutral-inverse" size={size} aria-label={`Close (inverse ${size})`} />
        ))}
        <IconButton {...args} variant="subtle" tone="neutral-inverse" aria-label="Close (inverse disabled)" isDisabled />
      </div>
    </div>
  ),
  play: async ({ canvas }) => {
    const inverse = canvas.getByRole('button', { name: 'Close (inverse small)' });
    await userEvent.hover(inverse);
    // inverse-tint: text-inverse at 7%, see-through, so the brand fill behind it still shows.
    const layer = getComputedStyle(inverse.firstElementChild!, '::before');
    await expect(layer.backgroundColor).toMatch(/^rgba\(255, 255, 255, 0\.07\d*\)$/);
  },
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
                      <IconButton {...std(args)} size={size} variant={variant} aria-label={`Like (${theme} ${size} ${variant})`} />
                      <IconButton {...std(args)} size={size} variant={variant} aria-label={`Like (${theme} ${size} ${variant} disabled)`} isDisabled />
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
          <IconButton {...std(args)} size={size} variant="subtle" aria-label={`More options (${size})`} />
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
  render: (args) => row(VARIANTS.map((v) => <IconButton key={v} {...std(args)} variant={v} aria-label={`Like (${v})`} isDisabled />)),
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

const demo = stylex.create({
  brandSurface: { display: 'flex', gap: 8, padding: 8, backgroundColor: color.brand },
});
