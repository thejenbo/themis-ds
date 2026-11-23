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

// trailing=true: content after the label (the "Trailing" slot), such as an external-link icon. It goes in the children.
const hasTrailing = instance.getBoolean('trailing')

// Icons are found by Code Connect id: "Icon Left" comes before "Trailing" in the layers, so the left icon is the first
// found and a trailing icon the one after it. The slots are the fallback (e.g. trailing content that isn't an icon).
const icons = instance.findConnectedInstances((node) => node.codeConnectId() === 'icon', { traverseInstances: true })
function iconAt(index: number, slotName: string) {
  const found = icons[index]
  return found && found.type === 'INSTANCE' ? found.executeTemplate().example : instance.getSlot(slotName)
}
const icon = hasIcon ? iconAt(0, 'Icon Left') : undefined
const trailing = hasTrailing ? iconAt(hasIcon ? 1 : 0, 'Trailing') : undefined

const labelLayer = instance.findText('Menu Item')
const label = labelLayer.type === 'TEXT' ? labelLayer.textContent : 'Menu Item'
const id = label
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '')

export default {
  example: figma.code`<ActionMenuItem id="${id}"${icon ? figma.code` icon={${icon}}` : ''}${isDanger ? ' isDanger' : ''}${
    state === 'disabled' ? ' isDisabled' : ''
  }${trailing ? ` textValue="${label}"` : ''}>
  ${trailing ? figma.code`${label}
  ${trailing}` : label}
</ActionMenuItem>`,
  imports: ['import { ActionMenuItem } from "themis-ds"'],
  id: 'action-menu-item',
  metadata: { nestable: true },
}
