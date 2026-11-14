import * as stylex from '@stylexjs/stylex';
import { type ReactNode, useMemo } from 'react';
import {
  type Color,
  type ColorChannel,
  type ColorSpace,
  Label,
  parseColor,
  Slider,
  SliderOutput,
  type SliderProps,
  type SliderRenderProps,
  SliderThumb,
  type SliderThumbRenderProps,
  SliderTrack,
  type SliderTrackRenderProps,
  useLocale,
} from 'react-aria-components';

import { border as borderWidth } from '../../tokens/borderWidth.stylex';
import { color } from '../../tokens/colorTheme.stylex';
import { border as radius } from '../../tokens/radius.stylex';
import { color as system } from '../../tokens/system.stylex';
import { spacing } from '../../tokens/spacing.stylex';
import { textStyles } from '../../styles/type-styles';
import { channelGradient, colorFill, colorThumb, colorTrack, trackEnds } from '../../utils/color';
import { focusRing } from '../../utils/focus-ring';
import { racStyles } from '../../utils/stylex-rac';
import { touchTarget } from '../../utils/touch-target';

export interface ColorRangeSliderProps
  extends Omit<
    SliderProps<number[]>,
    'className' | 'style' | 'children' | 'orientation' | 'value' | 'defaultValue' | 'onChange' | 'onChangeEnd' | 'minValue' | 'maxValue' | 'step' | 'formatOptions'
  > {
  /** The channel the range covers: `hue`, `saturation`, `lightness`, `brightness`, `red`, `green`, `blue` or `alpha`. */
  channel: ColorChannel;
  /**
   * The colour the range is taken from: the track shows it with `channel` running from its minimum to its maximum.
   * @default 'hsl(0, 100%, 50%)'
   */
  color?: string | Color;
  /** Turn `color` into this colour space first, e.g. `hsb` for a brightness range. Defaults to the colour's own space. */
  colorSpace?: ColorSpace;
  /** The start and end of the range, in the channel's units (hue 0–360, saturation 0–100, alpha 0–1…). Controlled. */
  value?: [number, number];
  /** The starting range (uncontrolled). Defaults to the channel's full range. */
  defaultValue?: [number, number];
  /** Called continuously while either end moves, with `[start, end]`. */
  onChange?: (value: [number, number]) => void;
  /** Called once when the person lets go (or after a key press). Use this for anything expensive, like saving. */
  onChangeEnd?: (value: [number, number]) => void;
  /** The setting's name, shown above the track. Without it, screen readers hear "<channel> range", e.g. "Hue range". */
  label?: ReactNode;
  /**
   * With a `label`, show the range at the end of the label row ("30° – 90°").
   * @default true
   */
  showValue?: boolean;
  /**
   * Show a swatch of each end's colour above its thumb, always visible. Useful when the two ends are what matter,
   * e.g. the stops of a two-colour gradient. Adds space above the track for them.
   * @default false
   */
  showSwatches?: boolean;
  /** Layout-only StyleX overrides (margin, flex, grid placement). Do not restyle colours or size. */
  xstyle?: stylex.StyleXStyles;
}

/**
 * Picks a span of one colour channel, such as a range of hues, with a start and an end thumb on a track that shows the
 * colours on offer. Each thumb is filled with the colour at its end. Built on React Aria `Slider` with two thumbs: the
 * thumbs can't cross, arrow keys step, Page Up/Down take bigger steps, and Home/End jump as far as the other thumb
 * allows.
 */
