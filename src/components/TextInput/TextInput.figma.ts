// url=https://www.figma.com/design/tRoAewIghL1YbnTio6fkkw/Themis-Design-System?node-id=607-74
// source=src/components/TextInput/TextInput.tsx
// component=TextInput
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
const hasIcon = instance.getEnum('iconRight', { true: true, false: false })
const hasCharLimit = instance.getEnum('charLimit', { true: true, false: false })
const isErrored = state === 'errored' || state === 'charLimitErrored'

// Label, value, help text, count and error are text layers inside the nested "Input Base" / "Input Box".
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

// In the errored variants the Icon Right slot holds the error icon, which the component adds by itself.
const box = base.type === 'INSTANCE' ? base.findInstance('Input Box', { traverseInstances: true }) : undefined
// The icon is found by Code Connect id: the slot comes back empty this deep in nested instances.
function boxIcon() {
  if (!box || box.type !== 'INSTANCE') return undefined
  const found = box.findConnectedInstances((node) => node.codeConnectId() === 'icon', { traverseInstances: true })
  const last = found[found.length - 1]
  return last && last.type === 'INSTANCE' ? last.executeTemplate().example : box.getSlot('Icon Right')
}
const icon = hasIcon && !isErrored ? boxIcon() : undefined

export default {
  example: figma.code`<TextInput${attr('label', label)}${isEmpty && content ? attr('placeholder', content) : ''}${
    !isEmpty && content ? attr('defaultValue', content) : ''
  }${description ? attr('description', description) : ''}${characterLimit ? ` characterLimit={${characterLimit}}` : ''}${
    icon ? figma.code` icon={${icon}}` : ''
  }${state === 'errored' ? ' isInvalid' : ''}${errorMessage ? attr('errorMessage', errorMessage) : ''}${
    state === 'disabled' ? ' isDisabled' : ''
  } />`,
  imports: ['import { TextInput } from "themis-ds"'],
  id: 'text-input',
  metadata: { nestable: true },
}
