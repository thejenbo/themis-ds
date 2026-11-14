// url=https://www.figma.com/design/tRoAewIghL1YbnTio6fkkw/Themis-Design-System?node-id=1843-2158
// source=src/components/NumberInput/NumberInput.tsx
// component=NumberInput
import figma from 'figma'
const instance = figma.selectedInstance

// Focused comes from interaction, not props.
const state = instance.getEnum('state', {
  default: 'default',
  focused: 'default',
  errored: 'errored',
  disabled: 'disabled',
})
const hasDescription = instance.getEnum('description', { true: true, false: false })
const isEmpty = instance.getEnum('empty', { true: true, false: false })

// Label, value, help text and error are text layers inside the nested "Input Base" / "Input Box".
const base = instance.findInstance('Input Base')
function readText(layerName: string, fallback: string): string {
  if (base.type !== 'INSTANCE') return fallback
  const layer = base.findText(layerName, { traverseInstances: true })
  return layer.type === 'TEXT' ? layer.textContent : fallback
}
function attr(name: string, value: string): string {
  return value.includes('"') ? ` ${name}={${JSON.stringify(value)}}` : ` ${name}="${value}"`
}

const label = readText('label', 'Label')
const content = readText('input content', '')
const description = hasDescription ? readText('here’s some helpful context!', '') : ''
const errorMessage = state === 'errored' ? readText('a helpful error message :-)', '') : ''
// The value is a number in code; a non-numeric mock value is left out.
const value = !isEmpty && content.trim() !== '' ? Number(content.replace(/,/g, '')) : NaN

export default {
  example: figma.code`<NumberInput${attr('label', label)}${isEmpty && content ? attr('placeholder', content) : ''}${
    Number.isFinite(value) ? ` defaultValue={${value}}` : ''
  }${description ? attr('description', description) : ''}${state === 'errored' ? ' isInvalid' : ''}${
    errorMessage ? attr('errorMessage', errorMessage) : ''
  }${state === 'disabled' ? ' isDisabled' : ''} />`,
  imports: ['import { NumberInput } from "themis-ds"'],
  id: 'number-input',
  metadata: { nestable: true },
}
