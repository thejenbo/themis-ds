// url=https://www.figma.com/design/tRoAewIghL1YbnTio6fkkw/Themis-Design-System?node-id=2194-12854
// source=src/components/ActionMenu/ActionMenu.tsx
// component=ActionMenu
import figma from 'figma'
const instance = figma.selectedInstance

// `opened` is left out: it's interaction (the menu shows while open), not a prop. Items are only drawn when it's open.
const trigger = instance.getSlot('Trigger Button')

// The items sit inside the nested "ActionMenu Dropdown" instance.
const itemInstances = instance.findConnectedInstances((node) => node.codeConnectId() === 'action-menu-item', {
  traverseInstances: true,
})
let items
for (const item of itemInstances) {
  if (item.type === 'INSTANCE') {
    const example = item.executeTemplate().example
    items = items
      ? figma.code`${items}
    ${example}`
      : figma.code`
    ${example}`
  }
}

export default {
  example: figma.code`<ActionMenuTrigger>
  ${trigger}
  <ActionMenu onAction={(key) => {}}>${items ? items : figma.code`
    {/* ActionMenuItems */}`}
  </ActionMenu>
</ActionMenuTrigger>`,
  imports: ['import { ActionMenu, ActionMenuItem, ActionMenuTrigger } from "themis-ds"'],
  id: 'action-menu',
  metadata: { nestable: true },
}
