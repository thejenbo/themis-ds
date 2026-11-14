// url=https://www.figma.com/design/tRoAewIghL1YbnTio6fkkw/Themis-Design-System?node-id=2064-17395
// source=src/components/Tabs/Tabs.tsx
// component=Tab
import figma from 'figma'
const instance = figma.selectedInstance

// `active` is the selected tab: in code selection lives on Tabs (`defaultSelectedKey`, first tab by default),
// so it isn't a Tab prop. Hovered and focused come from interaction.
const state = instance.getEnum('state', {
  default: 'default',
  active: 'default',
  hovered: 'default',
  focused: 'default',
  disabled: 'disabled',
})

// The label is read from its text layer: the two "Tab Content" slots share a name, so getSlot can't tell them apart.
const labelLayer = instance.findText('tab one')
const label = labelLayer.type === 'TEXT' ? labelLayer.textContent : 'Tab'
// `id` is required in code and must match a TabPanel; derive it from the label ("tab one" → "tab-one").
const id = label.trim().toLowerCase().replace(/\s+/g, '-')

export default {
  example: figma.code`<Tab id="${id}"${state === 'disabled' ? ' isDisabled' : ''}>${label}</Tab>`,
  imports: ['import { Tab } from "themis-ds"'],
  id: 'tab',
  metadata: { nestable: true },
}
