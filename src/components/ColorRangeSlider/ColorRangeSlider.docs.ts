import { defineComponentDocs } from '../../docs/component-docs';

export default defineComponentDocs({
  name: 'ColorRangeSlider',
  status: 'beta',
  category: 'Color',
  summary: 'Picks a span of one color channel, such as a range of hues, with a start and an end thumb.',
  base: {
    package: 'react-aria-components',
    component: 'Slider',
    docsUrl: 'https://react-spectrum.adobe.com/react-aria/Slider.html',
  },

  usage: {
    whenToUse: [
      'Choosing a band of a channel, e.g. the hues a palette may use or a range of lightness.',
      'Filtering by color, e.g. "show images between these hues".',
    ],
    whenNotToUse: [
      { scenario: 'Picking a single color.', useInstead: 'ColorSlider' },
      { scenario: 'A range of plain numbers.', useInstead: 'Slider (range coming later)' },
    ],
  },

  anatomy: [
    { part: 'Label and value', description: 'With `label`: the label and the range (`showValue`), label style, 8px above the track.', required: false },
    { part: 'Track', description: 'As ColorSlider: a 16px pill with a border, showing the channel from minimum to maximum of `color` (hue: always the full-strength rainbow).', required: true },
    { part: 'Swatches', description: 'With `showSwatches`: a 24px swatch of each end\'s color (border/radius/md, border/width/sm border in color/border), 4px above its thumb, always shown. The slider makes room for them above the track.', required: false },
    { part: 'Start and end thumbs', description: 'As ColorSlider\'s thumb, each filled with the color at its end of the range. The one being dragged grows to 36px.', required: true },
  ],

  variants: {
    channel: {
      hue: 'A span of the color wheel, 0–360°.',
      'other channels': 'saturation, lightness, brightness, red, green, blue or alpha, in that channel\'s units.',
    },
    showValue: {
      true: 'With a `label`, the range at the end of the label row. The default.',
      false: 'No value in the label row.',
    },
    showSwatches: {
      false: 'Only the thumbs show the end colors. The default.',
      true: 'A swatch above each thumb as well, e.g. for the two stops of a gradient.',
    },
  },

  accessibility: {
    providedByBase: [
      'Each thumb is a native range input (role="slider"), named "Start" or "End" within the slider\'s label, with its value announced in the channel\'s unit.',
      'The thumbs can\'t cross: each one stops at the other.',
      'Without a `label` or `aria-label`, it\'s named after its channel ("Hue range").',
    ],
    keyboard: [
      { keys: 'Tab', action: 'Moves between the start and end thumbs.' },
      { keys: 'Left / Right arrow', action: 'Moves the focused thumb by one step.' },
      { keys: 'Page Down / Page Up', action: 'Moves it by a bigger step.' },
      { keys: 'Home / End', action: 'Moves it as far as it can go (the minimum, the maximum or the other thumb).' },
    ],
    requirements: [
      'Give it a visible `label`, or an `aria-label` that says what the range is for.',
      'Show the range as text (`showValue`) where people need the exact values.',
    ],
  },

  guidelines: {
    do: [
      'Set `color` to the color the range is taken from, so saturation, lightness and other tracks show the real colors on offer.',
      'Save with `onChangeEnd`.',
      'Turn on `showSwatches` when the two end colors are the result, e.g. gradient stops.',
    ],
    dont: [
      'Use it for a single color; a ColorSlider has one thumb.',
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
    'radius/border.radius.md',
    'spacing/spacing.2xs',
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
      trigger: 'Hover or drag a thumb',
      property: 'Thumb grows (28 → 32px on hover, 36px while dragging)',
      duration: 'motion/duration.fast',
      easing: 'motion/easing.standard',
      reducedMotion: 'Changes size instantly.',
    },
  ],

  figma: {
    componentKey: null,
    url: 'https://www.figma.com/design/tRoAewIghL1YbnTio6fkkw/Themis-Design-System?node-id=2335-733',
    properties: {
      label: { figmaProperty: 'Label', type: 'TEXT' },
      showValue: { figmaProperty: 'showValue', type: 'BOOLEAN' },
      isDisabled: { figmaProperty: 'state', type: 'VARIANT', values: { true: 'disabled' } },
      showSwatches: { figmaProperty: 'showSwatches', type: 'VARIANT' },
    },
    differences: [
      { topic: 'Active thumb', figma: 'Both thumbs at their resting 28px.', code: 'The thumb being dragged grows to 36px (32px on hover), as Thumb `activated=true`.', action: 'annotate-figma', done: '2026-11-14' },
    ],
  },

  related: ['ColorSlider', 'Slider'],
  notes: [
    'React Aria has no two-thumb color slider, so this is React Aria\'s `Slider` with two thumbs, with the channel\'s range, steps, value format and gradient taken from `color`.',
  ],
});
