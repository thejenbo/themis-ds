import { defineComponentDocs } from '../../docs/component-docs';

export default defineComponentDocs({
  name: 'Select',
  status: 'beta',
  category: 'Inputs',
  summary: 'Picks one option from a list that opens below the field, such as a country or a role.',
  base: {
    package: 'react-aria-components',
    component: 'Select',
    docsUrl: 'https://react-spectrum.adobe.com/react-aria/Select.html',
  },

  usage: {
    whenToUse: [
      'Choosing one option from about 5–15 that don\'t all need to be visible at once.',
      'Form fields where the options are known in advance (country, role, size).',
    ],
    whenNotToUse: [
      { scenario: '2–5 short options that change what\'s shown right away.', useInstead: 'SegmentedControl' },
      { scenario: 'Long lists people would rather search.', useInstead: 'a ComboBox (coming later)' },
      { scenario: 'Choosing several options.', useInstead: 'checkboxes (coming later)' },
      { scenario: 'Running actions (the one exception: an "Add new…" option at the end, see below).', useInstead: 'ActionMenu' },
    ],
  },

  anatomy: [
    { part: 'Label', description: 'The field\'s name (`label`), label style. "(optional)" is added with `isOptional`.', required: true },
    { part: 'Input Box', description: 'The 40px box (shared with TextInput) showing the chosen option or the placeholder, with a caret (background-disabled-default when disabled). A button that opens the list.', required: true },
    { part: 'Description / Error message', description: 'Help text (caption) and the error message, as in TextInput.', required: false },
    { part: 'Dropdown', description: 'The list, 4px below the box and as wide as it: border, radius md, drop shadow, 8px padding and 4px between options (as in ActionMenu). Scrolls when long.', required: true },
    { part: 'Dropdown Option', description: '32px option (`SelectItem`) in the input text style, with an optional decorative `icon` before the label. Pale brand tint when highlighted; ✓ when chosen.', required: true },
    { part: 'Dropdown Divider', description: '`SelectSeparator`: a 1px line in the border color (whatever the border-width theme) between groups of options. Screen readers skip it.', required: false },
  ],

  variants: {},

  accessibility: {
    providedByBase: [
      'The box is a button that announces the label and chosen option; the list is a listbox of options with "selected" announced.',
      'Enter, Space or Down arrow opens the list; arrow keys move, Enter chooses, Escape closes, and focus returns to the box.',
      'Typing letters jumps to the matching option, whether the list is open or not.',
      'The label, description and error message are linked; `isRequired` validation shows its message on submit.',
      'A hidden native select is rendered for form submission and browser autofill.',
    ],
    keyboard: [
      { keys: 'Enter / Space / Down arrow', action: 'Opens the list.' },
      { keys: 'Up / Down arrow', action: 'Moves between options (disabled ones are skipped).' },
      { keys: 'Enter', action: 'Chooses the highlighted option and closes the list.' },
      { keys: 'Escape', action: 'Closes the list without changing the choice.' },
      { keys: 'Letters', action: 'Jumps to the next option starting with them.' },
    ],
    requirements: [
      'Always give a visible `label`.',
      'Keep option labels short and distinct; they\'re what typing matches against.',
      'Use a placeholder that says what to do ("Choose a country"), not a fake first option.',
      'An "Add new…" option is announced as an option, so offer the same action somewhere else too (e.g. in an ActionMenu next to the select).',
    ],
  },

  guidelines: {
    do: [
      'Order options logically: alphabetically, by frequency, or in their natural order (sizes small to large).',
      'Preselect a sensible default when there is one.',
      'Put an "Add new…" option last, after a `SelectSeparator`, with a plus `icon` and an `onAction`. Choosing it runs the action and keeps the current value.',
    ],
    dont: [
      'Use a select for 2–3 options that would fit as a SegmentedControl.',
      'Put other actions ("Delete…", "Rename…") among the options; they belong in an ActionMenu.',
    ],
  },

  tokens: [
    'colorTheme/color.background',
    'colorTheme/color.text',
    'colorTheme/color.border',
    'colorTheme/color.state.error',
    'colorTheme/color.brand',
    'colorTheme/color.brand-tint',
    'system/color.background-disabled-inverse',
    'system/color.border-disabled',
    'system/color.background-disabled-default',
    'system/color.text-disabled-default',
    'colorTheme/color.text-disabled-on-background',
    'colorTheme/color.text-placeholder-default',
    'spacing/spacing.3xs',
    'spacing/spacing.2xs',
    'spacing/spacing.xs',
    'spacing/spacing.sm',
    'radius/border.radius.md',
    'borderWidth/border.width.mandatory',
    'borderWidth/border.width.focus ring',
    'shadows/drop shadow.x.default',
    'shadows/drop shadow.y.default',
    'shadows/drop shadow.blur.default',
    'shadows/drop shadow.color.default',
    'fontTheme/font.family.body',
    'typography/font.size.label',
    'typography/font.line height.label',
    'typography/font.size.input',
    'typography/font.line height.input',
    'typography/font.size.caption',
    'typography/font.line height.caption',
    'typography/font.size.sm',
    'typography/font.line height.sm',
    'typography/font.weight.semibold',
    'typography/font.weight.regular',
    'primitives/color.grayscale.000',
    'primitives/color.grayscale.1000',
    'motion/duration.fast',
    'motion/duration.base',
    'motion/easing.standard',
  ],

  motion: [
    {
      trigger: 'List opens',
      property: 'Fades in and slides 4px away from the box',
      duration: 'motion/duration.base',
      easing: 'motion/easing.standard',
      reducedMotion: 'Fades in, no movement.',
    },
    {
      trigger: 'Option highlighted (hover or arrow keys)',
      property: 'Tint fades in',
      duration: 'motion/duration.fast',
      easing: 'motion/easing.standard',
      reducedMotion: 'Appears instantly.',
    },
  ],

  figma: {
    componentKey: null,
    url: 'https://www.figma.com/design/tRoAewIghL1YbnTio6fkkw/Themis-Design-System?node-id=1838-8009',
    properties: {
      isDisabled: { figmaProperty: 'state', type: 'VARIANT', values: { true: 'disabled' } },
      isInvalid: { figmaProperty: 'state', type: 'VARIANT', values: { true: 'errored' } },
      isOpen: { figmaProperty: 'state', type: 'VARIANT', values: { true: 'opened' } },
      description: { figmaProperty: 'description', type: 'VARIANT' },
    },
    differences: [
      { topic: 'Focus ring', figma: 'The `focused` variant shows the ring.', code: 'The ring only shows for keyboard focus, since the box is a button; a click opens the list instead.', action: 'annotate-figma', done: '2026-11-13' },
    ],
  },

  related: ['TextInput', 'SegmentedControl', 'ActionMenu'],
  notes: [
    'Built on Figma "Input Base" / "Input Box" (shared with TextInput, src/components/TextInput/field-base.ts), "Dropdown" (node 1502-172), "Dropdown Option" (node 1502-145: `iconLeft` with an "Icon Left" slot for `icon`, which takes any decorative content such as color dots; `trailing` with a "Trailing" slot for extra children after the label, such as a muted caption) and "Dropdown Divider" (node 2421-2384).',
    'Figma\'s `empty` variants show the placeholder; `focused` and `opened` come from interaction.',
    'The caret stays the same while the list is open (Figma).',
    'The highlight tint matches ActionMenu: brand-tint, the brand color at 7% opacity, over the list.',
    'The box shows the shared focus ring inside it for keyboard focus (as in Figma and the other inputs); options use it inside the option.',
    'React Aria\'s Select would make an `onAction` option the value; Themis keeps the value itself and runs the action instead (only from the open list, so typing a letter on the closed box never runs it).',
    'Not built yet: multiple selection, and option groups with headings.',
  ],
});
