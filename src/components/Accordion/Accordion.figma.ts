// url=https://www.figma.com/design/tRoAewIghL1YbnTio6fkkw/Themis-Design-System?node-id=2064-17367
// source=src/components/Accordion/Accordion.tsx
// component=Accordion
import figma from 'figma'
const instance = figma.selectedInstance

// Figma `open` is the starting state, so it maps to the uncontrolled `defaultExpanded`.
const open = instance.getEnum('open', { true: true, false: false })
// Hovered and focused come from interaction, not props.
const state = instance.getEnum('state', {
  default: 'default',
  hovered: 'default',
  focused: 'default',
  disabled: 'disabled',
})

const titleLayer = instance.findText('Accordion Header')
const title = titleLayer.type === 'TEXT' ? titleLayer.textContent : 'Title'
const content = instance.getSlot('Accordion Content')

export default {
  example: figma.code`<Accordion title="${title}"${open ? ' defaultExpanded' : ''}${state === 'disabled' ? ' isDisabled' : ''}>
  ${content}
</Accordion>`,
  imports: ['import { Accordion } from "themis-ds"'],
  id: 'accordion',
  metadata: { nestable: true },
}
