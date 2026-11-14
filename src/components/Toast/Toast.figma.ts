// url=https://www.figma.com/design/tRoAewIghL1YbnTio6fkkw/Themis-Design-System?node-id=1377-451
// source=src/components/Toast/Toast.tsx
// component=Toast
import figma from 'figma'
const instance = figma.selectedInstance

// Toasts aren't rendered as JSX: apps call toast.show() and render one <ToastRegion /> near the root.
// Figma `variant` is `tone`; info is the default, so it's left out.
const tone = instance.getEnum('variant', {
  info: undefined,
  brand: 'brand',
  danger: 'danger',
  warning: 'warning',
  success: 'success',
})
const hasHeading = instance.getEnum('heading', { true: true, false: false })
const hasIcon = instance.getEnum('icon', { true: true, false: false })
const hasClose = instance.getEnum('close button', { true: true, false: false })
const hasAction = instance.getEnum('action button', { true: true, false: false })

const title = instance.getString('Heading')
const description = instance.getString('Content')

// The action is an options object, not a nested Button, so only its label is read.
const actionLabelLayer = instance.findText('Click Me', { traverseInstances: true, path: ['Action Button'] })
const actionLabel = actionLabelLayer.type === 'TEXT' ? actionLabelLayer.textContent : 'Undo'

// The icon is on by default for every tone except brand, so only the difference is written.
let iconOption = ''
if (!hasIcon && tone !== 'brand') iconOption = '\n  icon: false,'
if (hasIcon && tone === 'brand') iconOption = '\n  icon: true,'

export default {
  example: figma.code`toast.show({${tone ? `\n  tone: ${JSON.stringify(tone)},` : ''}${hasHeading ? `\n  title: ${JSON.stringify(title)},` : ''}
  description: ${JSON.stringify(description)},${iconOption}${
    hasAction ? `\n  action: { label: ${JSON.stringify(actionLabel)}, onAction: () => {} },` : ''
  }${hasClose ? '' : '\n  showCloseButton: false,'}
})`,
  imports: ['import { toast } from "themis-ds"'],
  id: 'toast',
  metadata: { nestable: true },
}
