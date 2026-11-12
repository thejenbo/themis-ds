import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';
import {
  Label,
  Slider as AriaSlider,
  SliderOutput,
  type SliderProps as AriaSliderProps,
  type SliderRenderProps,
  SliderThumb,
  type SliderThumbRenderProps,
  SliderTrack,
  type SliderTrackRenderProps,
} from 'react-aria-components';

import { border as borderWidth } from '../../tokens/borderWidth.stylex';
import { color } from '../../tokens/colorTheme.stylex';
import { duration, easing } from '../../tokens/motion.stylex';
import { border as radius } from '../../tokens/radius.stylex';
import { spacing } from '../../tokens/spacing.stylex';
import { color as system } from '../../tokens/system.stylex';
import { textStyles } from '../../styles/type-styles';
import { focusRing } from '../../utils/focus-ring';
import { racStyles } from '../../utils/stylex-rac';
import { touchTarget } from '../../utils/touch-target';

interface SliderBaseProps
  extends Omit<AriaSliderProps<number>, 'className' | 'style' | 'children' | 'orientation' | 'value' | 'defaultValue' | 'onChange' | 'onChangeEnd'> {
  /** The current value (controlled). Use with `onChange`. */
  value?: number;
  /** The starting value (uncontrolled). */
  defaultValue?: number;
  /** Called continuously while the value changes (dragging, arrow keys). */
  onChange?: (value: number) => void;
  /** Called once when the person lets go (or after a key press). Use this for anything expensive, like saving. */
  onChangeEnd?: (value: number) => void;
  /**
   * Show the current value at the end of the label row.
   * @default true
   */
  showValue?: boolean;
  /** Layout-only StyleX overrides (margin, flex, grid placement). Do not restyle colours or size. */
  xstyle?: stylex.StyleXStyles;
}

/** A visible `label` is expected; `aria-label` (or `aria-labelledby`) only when the layout really can't show one. */
export type SliderProps = SliderBaseProps &
  (
    | { /** The setting's name, shown above the track, e.g. "Volume". */ label: ReactNode; 'aria-label'?: string }
    | { label?: undefined; 'aria-label': string }
    | { label?: undefined; 'aria-labelledby': string }
  );

/**
 * Picks a number from a range by dragging a thumb along a track, such as volume or opacity. Built on React Aria
 * `Slider`: arrow keys step, Page Up/Down take bigger steps, Home/End jump to the ends, and clicking the track jumps
 * there. Use `formatOptions` for units (e.g. `{ style: 'percent' }`), so screen readers and the value say them too.
 */
export function Slider({ label, showValue = true, xstyle, ...props }: SliderProps) {
  return (
    <AriaSlider<number> {...props} {...racStyles<SliderRenderProps>(() => [styles.slider, xstyle])}>
      {(label != null || showValue) && (
        <div {...stylex.props(styles.labelRow)}>
          {label != null && <Label {...stylex.props(textStyles.label, styles.label)}>{label}</Label>}
          {showValue && <SliderOutput {...stylex.props(textStyles.label, styles.output)} />}
        </div>
      )}
      <SliderTrack {...racStyles<SliderTrackRenderProps>((s) => [styles.track, s.isDisabled && styles.trackDisabled])}>
        {({ state, isDisabled }) => (
          <>
            <div
              {...stylex.props(styles.fill, isDisabled && styles.fillDisabled)}
              style={{ width: `calc(${state.getThumbPercent(0) * 100}% + ${HALF_THUMB} - ${borderWidth.widthSm})` }}
            />
            <SliderThumb
              data-themis-touch-target=""
              {...racStyles<SliderThumbRenderProps>((t) => [
                styles.thumb,
                t.isHovered && !t.isDragging && styles.thumbHovered,
                t.isDragging && styles.thumbDragging,
                t.isDisabled && styles.thumbDisabled,
                touchTarget.area,
                focusRing.base,
                t.isFocusVisible && focusRing.visible,
                // The thumb has a real 3px border, so the white ring has to clear it.
                t.isFocusVisible && focusRing.aroundBorderMd,
                t.isFocusVisible && focusRing.radiusFull,
              ])}
            >
              {({ isDragging, isFocusVisible }) => (
                // The value, floating above the thumb while it's in use. Screen readers get it from the slider itself.
                <span aria-hidden="true" {...stylex.props(textStyles.caption, styles.bubble, (isDragging || isFocusVisible) && styles.bubbleShown)}>
                  {state.getThumbValueLabel(0)}
                </span>
              )}
            </SliderThumb>
          </>
        )}
      </SliderTrack>
    </AriaSlider>
  );
}

