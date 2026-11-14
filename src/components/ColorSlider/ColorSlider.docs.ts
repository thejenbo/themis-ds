import { defineComponentDocs } from '../../docs/component-docs';

export default defineComponentDocs({
  name: 'ColorSlider',
  status: 'beta',
  category: 'Color',
  summary: 'Changes one channel of a colour, such as its hue or opacity, along a track that shows the colours on offer.',
  base: {
    package: 'react-aria-components',
    component: 'ColorSlider',
    docsUrl: 'https://react-spectrum.adobe.com/react-aria/ColorSlider.html',
  },

  usage: {
    whenToUse: [
      'Adjusting one channel of a colour while seeing the result: hue, saturation, lightness, opacity (`alpha`)…',
      'Next to a ColorArea, as the hue slider that completes it.',
    ],
    whenNotToUse: [
      { scenario: 'Picking a span of a channel, such as a range of hues.', useInstead: 'ColorRangeSlider' },
      { scenario: 'Picking two channels at once (e.g. saturation and lightness).', useInstead: 'ColorArea' },
      { scenario: 'A plain number with no colour.', useInstead: 'Slider' },
    ],
  },

  anatomy: [
    { part: 'Label and value', description: 'With `label`: the label and the channel\'s value (`showValue`), label style, 8px above the track.', required: false },
    { part: 'Track', description: '16px pill with a border/width/sm border in color/border, showing the channel\'s colours from minimum to maximum. The alpha channel shows a checkerboard behind them.', required: true },
    { part: 'Thumb', description: '28px circle filled with the current colour, with a black border and a white ring inside it (border/width/mandatory each). 32px on hover, 36px while dragging. Stays inside the track at both ends.', required: true },
  ],

  variants: {
    channel: {
      hue: 'Round the colour wheel, 0–360°.',
      saturation: 'From grey to the full colour, 0–100%.',
      lightness: 'From black through the colour to white, 0–100% (hsl).',
      brightness: 'From black to the colour, 0–100% (hsb).',
      'red / green / blue': 'One RGB channel, 0–255.',
      alpha: 'From see-through to opaque, 0–100%, over a checkerboard.',
    },
    showValue: {
      true: 'With a `label`, the channel\'s value at the end of the label row. The default.',
      false: 'No value in the label row.',
    },
  },

  accessibility: {
    providedByBase: [
      'The thumb is a native range input (role="slider") whose value is announced with its unit and a description of the colour, e.g. "180°, cyan".',
      'Without a `label` or `aria-label`, it\'s named after its channel ("Hue").',
      'Arrow keys change the value by one step, Page Up/Down by bigger steps, and Home/End jump to the ends.',
      'Clicking or tapping the track jumps the thumb there.',
    ],
    keyboard: [
      { keys: 'Left / Right arrow', action: 'Decreases / increases the channel by one step.' },
      { keys: 'Page Down / Page Up', action: 'Decreases / increases by a bigger step.' },
      { keys: 'Home / End', action: 'Jumps to the minimum / maximum.' },
    ],
    requirements: [
      'Give it a visible `label`, or an `aria-label` that says what the colour is for ("Background hue") when several sliders sit together.',
      'Show the resulting colour (e.g. a ColorSwatch) and its value as text where people need the exact colour.',
    ],
  },

  guidelines: {
    do: [
      'Save with `onChangeEnd`, and use `onChange` only to preview.',
      'Pair a hue slider with a ColorArea to reach every colour.',
    ],
    dont: [
      'Use several sliders without labels; channel names alone don\'t say which colour they change.',
    ],
  },

  tokens: [
    'colorTheme/color.border',
    'colorTheme/color.text',
    'system/color.background-disabled-default',
    'system/color.background-disabled-inverse',
    'system/color.border-disabled',
    'primitives/color.grayscale.000',
    'primitives/color.grayscale.030',
    'primitives/color.grayscale.1000',
    'spacing/spacing.xs',
    'radius/border.radius.full',
    'borderWidth/border.width.sm',
    'borderWidth/border.width.mandatory',
    'borderWidth/border.width.focus ring',
    'fontTheme/font.family.body',
    'typography/font.size.label',
    'typography/font.line height.label',
    'typography/font.weight.semibold',
    'motion/duration.fast',
    'motion/easing.standard',
  ],

  motion: [
    {
      trigger: 'Hover or drag the thumb',
      property: 'Thumb grows (28 → 32px on hover, 36px while dragging)',
      duration: 'motion/duration.fast',
      easing: 'motion/easing.standard',
      reducedMotion: 'Changes size instantly.',
    },
  ],

  figma: {
    componentKey: null,
    url: 'https://www.figma.com/design/tRoAewIghL1YbnTio6fkkw/Themis-Design-System?node-id=1909-994',
    properties: {
      label: { figmaProperty: 'Label', type: 'TEXT' },
      showValue: { figmaProperty: 'showValue', type: 'BOOLEAN' },
      isDisabled: { figmaProperty: 'state', type: 'VARIANT', values: { true: 'disabled' } },
    },
    differences: [
      { topic: 'Gradient', figma: 'The "Gradient" slot holds a drawn hue gradient.', code: 'The gradient is drawn from `channel` and the current colour, so it changes with them.', action: 'annotate-figma', done: '2026-11-14' },
    ],
  },

  related: ['ColorArea', 'ColorRangeSlider', 'ColorSwatch', 'Slider'],
  notes: [
    'Figma\'s `progress` variants are example values; in code it\'s `value` / `defaultValue`, a whole colour, and the slider changes its `channel`.',
    'Horizontal only, like Slider.',
  ],
});
