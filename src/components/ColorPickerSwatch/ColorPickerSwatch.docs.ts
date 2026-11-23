import { defineComponentDocs } from '../../docs/component-docs';

export default defineComponentDocs({
  name: 'ColorPickerSwatch',
  status: 'beta',
  category: 'Color',
  summary: 'A color swatch you can press, e.g. the button that opens a ColorPicker, or a recent color inside one.',
  base: {
    package: 'react-aria-components',
    component: 'Button',
    docsUrl: 'https://react-spectrum.adobe.com/react-aria/Button.html',
  },

  usage: {
    whenToUse: ['Opening a color picker from the color it will change.', 'A choosable color in a list of swatches (ColorPickerSwatchItem).'],
    whenNotToUse: [
      { scenario: 'Showing a color that can\'t be pressed.', useInstead: 'ColorSwatch' },
      { scenario: 'An empty slot with no color yet.', useInstead: 'ColorSwatch variant="empty"' },
    ],
  },

  anatomy: [
    { part: 'Swatch', description: 'An outline ColorSwatch, 24, 32 or 40px, radius md.', required: true },
    { part: 'Focus ring', description: 'The standard focus ring, 4px outside the swatch, on keyboard focus.', required: false },
  ],

  variants: {
    size: { small: '24px.', medium: '32px.', large: '40px, the height of an input box. The default.' },
    isDisabled: { false: 'Shows the color. The default.', true: 'Shows the disabled gray (color/background-disabled-inverse, border-disabled) instead of the color, and can\'t be pressed.' },
  },

  accessibility: {
    providedByBase: [
      'A native button, named by the color\'s description followed by `aria-label` ("vibrant purple, Pick a color").',
      'ColorPickerSwatchItem is an option in a ColorSwatchPicker listbox; the chosen one is announced as selected.',
    ],
    keyboard: [{ keys: 'Enter / Space', action: 'Presses it.' }],
    requirements: ['Give it an `aria-label` that says what pressing does.'],
  },

  guidelines: {
    do: ['Keep the swatch\'s color in sync with the color it changes.'],
    dont: ['Add a hover tint; it would change the color shown.'],
  },

  tokens: [
    'colorTheme/color.border',
    'radius/border.radius.md',
    'borderWidth/border.width.sm',
    'borderWidth/border.width.focus ring',
    'system/color.background-disabled-inverse',
    'system/color.border-disabled',
    'motion/duration.fast',
    'motion/duration.slow',
    'motion/easing.standard',
    'motion/scale.pressed',
  ],

  motion: [
    {
      trigger: 'Press',
      property: 'The swatch shrinks to motion/scale.pressed',
      duration: 'motion/duration.fast',
      easing: 'motion/easing.standard',
      reducedMotion: 'No shrink.',
    },
  ],

  figma: {
    componentKey: null,
    url: 'https://www.figma.com/design/tRoAewIghL1YbnTio6fkkw/Themis-Design-System?node-id=2359-405',
    properties: {
      size: { figmaProperty: 'size', type: 'VARIANT' },
      isDisabled: { figmaProperty: 'state', type: 'VARIANT', values: { true: 'disabled' } },
    },
    differences: [],
  },

  related: ['ColorSwatch', 'ColorPicker', 'ColorField'],
  notes: ['No hover state on purpose: a hover tint would change the color the swatch shows.'],
});