export function ColorRangeSlider({
  channel,
  color: colorProp = 'hsl(0, 100%, 50%)',
  colorSpace,
  label,
  showValue = true,
  showSwatches = false,
  xstyle,
  ...props
}: ColorRangeSliderProps) {
  const { direction, locale } = useLocale();
  const base = useMemo(() => {
    const parsed = typeof colorProp === 'string' ? parseColor(colorProp) : colorProp;
    return colorSpace ? parsed.toFormat(colorSpace) : parsed;
  }, [colorProp, colorSpace]);
  const { minValue, maxValue, step } = base.getChannelRange(channel);
  const channelName = base.getChannelName(channel, locale);
  const ariaLabel = props['aria-label'] ?? (label == null && !props['aria-labelledby'] ? `${channelName} range` : undefined);
  const gradient = channelGradient(base, channel, direction === 'rtl' ? 'left' : 'right');

  return (
    <Slider<number[]>
      {...props}
      aria-label={ariaLabel}
      value={props.value}
      defaultValue={props.defaultValue ?? (props.value ? undefined : [minValue, maxValue])}
      onChange={props.onChange as ((v: number[]) => void) | undefined}
      onChangeEnd={props.onChangeEnd as ((v: number[]) => void) | undefined}
      minValue={minValue}
      maxValue={maxValue}
      step={step}
      formatOptions={base.getChannelFormatOptions(channel)}
      {...racStyles<SliderRenderProps>(() => [styles.slider, xstyle])}
    >
      {({ isDisabled }) => (
        <>
          {label != null && (
            <div {...stylex.props(styles.labelRow)}>
              <Label {...stylex.props(textStyles.label, styles.label)}>{label}</Label>
              {showValue && <SliderOutput {...stylex.props(textStyles.label, styles.output)} />}
            </div>
          )}
          <div
            {...stylex.props(colorTrack.pill, isDisabled && colorTrack.pillDisabled, showSwatches && (label != null ? styles.swatchRoomBelowLabel : styles.swatchRoom))}
            style={isDisabled ? undefined : { background: trackEnds(base, channel, direction) }}
          >
            <SliderTrack
              className={(s: SliderTrackRenderProps) =>
                stylex.props(colorTrack.track, s.isDisabled && colorTrack.trackDisabled).className ?? ''
              }
              style={({ defaultStyle, isDisabled: off }) => (off ? defaultStyle : { ...defaultStyle, background: gradient })}
            >
              {({ state }) =>
                [0, 1].map((index) => (
                  <SliderThumb
                    key={index}
                    index={index}
                    aria-label={index === 0 ? 'Start' : 'End'}
                    data-themis-touch-target=""
                    {...racStyles<SliderThumbRenderProps>((t) => [
                      colorThumb.thumb,
                      t.isHovered && !t.isDragging && colorThumb.hovered,
                      t.isDragging && colorThumb.dragging,
                      t.isDisabled && colorThumb.disabled,
                      touchTarget.area,
                      focusRing.base,
                      t.isFocusVisible && focusRing.visible,
                      t.isFocusVisible && focusRing.aroundBorderSm,
                      t.isFocusVisible && focusRing.radiusFull,
                    ])}
                  >
                    <span
                      aria-hidden="true"
                      {...stylex.props(colorThumb.fill, isDisabled && colorThumb.fillDisabled)}
                      style={isDisabled ? undefined : { background: colorFill(base.withChannelValue(channel, state.getThumbValue(index))) }}
                    />
                    {showSwatches && (
                      // Decorative: screen readers get each end's value from its thumb.
                      <span
                        aria-hidden="true"
                        {...stylex.props(styles.swatch, isDisabled && styles.swatchDisabled)}
                        style={isDisabled ? undefined : { background: colorFill(base.withChannelValue(channel, state.getThumbValue(index))) }}
                      />
                    )}
                  </SliderThumb>
                ))
              }
            </SliderTrack>
          </div>
        </>
      )}
    </Slider>
  );
}

const styles = stylex.create({
  slider: { display: 'flex', flexDirection: 'column', gap: spacing.xs, width: '100%' },
  labelRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: spacing.xs, color: color.text },
  label: { minWidth: 0 },
  output: { marginInlineStart: 'auto', fontVariantNumeric: 'tabular-nums' },
  /*
   * Room for the swatches: a 24px swatch 4px above the thumb, which reaches 10px above the track at its largest
   * (36px while dragging), so the swatch never covers the label row.
   */
  swatchRoom: { marginTop: `calc(24px + ${spacing['2xs']} + 10px)` },
  // The label row's gap already gives some of it.
  swatchRoomBelowLabel: { marginTop: `calc(24px + ${spacing['2xs']} + 10px - ${spacing.xs})` },
  // Figma "Swatch indicator": a small outline ColorSwatch, 4px above the thumb.
  swatch: {
    position: 'absolute',
    insetInlineStart: '50%',
    bottom: `calc(100% + ${spacing['2xs']})`,
    transform: 'translateX(-50%)',
    boxSizing: 'border-box',
    width: '24px',
    height: '24px',
    borderRadius: radius.radiusMd,
    borderStyle: 'solid',
    borderWidth: borderWidth.widthSm,
    borderColor: color.border,
    pointerEvents: 'none',
  },
  swatchDisabled: { borderColor: system.borderDisabled, backgroundColor: system.backgroundDisabledInverse },
});
