import { defineComponentDocs } from '../../docs/component-docs';

export default defineComponentDocs({
  name: 'TextInput',
  status: 'beta',
  category: 'Inputs',
  summary: 'A single-line text field with a label, optional help text, character count and error message.',
  base: {
    package: 'react-aria-components',
    component: 'TextField',
    docsUrl: 'https://react-spectrum.adobe.com/react-aria/TextField.html',
  },

  usage: {
    whenToUse: ['Short free-text answers: names, email addresses, titles, search terms.'],
    whenNotToUse: [
      { scenario: 'Text longer than a line or two.', useInstead: 'TextArea' },
      { scenario: 'Choosing from a known list.', useInstead: 'Select or SegmentedControl' },
      { scenario: 'A number in a range where roughly is fine.', useInstead: 'Slider' },
      { scenario: 'Turning something on or off.', useInstead: 'Switch' },
    ],
  },

  anatomy: [
    { part: 'Label', description: 'The field\'s name (`label`), label style. "(optional)" is added with `isOptional`.', required: true },
    { part: 'Input Box', description: '40px on every screen: background, 2px border (error color when invalid), radius md, input text style. Gray when disabled.', required: true },
    { part: 'Icon Right', description: 'Optional decorative icon (`icon`); the error icon replaces it while the field is invalid.', required: false },
    { part: 'Context', description: 'Caption row under the box: description on the left, character count on the right.', required: false },
    { part: 'Error message', description: 'Shown below the context row when the field is invalid, in the error color.', required: false },
  ],

  variants: {
    type: {
      text: 'The default.',
      email: 'Email addresses; phones show an @ keyboard.',
      tel: 'Phone numbers; phones show a number pad.',
      url: 'Web addresses.',
      search: 'Search terms.',
      password: 'Hidden characters. (A show/hide button isn\'t built yet.)',
    },
  },

  accessibility: {
    providedByBase: [
      'The label is linked to the input, and the description, count and error message are read as its description.',
      'aria-invalid is set when the field is invalid; the error message is linked so it\'s read with the field.',
      'Built-in validation (`isRequired`, `validate`, `pattern`, `type="email"`) shows its messages when the form is submitted.',
    ],
    keyboard: [{ keys: 'Tab', action: 'Moves focus into and out of the field.' }],
    requirements: [
      'Always give a visible `label`. A placeholder is not a label: it disappears as soon as someone types.',
      'Write error messages that say how to fix the problem ("Enter an email address like name@example.com").',
      'Use `type="email"`, `"tel"` or `"url"` and `autoComplete` so phones and password managers can help.',
      'Over the character limit, the field is marked invalid and the overage is announced; say so in the error message too if you block submitting.',
    ],
  },

  guidelines: {
    do: [
      'Mark the optional fields with `isOptional`, rather than starring the required ones.',
      'Use `description` for format hints that people need while typing.',
      'Make the box about as wide as the expected answer.',
    ],
    dont: [
      'Use placeholder text for instructions people need later.',
      'Disable a field without saying why nearby.',
      'Validate on every keystroke for anything but the character limit.',
    ],
  },

  tokens: [
    'colorTheme/color.background',
    'colorTheme/color.text',
    'colorTheme/color.border',
    'colorTheme/color.state.error',
    'system/color.background-disabled-inverse',
    'system/color.border-disabled',
    'system/color.text-disabled-default',
    'colorTheme/color.text-placeholder-default',
    'spacing/spacing.2xs',
    'spacing/spacing.xs',
    'spacing/spacing.sm',
    'radius/border.radius.md',
    'borderWidth/border.width.mandatory',
    'borderWidth/border.width.focus ring',
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
  ],

  figma: {
    componentKey: null,
    url: 'https://www.figma.com/design/tRoAewIghL1YbnTio6fkkw/Themis-Design-System?node-id=607-74',
    properties: {
      isDisabled: { figmaProperty: 'state', type: 'VARIANT', values: { true: 'disabled' } },
      isInvalid: { figmaProperty: 'state', type: 'VARIANT', values: { true: 'errored' } },
      description: { figmaProperty: 'description', type: 'VARIANT' },
      characterLimit: { figmaProperty: 'charLimit', type: 'VARIANT' },
      icon: { figmaProperty: 'iconRight', type: 'VARIANT' },
    },
  },

  related: ['TextArea', 'Slider', 'Switch', 'SegmentedControl'],
  notes: [
    'Built on Figma "Input Base" (node 1834-6859) and "Input Box" (node 1832-6830). The shared styles live in src/components/TextInput/field-base.ts for the other inputs.',
    'Figma\'s `empty` variants show the placeholder; `focused` is interaction; `charLimitErrored` is typing past `characterLimit`.',
    'The shared black/white focus ring sits inside the box, 2px in from the border (Figma "Focus Ring"), and shows whenever the field has focus. Inside, it never crowds the label or help text, and containers that clip overflow can\'t cut it off.',
    'The box stays 40px on every screen (type/input/base is a fixed 16/24), so it lines up with a medium Button.',
    'Disabled fields keep the label in color/text (Figma); only the box goes gray.',
    'Not built yet: password show/hide, a search clear button, and the dropdown (that\'s Select).',
  ],
});
