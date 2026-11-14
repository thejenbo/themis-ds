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
  /** The colour to show, as a CSS colour string (`'#7A1FEB'`, `'hsl(270 85% 52%)'`) or a parsed `Color`. */
  color?: string | Color;
  /**
   * A name for the colour, read by screen readers instead of the generated description ("vibrant purple"). Use it
   * when the colour has a meaningful name, e.g. a brand or palette name.
   */
  colorName?: string;
  /**
   * The swatch's size: 24px, 32px or 40px.
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * `outline` adds a border in color/border, so light colours stay visible on a light background (and dark on dark).
   * @default 'solid'
   */
  variant?: 'solid' | 'outline';
  /** Layout-only StyleX overrides (margin, flex, grid placement). Do not restyle colours or size. */
  xstyle?: stylex.StyleXStyles;
}

/**
 * Shows a colour as a small square, e.g. next to a colour's name or value. Built on React Aria `ColorSwatch`: it's an
 * image (role="img") whose accessible name describes the colour ("dark vibrant blue"), or `colorName` when given.
 * See-through colours show a checkerboard behind them. It isn't interactive by itself.
 */
export function ColorSwatch({ size = 'medium', variant = 'solid', xstyle, ...props }: ColorSwatchProps) {
  return (
    <AriaColorSwatch
      {...props}
      className={() =>
        stylex.props(styles.swatch, sizes[size], variant === 'outline' && styles.outline, xstyle).className ?? ''
      }
      // The colour is a runtime value, so it's an inline background (over a checkerboard when see-through).
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
});

// Figma: large 40px, medium 32px, small 24px.
const sizes = stylex.create({
  small: { width: '24px', height: '24px' },
  medium: { width: '32px', height: '32px' },
  large: { width: '40px', height: '40px' },
});
