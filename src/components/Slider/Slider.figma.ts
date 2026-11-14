// url=https://www.figma.com/design/tRoAewIghL1YbnTio6fkkw/Themis-Design-System?node-id=1874-2404
// source=src/components/Slider/Slider.tsx
// component=Slider
import figma from 'figma'
const instance = figma.selectedInstance

const label = instance.getString('Label')
// Figma `progress` is an example position, so it becomes the starting value. 0 is the code default (minValue).
const defaultValue = instance.getEnum('progress', { '0': undefined, '25': 25, '50': 50, '75': 75, '100': 100 })
// Focused comes from interaction, not props.
const state = instance.getEnum('state', { default: 'default', focused: 'default', disabled: 'disabled' })
// `indicator` (the value bubble) shows automatically while dragging and `stops` has no code equivalent,
// so neither is read here.

export default {
  example: figma.code`<Slider label="${label}"${defaultValue ? ` defaultValue={${defaultValue}}` : ''}${state === 'disabled' ? ' isDisabled' : ''} />`,
  imports: ['import { Slider } from "themis-ds"'],
  id: 'slider',
  metadata: { nestable: true },
}
