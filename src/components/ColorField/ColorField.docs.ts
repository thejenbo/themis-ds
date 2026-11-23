import { defineComponentDocs } from '../../docs/component-docs';

export default defineComponentDocs({
  name: 'ColorField',
  status: 'beta',
  category: 'Color',
  summary: 'A colour typed as a code (hex, optionally RGB, HSL or HSB), with a swatch beside it that opens a ColorPicker.',
  base: {
    package: 'react-aria-components',
    component: 'TextField',
    docsUrl: 'https://react-spectrum.adobe.com/react-aria/TextField.html',
  },

  usage: {
    whenToUse: ['Any form field for a colour, where people may type, paste or pick it.'],
    whenNotToUse: [
      { scenario: 'Picking visually with no code shown.', useInstead: 'ColorPicker' },
      { scenario: 'One channel only (e.g. a hue).', useInstead: 'ColorSlider' },
    ],
  },

  anatomy: [
    { part: 'Label', description: 'Label style, 4px above the box, as TextInput.', required: false },
    { part: 'Label accessory', description: 'Optional (`labelAccessory`): something after the label on its line, 8px from it but outside the <label>, such as a contrast rating button.', required: false },
    { part: 'Box', description: 'TextInput\'s box: the code in the input text style.', required: true },
    { part: 'Format button', description: 'With more than one of `formats`: UnitInput\'s unit button (a divider, the format name, the caret), opening a list of formats.', required: false },
    { part: 'Swatch', description: 'A 40px ColorPickerSwatch 8px to the right of the box, showing the colour and opening the picker.', required: true },
    { part: 'Help and error', description: 'As TextInput: description, then the error message when invalid.', required: false },
  ],

  variants: {
    formats: {
      "['hex']": 'Hex codes only, no format button. The default.',
      "['hex', 'rgb', 'hsl', 'hsb']": 'Any of these; the format button switches which one the code is shown and read in. Codes other than hex are shown as just the values ("122, 31, 235", "226, 84%, 52%"), since the button names the format.',
    },
  },

  accessibility: {
    providedByBase: [
      'A native text input with its label, description and error linked for screen readers; invalid codes set aria-invalid.',
      'The format button is labelled "<label> format, <format>"; the swatch is a button that opens the picker dialog.',
    ],
    keyboard: [
      { keys: 'Enter', action: 'Reads the typed code.' },
      { keys: 'Tab', action: 'Moves from the code to the format button, then the swatch.' },
    ],
    requirements: ['Give it a visible `label`.', 'Translate `errorMessage`, `formatLabel` and `pickerLabel`.'],
  },

  guidelines: {
    do: ['Offer the formats your audience uses; hex alone is fine for most.', 'Keep recent colours in your app and pass them in.'],
    dont: ['Change the colour while the person is still typing; it\'s read on Enter or when leaving the field.'],
  },

  tokens: [
    'colorTheme/color.border',
    'colorTheme/color.text',
    'colorTheme/color.state.error',
    'spacing/spacing.xs',
    'spacing/spacing.sm',
  ],

  figma: {
    componentKey: null,
    url: 'https://www.figma.com/design/tRoAewIghL1YbnTio6fkkw/Themis-Design-System?node-id=2359-684',
    properties: {
      isInvalid: { figmaProperty: 'state', type: 'VARIANT', values: { true: 'errored' } },
      isDisabled: { figmaProperty: 'state', type: 'VARIANT', values: { true: 'disabled' } },
      formats: { figmaProperty: 'formats', type: 'VARIANT', values: { "['hex', 'rgb', 'hsl', 'hsb']": 'true' } },
    },
    differences: [
      { topic: 'Reading the code', figma: 'Not shown.', code: 'The code is read on Enter or when leaving the field; forgiving ("7A1FEB", "122 31 235" in RGB and "226 84 52" in HSL work, as does the full "rgb(…)" form). Unreadable codes show the error and keep the colour.', action: 'annotate-figma', done: '2026-11-16' },
    ],
  },

  related: ['ColorPicker', 'ColorPickerSwatch', 'TextInput', 'UnitInput'],
  notes: ['The code, the swatch and the picker share one colour through React Aria\'s `ColorPicker`.'],
});
