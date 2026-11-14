// url=https://www.figma.com/design/tRoAewIghL1YbnTio6fkkw/Themis-Design-System?node-id=2052-12626
// source=src/components/SegmentedControl/SegmentedControl.tsx
// component=SegmentedControl
import figma from 'figma'
const instance = figma.selectedInstance

const size = instance.getEnum('size', { micro: 'micro', small: undefined, medium: 'medium' })
const state = instance.getEnum('state', { default: 'default', disabled: 'disabled' })
const items = instance.getSlot('Items')

// aria-label (or aria-labelledby) is required in code but Figma has no name for it: "Options" is a placeholder.
// Which item starts selected (`defaultSelectedKey`) isn't read from Figma; set it to one of the item ids.
export default {
  example: figma.code`<SegmentedControl aria-label="Options"${size ? ` size="${size}"` : ''}${state === 'disabled' ? ' isDisabled' : ''}>
  ${items}
</SegmentedControl>`,
  imports: ['import { SegmentedControl } from "themis-ds"'],
  id: 'segmented-control',
  metadata: { nestable: true },
}
