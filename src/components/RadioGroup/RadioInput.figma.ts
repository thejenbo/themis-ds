// url=https://www.figma.com/design/tRoAewIghL1YbnTio6fkkw/Themis-Design-System?node-id=2248-16566
// source=src/components/RadioGroup/RadioGroup.tsx
// component=RadioGroup
import figma from 'figma'
const instance = figma.selectedInstance

// "Radio Input" is a RadioGroup with a visible label (the question).
const state = instance.getEnum('state', { default: 'default', errored: 'errored', disabled: 'disabled' })
// Vertical is the code default.
const orientation = instance.getEnum('layout', { vertical: undefined, horizontal: 'horizontal' })
const hasDescription = instance.getEnum('description', { true: true, false: false })

// Label, help text and error are text layers inside the nested "Input Base"; the options are the Radio Buttons in
// its nested "Radio Button Group".
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
const description = hasDescription ? readText('here’s some helpful context!', '') : ''
const errorMessage = state === 'errored' ? readText('a helpful error message :-)', '') : ''
const isDisabled = state === 'disabled'

type RadioMeta = { label: string; value: string; selected: boolean; isDisabled: boolean }
const radios: RadioMeta[] = []
if (base.type === 'INSTANCE') {
  base
    .findConnectedInstances((node) => node.codeConnectId() === 'radio', { traverseInstances: true })
    .forEach((node) => {
      if (node.type !== 'INSTANCE') return
      const meta = node.executeTemplate().metadata
      if (meta && meta.props) radios.push(meta.props as RadioMeta)
    })
}
const chosen = radios.find((r) => r.selected)
// A disabled group disables every Radio, so per-option isDisabled is only shown on an enabled group.
const items = radios.length
  ? radios
      .map(
        (r) =>
          `  <Radio value="${r.value}"${r.isDisabled && !isDisabled ? ' isDisabled' : ''}>${
            /[{}<>]/.test(r.label) ? `{${JSON.stringify(r.label)}}` : r.label
          }</Radio>`,
      )
      .join('\n')
  : '  {/* Radio options */}'

export default {
  example: figma.code`<RadioGroup${attr('label', label)}${orientation ? ` orientation="${orientation}"` : ''}${
    chosen ? ` defaultValue="${chosen.value}"` : ''
  }${description ? attr('description', description) : ''}${state === 'errored' ? ' isInvalid' : ''}${
    errorMessage ? attr('errorMessage', errorMessage) : ''
  }${isDisabled ? ' isDisabled' : ''}>
${items}
</RadioGroup>`,
  imports: ['import { Radio, RadioGroup } from "themis-ds"'],
  id: 'radio-input',
  metadata: { nestable: true },
}
