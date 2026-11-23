import * as stylex from '@stylexjs/stylex';
import {
  type Color,
  ColorArea as AriaColorArea,
  type ColorAreaProps as AriaColorAreaProps,
  type ColorAreaRenderProps,
  ColorThumb,
  type ColorThumbRenderProps,
  parseColor,
} from 'react-aria-components';

import { border as borderWidth } from '../../tokens/borderWidth.stylex';
import { color } from '../../tokens/colorTheme.stylex';
import { border as borderPrimitive, color as primitive } from '../../tokens/primitives.stylex';
import { border as radius } from '../../tokens/radius.stylex';
import { spacing } from '../../tokens/spacing.stylex';
import { color as system } from '../../tokens/system.stylex';
import { colorFill } from '../../utils/color';
import { focusRing } from '../../utils/focus-ring';
import { racStyles } from '../../utils/stylex-rac';
import { touchTarget } from '../../utils/touch-target';

export interface ColorAreaProps
  extends Omit<AriaColorAreaProps, 'className' | 'style' | 'children' | 'value' | 'defaultValue' | 'onChange' | 'onChangeEnd'> {
  /** The current color (controlled), as a CSS color string or a parsed `Color`. Use with `onChange`. */
  value?: string | Color;
  /** The starting color (uncontrolled). */
  defaultValue?: string | Color;
  /** Called continuously while the color changes (dragging, arrow keys), with the whole color. */
  onChange?: (value: Color) => void;
  /** Called once when the person lets go (or after a key press). Use this for anything expensive, like saving. */
  onChangeEnd?: (value: Color) => void;
  /**
   * The channel that changes left to right. With `yChannel`, pick two channels of the color's space (`colorSpace`).
   * Defaults to saturation (hsl/hsb) or red (rgb).
   */
  xChannel?: AriaColorAreaProps['xChannel'];
  /** The channel that changes bottom to top. Defaults to lightness (hsl), brightness (hsb) or green (rgb). */
  yChannel?: AriaColorAreaProps['yChannel'];
  /**
   * Size and layout-only StyleX overrides (width, height, aspect ratio, margin, flex, grid placement). It fills its
   * container's width at Figma's 345 × 284 proportions by default. Do not restyle colors.
   */
  xstyle?: stylex.StyleXStyles;
}

/**
 * Picks a color by dragging a thumb over a square of colors that changes along two channels, such as saturation
 * (left to right) and lightness (bottom to top). Built on React Aria `ColorArea`: arrow keys move the thumb (Left/Right
 * for the x channel, Up/Down for the y channel), Page Up/Down and Shift+arrows take bigger steps, and clicking jumps
 * there. Pair it with a hue ColorSlider to reach every color.
 */
export function ColorArea({ xstyle, xChannel, yChannel, ...props }: ColorAreaProps) {
  // React Aria defaults to the color space's first two channels (hue and saturation for hsl). Themis defaults to the
  // two that pair with a hue slider: saturation and lightness (hsl) or brightness (hsb).
  const start = props.value ?? props.defaultValue;
  const space = props.colorSpace ?? (start == null ? undefined : (typeof start === 'string' ? parseColor(start) : start).getColorSpace());
  const pair = space === 'hsl' ? (['saturation', 'lightness'] as const) : space === 'hsb' ? (['saturation', 'brightness'] as const) : undefined;
  return (
    <AriaColorArea
      {...props}
      xChannel={xChannel ?? (yChannel ? undefined : pair?.[0])}
      yChannel={yChannel ?? (xChannel ? undefined : pair?.[1])}
      className={(s: ColorAreaRenderProps) => stylex.props(styles.area, s.isDisabled && styles.areaDisabled, xstyle).className ?? ''}
      // React Aria paints the two-channel gradient here; disabled, the gray fill shows instead.
      style={({ defaultStyle, isDisabled }) => (isDisabled ? { ...defaultStyle, background: 'none' } : defaultStyle)}
    >
      <ColorThumb
        data-themis-touch-target=""
        {...racStyles<ColorThumbRenderProps>((t) => [
          styles.thumb,
          t.isDragging && styles.thumbDragging,
          t.isDisabled && styles.thumbDisabled,
          touchTarget.area,
          focusRing.base,
          t.isFocusVisible && focusRing.visible,
          t.isFocusVisible && styles.focusAroundRing,
          t.isFocusVisible && focusRing.radiusFull,
        ])}
      >
        {({ color: c, isDisabled }) => (
          <>
            <span aria-hidden="true" {...stylex.props(styles.ring, isDisabled && styles.ringDisabled)} />
            <span
              aria-hidden="true"
              {...stylex.props(styles.center, isDisabled && styles.centerDisabled)}
              style={isDisabled ? undefined : { background: colorFill(c) }}
            />
          </>
        )}
      </ColorThumb>
    </AriaColorArea>
  );
}

// The bullseye's rings are always 3px (the large border width), whatever the border-width mode: thinner rings make
// the thumb hard to see on busy colors.
const ring = borderPrimitive.width3;

const styles = stylex.create({
  area: {
    position: 'relative',
    flexShrink: 0,
    width: '100%',
    aspectRatio: '345 / 284',
    borderRadius: radius.radiusMd,
    // Figma: a border/width/md border in color/border, drawn inside so the thumb's positions match the visible box.
    boxShadow: `inset 0 0 0 ${borderWidth.widthMd} ${color.border}`,
    forcedColorAdjust: 'none',
  },
  areaDisabled: { backgroundColor: system.backgroundDisabledDefault },
  /*
   * Figma "Thumb", bullseye: 32px, a 3px black border, a 3px white ring inside it, then the color in a 22px circle
   * with its own 3px black border. One of black or white always shows against the colors around it.
   */
  thumb: {
    zIndex: 1,
    boxSizing: 'border-box',
    width: '32px',
    height: '32px',
    borderRadius: radius.radiusFull,
    borderStyle: 'solid',
    borderWidth: ring,
    borderColor: primitive.grayscale1000,
    cursor: 'grab',
  },
  // The focus ring sits outside the 3px border (focusRing's own offset assumes border/width/sm).
  focusAroundRing: { '::before': { inset: `calc(-1 * (${spacing['3xs']} + ${borderWidth.widthFocusRing} + ${ring}))` } },
  thumbDragging: { cursor: 'grabbing' },
  thumbDisabled: { cursor: 'not-allowed', borderColor: system.borderDisabled },
  ring: {
    position: 'absolute',
    inset: 0,
    borderRadius: radius.radiusFull,
    borderStyle: 'solid',
    borderWidth: ring,
    borderColor: primitive.grayscale000,
    pointerEvents: 'none',
  },
  ringDisabled: { borderColor: system.backgroundDisabledInverse },
  center: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    boxSizing: 'border-box',
    width: '22px',
    height: '22px',
    transform: 'translate(-50%, -50%)',
    borderRadius: radius.radiusFull,
    borderStyle: 'solid',
    borderWidth: ring,
    borderColor: primitive.grayscale1000,
    pointerEvents: 'none',
  },
  centerDisabled: { borderColor: system.borderDisabled, backgroundColor: system.backgroundDisabledInverse },
});