// Figma: 28px thumb (32px hovered, 36px while dragging) on a 16px track.
const HALF_THUMB = '14px';

const styles = stylex.create({
  slider: { display: 'flex', flexDirection: 'column', gap: spacing.xs, width: '100%' },
  labelRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: spacing.xs, color: color.text },
  label: { minWidth: 0 },
  output: { marginInlineStart: 'auto', fontVariantNumeric: 'tabular-nums' },
  /*
   * The track's own box is inset by half a thumb at each end, so the thumb (centred on the value) stays inside the
   * pill at 0 and 100%, as in Figma, and pointer positions still map exactly onto values. The pill is drawn by
   * ::before, which reaches back out to the full width.
   */
  track: {
    position: 'relative',
    height: '1rem',
    marginInline: HALF_THUMB,
    cursor: 'pointer',
    '::before': {
      content: "''",
      position: 'absolute',
      insetBlock: 0,
      insetInline: `calc(-1 * ${HALF_THUMB})`,
      borderRadius: radius.radiusFull,
      borderStyle: 'solid',
      borderWidth: borderWidth.widthSm,
      borderColor: color.border,
      // Figma: brand with transform-90 on top (a pale brand) for the part not filled yet.
      backgroundColor: color.brand,
      backgroundImage: `linear-gradient(${color.transform90}, ${color.transform90})`,
    },
  },
  trackDisabled: { cursor: 'not-allowed', '::before': { backgroundColor: system.backgroundDisabledDefault } },
  // From the start of the pill (inside its border) to the thumb's centre; the thumb covers its rounded end.
  fill: {
    position: 'absolute',
    insetBlock: borderWidth.widthSm,
    insetInlineStart: `calc(${borderWidth.widthSm} - ${HALF_THUMB})`,
    borderRadius: radius.radiusFull,
    backgroundColor: color.brand,
    pointerEvents: 'none',
  },
  fillDisabled: { backgroundColor: system.backgroundDisabledDefault },
  thumb: {
    top: '50%',
    width: '28px',
    height: '28px',
    borderRadius: radius.radiusFull,
    borderStyle: 'solid',
    borderWidth: borderWidth.widthMd,
    borderColor: color.border,
    backgroundColor: color.background,
    cursor: 'grab',
    transitionProperty: 'width, height',
    transitionDuration: { default: duration.fast, '@media (prefers-reduced-motion: reduce)': '0s' },
    transitionTimingFunction: easing.standard,
  },
  thumbHovered: { width: '32px', height: '32px' },
  thumbDragging: { width: '36px', height: '36px', cursor: 'grabbing' },
  thumbDisabled: {
    cursor: 'not-allowed',
    backgroundColor: system.backgroundDisabledInverse,
    borderColor: system.borderDisabled,
  },
  // Figma "Indicator": a pill 4px above the thumb, caption text.
  bubble: {
    position: 'absolute',
    insetInlineStart: '50%',
    bottom: `calc(100% + ${spacing['2xs']})`,
    transform: 'translateX(-50%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '2rem',
    height: '1.5rem',
    paddingInline: spacing.xs,
    borderRadius: radius.radiusFull,
    backgroundColor: color.backgroundInverse,
    color: color.textInverse,
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
    opacity: 0,
    transitionProperty: 'opacity',
    transitionDuration: { default: duration.fast, '@media (prefers-reduced-motion: reduce)': '0s' },
    transitionTimingFunction: easing.standard,
  },
  bubbleShown: { opacity: 1 },
});
