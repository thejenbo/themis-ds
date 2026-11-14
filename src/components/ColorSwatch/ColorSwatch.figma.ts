// url=https://www.figma.com/design/tRoAewIghL1YbnTio6fkkw/Themis-Design-System?node-id=1859-2940
// source=src/components/ColorSwatch/ColorSwatch.tsx
// component=ColorSwatch
import figma from 'figma'
const instance = figma.selectedInstance

// Defaults (medium, solid) are left out.
const size = instance.getEnum('size', { small: 'small', medium: undefined, large: 'large' })
const variant = instance.getEnum('variant', { solid: undefined, outline: 'outline' })

// The colour is the "Swatch Content" fill, which templates can't read: `yourColor` is a placeholder for any CSS
// colour string or React Aria `Color`.
export default {
  example: figma.code`<ColorSwatch color={yourColor}${size ? ` size="${size}"` : ''}${variant ? ` variant="${variant}"` : ''} />`,
  imports: ['import { ColorSwatch } from "themis-ds"'],
  id: 'color-swatch',
  metadata: { nestable: true },
}
