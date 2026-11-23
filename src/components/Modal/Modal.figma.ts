// url=https://www.figma.com/design/tRoAewIghL1YbnTio6fkkw/Themis-Design-System?node-id=2064-17124
// source=src/components/Modal/Modal.tsx
// component=Modal
import figma from 'figma'
const instance = figma.selectedInstance

// tone=danger is an alert dialog that clicks outside don't close; brand is the default, so it's left out.
const tone = instance.getEnum('tone', { brand: undefined, danger: 'danger' })
// "Swap Actions" is left out: the order is the order the buttons are passed in.
const size = instance.getEnum('size', { small: 'small', medium: undefined, large: 'large' })
const hasHeader = instance.getEnum('Header', { true: true, false: false })
const hasClose = instance.getEnum('Close Button', { true: true, false: false })
const hasPrimary = instance.getEnum('Primary Action', { true: true, false: false })
const hasSecondary = instance.getEnum('Secondary Action', { true: true, false: false })
const hideActionBorder = instance.getEnum('Hide Action Border', { true: true, false: false })
const hasActions = hasPrimary || hasSecondary

const titleLayer = instance.findText('Modal Header')
const title = titleLayer.type === 'TEXT' ? titleLayer.textContent : 'Modal title'

// The body is a slot; fall back to the example text layer if the slot is empty.
const contentSlot = instance.getSlot('Modal Content')
const contentLayer = instance.findText('Modal Content')
const content =
  contentSlot && contentSlot.length > 0 ? contentSlot : contentLayer.type === 'TEXT' ? contentLayer.textContent : 'Modal content'

// The Buttons in the controls slot render through their own template.
const controls = hasActions ? instance.getSlot('Modal Controls') : undefined

// showCloseButton defaults to true without actions and false with them, so only the difference is written.
let closeProp = ''
if (hasClose && hasActions) closeProp = ' showCloseButton'
if (!hasClose && !hasActions) closeProp = ' showCloseButton={false}'

export default {
  example: figma.code`<Modal${hasHeader ? ` title="${title}"` : ' aria-label="Describe this modal"'}${tone ? ` tone="${tone}"` : ''}${size ? ` size="${size}"` : ''}${closeProp}${
    hideActionBorder && hasActions ? ' hideActionBorder' : ''
  }${
    controls
      ? figma.code`
  actions={
    <>
      ${controls}
    </>
  }`
      : ''
  }
>
  ${content}
</Modal>`,
  imports: ['import { Modal } from "themis-ds"'],
  id: 'modal',
  metadata: { nestable: true },
}
