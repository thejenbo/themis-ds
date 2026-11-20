// url=https://www.figma.com/design/tRoAewIghL1YbnTio6fkkw/Themis-Design-System?node-id=2064-17412
// source=src/components/Tabs/Tabs.tsx
// component=Tabs
import figma from 'figma'
const instance = figma.selectedInstance

// "Tab Container" holds the Tab Items; "Tab Content" is the selected tab's panel.
// `full width` maps to isFullWidth.
const fullWidth = instance.getEnum('full width', { true: true, false: false })
const tabs = instance.getSlot('Tab Container')
const panel = instance.getSlot('Tab Content')

// aria-label on TabList is a placeholder; it's needed when the page has more than one set of tabs.
// Each Tab needs a TabPanel with a matching id: "tab-one" matches the default first Tab Item's id.
export default {
  example: figma.code`<Tabs${fullWidth ? ' isFullWidth' : ''}>
  <TabList aria-label="Sections">
    ${tabs}
  </TabList>
  <TabPanel id="tab-one">
    ${panel}
  </TabPanel>
</Tabs>`,
  imports: ['import { TabList, TabPanel, Tabs } from "themis-ds"'],
  id: 'tabs',
  metadata: { nestable: true },
}
