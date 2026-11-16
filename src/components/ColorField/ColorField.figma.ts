// url=https://www.figma.com/design/tRoAewIghL1YbnTio6fkkw/Themis-Design-System?node-id=2359-684
// source=src/components/ColorField/ColorField.tsx
// component=ColorField
import figma from 'figma'
const instance = figma.selectedInstance

// Focused is interaction. The label and error come from the nested "Input Base"; `yourColor` is a placeholder.
const state = instance.getEnum('state', { default: 'default', focused: 'default', errored: 'errored', disabled: 'disabled' })
const formats = instance.getEnum('formats', { true: true, false: false })

const base = instance.findInstance('Input Base')
function readText(layerName: string, fallback: string): string {
  if (base.type !== 'INSTANCE') return fallback
  const layer = base.findText(layerName, { traverseInstances: true })
  return layer.type === 'TEXT' ? layer.textContent : fallback
}
const label = readText('label', 'Color')
const error = readText('a helpful error message :-)', 'Enter a color code, e.g. #7A1FEB')

export default {
  example: figma.code`<ColorField label="${label}" defaultValue={yourColor}${formats ? ` formats={['hex', 'rgb', 'hsl', 'hsb']}` : ''}${state === 'errored' ? ` isInvalid errorMessage="${error}"` : ''}${state === 'disabled' ? ' isDisabled' : ''} />`,
  imports: ['import { ColorField } from "themis-ds"'],
  id: 'color-field',
  metadata: { nestable: true },
}
