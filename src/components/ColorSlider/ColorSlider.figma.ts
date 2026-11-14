// url=https://www.figma.com/design/tRoAewIghL1YbnTio6fkkw/Themis-Design-System?node-id=1909-994
// source=src/components/ColorSlider/ColorSlider.tsx
// component=ColorSlider
import figma from 'figma'
const instance = figma.selectedInstance

// Figma draws a hue slider, so the snippet uses `channel="hue"`. `focused` is interaction.
const disabled = instance.getEnum('state', { default: false, focused: false, disabled: true })
// The example position, as a hue: 0–100% of the track is 0–360°.
const hue = instance.getEnum('progress', { '0': 0, '25': 90, '50': 180, '75': 270, '100': 360 })
const showLabel = instance.getBoolean('showLabel')
const showValue = instance.getBoolean('showValue')
const label = instance.getString('Label')

export default {
  example: figma.code`<ColorSlider channel="hue"${showLabel ? ` label="${label}"` : ''}${showLabel && !showValue ? ' showValue={false}' : ''} defaultValue="hsl(${hue}, 100%, 50%)"${disabled ? ' isDisabled' : ''} />`,
  imports: ['import { ColorSlider } from "themis-ds"'],
  id: 'color-slider',
  metadata: { nestable: true },
}
