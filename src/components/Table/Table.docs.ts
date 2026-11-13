import { defineComponentDocs } from '../../docs/component-docs';

export default defineComponentDocs({
  name: 'Table',
  status: 'beta',
  category: 'Data display',
  summary: 'Rows of data in columns, with optional sorting and a row action, such as a list of projects or invoices.',
  // A plain HTML table, not React Aria's grid Table (see notes). Sort buttons are React Aria Buttons.
  base: null,

  usage: {
    whenToUse: [
      'Comparing several records across the same fields (name, date, owner).',
      'Lists people need to sort, or open one item from.',
    ],
    whenNotToUse: [
      { scenario: 'A single record\'s details.', useInstead: 'a description list or a form' },
      { scenario: 'Choosing one or more options in a form.', useInstead: 'Select, RadioGroup or Checkbox' },
      { scenario: 'A few items with one or two facts each, especially on phones.', useInstead: 'a simple list' },
    ],
  },

  anatomy: [
    { part: 'Frame', description: 'border/width/mandatory in color/border all round, radius md, so the table keeps its edge when border widths are "none". Scrolls sideways inside the border when the table is wider than its space.', required: true },
    { part: 'Header', description: 'A brand row of `Column` headings: type/label/base (semibold) in text-inverse, 16px padding, 56px tall.', required: true },
    { part: 'Sort arrow', description: 'On sortable columns: up for ascending, down for descending. Faint on hover or focus while unsorted. Decorative: the heading\'s button sorts.', required: false },
    { part: 'Rows', description: '56px rows of `Cell`s in the regular input text style, with a border/width/mandatory line in border-brand between them (none under the last), so rows stay separated when border widths are "none".', required: true },
    { part: 'Actions column', description: 'A narrow last column of ActionMenu triggers (micro subtle IconButtons), with its heading hidden but read out as "Actions".', required: false },
    { part: 'Empty state', description: 'One full-width row with `emptyText` ("No results") when there are no rows.', required: false },
  ],

  variants: {},

  accessibility: {
    providedByBase: [
      'A native table: screen readers announce it with its size and read each cell with its column heading and row header (`isRowHeader`), using their own table commands.',
      'Sortable headings hold a real button; the heading carries `aria-sort` with the current order.',
      'Keyboard users Tab only to what they can act on: sort buttons, each row\'s action button (with `onRowAction`) and controls in cells such as an ActionMenu. Plain cells are not focusable.',
    ],
    keyboard: [
      { keys: 'Tab', action: 'Moves through the sort buttons, then each row\'s action button and controls, in reading order.' },
      { keys: 'Enter / Space', action: 'On a sort button, sorts by that column (ascending, then descending). On a row\'s name, runs the row action.' },
    ],
    requirements: [
      'Name the table with `aria-label` or `aria-labelledby` ("Projects").',
      'Mark the cell that names each row with `isRowHeader` (usually the first). With `onRowAction`, it becomes the row\'s action button, so keyboard users can reach it.',
      'Give the actions column a heading ("Actions") with `hideLabel`, and each row\'s ActionMenu trigger an `aria-label` naming its row ("Actions for Website redesign").',
      'Every Tab stop counts: for long tables, paginate rather than adding hundreds of rows.',
    ],
  },

  guidelines: {
    do: [
      'Put the column that identifies each row first, and mark it `isRowHeader`.',
      'Let people sort by the columns they scan: names, dates, amounts.',
      'Keep cell text short; truncate long values in the data, not with CSS.',
    ],
    dont: [
      'Put more than one action button in a row. Group them in an ActionMenu.',
      'Use `onRowAction` and an actions menu for the same thing.',
      'Use a Table for layout.',
    ],
  },

  tokens: [
    'colorTheme/color.background',
    'colorTheme/color.brand',
    'colorTheme/color.brand-hover',
    'colorTheme/color.brand-tint',
    'colorTheme/color.border',
    'colorTheme/color.border-brand',
    'colorTheme/color.text',
    'colorTheme/color.text-inverse',
    'colorTheme/color.text-disabled-on-background',
    'spacing/spacing.2xs',
    'spacing/spacing.3xs',
    'spacing/spacing.sm',
    'radius/border.radius.md',
    'borderWidth/border.width.mandatory',
    'borderWidth/border.width.focus ring',
    'fontTheme/font.family.body',
    'typography/font.size.label',
    'typography/font.line height.label',
    'typography/font.size.input',
    'typography/font.line height.input',
    'typography/font.weight.semibold',
    'typography/font.weight.regular',
    'primitives/color.grayscale.000',
    'primitives/color.grayscale.1000',
    'motion/duration.fast',
    'motion/easing.standard',
  ],

  motion: [
    {
      trigger: 'Row hovered (tables with `onRowAction`)',
      property: 'The row fades to brand-tint',
      duration: 'motion/duration.fast',
      easing: 'motion/easing.standard',
      reducedMotion: 'The tint appears instantly.',
    },
    {
      trigger: 'Sortable heading hovered',
      property: 'The heading fades to brand-hover and a faint arrow appears',
      duration: 'motion/duration.fast',
      easing: 'motion/easing.standard',
      reducedMotion: 'Both change instantly.',
    },
  ],

  figma: {
    componentKey: null,
    url: 'https://www.figma.com/design/tRoAewIghL1YbnTio6fkkw/Themis-Design-System?node-id=1457-6618',
    properties: {},
  },

  related: ['ActionMenu', 'IconButton'],
  notes: [
    'A plain HTML table rather than React Aria\'s grid Table: in a grid every cell is focusable and the whole table is one Tab stop (arrow keys inside). For a read-and-act table, Tab reaching the sort buttons and row actions is what keyboard users expect.',
    'Figma "Table" (1457-6618) is `Table`; "Table Header" (1490-42) is `TableHeader`; "Table Header Cell" (1493-95) is `Column`, whose `sorting` none/asc/desc is the table\'s `sortDescriptor`; "Table Row" (1491-55) is `Row`, whose `action=true` is a last `Cell` holding an ActionMenu.',
    'The sort button fills the heading (Figma draws the arrow as a micro IconButton). Unsorted sortable headings show a faint arrow on hover or keyboard focus, and the heading turns brand-hover, like a filled button.',
    'Body cells use the regular input text style (Figma: semibold label style) so the header stands apart.',
    'Rows only tint on hover (brand-tint) and show the pointer cursor when the table has `onRowAction`; clicking anywhere on the row (outside other controls) runs it. Figma shows the hover on every row.',
    'Keyboard focus: the shared ring just inside the sort button, or just inside the whole row while its row header button is focused. Figma has no focus state.',
    'Columns size to their content (Figma: equal widths). Pass `width` to fix one. A `hideLabel` column shrinks to fit its content.',
    'Not built yet: row selection with checkboxes, column resizing, and a loading state.',
  ],
});
