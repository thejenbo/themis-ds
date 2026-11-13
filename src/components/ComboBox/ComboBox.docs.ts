import { defineComponentDocs } from '../../docs/component-docs';

export default defineComponentDocs({
  name: 'ComboBox',
  status: 'beta',
  category: 'Inputs',
  summary: 'A text box that suggests options as you type, such as a country or a teammate, for lists too long to scroll.',
  base: {
    package: 'react-aria-components',
    component: 'ComboBox',
    docsUrl: 'https://react-spectrum.adobe.com/react-aria/ComboBox.html',
  },

  usage: {
    whenToUse: [
      'Choosing one option from a long list (roughly 15+) that people would rather search than scroll: countries, teammates, time zones.',
      'Suggesting known values while still allowing free text (`allowsCustomValue`), such as tags.',
    ],
    whenNotToUse: [
      { scenario: 'A short list (under about 15 options).', useInstead: 'Select' },
      { scenario: 'Free text with no suggestions.', useInstead: 'TextInput' },
      { scenario: 'Choosing several options.', useInstead: 'checkboxes or a TagGroup (coming later)' },
    ],
  },

  anatomy: [
    { part: 'Label', description: 'The field\'s name (`label`), label style. "(optional)" is added with `isOptional`.', required: true },
    { part: 'Input Box', description: 'The 40px box (shared with TextInput and Select) with a text field and the caret button. Red border when invalid, grey when disabled.', required: true },
    { part: 'Caret', description: 'A button that shows every option. Out of the tab order (Down arrow does the same). The same in every state.', required: true },
    { part: 'Description / Error message', description: 'Help text (caption) and the error message, as in TextInput.', required: false },
    { part: 'Dropdown', description: 'The filtered list, shared with Select: 4px below the box and as wide as it, 8px padding, 4px between options, scrolls when long.', required: true },
    { part: 'No results', description: 'Shown in the list when nothing matches (`emptyText`), in the disabled-on-background colour.', required: false },
  ],

  variants: {},

  accessibility: {
    providedByBase: [
      'The text box is a combobox linked to the list; screen readers hear how many options match as the list changes.',
      'Arrow keys move through the options without leaving the text box (aria-activedescendant); Enter chooses; Escape closes the list, and a second Escape clears the text.',
      'Leaving the field without choosing puts back the last chosen option (unless `allowsCustomValue`).',
      'The label, description and error message are linked; `isRequired` validation shows its message on submit.',
    ],
    keyboard: [
      { keys: 'Typing', action: 'Filters the list and opens it.' },
      { keys: 'Down / Up arrow', action: 'Opens the list (showing every option), then moves through it.' },
      { keys: 'Enter', action: 'Chooses the highlighted option.' },
      { keys: 'Escape', action: 'Closes the list; pressed again, clears the text.' },
    ],
    requirements: [
      'Always give a visible `label`, and a placeholder that invites typing ("Search or choose a country").',
      'Translate `emptyText` along with the rest of the UI.',
      'For very long or remote lists, filter on the server and pass `items` (async loading isn\'t built in yet).',
    ],
  },

  guidelines: {
    do: ['Use option labels people would naturally type.', 'Preselect the likeliest option when there is one.'],
    dont: ['Use a combobox for a handful of options; a Select is quicker to scan.', 'Allow custom values when the value has to be one of the options.'],
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
    url: 'https://www.figma.com/design/tRoAewIghL1YbnTio6fkkw/Themis-Design-System?node-id=2231-15721',
    properties: {
      isDisabled: { figmaProperty: 'state', type: 'VARIANT', values: { true: 'disabled' } },
      isInvalid: { figmaProperty: 'state', type: 'VARIANT', values: { true: 'errored' } },
      description: { figmaProperty: 'description', type: 'VARIANT' },
      emptyText: { figmaProperty: 'noResults', type: 'VARIANT' },
    },
  },

  related: ['Select', 'TextInput'],
  notes: [
    'Shares its box with TextInput and its dropdown and options with Select (src/components/Select/dropdown.tsx), so the three stay identical.',
    'The caret is always shown and is a real button (Figma: same in every state). Errors are shown by the border and message; the caret isn\'t replaced by the error icon.',
    'Figma\'s `noResults` variant is what shows when nothing matches; the default text matches it, "no results found :-(" (`emptyText`).',
    'The box shows the shared focus ring inside it whenever it has focus (like TextInput), since that\'s where typing goes.',
    'Not built yet: loading options as you type, highlighting the matching letters, and choosing several options.',
  ],
});
