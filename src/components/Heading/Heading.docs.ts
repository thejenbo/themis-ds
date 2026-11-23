import { defineComponentDocs } from '../../docs/component-docs';

export default defineComponentDocs({
  name: 'Heading',
  status: 'beta',
  category: 'Typography',
  summary: 'A page or section heading in the heading font, using the Figma type/heading styles.',
  base: null,

  usage: {
    whenToUse: ['Titles of pages, sections, cards and dialogs.'],
    whenNotToUse: [
      { scenario: 'Bold text that doesn\'t start a section.', useInstead: 'Text with variant="body-bold"' },
      { scenario: 'Labels for controls or small headings inside components.', useInstead: 'Text with variant="label"' },
    ],
  },

  anatomy: [{ part: 'Heading', description: 'An <h1>–<h6> element in the heading font.', required: true }],

  variants: {
    size: {
      xl: 'type/heading/xl. Page titles (default for h1).',
      lg: 'type/heading/lg. Major sections (default for h2).',
      md: 'type/heading/md. Sections (default for h3).',
      base: 'type/heading/base. Subsections, card titles (default for h4).',
      sm: 'type/heading/sm. Small headings in dense layouts (default for h5).',
      xs: 'type/heading/xs. Smallest headings (default for h6).',
    },
  },

  accessibility: {
    providedByBase: [],
    keyboard: [],
    requirements: [
      'Choose `level` for the page outline, not the look: one h1 per page, and don\'t skip levels going down (h2 → h4). Use `size` to change the look.',
      'Screen-reader users jump between headings, so headings should describe the section that follows.',
    ],
  },

  guidelines: {
    do: ['Write headings in sentence case.', 'Keep them short; the browser balances line breaks for you.'],
    dont: ['Use a heading just to make text big or bold.', 'Pick a level to get a size.'],
  },

  tokens: [
    'fontTheme/font.family.heading',
    'typography/font.size.4xl',
    'typography/font.line height.2xl',
    'typography/font.line height.xs',
    'typography/font.size.3xl',
    'typography/font.size.2xl',
    'typography/font.size.xl',
    'typography/font.size.sm',
    'typography/font.size.xs',
    'typography/font.line height.xl',
    'typography/font.line height.lg',
    'typography/font.line height.md',
    'typography/font.line height.sm',
    'typography/font.weight.bold',
    'typography/font.weight.semibold',
  ],

  figma: {
    componentKey: null,
    url: 'https://www.figma.com/design/tRoAewIghL1YbnTio6fkkw/Themis-Design-System?node-id=2200-14528',
    properties: {},
  },

  related: ['Text'],
  notes: [
    'The Figma text styles are also exported as StyleX styles (`headingStyles` from themis-ds) for components that need a heading look on another element.',
    'Sizes and line heights switch to the desktop scale at 48em, from the typography tokens.',
    'Color is inherited (the ThemeProvider sets color/text).',
  ],
});
