// url=https://www.figma.com/design/tRoAewIghL1YbnTio6fkkw/Themis-Design-System?node-id=2335-733
// source=src/components/ColorRangeSlider/ColorRangeSlider.tsx
// component=ColorRangeSlider
import figma from 'figma'
const instance = figma.selectedInstance

// Figma draws a hue range from 90° to 270°. `focused` and the dragged thumb's size are interaction.
const disabled = instance.getEnum('state', { default: false, focused: false, disabled: true })
const showSwatches = instance.getEnum('showSwatches', { false: false, true: true })
const showLabel = instance.getBoolean('showLabel')
const showValue = instance.getBoolean('showValue')
const label = instance.getString('Label')

export default {
  example: figma.code`<ColorRangeSlider channel="hue"${showLabel ? ` label="${label}"` : ''}${showLabel && !showValue ? ' showValue={false}' : ''} defaultValue={[90, 270]}${showSwatches ? ' showSwatches' : ''}${disabled ? ' isDisabled' : ''} />`,
  imports: ['import { ColorRangeSlider } from "themis-ds"'],
  id: 'color-range-slider',
  metadata: { nestable: true },
}
