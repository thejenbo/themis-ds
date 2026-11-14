// url=https://www.figma.com/design/tRoAewIghL1YbnTio6fkkw/Themis-Design-System?node-id=1490-42
// source=src/components/Table/Table.tsx
// component=TableHeader
import figma from 'figma'
const instance = figma.selectedInstance

// The header cells render through the Table Header Cell (Column) template.
const cells = instance.getSlot('Table Header Cells')

// Pass the sorted column up to the Table template, for its `sortDescriptor`.
let sortColumn
let sortDirection
for (const cell of instance.findConnectedInstances((node) => node.codeConnectId() === 'table-header-cell')) {
  if (cell.type === 'INSTANCE') {
    const props = cell.executeTemplate().metadata?.props
    if (props && props.sortDirection) {
      sortColumn = props.columnId
      sortDirection = props.sortDirection
    }
  }
}

export default {
  example: figma.code`<TableHeader>
  ${cells}
</TableHeader>`,
  imports: ['import { Column, TableHeader } from "themis-ds"'],
  id: 'table-header',
  metadata: { nestable: true, props: { sortColumn, sortDirection } },
}
