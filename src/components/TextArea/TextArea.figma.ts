// url=https://www.figma.com/design/tRoAewIghL1YbnTio6fkkw/Themis-Design-System?node-id=1843-8705
// source=src/components/TextArea/TextArea.tsx
// component=TextArea
import figma from 'figma'
const instance = figma.selectedInstance

// Focused comes from interaction, not props. charLimitErrored is typing past `characterLimit`: the field marks
// itself invalid, so it gets the error message but not `isInvalid`.
const state = instance.getEnum('state', {
  default: 'default',
  focused: 'default',
  errored: 'errored',
  charLimitErrored: 'charLimitErrored',
  disabled: 'disabled',
})
const hasDescription = instance.getEnum('description', { true: true, false: false })
const isEmpty = instance.getEnum('empty', { true: true, false: false })
const hasCharLimit = instance.getEnum('charLimit', { true: true, false: false })
const isErrored = state === 'errored' || state === 'charLimitErrored'

// Label, value, help text, count and error are text layers inside the nested "Input Base" / "Textarea Box".
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
const errorMessage = isErrored ? readText('a helpful error message :-)', '') : ''
// The count reads "0/150"; the number after the slash is the limit.
const countMatch = hasCharLimit ? /\/\s*(\d+)/.exec(readText('0/150', '')) : null
const characterLimit = countMatch ? countMatch[1] : undefined

export default {
  example: figma.code`<TextArea${attr('label', label)}${isEmpty && content ? attr('placeholder', content) : ''}${
    !isEmpty && content ? attr('defaultValue', content) : ''
  }${description ? attr('description', description) : ''}${characterLimit ? ` characterLimit={${characterLimit}}` : ''}${
    state === 'errored' ? ' isInvalid' : ''
  }${errorMessage ? attr('errorMessage', errorMessage) : ''}${state === 'disabled' ? ' isDisabled' : ''} />`,
  imports: ['import { TextArea } from "themis-ds"'],
  id: 'text-area',
  metadata: { nestable: true },
}
