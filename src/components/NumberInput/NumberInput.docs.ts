import { defineComponentDocs } from '../../docs/component-docs';

export default defineComponentDocs({
  name: 'NumberInput',
  status: 'beta',
  category: 'Inputs',
  summary: 'A number field with up and down buttons, such as a quantity or a number of guests.',
  base: {
    package: 'react-aria-components',
    component: 'NumberField',
    docsUrl: 'https://react-spectrum.adobe.com/react-aria/NumberField.html',
  },

  usage: {
    whenToUse: [
      'Exact numbers people adjust by small amounts: quantities, guests, nights, a percentage.',
      'Numbers with limits (`minValue`, `maxValue`) or a fixed step (`step`).',
    ],
    whenNotToUse: [
      { scenario: 'A rough value on a scale, where the exact number matters less.', useInstead: 'Slider' },
      { scenario: 'A number with a choice of unit (kg/lb).', useInstead: 'UnitInput' },
      { scenario: 'Numbers that aren\'t amounts: phone numbers, card numbers, postcodes.', useInstead: 'TextInput (`type="tel"` or `inputMode="numeric"`)' },
    ],
  },

  anatomy: [
    { part: 'Label', description: 'The field\'s name (`label`), label style. "(optional)" is added with `isOptional`.', required: true },
    { part: 'Input Box', description: 'The 40px box shared with TextInput: red border when invalid, grey with border-disabled when disabled.', required: true },
    { part: 'Number', description: 'The number in the input text style, formatted for the locale; placeholder while empty.', required: true },
    { part: 'Steppers', description: 'Up and down buttons (Figma "Number Stepper", in "Icon Right"), 16px from the number. Each greys out at its limit (stepper `atMin` / `atMax`).', required: true },
    { part: 'Description / Error message', description: 'Help text (caption) and the error message, as in TextInput.', required: false },
  ],

  variants: {},

  accessibility: {
    providedByBase: [
      'The input is a text box with number semantics; screen readers hear the formatted value, and phones show a number keyboard.',
      'Up/Down arrows step by `step`; Page Up/Down step by more; Home/End go to `minValue`/`maxValue`.',
      'Values are parsed for the user\'s locale, rounded to the step and kept between the limits when the field loses focus.',
      'The up and down buttons are named with the label ("Increase Guests", "Decrease Guests"), left out of the tab order (the arrow keys do the same), and repeat while held.',
      'The label, description and error message are linked; `isRequired` validation shows its message on submit.',
    ],
    keyboard: [
      { keys: 'Up / Down arrow', action: 'Steps the number up or down.' },
      { keys: 'Page Up / Page Down', action: 'Steps by a larger amount.' },
      { keys: 'Home / End', action: 'Goes to the minimum or maximum, when set.' },
    ],
    requirements: [
      'Always give a visible `label`, naming what\'s counted ("Guests").',
      'Translate `stepperLabels` along with the rest of the UI.',
      'Say the limits in the description ("Up to 8 guests") rather than only enforcing them.',
    ],
  },

  guidelines: {
    do: ['Set `minValue`, `maxValue` and `step` whenever the number has them.', 'Use `formatOptions` for percent, currency and fixed decimals instead of adding symbols to the label.'],
    dont: ['Use it for long numbers people type rather than adjust (IDs, phone numbers).', 'Rely on the buttons alone for large changes; people can always type.'],
  },

  tokens: [
    'colorTheme/color.background',
    'colorTheme/color.text',
    'colorTheme/color.border',
    'colorTheme/color.state.error',
    'system/color.background-disabled-inverse',
    'system/color.border-disabled',
    'system/color.background-disabled-default',
    'system/color.text-disabled-default',
    'colorTheme/color.text-placeholder-default',
    'spacing/spacing.3xs',
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
    'motion/duration.fast',
    'motion/duration.slow',
    'motion/easing.standard',
    'motion/scale.pressed',
  ],

  motion: [
    {
      trigger: 'Up or down button pressed',
      property: 'Chevron shrinks to scale.pressed (0.96)',
      duration: 'motion/duration.fast',
      easing: 'motion/easing.standard',
      reducedMotion: 'No shrink.',
    },
  ],

  figma: {
    componentKey: null,
    url: 'https://www.figma.com/design/tRoAewIghL1YbnTio6fkkw/Themis-Design-System?node-id=1843-2158',
    properties: {
      isDisabled: { figmaProperty: 'state', type: 'VARIANT', values: { true: 'disabled' } },
      isInvalid: { figmaProperty: 'state', type: 'VARIANT', values: { true: 'errored' } },
      description: { figmaProperty: 'description', type: 'VARIANT' },
    },
    differences: [
      { topic: 'Touch targets and scrolling', figma: 'Not shown.', code: 'On touch screens each step button\'s target is its half of the box, 44px wide. Scrolling over the focused field changes the value (`isWheelDisabled` turns it off).', action: 'annotate-figma', done: '2026-11-13' },
    ],
  },

  related: ['TextInput', 'UnitInput', 'Slider'],
  notes: [
    'Figma has no hover state for the buttons; they use the pointer cursor and the pressed shrink.',
    'The focus ring sits inside the box, as in Figma and the other inputs.',
  ],
});
