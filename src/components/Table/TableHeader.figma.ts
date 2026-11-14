// url=https://www.figma.com/design/tRoAewIghL1YbnTio6fkkw/Themis-Design-System?node-id=1490-42
// source=src/components/Table/Table.tsx
// component=TableHeader
import figma from 'figma'
const instance = figma.selectedInstance

// The header cells render through the Table Header Cell (Column) template. They're found by Code Connect id rather
// than through the "Table Header Cells" slot, because the slot comes back empty when the header is nested in a Table.
let cells
let sortColumn
let sortDirection
for (const cell of instance.findConnectedInstances((node) => node.codeConnectId() === 'table-header-cell')) {
  if (cell.type === 'INSTANCE') {
    const result = cell.executeTemplate()
    cells = cells
      ? figma.code`${cells}
  ${result.example}`
      : result.example
    // Pass the sorted column up to the Table template, for its `sortDescriptor`.
    const props = result.metadata?.props
    if (props && props.sortDirection) {
      sortColumn = props.columnId
      sortDirection = props.sortDirection
    }
  }
}
if (!cells) cells = instance.getSlot('Table Header Cells')

export default {
  example: figma.code`<TableHeader>
  ${cells}
</TableHeader>`,
  imports: ['import { Column, TableHeader } from "themis-ds"'],
  id: 'table-header',
  metadata: { nestable: true, props: { sortColumn, sortDirection } },
}
