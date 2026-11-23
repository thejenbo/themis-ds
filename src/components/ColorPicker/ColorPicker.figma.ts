// url=https://www.figma.com/design/tRoAewIghL1YbnTio6fkkw/Themis-Design-System?node-id=2359-759
// source=src/components/ColorPicker/ColorPicker.tsx
// component=ColorPicker
import figma from 'figma'
const instance = figma.selectedInstance

// Figma shows the open panel; in code it opens from a swatch. "Brand color" is a placeholder for what the color is
// for, and `recentColors` comes from your app's state.
const recent = instance.getEnum('recentSwatches', { true: true, false: false })
const advanced = instance.getEnum('showAdvanced', { true: true, false: false })
const open = instance.getEnum('advancedOpen', { true: true, false: false })

export default {
  example: figma.code`<ColorPicker aria-label="Brand color" defaultValue={yourColor}${advanced ? ' showAdvanced' : ''}${open ? ' defaultAdvancedOpen' : ''}${recent ? ' recentColors={recentColors} onChangeEnd={addRecentColor}' : ''} />`,
  imports: ['import { ColorPicker } from "themis-ds"'],
  id: 'color-picker',
  metadata: { nestable: true },
}
