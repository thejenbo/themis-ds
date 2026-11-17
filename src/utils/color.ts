import * as stylex from '@stylexjs/stylex';
import type { Color, ColorChannel } from 'react-aria-components';

import { border as borderWidth } from '../tokens/borderWidth.stylex';
import { color as theme } from '../tokens/colorTheme.stylex';
import { duration, easing } from '../tokens/motion.stylex';
import { color as primitive } from '../tokens/primitives.stylex';
import { border as radius } from '../tokens/radius.stylex';
import { color as system } from '../tokens/system.stylex';

/**
 * Shared pieces for the colour components (ColorSwatch, ColorSlider, ColorRangeSlider, ColorArea).
 */

/** A grey and white checkerboard, shown behind see-through colours so their transparency is visible. */
export const CHECKERBOARD = `repeating-conic-gradient(${primitive.grayscale030} 0% 25%, ${primitive.grayscale000} 0% 50%) 50% / 8px 8px`;

/**
 * CSS `background` that paints a colour, over a checkerboard when it's see-through. Use as an inline style:
 * colours are runtime values, so they can't be StyleX classes.
 */
export function colorFill(color: Color): string {
  const css = color.toString('css');
  return color.getChannelValue('alpha') < 1 ? `linear-gradient(${css}, ${css}), ${CHECKERBOARD}` : css;
}

/**
 * The gradient along one channel of a colour, the same stops React Aria's ColorSlider uses: hue goes round the
 * wheel at full strength, lightness passes through the full colour in the middle, and every other channel runs from
 * its minimum to its maximum.
 */
export function channelGradient(color: Color, channel: ColorChannel, to: 'left' | 'right'): string {
  const { minValue, maxValue } = color.getChannelRange(channel);
  let values: number[];
  if (channel === 'hue') values = [0, 60, 120, 180, 240, 300, 360];
  else if (channel === 'lightness') values = [minValue, (maxValue - minValue) / 2, maxValue];
  else values = [minValue, maxValue];
  // A hue track is a fixed rainbow of full-strength hues, so it doesn't dim or grey out as the colour's saturation and
  // brightness change (e.g. moving ColorArea's thumb). Every other channel shows the colour's own range.
  const stop = (v: number) => (channel === 'hue' ? `hsl(${v}, 100%, 50%)` : color.withChannelValue(channel, v).toString('css'));
  return `linear-gradient(to ${to}, ${values.map(stop).join(', ')})`;
}

/**
 * CSS `background` for the colour track's pill: the channel's gradient from end to end of the pill (over a
 * checkerboard for the alpha channel). The thumb's centre only travels between half a thumb in from each end, so the
 * colour under it is a little off near the ends, but the thumb is filled with the exact colour; drawing the gradient
 * only over the thumb's travel left solid blocks at the ends.
 */
export function trackBackground(color: Color, channel: ColorChannel, direction: 'ltr' | 'rtl'): string {
  const gradient = channelGradient(color, channel, direction === 'rtl' ? 'left' : 'right');
  return channel === 'alpha' ? `${gradient}, ${CHECKERBOARD}` : gradient;
}

// Figma "Thumb": 28px (32px hovered, 36px while dragging) on a 16px track.
export const HALF_THUMB = '14px';

/**
 * The colour track: a 16px pill with a border, painted with the channel's gradient (inline, `trackBackground`). The
 * slider's own track sits inside it, inset by half a thumb at each end so the thumb stays inside the pill at both
 * ends (as in Slider); it's transparent.
 */
export const colorTrack = stylex.create({
  pill: {
    position: 'relative',
    height: '1rem',
    paddingInline: HALF_THUMB,
    borderRadius: radius.radiusFull,
    forcedColorAdjust: 'none',
    // The border is an overlay on top of the colours, so they run right up to it.
    '::after': {
      content: "''",
      position: 'absolute',
      inset: 0,
      zIndex: 1,
      borderRadius: radius.radiusFull,
      borderStyle: 'solid',
      borderWidth: borderWidth.widthSm,
      borderColor: theme.border,
      pointerEvents: 'none',
    },
  },
  pillDisabled: { backgroundColor: system.backgroundDisabledDefault },
  // React Aria sets the track's position inline, so it's inset by the pill's padding rather than positioned.
  track: {
    height: '100%',
    cursor: 'pointer',
    // Clicks on the inset ends still land on the track (the value clamps to that end).
    '::before': {
      content: "''",
      position: 'absolute',
      insetBlock: 0,
      insetInline: `calc(-1 * ${HALF_THUMB})`,
    },
  },
  trackDisabled: { cursor: 'not-allowed' },
});

/**
 * Colour thumb: filled with the colour it points at. A black border and a white ring inside it keep it visible on
 * any colour, light or dark (one of the two always has 3:1 contrast, WCAG 1.4.11), like ColorArea's bullseye thumb.
 * Uses `border/width/mandatory`, so it stays visible in themes with no borders.
 *
 * The colour itself is a child `<span>` (styled by `fill`), because the thumb's `::before` and `::after` are taken
 * by the focus ring and touch target.
 */
export const colorThumb = stylex.create({
  thumb: {
    top: '50%',
    // Above the track's border overlay.
    zIndex: 2,
    width: '28px',
    height: '28px',
    borderRadius: radius.radiusFull,
    borderStyle: 'solid',
    borderWidth: borderWidth.widthMandatory,
    borderColor: primitive.grayscale1000,
    cursor: 'grab',
    transitionProperty: 'width, height',
    transitionDuration: { default: duration.fast, '@media (prefers-reduced-motion: reduce)': '0s' },
    transitionTimingFunction: easing.standard,
  },
  hovered: { width: '32px', height: '32px' },
  dragging: { width: '36px', height: '36px', cursor: 'grabbing' },
  disabled: { cursor: 'not-allowed', borderColor: system.borderDisabled },
  fill: {
    position: 'absolute',
    inset: 0,
    borderRadius: radius.radiusFull,
    boxShadow: `inset 0 0 0 ${borderWidth.widthMandatory} ${primitive.grayscale000}`,
    pointerEvents: 'none',
  },
  fillDisabled: { boxShadow: 'none', backgroundColor: system.backgroundDisabledInverse },
});
