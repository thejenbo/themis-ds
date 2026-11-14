// url=https://www.figma.com/design/tRoAewIghL1YbnTio6fkkw/Themis-Design-System?node-id=2248-16469
// source=src/components/Checkbox/Checkbox.tsx
// component=Checkbox
import figma from 'figma'
const instance = figma.selectedInstance

// Focused comes from interaction, not props.
const state = instance.getEnum('state', {
  default: 'default',
  focused: 'default',
  errored: 'errored',
  disabled: 'disabled',
})
// Unchecked is the code default.
const checked = instance.getEnum('selected', { false: undefined, true: 'selected', indeterminate: 'indeterminate' })

const labelLayer = instance.findText('please send me lots and lots and lots of emails')
const label = labelLayer.type === 'TEXT' ? labelLayer.textContent : 'Checkbox'
const errorLayer = state === 'errored' ? instance.findText('helpful error message :-)') : undefined
const errorMessage = errorLayer && errorLayer.type === 'TEXT' ? errorLayer.textContent : ''
const children = /[{}<>]/.test(label) ? `{${JSON.stringify(label)}}` : label

export default {
  example: figma.code`<Checkbox${checked === 'selected' ? ' defaultSelected' : ''}${
    checked === 'indeterminate' ? ' isIndeterminate' : ''
  }${state === 'errored' ? ' isInvalid' : ''}${
    errorMessage ? (errorMessage.includes('"') ? ` errorMessage={${JSON.stringify(errorMessage)}}` : ` errorMessage="${errorMessage}"`) : ''
  }${state === 'disabled' ? ' isDisabled' : ''}>
  ${children}
</Checkbox>`,
  imports: ['import { Checkbox } from "themis-ds"'],
  id: 'checkbox',
  metadata: { nestable: true },
}
