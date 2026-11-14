// url=https://www.figma.com/design/tRoAewIghL1YbnTio6fkkw/Themis-Design-System?node-id=2194-12252
// source=src/components/ActionMenu/ActionMenu.tsx
// component=ActionMenuItem
import figma from 'figma'
const instance = figma.selectedInstance

// Hovered and focused come from interaction (both are the highlighted item), not props.
const state = instance.getEnum('state', {
  default: 'default',
  hovered: 'default',
  focused: 'default',
  disabled: 'disabled',
})
const isDanger = instance.getEnum('danger', { false: false, true: true })
const hasIcon = instance.getEnum('iconLeft', { true: true, false: false })

// The icon isn't a component property, so take the item's own instance layer, whatever it's called.
let icon
if (hasIcon) {
  const iconLayer = instance.findLayers((node) => node.type === 'INSTANCE')[0]
  if (iconLayer && iconLayer.type === 'INSTANCE') {
    icon = iconLayer.executeTemplate().example
  }
}

const labelLayer = instance.findText('Menu Item')
const label = labelLayer.type === 'TEXT' ? labelLayer.textContent : 'Menu Item'
const id = label
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '')

export default {
  example: figma.code`<ActionMenuItem id="${id}"${icon ? figma.code` icon={${icon}}` : ''}${isDanger ? ' isDanger' : ''}${
    state === 'disabled' ? ' isDisabled' : ''
  }>
  ${label}
</ActionMenuItem>`,
  imports: ['import { ActionMenuItem } from "themis-ds"'],
  id: 'action-menu-item',
  metadata: { nestable: true },
}
