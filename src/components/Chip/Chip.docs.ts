import { defineComponentDocs } from '../../docs/component-docs';

export default defineComponentDocs({
  name: 'Chip',
  status: 'beta',
  category: 'Data display',
  summary: 'A small read-only label for a status or category, such as "Paid" or "Overdue" in a table row.',
  base: null,

  usage: {
    whenToUse: [
      'Showing the status of an item in a list or table ("Paid", "Overdue", "Declined").',
      'Labeling a category or type next to a title ("Beta", "Draft").',
    ],
    whenNotToUse: [
      { scenario: 'Something people click to filter or select.', useInstead: 'SegmentedControl, ToggleButton, or a TagGroup (coming later)' },
      { scenario: 'Something people can remove (e.g. applied filters).', useInstead: 'a TagGroup (coming later)' },
      { scenario: 'A message about something that just happened.', useInstead: 'Toast' },
      { scenario: 'A count on an icon, such as unread messages.', useInstead: 'a Badge (coming later)' },
    ],
  },

  anatomy: [
    { part: 'Chip', description: 'The label. Outline: background fill with a border in the tone. Solid: filled with the tone.', required: true },
    { part: 'Chip Text', description: 'The label text (caption style). Always present: it carries the meaning.', required: true },
    { part: 'Icon Left', description: 'Optional decorative icon before the text.', required: false },
    { part: 'Icon Right', description: 'Optional decorative icon after the text.', required: false },
  ],

  variants: {
    tone: {
      neutral: 'Black and white (inverted in dark themes). Categories and statuses with no particular meaning ("Draft", "Pending").',
      brand: 'The brand color. Highlights something new or featured ("Beta", "New").',
      success: 'Something is done or healthy ("Paid", "Active").',
      warning: 'Something needs attention soon ("Overdue", "Expiring").',
      danger: 'Something failed or was refused ("Declined", "Failed").',
    },
    variant: {
      outline: 'The default. Quiet enough to repeat down a table column.',
      solid: 'Stands out more. Use for the one status people most need to spot, and sparingly.',
    },
  },

  accessibility: {
    providedByBase: [],
    keyboard: [],
    requirements: [
      'The text carries the meaning, so color is never the only cue. Always write the status as a word.',
      'Icons are hidden from screen readers; don\'t put meaning only in an icon.',
      'A chip isn\'t focusable or clickable. If it needs to do something, use a Button or a TagGroup instead.',
      'In a table, the column header says what the chip describes (e.g. "Payment status"), so the chip can stay short.',
    ],
  },

  guidelines: {
    do: [
      'Keep labels to one or two words, in sentence case.',
      'Use the same word and tone for the same status everywhere.',
    ],
    dont: [
      'Wrap or truncate a chip; shorten the label instead.',
      'Use more than one solid chip in a row or card.',
      'Make chips look clickable (no hover or pointer cursor).',
    ],
  },

  tokens: [
    'colorTheme/color.background',
    'colorTheme/color.background-inverse',
    'colorTheme/color.brand',
    'colorTheme/color.text',
    'colorTheme/color.text-brand',
    'colorTheme/color.text-inverse',
    'colorTheme/color.border',
    'colorTheme/color.border-brand',
    'colorTheme/color.state.success',
    'colorTheme/color.state.warning',
    'colorTheme/color.state.error',
    'spacing/spacing.3xs',
    'spacing/spacing.2xs',
    'spacing/spacing.xs',
    'radius/border.radius.xs',
    'borderWidth/border.width.mandatory',
    'fontTheme/font.family.body',
    'typography/font.line height.caption',
    'typography/font.size.caption',
    'typography/font.weight.regular',
  ],

  figma: {
    componentKey: null,
    url: 'https://www.figma.com/design/tRoAewIghL1YbnTio6fkkw/Themis-Design-System?node-id=2064-17447',
    properties: {
      tone: { figmaProperty: 'tone', type: 'VARIANT' },
      variant: { figmaProperty: 'variant', type: 'VARIANT' },
      iconLeft: { figmaProperty: 'iconLeft', type: 'VARIANT' },
      iconRight: { figmaProperty: 'iconRight', type: 'VARIANT' },
    },
  },

  related: ['Toast', 'Button'],
  notes: [
    'Read-only, so there is no React Aria base: it renders a plain <span>. Interactive chips (select, remove) will be a separate component built on React Aria TagGroup.',
    'Figma\'s iconLeft/iconRight booleans are on when `iconLeft` / `iconRight` is passed; code also allows both at once.',
    'The outline border is drawn inside the chip, like Figma\'s inside stroke. With the large border-width mode (3px) it overlaps the 2px padding slightly, as in Figma.',
    'No hover, focus or motion: chips aren\'t interactive.',
  ],
});
