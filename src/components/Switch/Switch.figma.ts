// url=https://www.figma.com/design/tRoAewIghL1YbnTio6fkkw/Themis-Design-System?node-id=2052-12425
// source=src/components/Switch/Switch.tsx
// component=Switch
import figma from 'figma'
const instance = figma.selectedInstance

// Figma `selected` is the starting state, so it maps to the uncontrolled `defaultSelected`.
const selected = instance.getEnum('selected', { true: true, false: false })
const size = instance.getEnum('size', { micro: 'micro', small: undefined, medium: 'medium' })
const labelPosition = instance.getEnum('label position', { right: undefined, left: 'left' })
// Hovered and focused come from interaction, not props.
const state = instance.getEnum('state', {
  default: 'default',
  hovered: 'default',
  focused: 'default',
  disabled: 'disabled',
})
const hasDescription = instance.getEnum('description', { true: true, false: false })
const description = hasDescription ? instance.getString('Description text') : undefined
const label = instance.getString('Label')

export default {
  example: figma.code`<Switch${size ? ` size="${size}"` : ''}${labelPosition ? ` labelPosition="${labelPosition}"` : ''}${
    description ? ` description="${description}"` : ''
  }${selected ? ' defaultSelected' : ''}${state === 'disabled' ? ' isDisabled' : ''}>
  ${label}
</Switch>`,
  imports: ['import { Switch } from "themis-ds"'],
  id: 'switch',
  metadata: { nestable: true },
}
