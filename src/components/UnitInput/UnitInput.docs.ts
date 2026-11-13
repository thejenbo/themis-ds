import { defineComponentDocs } from '../../docs/component-docs';

export default defineComponentDocs({
  name: 'UnitInput',
  status: 'beta',
  category: 'Inputs',
  summary: 'A number with its unit in one box, such as a weight in kg or lb, or a length in cm or in.',
  base: {
    package: 'react-aria-components',
    component: 'NumberField',
    docsUrl: 'https://react-spectrum.adobe.com/react-aria/NumberField.html',
  },

  usage: {
    whenToUse: [
      'Entering an amount where people can choose the unit: weight, height, distance, duration, file size.',
      'Converting between units is your job: keep the number and unit together in your data and convert on save.',
    ],
    whenNotToUse: [
      { scenario: 'The unit is fixed.', useInstead: 'TextInput with the unit in the label ("Weight (kg)")' },
      { scenario: 'Money.', useInstead: 'a currency input (coming later)' },
      { scenario: 'A rough value on a scale.', useInstead: 'Slider' },
    ],
  },

  anatomy: [
    { part: 'Label', description: 'The field\'s name (`label`), label style. "(optional)" is added with `isOptional`.', required: true },
    { part: 'Input Box', description: 'The 40px box shared with TextInput and Select, split in two by a divider in the border colour (red when invalid, grey when disabled).', required: true },
    { part: 'Number', description: 'The number, in the input text style. Formatted for the locale; placeholder while empty.', required: true },
    { part: 'Unit', description: 'A button showing the chosen unit and the caret. As wide as the widest unit, so the divider never moves.', required: true },
    { part: 'Description / Error message', description: 'Help text (caption) and the error message, as in TextInput.', required: false },
    { part: 'Dropdown', description: 'The units, in Select\'s dropdown: as wide as the whole box, 4px below it.', required: true },
  ],

  variants: {},

  accessibility: {
    providedByBase: [
      'The number is a text box with number semantics: Up/Down arrows step by `step`, Home/End go to min/max, and phones show a number keyboard.',
      'The number is parsed and formatted for the user\'s locale (e.g. "1.234,5" in German).',
      'The unit is a separate button that opens a listbox; it is named "{label} unit" (e.g. "Weight unit"), so screen readers know what it changes.',
      'The label, description and error message are linked; `isRequired`, `minValue` and `maxValue` validation show their message on submit.',
    ],
    keyboard: [
      { keys: 'Tab', action: 'Moves from the number to the unit button and on.' },
      { keys: 'Up / Down arrow (number)', action: 'Steps the number up or down.' },
      { keys: 'Enter / Space / Down arrow (unit)', action: 'Opens the unit list; arrows move, Enter chooses, Escape closes.' },
    ],
    requirements: [
      'Always give a visible `label` naming the quantity ("Weight"), not the unit.',
      'Translate `unitLabel` (the word "unit" in "Weight unit") along with the rest of the UI.',
      'Unit labels should be what people read aloud correctly: prefer "kg" and "lb" over symbols with no text.',
    ],
  },

  guidelines: {
    do: ['Preselect the unit people use most in their region.', 'Set `minValue`, `maxValue` and `step` when the quantity has limits.'],
    dont: ['Put more than a handful of units in the list.', 'Change the number when the unit changes without telling people.'],
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
      trigger: 'Unit list opens',
      property: 'Fades in and slides 4px away from the box',
      duration: 'motion/duration.base',
      easing: 'motion/easing.standard',
      reducedMotion: 'Fades in, no movement.',
    },
  ],

  figma: {
    componentKey: null,
    url: 'https://www.figma.com/design/tRoAewIghL1YbnTio6fkkw/Themis-Design-System?node-id=1846-1823',
    properties: {
      isDisabled: { figmaProperty: 'state', type: 'VARIANT', values: { true: 'disabled' } },
      isInvalid: { figmaProperty: 'state', type: 'VARIANT', values: { true: 'errored' } },
      description: { figmaProperty: 'description', type: 'VARIANT' },
    },
  },

  related: ['TextInput', 'Select', 'Slider'],
  notes: [
    'Figma "Unit Select Input". Shares its box with TextInput and its dropdown with Select and ComboBox.',
    'Each half shows the shared focus ring inside the box (Figma `inputFocused` / `selectFocused`): the number whenever it has focus, the unit for keyboard focus.',
    'The unit button is as wide as the widest unit (Figma hugs "Unit"), so the divider stays put when the unit changes.',
    'Disabled keeps the label in color/text, like every input; only the box goes grey.',
    'No stepper buttons (Figma has none); Up/Down arrows step the number.',
  ],
});
