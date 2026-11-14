// url=https://www.figma.com/design/tRoAewIghL1YbnTio6fkkw/Themis-Design-System?node-id=2098-19172
// source=src/components/IconButton/IconButton.tsx
// component=IconButton
import figma from 'figma'
const instance = figma.selectedInstance

// Defaults (brand, default, small) are left out so the snippet shows only what differs.
const tone = instance.getEnum('tone', {
  brand: undefined,
  neutral: 'neutral',
  'neutral-inverse': 'neutral-inverse',
  danger: 'danger',
  success: 'success',
  warning: 'warning',
})
// neutral-inverse only exists with variant="subtle", and the code type requires it to be spelled out.
const variant =
  tone === 'neutral-inverse'
    ? 'subtle'
    : instance.getEnum('variant', { default: undefined, outline: 'outline', subtle: 'subtle' })
const size = instance.getEnum('size', { micro: 'micro', small: undefined, medium: 'medium' })
// Hovered and focused come from interaction, not props.
const state = instance.getEnum('state', {
  default: 'default',
  hovered: 'default',
  focused: 'default',
  disabled: 'disabled',
  pending: 'pending',
})
const icon = instance.getSlot('Button Content')

// aria-label is required in code but Figma has no name for it: "Action" is a placeholder.
// Replace it with what the button does, e.g. "Add to favourites".
export default {
  example: figma.code`<IconButton aria-label="Action"${tone ? ` tone="${tone}"` : ''}${variant ? ` variant="${variant}"` : ''}${
    size ? ` size="${size}"` : ''
  }${state === 'disabled' ? ' isDisabled' : ''}${state === 'pending' ? ' isPending' : ''}>
  ${icon}
</IconButton>`,
  imports: ['import { IconButton } from "themis-ds"'],
  id: 'icon-button',
  metadata: { nestable: true },
}
