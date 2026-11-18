// url=https://www.figma.com/design/tRoAewIghL1YbnTio6fkkw/Themis-Design-System?node-id=1502-145
// source=src/components/Select/Select.tsx
// component=SelectItem
import figma from 'figma'
const instance = figma.selectedInstance

// Hovered and focused come from interaction, not props. `selected` is set on the parent (Select `defaultValue`),
// so it is passed up in metadata instead of shown here.
const state = instance.getEnum('state', {
  default: 'default',
  hovered: 'default',
  focused: 'default',
  disabled: 'disabled',
})
const selected = instance.getEnum('selected', { true: true, false: false })

const labelLayer = instance.findText('option')
const label = labelLayer.type === 'TEXT' ? labelLayer.textContent : 'Option'
// Items need a unique `id`; derive one from the label.
const id =
  label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'option'
const children = /[{}<>]/.test(label) ? `{${JSON.stringify(label)}}` : label
const isDisabled = state === 'disabled'

// iconLeft=true: the icon is a nested Icons instance, not a component property, so find it by type.
const hasIcon = instance.getEnum('iconLeft', { true: true, false: false })
let icon: string | undefined
if (hasIcon) {
  const iconLayer = instance.findLayers((node) => node.type === 'INSTANCE')[0]
  if (iconLayer && iconLayer.type === 'INSTANCE') {
    const meta = iconLayer.executeTemplate().metadata
    icon = meta && meta.props && typeof meta.props.name === 'string' ? meta.props.name : undefined
  }
}
const iconAttr = icon ? ` icon={<Icon name="${icon}" />}` : ''

export default {
  example: figma.code`<SelectItem id="${id}"${iconAttr}${isDisabled ? ' isDisabled' : ''}>${children}</SelectItem>`,
  imports: [icon ? 'import { Icon, SelectItem } from "themis-ds"' : 'import { SelectItem } from "themis-ds"'],
  id: 'dropdown-option',
  // Select, ComboBox and UnitInput read these to render their own item component (SelectItem, ComboBoxItem,
  // UnitInputItem) and to set the chosen option.
  metadata: { nestable: true, props: { label, id, selected, isDisabled, icon } },
}
