import * as stylex from '@stylexjs/stylex';
import {
  Button,
  type ButtonProps,
  type ButtonRenderProps,
  type Color,
  ColorSwatchPickerItem,
  type ColorSwatchPickerItemProps,
  type ColorSwatchPickerItemRenderProps,
} from 'react-aria-components';

import { border as borderWidth } from '../../tokens/borderWidth.stylex';
import { border as radius } from '../../tokens/radius.stylex';
import { color as system } from '../../tokens/system.stylex';
import { focusRing } from '../../utils/focus-ring';
import { interactiveCursor } from '../../utils/interactive-cursor';
import { pressMotion } from '../../utils/press-motion';
import { racStyles } from '../../utils/stylex-rac';
import { touchTarget } from '../../utils/touch-target';
import { ColorSwatch } from '../ColorSwatch';

export type ColorPickerSwatchSize = 'small' | 'medium' | 'large';

export interface ColorPickerSwatchProps extends Omit<ButtonProps, 'className' | 'style' | 'children'> {
  /**
   * The colour shown, as a CSS colour string or a parsed `Color`. Inside a ColorPicker it can be left out: it shows
   * the picker's colour.
   */
  color?: string | Color;
  /**
   * 24px, 32px or 40px, as ColorSwatch. `large` lines up with an input box (40px tall).
   * @default 'large'
   */
  size?: ColorPickerSwatchSize;
  /**
   * What pressing it does, added after the colour's description, e.g. "Pick a color" → "vibrant purple, Pick a color".
   * The description alone doesn't say it's a button for something.
   */
  'aria-label'?: string;
  /** Layout-only StyleX overrides (margin, flex, grid placement). Do not restyle colours or size. */
  xstyle?: stylex.StyleXStyles;
}

/**
 * A colour swatch you can press, e.g. the button that opens a ColorPicker. Built on React Aria `Button` with a
 * ColorSwatch inside, so screen readers hear the colour's description and what pressing does. It shows the keyboard
 * focus ring and shrinks while pressed, but has no hover tint: a tint would change the colour it shows. Disabled, it
 * shows the disabled grey instead of the colour.
 */
export function ColorPickerSwatch({ color, size = 'large', 'aria-label': ariaLabel, xstyle, ...props }: ColorPickerSwatchProps) {
  return (
    <Button
      {...props}
      // Disabled, the colour isn't shown (so it isn't described either): the button is named by `aria-label` alone.
      aria-label={props.isDisabled ? ariaLabel : undefined}
      data-themis-touch-target=""
      {...racStyles<ButtonRenderProps>((s) => [
        pickerSwatch.root,
        sizes[size],
        touchTarget.area,
        focusRing.base,
        s.isFocusVisible && focusRing.visible,
        s.isDisabled ? interactiveCursor.disabled : interactiveCursor.enabled,
        xstyle,
      ])}
    >
      {({ isPressed, isDisabled }) =>
        isDisabled ? (
          <span aria-hidden="true" {...stylex.props(pickerSwatch.disabled, sizes[size])} />
        ) : (
          <ColorSwatch
            color={color}
            size={size}
            variant="outline"
            aria-label={ariaLabel}
            xstyle={[pressMotion.base, isPressed && pressMotion.pressed]}
          />
        )
      }
    </Button>
  );
}

export interface ColorPickerSwatchItemProps extends Omit<ColorSwatchPickerItemProps, 'className' | 'style' | 'children'> {
  /**
   * The swatch's size, as ColorPickerSwatch.
   * @default 'large'
   */
  size?: ColorPickerSwatchSize;
}

/**
 * One choosable colour in a React Aria `ColorSwatchPicker` (e.g. ColorPicker's recent colours), styled as
 * ColorPickerSwatch: a focus ring and a press shrink, no hover tint. The chosen one is announced as selected.
 */
export function ColorPickerSwatchItem({ size = 'large', ...props }: ColorPickerSwatchItemProps) {
  return (
    <ColorSwatchPickerItem
      {...props}
      data-themis-touch-target=""
      {...racStyles<ColorSwatchPickerItemRenderProps>((s) => [
        pickerSwatch.root,
        sizes[size],
        touchTarget.area,
        focusRing.base,
        s.isFocusVisible && focusRing.visible,
        s.isDisabled ? interactiveCursor.disabled : interactiveCursor.enabled,
      ])}
    >
      {({ color: c, isPressed }) => (
        <ColorSwatch color={c} size={size} variant="outline" xstyle={[pressMotion.base, isPressed && pressMotion.pressed]} />
      )}
    </ColorSwatchPickerItem>
  );
}

export const pickerSwatch = stylex.create({
  // The button is the swatch's size; the swatch inside shrinks while pressed, the button (and its ring) doesn't.
  root: {
    position: 'relative',
    display: 'inline-flex',
    flexShrink: 0,
    padding: 0,
    margin: 0,
    borderWidth: 0,
    borderRadius: radius.radiusMd,
    backgroundColor: 'transparent',
    outlineStyle: 'none',
  },
  // Disabled: the disabled grey, like ColorArea's disabled thumb, so a disabled control doesn't show a live colour.
  disabled: {
    boxSizing: 'border-box',
    borderRadius: radius.radiusMd,
    borderStyle: 'solid',
    borderWidth: borderWidth.widthSm,
    borderColor: system.borderDisabled,
    backgroundColor: system.backgroundDisabledInverse,
  },
});

const sizes = stylex.create({
  small: { width: '24px', height: '24px' },
  medium: { width: '32px', height: '32px' },
  large: { width: '40px', height: '40px' },
});
