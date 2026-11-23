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

// iconLeft=true: the "Icon Left" slot holds an Icon (found by Code Connect id) or other decorative content, such as
// color dots, which falls back to the slot itself.
const hasIcon = instance.getEnum('iconLeft', { true: true, false: false })
let icon: string | undefined
let iconSlot
if (hasIcon) {
  const iconLayer = instance.findConnectedInstances((node) => node.codeConnectId() === 'icon', { traverseInstances: true })[0]
  if (iconLayer && iconLayer.type === 'INSTANCE') {
    const meta = iconLayer.executeTemplate().metadata
    icon = meta && meta.props && typeof meta.props.name === 'string' ? meta.props.name : undefined
  } else {
    iconSlot = instance.getSlot('Icon Left')
  }
}
const iconAttr = icon ? ` icon={<Icon name="${icon}" />}` : ''

// trailing=true: extra content after the label (the "Trailing" slot), e.g. a font's category in muted caption text.
// It becomes part of the children; a plain text layer is shown as a span, anything else as the slot.
const hasTrailing = instance.getBoolean('trailing')
const detailLayer = hasTrailing ? instance.findText('detail') : undefined
const detail = detailLayer && detailLayer.type === 'TEXT' ? detailLayer.textContent : undefined

export default {
  example: hasTrailing
    ? figma.code`<SelectItem id="${id}" textValue="${label}"${iconAttr}${iconSlot ? figma.code` icon={${iconSlot}}` : ''}${isDisabled ? ' isDisabled' : ''}>
  ${children}
  ${detail !== undefined ? `<span>${detail}</span>` : instance.getSlot('Trailing')}
</SelectItem>`
    : figma.code`<SelectItem id="${id}"${iconAttr}${iconSlot ? figma.code` icon={${iconSlot}}` : ''}${isDisabled ? ' isDisabled' : ''}>${children}</SelectItem>`,
  imports: [icon ? 'import { Icon, SelectItem } from "themis-ds"' : 'import { SelectItem } from "themis-ds"'],
  id: 'dropdown-option',
  // Select, ComboBox and UnitInput read these to render their own item component (SelectItem, ComboBoxItem,
  // UnitInputItem) and to set the chosen option.
  metadata: { nestable: true, props: { label, id, selected, isDisabled, icon } },
}
