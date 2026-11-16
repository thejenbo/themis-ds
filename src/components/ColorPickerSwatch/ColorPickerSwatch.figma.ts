// url=https://www.figma.com/design/tRoAewIghL1YbnTio6fkkw/Themis-Design-System?node-id=2359-405
// source=src/components/ColorPickerSwatch/ColorPickerSwatch.tsx
// component=ColorPickerSwatch
import figma from 'figma'
const instance = figma.selectedInstance

// Focused and pressed are interaction. The colour is the swatch's fill, which templates can't read: `yourColor` is a
// placeholder. "Pick a color" is a placeholder for what pressing does.
const size = instance.getEnum('size', { small: 'small', medium: 'medium', large: undefined })
const disabled = instance.getEnum('state', { default: false, focused: false, pressed: false, disabled: true })

export default {
  example: figma.code`<ColorPickerSwatch color={yourColor} aria-label="Pick a color"${size ? ` size="${size}"` : ''}${disabled ? ' isDisabled' : ''} />`,
  imports: ['import { ColorPickerSwatch } from "themis-ds"'],
  id: 'color-picker-swatch',
  metadata: { nestable: true },
}
