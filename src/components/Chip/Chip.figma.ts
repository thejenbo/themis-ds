// url=https://www.figma.com/design/tRoAewIghL1YbnTio6fkkw/Themis-Design-System?node-id=2064-17447
// source=src/components/Chip/Chip.tsx
// component=Chip
import figma from 'figma'
const instance = figma.selectedInstance

// Defaults (neutral, outline) are left out so the snippet shows only what differs.
const tone = instance.getEnum('tone', {
  neutral: undefined,
  brand: 'brand',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
})
const variant = instance.getEnum('variant', { outline: undefined, solid: 'solid' })
const hasIconLeft = instance.getEnum('iconLeft', { true: true, false: false })
const hasIconRight = instance.getEnum('iconRight', { true: true, false: false })
const iconLeft = hasIconLeft ? instance.getSlot('Icon Left') : undefined
const iconRight = hasIconRight ? instance.getSlot('Icon Right') : undefined

// Each tone's variants name the label layer after its sample text.
const paid = instance.findText('paid')
const overdue = instance.findText('overdue')
const declined = instance.findText('declined')
const pending = instance.findText('pending')
const labelLayer = [paid, overdue, declined, pending].find((layer) => layer.type === 'TEXT')
const label = labelLayer && labelLayer.type === 'TEXT' ? labelLayer.textContent : 'Label'

export default {
  example: figma.code`<Chip${tone ? ` tone="${tone}"` : ''}${variant ? ` variant="${variant}"` : ''}${
    iconLeft ? figma.code` iconLeft={${iconLeft}}` : ''
  }${iconRight ? figma.code` iconRight={${iconRight}}` : ''}>
  ${label}
</Chip>`,
  imports: ['import { Chip } from "themis-ds"'],
  id: 'chip',
  metadata: { nestable: true },
}
