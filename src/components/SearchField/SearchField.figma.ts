// url=https://www.figma.com/design/tRoAewIghL1YbnTio6fkkw/Themis-Design-System?node-id=2478-2802
// source=src/components/SearchField/SearchField.tsx
// component=SearchField
import figma from 'figma'
const instance = figma.selectedInstance

// Focused comes from interaction, not props.
const state = instance.getEnum('state', { default: 'default', focused: 'default', errored: 'errored', disabled: 'disabled' })
const hasDescription = instance.getEnum('description', { true: true, false: false })
const isEmpty = instance.getEnum('empty', { true: true, false: false })

// Label, help text and error are in the nested "Input Base"; the text and the search icon are in its "Search Box".
const base = instance.findInstance('Input Base')
function readText(layerName: string, fallback: string): string {
  if (base.type !== 'INSTANCE') return fallback
  const layer = base.findText(layerName, { traverseInstances: true })
  return layer.type === 'TEXT' ? layer.textContent : fallback
}
function attr(name: string, value: string): string {
  return value.includes('"') ? ` ${name}={${JSON.stringify(value)}}` : ` ${name}="${value}"`
}
const box = base.type === 'INSTANCE' ? base.findInstance('Search Box', { traverseInstances: true }) : undefined
const hideIcon = box && box.type === 'INSTANCE' ? box.getBoolean('searchIcon') === false : false

const label = readText('label', 'Search')
const content = readText('input content', '')
const description = hasDescription ? readText('here’s some helpful context!', '') : ''
const errorMessage = state === 'errored' ? readText('a helpful error message :-)', '') : ''

export default {
  example: figma.code`<SearchField${attr('label', label)}${isEmpty && content ? attr('placeholder', content) : ''}${
    !isEmpty && content ? attr('defaultValue', content) : ''
  }${description ? attr('description', description) : ''}${hideIcon ? ' hideIcon' : ''}${state === 'errored' ? ' isInvalid' : ''}${
    errorMessage ? attr('errorMessage', errorMessage) : ''
  }${state === 'disabled' ? ' isDisabled' : ''} />`,
  imports: ['import { SearchField } from "themis-ds"'],
  id: 'search-field',
  metadata: { nestable: true },
}
