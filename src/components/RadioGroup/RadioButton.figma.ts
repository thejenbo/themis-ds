// url=https://www.figma.com/design/tRoAewIghL1YbnTio6fkkw/Themis-Design-System?node-id=2248-16511
// source=src/components/RadioGroup/RadioGroup.tsx
// component=Radio
import figma from 'figma'
const instance = figma.selectedInstance

// Focused comes from interaction, not props. `Selected` is set on the RadioGroup (`defaultValue`), so it is passed
// up in metadata instead of shown here.
const state = instance.getEnum('state', { default: 'default', focused: 'default', disabled: 'disabled' })
const selected = instance.getEnum('selected', { true: true, false: false })

// The label layer is named after its sample text, which differs between the selected and unselected variants.
const labelLayer = instance.findText(selected ? 'no, choose me!' : 'choose me!')
const label = labelLayer.type === 'TEXT' ? labelLayer.textContent : 'Option'
// Each Radio needs a `value`; derive one from the label.
const value =
  label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'option'
const children = /[{}<>]/.test(label) ? `{${JSON.stringify(label)}}` : label
const isDisabled = state === 'disabled'

export default {
  example: figma.code`<Radio value="${value}"${isDisabled ? ' isDisabled' : ''}>${children}</Radio>`,
  imports: ['import { Radio } from "themis-ds"'],
  id: 'radio',
  // RadioGroup templates read these to list the options and set the chosen one.
  metadata: { nestable: true, props: { label, value, selected, isDisabled } },
}
