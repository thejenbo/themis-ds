// url=https://www.figma.com/design/tRoAewIghL1YbnTio6fkkw/Themis-Design-System?node-id=2092-18091
// source=src/components/ToggleButton/ToggleButton.tsx
// component=ToggleButton
import figma from 'figma'
const instance = figma.selectedInstance

// Figma `selected` is the starting state, so it maps to the uncontrolled `defaultSelected`
// (a bare `isSelected` without `onChange` would freeze the toggle).
const selected = instance.getEnum('selected', { true: true, false: false })
const size = instance.getEnum('size', { micro: 'micro', small: undefined, medium: 'medium' })
// Hovered and focused come from interaction, not props.
const state = instance.getEnum('state', {
  default: 'default',
  hovered: 'default',
  focused: 'default',
  disabled: 'disabled',
})
const hasIconLeft = instance.getEnum('iconLeft', { true: true, false: false })
const hasIconRight = instance.getEnum('iconRight', { true: true, false: false })

// The "Toggle Content" slot holds the icon and the label together, so they are read separately here.
const iconLayer = hasIconLeft || hasIconRight ? instance.findInstance('Icons') : undefined
const icon = iconLayer && iconLayer.type === 'INSTANCE' ? iconLayer.executeTemplate().example : undefined

const labelLayer = instance.findText('Label')
const label = labelLayer.type === 'TEXT' ? labelLayer.textContent : 'Toggle'

export default {
  example: figma.code`<ToggleButton${size ? ` size="${size}"` : ''}${hasIconLeft && icon ? figma.code` iconLeft={${icon}}` : ''}${
    hasIconRight && icon ? figma.code` iconRight={${icon}}` : ''
  }${selected ? ' defaultSelected' : ''}${state === 'disabled' ? ' isDisabled' : ''}>
  ${label}
</ToggleButton>`,
  imports: ['import { ToggleButton } from "themis-ds"'],
  id: 'toggle-button',
  metadata: { nestable: true },
}
