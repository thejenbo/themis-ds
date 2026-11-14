// url=https://www.figma.com/design/tRoAewIghL1YbnTio6fkkw/Themis-Design-System?node-id=1544-6241
// component=Icon
import figma from 'figma'
const instance = figma.selectedInstance

// Themis has no icon library yet, so icons show as a named placeholder component (components take any ReactNode
// as an icon). Swap in your app's icon. Every Figma icon is listed so none renders as undefined.
const name = instance.getEnum('variant', {
  heart: 'HeartIcon',
  close: 'CloseIcon',
  check: 'CheckIcon',
  'caret-down': 'CaretDownIcon',
  warning: 'WarningIcon',
  shuffle: 'ShuffleIcon',
  'caret-up-down': 'CaretUpDownIcon',
  kebab: 'MoreIcon',
  'arrow-up': 'ArrowUpIcon',
  'arrow-down': 'ArrowDownIcon',
})

export default {
  example: figma.code`<${name} />`,
  id: 'icon',
  metadata: { nestable: true },
}
