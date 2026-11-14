// url=https://www.figma.com/design/tRoAewIghL1YbnTio6fkkw/Themis-Design-System?node-id=1846-1823
// source=src/components/UnitInput/UnitInput.tsx
// component=UnitInput
import figma from 'figma'
const instance = figma.selectedInstance

// inputFocused, selectFocused and opened come from interaction, not props.
const state = instance.getEnum('state', {
  default: 'default',
  inputFocused: 'default',
  selectFocused: 'default',
  opened: 'default',
  errored: 'errored',
  disabled: 'disabled',
})
const hasDescription = instance.getEnum('description', { true: true, false: false })
const isEmpty = instance.getEnum('empty', { true: true, false: false })

// Label, help text and error are in the nested "Input Base"; the number ("value") and the unit ("Unit") are in
// its "Unit Select Input Box".
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
      .replace(/^-+|-+$/g, '') || 'unit'
  )
}

const label = readText('label', 'Label')
const content = readText('value', '')
const unitText = readText('Unit', 'Unit')
const description = hasDescription ? readText('here’s some helpful context!', '') : ''
const errorMessage = state === 'errored' ? readText('a helpful error message :-)', '') : ''
// The value is a number in code; a non-numeric mock value is left out.
const value = !isEmpty && content.trim() !== '' ? Number(content.replace(/,/g, '')) : NaN

// The opened variants show "Dropdown Option" instances; their template passes label/id/selected up in metadata.
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
          `  <UnitInputItem id="${o.id}"${o.isDisabled ? ' isDisabled' : ''}>${
            /[{}<>]/.test(o.label) ? `{${JSON.stringify(o.label)}}` : o.label
          }</UnitInputItem>`,
      )
      .join('\n')
  : '  {/* UnitInputItem units */}'
// "Unit" is the code's default `unitPlaceholder` (no unit chosen); any other text is a chosen unit.
const chosen = options.find((o) => o.selected)
const defaultUnit = chosen ? chosen.id : unitText !== 'Unit' ? slug(unitText) : undefined

export default {
  example: figma.code`<UnitInput${attr('label', label)}${isEmpty && content ? attr('placeholder', content) : ''}${
    Number.isFinite(value) ? ` defaultValue={${value}}` : ''
  }${defaultUnit ? attr('defaultUnit', defaultUnit) : ''}${description ? attr('description', description) : ''}${
    state === 'errored' ? ' isInvalid' : ''
  }${errorMessage ? attr('errorMessage', errorMessage) : ''}${state === 'disabled' ? ' isDisabled' : ''}>
${items}
</UnitInput>`,
  imports: ['import { UnitInput, UnitInputItem } from "themis-ds"'],
  id: 'unit-input',
  metadata: { nestable: true },
}
