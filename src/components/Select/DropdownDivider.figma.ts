// url=https://www.figma.com/design/tRoAewIghL1YbnTio6fkkw/Themis-Design-System?node-id=2421-2384
// source=src/components/Select/Select.tsx
// component=SelectSeparator
import figma from 'figma'

// A plain 1px line: no properties. ComboBox lists use ComboBoxSeparator, which is the same component.
export default {
  example: figma.code`<SelectSeparator />`,
  imports: ['import { SelectSeparator } from "themis-ds"'],
  id: 'dropdown-divider',
  metadata: { nestable: true },
}
