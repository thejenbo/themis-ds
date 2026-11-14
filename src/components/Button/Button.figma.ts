// url=https://www.figma.com/design/tRoAewIghL1YbnTio6fkkw/Themis-Design-System?node-id=1010-80
// source=src/components/Button/Button.tsx
// component=Button
import figma from 'figma'
const instance = figma.selectedInstance

// Defaults (brand, default, small) are left out so the snippet shows only what differs.
const tone = instance.getEnum('tone', {
  brand: undefined,
  neutral: 'neutral',
  danger: 'danger',
  warning: 'warning',
  success: 'success',
})
const variant = instance.getEnum('variant', { default: undefined, outline: 'outline', subtle: 'subtle' })
const size = instance.getEnum('size', { micro: 'micro', small: undefined, medium: 'medium' })
// Hovered and focused come from interaction, not props.
const state = instance.getEnum('state', {
  default: 'default',
  hovered: 'default',
  focused: 'default',
  disabled: 'disabled',
  pending: 'pending',
})
const hasIconLeft = instance.getEnum('iconLeft', { true: true, false: false })
const hasIconRight = instance.getEnum('iconRight', { true: true, false: false })
// Icons are found by Code Connect id. Reading the slots directly either comes back empty or wraps the icon in a
// generated frame component. "Icon Left" comes before "Icon Right" in the layers, so left is the first icon found
// and right the last. The slot is the fallback.
const icons = instance.findConnectedInstances((node) => node.codeConnectId() === 'icon', { traverseInstances: true })
function iconAt(index: number, slotName: string) {
  const found = icons[index]
  return found && found.type === 'INSTANCE' ? found.executeTemplate().example : instance.getSlot(slotName)
}
const iconLeft = hasIconLeft ? iconAt(0, 'Icon Left') : undefined
const iconRight = hasIconRight ? iconAt(icons.length - 1, 'Icon Right') : undefined

const labelLayer = instance.findText('Click Me')
const label = labelLayer.type === 'TEXT' ? labelLayer.textContent : 'Button'

export default {
  example: figma.code`<Button${tone ? ` tone="${tone}"` : ''}${variant ? ` variant="${variant}"` : ''}${size ? ` size="${size}"` : ''}${
    iconLeft ? figma.code` iconLeft={${iconLeft}}` : ''
  }${iconRight ? figma.code` iconRight={${iconRight}}` : ''}${state === 'disabled' ? ' isDisabled' : ''}${
    state === 'pending' ? ' isPending' : ''
  }>
  ${label}
</Button>`,
  imports: ['import { Button } from "themis-ds"'],
  id: 'button',
  metadata: { nestable: true },
}
