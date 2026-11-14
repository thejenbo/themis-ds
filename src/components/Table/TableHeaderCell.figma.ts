// url=https://www.figma.com/design/tRoAewIghL1YbnTio6fkkw/Themis-Design-System?node-id=1493-95
// source=src/components/Table/Table.tsx
// component=Column
import figma from 'figma'
const instance = figma.selectedInstance

// A sorted heading is a sortable Column; the direction itself lives on the Table's `sortDescriptor`,
// which the Table template builds from these cells' metadata.
const sorting = instance.getEnum('sorting', { none: undefined, asc: 'ascending', desc: 'descending' })
// sortable=true: the heading is a sort button (with sorting=none it can be sorted but isn't yet).
const sortable = instance.getEnum('sortable', { true: true, false: false })
// `state` is left out: hovered and focused come from interaction, not props.

const labelLayer = instance.findText('Date')
const label = labelLayer.type === 'TEXT' ? labelLayer.textContent : 'Column'
const id = label
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '')

export default {
  example: figma.code`<Column id="${id}"${sortable ? ' allowsSorting' : ''}>${label}</Column>`,
  imports: ['import { Column } from "themis-ds"'],
  id: 'table-header-cell',
  metadata: { nestable: true, props: { columnId: id, sortDirection: sorting } },
}
