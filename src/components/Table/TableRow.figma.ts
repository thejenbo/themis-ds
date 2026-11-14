// url=https://www.figma.com/design/tRoAewIghL1YbnTio6fkkw/Themis-Design-System?node-id=1491-55
// source=src/components/Table/Table.tsx
// component=Row
import figma from 'figma'
const instance = figma.selectedInstance

// `state` is left out: hovered and focused come from interaction, not props.
// action=true adds a last Cell holding an ActionMenu.
const hasAction = instance.getEnum('action', { false: false, true: true })

// One Cell per value layer, in order; the first names the row. The ActionMenu is handled separately below.
// (The "Action Button" slot properties share a name, so the cell layers are read directly instead.)
let cells
let index = 0
for (const layer of instance.findLayers(
  (node) => node.type === 'TEXT' || (node.name !== 'ActionMenu' && node.codeConnectId() !== 'action-menu'),
)) {
  let content
  if (layer.type === 'TEXT') content = layer.textContent
  else if (layer.type === 'INSTANCE') content = layer.executeTemplate().example
  else continue
  const cell = index === 0 ? figma.code`<Cell isRowHeader>${content}</Cell>` : figma.code`<Cell>${content}</Cell>`
  cells = cells
    ? figma.code`${cells}
  ${cell}`
    : figma.code`
  ${cell}`
  index++
}

let actionCell
if (hasAction) {
  const menu = instance.findConnectedInstance('action-menu')
  if (menu && menu.type === 'INSTANCE') {
    actionCell = figma.code`
  <Cell>
    ${menu.executeTemplate().example}
  </Cell>`
  }
}

export default {
  example: figma.code`<Row>${cells ? cells : ''}${actionCell ? actionCell : ''}
</Row>`,
  imports: ['import { Cell, Row } from "themis-ds"'],
  id: 'table-row',
  metadata: { nestable: true },
}
