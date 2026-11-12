import { defineComponentDocs } from '../../docs/component-docs';

export default defineComponentDocs({
  name: 'Text',
  status: 'beta',
  category: 'Typography',
  summary: 'Body text, labels and captions in the body font, using the Figma type/body, type/label and type/caption styles.',
  base: null,

  usage: {
    whenToUse: ['Paragraphs, descriptions, labels and small print anywhere in the UI.'],
    whenNotToUse: [
      { scenario: 'A title that starts a section.', useInstead: 'Heading' },
      { scenario: 'Text inside a Themis component (Button, Chip, Toast…): they already use the right style.' },
    ],
  },

  anatomy: [{ part: 'Text', description: 'A <p> (body styles) or <span> (label, caption), or the element set with `as`.', required: true }],

  variants: {
    variant: {
      'body-large': 'type/body/large. Lead paragraphs and intros.',
      'body-large-bold': 'type/body/large-bold. Emphasis at the large size.',
      'body-medium': 'type/body/medium. Comfortable reading text.',
      'body-medium-bold': 'type/body/medium-bold. Emphasis at the medium size.',
      'body-base': 'type/body/base. The default for most text.',
      'body-bold': 'type/body/bold. Emphasis at the base size.',
      label: 'type/label/base. Names for controls and fields; same size on every screen.',
      caption: 'type/caption/base. Small print, hints and metadata.',
    },
  },

  accessibility: {
    providedByBase: [],
    keyboard: [],
    requirements: [
      'Use `as="p"` for paragraphs and `as="span"` inside a line, so screen readers and reader modes get the right structure.',
      'Bold styles are visual only. For text that\'s important in meaning, use `as="strong"`.',
      'Captions are 12px: keep them to short, non-essential text.',
    ],
  },

  guidelines: {
    do: ['Use body-base for most text and the larger sizes sparingly.', 'Keep lines to about 60–80 characters.'],
    dont: ['Mix more than two body sizes in one block.', 'Use caption for anything people must read to complete a task.'],
  },

  tokens: [
    'fontTheme/font.family.body',
    'typography/font.size.lg',
    'typography/font.size.caption',
    'typography/font.line height.caption',
    'typography/font.line height.label',
    'typography/font.size.md',
    'typography/font.size.sm',
    'typography/font.size.label',
    'typography/font.line height.sm',
    'typography/font.line height.md',
    'typography/font.weight.regular',
    'typography/font.weight.semibold',
    'typography/font.weight.bold',
  ],

  figma: {
    componentKey: null,
    url: 'https://www.figma.com/design/tRoAewIghL1YbnTio6fkkw/Themis-Design-System?node-id=2200-14528',
    properties: {},
  },

  related: ['Heading'],
  notes: [
    'Variant names follow the Figma styles: type/body/bold (base size, bold) is `body-bold`.',
    'The styles are also exported as StyleX styles (`textStyles` from themis-ds) for use inside other components.',
    'type/button/base and type/button/micro are left out: only Button uses them.',
    'Colour is inherited (the ThemeProvider sets color/text).',
  ],
});
