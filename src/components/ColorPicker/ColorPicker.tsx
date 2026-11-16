import * as stylex from '@stylexjs/stylex';
import {
  type Color,
  ColorPicker as AriaColorPicker,
  type ColorPickerProps as AriaColorPickerProps,
  type PopoverProps,
} from 'react-aria-components';

import type { ColorPickerSwatchSize } from '../ColorPickerSwatch';
import { PickerPopover, type PickerPanelOptions } from './picker-popover';

export interface ColorPickerProps extends PickerPanelOptions {
  /** The current colour (controlled), as a CSS colour string or a parsed `Color`. Use with `onChange`. */
  value?: AriaColorPickerProps['value'];
  /** The starting colour (uncontrolled). */
  defaultValue?: AriaColorPickerProps['defaultValue'];
  /** Called continuously while the colour changes (dragging, arrow keys). */
  onChange?: (value: Color) => void;
  /**
   * Called once a change is finished: when a slider or the area is let go, or a recent colour is chosen. Add the
   * colour to your recent colours here.
   */
  onChangeEnd?: (value: Color) => void;
  /**
   * Names the swatch button and the popover for screen readers, after the colour's description ("vibrant purple,
   * Background color"). Say what the colour is for.
   */
  'aria-label': string;
  /**
   * The swatch button's size: 24px, 32px or 40px.
   * @default 'large'
   */
  size?: ColorPickerSwatchSize;
  /** Disables the swatch button, so the picker can't open. */
  isDisabled?: boolean;
  /**
   * Where the popover opens, relative to the swatch.
   * @default 'bottom start'
   */
  placement?: PopoverProps['placement'];
  /** Layout-only StyleX overrides for the swatch button (margin, flex, grid placement). */
  xstyle?: stylex.StyleXStyles;
}

/**
 * A colour swatch that opens a colour picker: a saturation × brightness area and a hue slider, optional Saturation,
 * Brightness and Hue sliders behind "Advanced", and optional recent colours. Built on React Aria `ColorPicker`, with a
 * `DialogTrigger` and `Popover`: clicking outside or pressing Escape closes it and focus returns to the swatch. For a
 * typed colour code next to the swatch, use ColorField.
 */
export function ColorPicker({
  value,
  defaultValue,
  onChange,
  onChangeEnd,
  'aria-label': ariaLabel,
  size = 'large',
  isDisabled,
  placement,
  xstyle,
  ...panel
}: ColorPickerProps) {
  return (
    <AriaColorPicker value={value} defaultValue={defaultValue} onChange={onChange}>
      <span {...stylex.props(styles.root, xstyle)}>
        <PickerPopover triggerLabel={ariaLabel} size={size} isDisabled={isDisabled} placement={placement} onChangeEnd={onChangeEnd} {...panel} />
      </span>
    </AriaColorPicker>
  );
}

const styles = stylex.create({
  root: { display: 'inline-flex' },
});
