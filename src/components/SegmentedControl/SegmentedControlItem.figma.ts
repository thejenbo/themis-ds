// url=https://www.figma.com/design/tRoAewIghL1YbnTio6fkkw/Themis-Design-System?node-id=2052-12657
// source=src/components/SegmentedControl/SegmentedControl.tsx
// component=SegmentedControlItem
import figma from 'figma'
const instance = figma.selectedInstance

// size, selected, left and right are not item props in code: size comes from the parent SegmentedControl,
// selection from its `defaultSelectedKey`, and the end rounding from the item's position in the row.
// Hovered and focused come from interaction, not props.
const state = instance.getEnum('state', {
  default: 'default',
  hovered: 'default',
  focused: 'default',
  disabled: 'disabled',
})

// The label sits in the "Content" slot. Use its text when it's still the default text layer, else the slot itself.
const labelLayer = instance.findText('cm')
const label = labelLayer.type === 'TEXT' ? labelLayer.textContent : undefined
const content = label ? undefined : instance.getSlot('Content')
// `id` is required in code; derive it from the label ("cm" → "cm").
const id = label ? label.trim().toLowerCase().replace(/\s+/g, '-') : 'option'

export default {
  example: figma.code`<SegmentedControlItem id="${id}"${state === 'disabled' ? ' isDisabled' : ''}>${label ? label : figma.code`${content}`}</SegmentedControlItem>`,
  imports: ['import { SegmentedControlItem } from "themis-ds"'],
  id: 'segmented-control-item',
  metadata: { nestable: true },
}
