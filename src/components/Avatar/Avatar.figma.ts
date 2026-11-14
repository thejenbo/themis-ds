// url=https://www.figma.com/design/tRoAewIghL1YbnTio6fkkw/Themis-Design-System?node-id=1875-2687
// source=src/components/Avatar/Avatar.tsx
// component=Avatar
import figma from 'figma'
const instance = figma.selectedInstance

// Defaults (md, solid) are left out so the snippet shows only what differs.
const size = instance.getEnum('size', { xs: 'xs', sm: 'sm', md: undefined, lg: 'lg', xl: 'xl' })
const variant = instance.getEnum('variant', { solid: undefined, outline: 'outline' })
const status = instance.getEnum('indicator', { true: 'online', false: undefined })
const hasImage = instance.getEnum('image', { true: true, false: false })

// The "Avatar Content" and "Indicator" slots are drawn by the component from `name`/`src` and `status`.
// `name` is required in code and Figma only has the initials: "Taylor Brooks" and the photo URL are placeholders.
const initialsLayer = instance.findText('T')
const initials = !hasImage && initialsLayer.type === 'TEXT' ? initialsLayer.textContent : undefined

export default {
  example: figma.code`<Avatar name="Taylor Brooks"${initials ? ` initials="${initials}"` : ''}${
    hasImage ? ' src="https://example.com/photo.jpg"' : ''
  }${size ? ` size="${size}"` : ''}${variant ? ` variant="${variant}"` : ''}${status ? ` status="${status}"` : ''} />`,
  imports: ['import { Avatar } from "themis-ds"'],
  id: 'avatar',
  metadata: { nestable: true },
}
