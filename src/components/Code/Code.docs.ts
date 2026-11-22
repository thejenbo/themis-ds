import { defineComponentDocs } from '../../docs/component-docs';

export default defineComponentDocs({
  name: 'Code',
  status: 'beta',
  category: 'Typography',
  summary: 'Code inside a sentence, such as a file name, prop or short snippet, in Space Mono on Monokai in every theme.',
  base: null,

  usage: {
    whenToUse: ['File names, prop and token names, and short snippets inside a sentence.'],
    whenNotToUse: [
      { scenario: 'More than a line of code, or code to copy.', useInstead: 'CodeBlock' },
      { scenario: 'Keyboard shortcuts or text people should type that isn\'t code.', useInstead: 'Text' },
    ],
  },

  anatomy: [{ part: 'Code', description: 'A <code> element: Monokai background, Space Mono at 87.5% of the text around it, 2px × 4px padding, radius xs.', required: true }],

  variants: {
    language: {
      text: 'One colour (the default).',
      json: 'Keys, strings, numbers and booleans coloured.',
      tsx: 'TypeScript and JSX: tags, attributes, strings, keywords, functions and comments coloured.',
    },
  },

  accessibility: {
    providedByBase: [],
    keyboard: [],
    requirements: [
      'Every Monokai colour has at least 4.5:1 contrast on the Monokai background (pink and the comment grey are lightened from the classic palette to get there).',
      'Screen readers read it as part of the sentence; say what it is in the text around it.',
    ],
  },

  guidelines: {
    do: ['Keep it short enough to sit in a line.', 'Use `language` when the snippet is code someone would write.'],
    dont: ['Use it for emphasis.', 'Put whole lines of code in a sentence: use CodeBlock.'],
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
    'typography/font.weight.regular',
    'spacing/spacing.3xs',
    'spacing/spacing.2xs',
    'radius/border.radius.xs',
  ],

  figma: {
    componentKey: null,
    url: 'https://www.figma.com/design/tRoAewIghL1YbnTio6fkkw/Themis-Design-System?node-id=2478-3186',
    properties: {
      children: { figmaProperty: 'code', type: 'TEXT' },
    },
  },

  related: ['CodeBlock', 'Text'],
  notes: [
    'The colours and font don\'t change with the theme: they come from the system collection (color/code/*, aliased to the color/monokai/* primitives) and font/family/code. Only the corner radius follows the theme.',
    'Loads Space Mono from Google Fonts once; turn off with `loadFont={false}` when the app hosts it.',
    'The highlighter is small on purpose: it colours JSON and TSX snippets well, and anything else as plain text.',
  ],
});
