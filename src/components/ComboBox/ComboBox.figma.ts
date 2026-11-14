// url=https://www.figma.com/design/tRoAewIghL1YbnTio6fkkw/Themis-Design-System?node-id=2231-15721
// source=src/components/ComboBox/ComboBox.tsx
// component=ComboBox
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
// noResults shows the list's empty text (`emptyText`) in place of the options.
const noResults = instance.getEnum('noResults', { true: true, false: false })

// Label, typed text, help text and error are text layers inside the nested "Input Base" / "Input Box".
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
// With noResults the only "option" is the empty text; only emit it when it differs from the code default.
const defaultEmptyText = 'no results found :-('
const emptyOption = noResults ? options[0] : undefined
const emptyText = emptyOption && emptyOption.label !== defaultEmptyText ? emptyOption.label : ''
const items =
  options.length && !noResults
    ? options
        .map(
          (o) =>
            `  <ComboBoxItem id="${o.id}"${o.isDisabled ? ' isDisabled' : ''}>${
              /[{}<>]/.test(o.label) ? `{${JSON.stringify(o.label)}}` : o.label
            }</ComboBoxItem>`,
        )
        .join('\n')
    : '  {/* ComboBoxItem options */}'

export default {
  example: figma.code`<ComboBox${attr('label', label)}${isEmpty && content ? attr('placeholder', content) : ''}${
    !isEmpty && content ? attr('defaultInputValue', content) : ''
  }${description ? attr('description', description) : ''}${emptyText ? attr('emptyText', emptyText) : ''}${
    state === 'errored' ? ' isInvalid' : ''
  }${errorMessage ? attr('errorMessage', errorMessage) : ''}${state === 'disabled' ? ' isDisabled' : ''}>
${items}
</ComboBox>`,
  imports: ['import { ComboBox, ComboBoxItem } from "themis-ds"'],
  id: 'combo-box',
  metadata: { nestable: true },
}
