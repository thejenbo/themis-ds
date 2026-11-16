// url=https://www.figma.com/design/tRoAewIghL1YbnTio6fkkw/Themis-Design-System?node-id=1544-6241
// source=src/components/Icon/Icon.tsx
// component=Icon
import figma from 'figma'
const instance = figma.selectedInstance

// The Figma Icons set still has its placeholder names; each maps to the matching icon in the Themis set. Every
// Figma icon is listed so none renders as undefined. Size is left out: inside components icons are `small`, the
// default. (This template moves next to Icon once the Figma set is rebuilt under the Themis names.)
const name = instance.getEnum('variant', {
  heart: 'heart',
  close: 'x',
  check: 'check',
  'caret-down': 'chevron-down',
  warning: 'triangle-alert',
  shuffle: 'shuffle',
  'caret-up-down': 'chevrons-up-down',
  kebab: 'ellipsis-vertical',
  'arrow-up': 'arrow-up',
  'arrow-down': 'arrow-down',
})

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ['import { Icon } from "themis-ds"'],
  id: 'icon',
  metadata: { nestable: true },
}
