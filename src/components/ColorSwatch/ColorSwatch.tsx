import * as stylex from '@stylexjs/stylex';
import {
  type Color,
  ColorSwatch as AriaColorSwatch,
  type ColorSwatchProps as AriaColorSwatchProps,
  type ColorSwatchRenderProps,
} from 'react-aria-components';

import { border as borderWidth } from '../../tokens/borderWidth.stylex';
import { color } from '../../tokens/colorTheme.stylex';
import { border as radius } from '../../tokens/radius.stylex';
import { colorFill } from '../../utils/color';

export interface ColorSwatchProps extends Omit<AriaColorSwatchProps, 'className' | 'style' | 'color'> {
  /** The color to show, as a CSS color string (`'#7A1FEB'`, `'hsl(270 85% 52%)'`) or a parsed `Color`. */
  color?: string | Color;
  /**
   * A name for the color, read by screen readers instead of the generated description ("vibrant purple"). Use it
   * when the color has a meaningful name, e.g. a brand or palette name.
   */
  colorName?: string;
  /**
   * The swatch's size: 24px, 32px or 40px.
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * `outline` adds a border in color/border, so light colors stay visible on a light background (and dark on dark).
   * `empty` is a placeholder for a slot with no color yet (a dashed outline, hidden from screen readers), e.g. the
   * unused slots in ColorPicker's recent colors; it ignores `color`.
   * @default 'solid'
   */
  variant?: 'solid' | 'outline' | 'empty';
  /** Layout-only StyleX overrides (margin, flex, grid placement). Do not restyle colors or size. */
  xstyle?: stylex.StyleXStyles;
}

/**
 * Shows a color as a small square, e.g. next to a color's name or value. Built on React Aria `ColorSwatch`: it's an
 * image (role="img") whose accessible name describes the color ("dark vibrant blue"), or `colorName` when given.
 * See-through colors show a checkerboard behind them. It isn't interactive by itself.
 */
export function ColorSwatch({ size = 'medium', variant = 'solid', xstyle, ...props }: ColorSwatchProps) {
  if (variant === 'empty') return <span aria-hidden="true" {...stylex.props(styles.swatch, sizes[size], styles.empty, xstyle)} />;
  return (
    <AriaColorSwatch
      {...props}
      className={() =>
        stylex.props(styles.swatch, sizes[size], variant === 'outline' && styles.outline, xstyle).className ?? ''
      }
      // The color is a runtime value, so it's an inline background (over a checkerboard when see-through).
      style={({ color: c }: ColorSwatchRenderProps) => ({ background: colorFill(c) })}
    />
  );
}

const styles = stylex.create({
  swatch: {
    flexShrink: 0,
    boxSizing: 'border-box',
    borderRadius: radius.radiusMd,
    forcedColorAdjust: 'none',
  },
  outline: {
    borderStyle: 'solid',
    borderWidth: borderWidth.widthSm,
    borderColor: color.border,
  },
  // Figma variant=empty: a dashed border/width/mandatory outline, so the slot still shows with border width none.
  empty: {
    display: 'inline-block',
    borderStyle: 'dashed',
    borderWidth: borderWidth.widthMandatory,
    borderColor: color.border,
  },
});

// Figma: large 40px, medium 32px, small 24px.
const sizes = stylex.create({
  small: { width: '24px', height: '24px' },
  medium: { width: '32px', height: '32px' },
  large: { width: '40px', height: '40px' },
});
