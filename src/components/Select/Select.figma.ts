// url=https://www.figma.com/design/tRoAewIghL1YbnTio6fkkw/Themis-Design-System?node-id=1838-8009
// source=src/components/Select/Select.tsx
// component=Select
import figma from 'figma'
const instance = figma.selectedInstance

// Focused and opened come from interaction, not props.
const state = instance.getEnum('state', {
  default: 'default',
  focused: 'default',
  opened: 'default',
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
function slug(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'option'
  )
}

const label = readText('label', 'Label')
const content = readText('input content', '')
const description = hasDescription ? readText('here’s some helpful context!', '') : ''
const errorMessage = state === 'errored' ? readText('a helpful error message :-)', '') : ''

// The open variants show "Dropdown Option" instances; their template passes label/id/selected up in metadata.
type OptionProps = { label: string; id: string; selected: boolean; isDisabled: boolean }
const options: OptionProps[] = []
if (base.type === 'INSTANCE') {
  base
    .findConnectedInstances((node) => node.codeConnectId() === 'dropdown-option', { traverseInstances: true })
    .forEach((node) => {
      if (node.type !== 'INSTANCE') return
      const meta = node.executeTemplate().metadata
      if (meta && meta.props) options.push(meta.props as OptionProps)
    })
}
const items = options.length
  ? options
      .map(
        (o) =>
          `  <SelectItem id="${o.id}"${o.isDisabled ? ' isDisabled' : ''}>${
            /[{}<>]/.test(o.label) ? `{${JSON.stringify(o.label)}}` : o.label
          }</SelectItem>`,
      )
      .join('\n')
  : '  {/* SelectItem options */}'
const chosen = options.find((o) => o.selected)
const defaultValue = chosen ? chosen.id : !isEmpty && content ? slug(content) : undefined

export default {
  example: figma.code`<Select${attr('label', label)}${isEmpty && content ? attr('placeholder', content) : ''}${
    defaultValue ? attr('defaultValue', defaultValue) : ''
  }${description ? attr('description', description) : ''}${state === 'errored' ? ' isInvalid' : ''}${
    errorMessage ? attr('errorMessage', errorMessage) : ''
  }${state === 'disabled' ? ' isDisabled' : ''}>
${items}
</Select>`,
  imports: ['import { Select, SelectItem } from "themis-ds"'],
  id: 'select',
  metadata: { nestable: true },
}
