// url=https://www.figma.com/design/tRoAewIghL1YbnTio6fkkw/Themis-Design-System?node-id=2478-3194
// source=src/components/CodeBlock/CodeBlock.tsx
// component=CodeBlock
import figma from 'figma'
const instance = figma.selectedInstance

const language = instance.getEnum('language', { json: 'json', tsx: 'tsx', text: 'text' })
const layers = instance.findLayers((node) => node.type === 'TEXT')
const first = layers[0]
const code = first && first.type === 'TEXT' ? first.textContent : ''

export default {
  example: figma.code`<CodeBlock language="${language}" aria-label="Code sample">{${JSON.stringify(code)}}</CodeBlock>`,
  imports: ['import { CodeBlock } from "themis-ds"'],
  id: 'code-block',
  metadata: { nestable: false },
}
