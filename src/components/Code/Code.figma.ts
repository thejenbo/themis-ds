// url=https://www.figma.com/design/tRoAewIghL1YbnTio6fkkw/Themis-Design-System?node-id=2478-3186
// source=src/components/Code/Code.tsx
// component=Code
import figma from 'figma'
const instance = figma.selectedInstance

const code = instance.getString('code')
// Braces and angle brackets would be read as JSX, so the code goes in as a string expression.
const children = /[{}<>]/.test(code) ? `{${JSON.stringify(code)}}` : code

export default {
  example: figma.code`<Code>${children}</Code>`,
  imports: ['import { Code } from "themis-ds"'],
  id: 'code',
  metadata: { nestable: true },
}
