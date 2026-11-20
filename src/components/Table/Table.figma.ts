// url=https://www.figma.com/design/tRoAewIghL1YbnTio6fkkw/Themis-Design-System?node-id=1457-6618
// source=src/components/Table/Table.tsx
// component=Table
import figma from 'figma'
const instance = figma.selectedInstance

// The "Table Contents" slot holds a Table Header and Table Rows. The rows go inside a TableBody, so the header
// and rows are found by their Code Connect ids rather than rendering the slot as one block.
let header
let sortColumn
let sortDirection
const headerInstance = instance.findConnectedInstance('table-header')
if (headerInstance && headerInstance.type === 'INSTANCE') {
  const result = headerInstance.executeTemplate()
  header = result.example
  sortColumn = result.metadata?.props?.sortColumn
  sortDirection = result.metadata?.props?.sortDirection
}

let rows
for (const row of instance.findConnectedInstances((node) => node.codeConnectId() === 'table-row')) {
  if (row.type === 'INSTANCE') {
    const example = row.executeTemplate().example
    rows = rows
      ? figma.code`${rows}
    ${example}`
      : figma.code`
    ${example}`
  }
}

// Fall back to the raw slot if nothing in it is connected.
const contents = header || rows ? undefined : instance.getSlot('Table Contents')

// Figma's `border` boolean is on by default; off is hideBorder.
const hideBorder = instance.getBoolean('border', { true: '', false: ' hideBorder' })

const sortProps = sortColumn
  ? ` sortDescriptor={{ column: "${sortColumn}", direction: "${sortDirection}" }} onSortChange={setSortDescriptor}`
  : ''

export default {
  example: contents
    ? figma.code`<Table aria-label="Describe this table"${hideBorder}${sortProps}>
  ${contents}
</Table>`
    : figma.code`<Table aria-label="Describe this table"${hideBorder}${sortProps}>
  ${header ? header : ''}
  <TableBody>${rows ? rows : ''}
  </TableBody>
</Table>`,
  imports: ['import { Cell, Column, Row, Table, TableBody, TableHeader } from "themis-ds"'],
  id: 'table',
  metadata: { nestable: true },
}
