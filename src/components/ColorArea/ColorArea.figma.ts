// url=https://www.figma.com/design/tRoAewIghL1YbnTio6fkkw/Themis-Design-System?node-id=2335-273
// source=src/components/ColorArea/ColorArea.tsx
// component=ColorArea
import figma from 'figma'

const instance = figma.selectedInstance

// `focused` is interaction. aria-label is required in code but Figma has no name for it: "Color" is a placeholder,
// e.g. "Background color". `yourColor` is a placeholder for any CSS color string or React Aria `Color`.
const disabled = instance.getEnum('state', { default: false, focused: false, disabled: true })

export default {
  example: figma.code`<ColorArea aria-label="Color" defaultValue={yourColor}${disabled ? ' isDisabled' : ''} />`,
  imports: ['import { ColorArea } from "themis-ds"'],
  id: 'color-area',
  metadata: { nestable: true },
}
