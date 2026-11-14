// url=https://www.figma.com/design/tRoAewIghL1YbnTio6fkkw/Themis-Design-System?node-id=1909-994
// source=src/components/ColorSlider/ColorSlider.tsx
// component=ColorSlider
import figma from 'figma'
const instance = figma.selectedInstance

// Figma draws a hue slider, so the snippet uses `channel="hue"`. `focused` and `activeHandle` are interaction, and
// on the single slider `indicator` is replaced by the thumb's own fill; on the range slider it's `showSwatches`.
const disabled = instance.getEnum('state', { default: false, focused: false, disabled: true })
const double = instance.getEnum('handles', { single: false, double: true })
const indicator = instance.getEnum('indicator', { false: false, true: true })
// The example position, as a hue: 0–100% of the track is 0–360°.
const hue = instance.getEnum('progress', { '0': 0, '25': 90, '50': 180, '75': 270, '100': 360 })

export default {
  example: double
    ? figma.code`<ColorRangeSlider channel="hue" label="Hues" defaultValue={[0, 360]}${indicator ? ' showSwatches' : ''}${disabled ? ' isDisabled' : ''} />`
    : figma.code`<ColorSlider channel="hue" label="Hue" defaultValue="hsl(${hue}, 100%, 50%)"${disabled ? ' isDisabled' : ''} />`,
  imports: double ? ['import { ColorRangeSlider } from "themis-ds"'] : ['import { ColorSlider } from "themis-ds"'],
  id: 'color-slider',
  metadata: { nestable: true },
}
