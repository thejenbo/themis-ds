import { defineComponentDocs } from '../../docs/component-docs';

export default defineComponentDocs({
  name: 'CodeBlock',
  status: 'beta',
  category: 'Typography',
  summary: 'A block of code, such as a file or a snippet to copy, in Space Mono, Monokai colors on black, in every theme.',
  base: null,

  usage: {
    whenToUse: ['Showing a file or a snippet of more than a line, e.g. an export or install instructions.'],
    whenNotToUse: [{ scenario: 'A file name or short snippet inside a sentence.', useInstead: 'Code' }],
  },

  anatomy: [
    { part: 'Block', description: 'A <pre>: black background, 16px padding, radius md. Long lines scroll sideways; set a max height with `xstyle` to scroll down too.', required: true },
    { part: 'Code', description: 'Space Mono at font/size/code (14/22), colored by `language`.', required: true },
  ],

  variants: {
    language: {
      text: 'One color (the default).',
      json: 'Keys, strings, numbers and booleans colored.',
      tsx: 'TypeScript and JSX: tags, attributes, strings, keywords, functions and comments colored.',
    },
  },

  accessibility: {
    providedByBase: [],
    keyboard: [{ keys: 'Tab', action: 'Focuses the block, so the arrow keys scroll it.' }],
    requirements: [
      'Give it an `aria-label` that says what the code is ("Theme file"). It\'s a focusable region, so keyboard users can scroll it.',
      'Every Monokai color has at least 6.5:1 contrast on the black background.',
      'Offer a copy button nearby for code people need to copy.',
    ],
  },

  guidelines: {
    do: ['Set `language` so the code is colored.', 'Cap its height in dialogs, so the actions stay in view.'],
    dont: ['Wrap long lines by hand: the block scrolls sideways.', 'Use it for a single word inside a sentence: use Code.'],
  },

  tokens: [
    'system/color.code.background',
    'system/color.code.text',
    'system/color.code.comment',
    'system/color.code.string',
    'system/color.code.number',
    'system/color.code.keyword',
    'system/color.code.function',
    'system/color.code.property',
    'system/color.code.parameter',
    'typography/font.family.code',
    'typography/font.size.code',
    'typography/font.line height.code',
    'typography/font.weight.regular',
    'spacing/spacing.sm',
    'radius/border.radius.md',
    'borderWidth/border.width.focus ring',
  ],

  figma: {
    componentKey: null,
    url: 'https://www.figma.com/design/tRoAewIghL1YbnTio6fkkw/Themis-Design-System?node-id=2478-3194',
    properties: {
      language: { figmaProperty: 'language', type: 'VARIANT' },
    },
  },

  related: ['Code'],
  notes: [
    'The colors and font don\'t change with the theme: they come from the system collection (color/code/*: the Monokai primitives for the text, black for the background) and font/family/code. Only the corner radius follows the theme.',
    'Shows the focus ring when it\'s focused from the keyboard.',
    'Loads Space Mono from Google Fonts once; turn off with `loadFont={false}` when the app hosts it.',
  ],
});
