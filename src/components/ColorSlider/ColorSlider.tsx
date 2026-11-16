import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';
import {
  type Color,
  ColorSlider as AriaColorSlider,
  type ColorSliderProps as AriaColorSliderProps,
  type ColorSliderRenderProps,
  ColorThumb,
  type ColorThumbRenderProps,
  Label,
  SliderOutput,
  SliderTrack,
  type SliderTrackRenderProps,
  useLocale,
} from 'react-aria-components';

import { color } from '../../tokens/colorTheme.stylex';
import { spacing } from '../../tokens/spacing.stylex';
import { textStyles } from '../../styles/type-styles';
import { colorFill, colorThumb, colorTrack, trackBackground } from '../../utils/color';
import { focusRing } from '../../utils/focus-ring';
import { racStyles } from '../../utils/stylex-rac';
import { touchTarget } from '../../utils/touch-target';

export interface ColorSliderProps
  extends Omit<AriaColorSliderProps, 'className' | 'style' | 'children' | 'orientation' | 'value' | 'defaultValue' | 'onChange' | 'onChangeEnd'> {
  /** The channel the slider changes: `hue`, `saturation`, `lightness`, `brightness`, `red`, `green`, `blue` or `alpha`. */
  channel: AriaColorSliderProps['channel'];
  /** The current colour (controlled), as a CSS colour string or a parsed `Color`. Use with `onChange`. */
  value?: string | Color;
  /** The starting colour (uncontrolled). */
  defaultValue?: string | Color;
  /** Called continuously while the colour changes (dragging, arrow keys), with the whole colour. */
  onChange?: (value: Color) => void;
  /** Called once when the person lets go (or after a key press). Use this for anything expensive, like saving. */
  onChangeEnd?: (value: Color) => void;
  /**
   * The setting's name, shown above the track. Without it, screen readers hear the channel's name ("Hue"); pass
   * `aria-label` to say more, e.g. "Background hue".
   */
  label?: ReactNode;
  /**
   * With a `label`, show the channel's value at the end of the label row ("180°", "50%").
   * @default true
   */
  showValue?: boolean;
  /** Layout-only StyleX overrides (margin, flex, grid placement). Do not restyle colours or size. */
  xstyle?: stylex.StyleXStyles;
}

/**
 * Changes one channel of a colour, such as its hue or opacity, by dragging a thumb along a track that shows the
 * colours on offer. Built on React Aria `ColorSlider`: arrow keys step, Page Up/Down take bigger steps, Home/End jump
 * to the ends, and clicking the track jumps there. The thumb is filled with the current colour.
 */
export function ColorSlider({ label, showValue = true, xstyle, ...props }: ColorSliderProps) {
  const { direction } = useLocale();
  return (
    <AriaColorSlider {...props} {...racStyles<ColorSliderRenderProps>(() => [styles.slider, xstyle])}>
      {({ state, isDisabled }) => (
        <>
          {label != null && (
            <div {...stylex.props(styles.labelRow)}>
              <Label {...stylex.props(textStyles.label, styles.label)}>{label}</Label>
              {showValue && <SliderOutput {...stylex.props(textStyles.label, styles.output)} />}
            </div>
          )}
          <div
            {...stylex.props(colorTrack.pill, isDisabled && colorTrack.pillDisabled)}
            style={isDisabled ? undefined : { background: trackBackground(state.value, props.channel, direction) }}
          >
            <SliderTrack
              className={(s: SliderTrackRenderProps) =>
                stylex.props(colorTrack.track, s.isDisabled && colorTrack.trackDisabled).className ?? ''
              }
              // React Aria paints the channel's gradient here, inset by half a thumb; the pill draws it end to end instead.
              style={({ defaultStyle }) => ({ ...defaultStyle, background: 'none' })}
            >
              <ColorThumb
                data-themis-touch-target=""
                {...racStyles<ColorThumbRenderProps>((t) => [
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
                {({ color: c, isDisabled: off }) => (
                  <span
                    aria-hidden="true"
                    {...stylex.props(colorThumb.fill, off && colorThumb.fillDisabled)}
                    style={off ? undefined : { background: colorFill(c) }}
                  />
                )}
              </ColorThumb>
            </SliderTrack>
          </div>
        </>
      )}
    </AriaColorSlider>
  );
}

const styles = stylex.create({
  slider: { display: 'flex', flexDirection: 'column', gap: spacing.xs, width: '100%' },
  labelRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: spacing.xs, color: color.text },
  label: { minWidth: 0 },
  output: { marginInlineStart: 'auto', fontVariantNumeric: 'tabular-nums' },
});
