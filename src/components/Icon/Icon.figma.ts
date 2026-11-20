// url=https://www.figma.com/design/tRoAewIghL1YbnTio6fkkw/Themis-Design-System?node-id=1544-6241
// source=src/components/Icon/Icon.tsx
// component=Icon
import figma from 'figma'
const instance = figma.selectedInstance

// Figma's `name` values are the code names. Every one is listed so none renders as undefined. Size is left out:
// inside components icons are `small`, the default.
const name = instance.getEnum('name', {
  'arrow-down': 'arrow-down',
  'arrow-up': 'arrow-up',
  bell: 'bell',
  calendar: 'calendar',
  'caret-down': 'caret-down',
  check: 'check',
  'chevron-down': 'chevron-down',
  'chevron-up': 'chevron-up',
  'chevrons-up-down': 'chevrons-up-down',
  'circle-alert': 'circle-alert',
  'circle-check': 'circle-check',
  copy: 'copy',
  'credit-card': 'credit-card',
  download: 'download',
  'ellipsis-vertical': 'ellipsis-vertical',
  'external-link': 'external-link',
  folder: 'folder',
  heart: 'heart',
  info: 'info',
  mail: 'mail',
  menu: 'menu',
  minus: 'minus',
  plus: 'plus',
  search: 'search',
  settings: 'settings',
  shuffle: 'shuffle',
  trash: 'trash',
  'triangle-alert': 'triangle-alert',
  upload: 'upload',
  user: 'user',
  x: 'x',
})

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ['import { Icon } from "themis-ds"'],
  id: 'icon',
  // Parents that build their own markup (e.g. Dropdown Option inside Select) read the name from here.
  metadata: { nestable: true, props: { name } },
}
