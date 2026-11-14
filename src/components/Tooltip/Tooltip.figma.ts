// url=https://www.figma.com/design/tRoAewIghL1YbnTio6fkkw/Themis-Design-System?node-id=2064-17480
// source=src/components/Tooltip/Tooltip.tsx
// component=Tooltip
import figma from 'figma'
const instance = figma.selectedInstance

// Figma `position` is `placement`, with the same values. Top is the default, so it's left out.
const placement = instance.getEnum('position', {
  top: undefined,
  bottom: 'bottom',
  left: 'left',
  right: 'right',
  'top start': 'top start',
  'top end': 'top end',
  'bottom start': 'bottom start',
  'bottom end': 'bottom end',
})
const hasHeading = instance.getEnum('heading', { true: true, false: false })

// The "Tooltip Content" slot holds the heading and text layers; the code takes them as `title` and children.
const headingLayer = instance.findText('Tooltip Heading')
const title = headingLayer.type === 'TEXT' ? headingLayer.textContent : 'Tooltip heading'
const textLayer = instance.findText('Some extra info')
const text = textLayer.type === 'TEXT' ? textLayer.textContent : 'Tooltip text'

export default {
  example: figma.code`<Tooltip${placement ? ` placement="${placement}"` : ''}${hasHeading ? ` title="${title}"` : ''}>${text}</Tooltip>`,
  imports: ['import { Tooltip } from "themis-ds"'],
  id: 'tooltip',
  metadata: { nestable: true },
}
