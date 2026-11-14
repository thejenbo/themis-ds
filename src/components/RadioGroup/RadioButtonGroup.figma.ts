// url=https://www.figma.com/design/tRoAewIghL1YbnTio6fkkw/Themis-Design-System?node-id=2248-16533
// source=src/components/RadioGroup/RadioGroup.tsx
// component=RadioGroup
import figma from 'figma'
const instance = figma.selectedInstance

// "Radio Button Group" is a RadioGroup with no visible label, so it needs an `aria-label`.
// disabledErrored looks disabled but still carries the error.
const state = instance.getEnum('state', {
  default: 'default',
  disabled: 'disabled',
  errored: 'errored',
  disabledErrored: 'disabledErrored',
})
// Vertical is the code default.
const orientation = instance.getEnum('layout', { vertical: undefined, horizontal: 'horizontal' })
// `checked` (whether an option is chosen) comes from the Radio Buttons' own `Selected`, read below.
const isDisabled = state === 'disabled' || state === 'disabledErrored'
const isInvalid = state === 'errored' || state === 'disabledErrored'

type RadioMeta = { label: string; value: string; selected: boolean; isDisabled: boolean }
const radios: RadioMeta[] = []
instance
  .findConnectedInstances((node) => node.codeConnectId() === 'radio', { traverseInstances: true })
  .forEach((node) => {
    if (node.type !== 'INSTANCE') return
    const meta = node.executeTemplate().metadata
    if (meta && meta.props) radios.push(meta.props as RadioMeta)
  })
const chosen = radios.find((r) => r.selected)
// A disabled group disables every Radio, so per-option isDisabled is only shown on an enabled group.
const items = radios
  .map(
    (r) =>
      `  <Radio value="${r.value}"${r.isDisabled && !isDisabled ? ' isDisabled' : ''}>${
        /[{}<>]/.test(r.label) ? `{${JSON.stringify(r.label)}}` : r.label
      }</Radio>`,
  )
  .join('\n')
// Fall back to the slot when the radios aren't connected.
const slot = radios.length ? undefined : instance.getSlot('Radio Buttons')

export default {
  example: figma.code`<RadioGroup aria-label="Describe the choice"${orientation ? ` orientation="${orientation}"` : ''}${
    chosen ? ` defaultValue="${chosen.value}"` : ''
  }${isInvalid ? ' isInvalid' : ''}${isDisabled ? ' isDisabled' : ''}>
${slot ? figma.code`  ${slot}` : items}
</RadioGroup>`,
  imports: ['import { Radio, RadioGroup } from "themis-ds"'],
  id: 'radio-button-group',
  metadata: { nestable: true },
}
