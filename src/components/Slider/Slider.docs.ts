import { defineComponentDocs } from '../../docs/component-docs';

export default defineComponentDocs({
  name: 'Slider',
  status: 'beta',
  category: 'Inputs',
  summary: 'Picks a number from a range by dragging a thumb along a track, such as volume or opacity.',
  base: {
    package: 'react-aria-components',
    component: 'Slider',
    docsUrl: 'https://react-spectrum.adobe.com/react-aria/Slider.html',
  },

  usage: {
    whenToUse: [
      'Adjusting a value where the rough position matters more than the exact number (volume, brightness, zoom).',
      'Values with a clear minimum and maximum, where seeing the effect while dragging helps.',
    ],
    whenNotToUse: [
      { scenario: 'An exact number people need to type (an amount, a quantity).', useInstead: 'a number field (coming later)' },
      { scenario: 'Choosing between a few named options.', useInstead: 'SegmentedControl' },
      { scenario: 'Turning something on or off.', useInstead: 'Switch' },
    ],
  },

  anatomy: [
    { part: 'Label and value', description: 'The label (`label`) and the current value (`showValue`), label style, 8px above the track.', required: false },
    { part: 'Slider', description: 'The 16px track: a pill with a border, pale brand where it isn\'t filled.', required: true },
    { part: 'Progress', description: 'Brand fill from the start of the track to the thumb.', required: true },
    { part: 'Thumb', description: '28px circle with a border; 32px on hover and 36px while dragging. Stays inside the track at both ends.', required: true },
    { part: 'Indicator', description: 'The value in a dark pill, 4px above the thumb, shown only while dragging or using the keyboard. It floats over the label row.', required: false },
  ],

  variants: {
    showValue: {
      true: 'The current value at the end of the label row. The default.',
      false: 'No value in the label row, e.g. when the setting\'s effect is visible right next to it.',
    },
  },

  accessibility: {
    providedByBase: [
      'The thumb is a native range input (role="slider") with its value, minimum and maximum, labelled by the label.',
      'Arrow keys change the value by one step, Page Up/Down by bigger steps, and Home/End jump to the ends.',
      'The value is announced with its formatting (e.g. "50%") when `formatOptions` is set.',
      'Clicking or tapping the track jumps the thumb there.',
    ],
    keyboard: [
      { keys: 'Left / Right arrow', action: 'Decreases / increases by one step.' },
      { keys: 'Page Down / Page Up', action: 'Decreases / increases by a bigger step.' },
      { keys: 'Home / End', action: 'Jumps to the minimum / maximum.' },
    ],
    requirements: [
      'Always give a visible `label`. Use `aria-label` only where the layout really can\'t show one.',
      'Use `formatOptions` for units (percent, currency) so the value isn\'t just a bare number.',
      'Don\'t rely on a slider alone for exact numbers; offer a text field next to it if precision matters.',
    ],
  },

  guidelines: {
    do: [
      'Show the effect of the change while dragging, and save with `onChangeEnd`.',
      'Pick a `step` that matches how precise the value needs to be.',
    ],
    dont: [
      'Use a slider for a range with very many exact values (e.g. 1–1000 in steps of 1).',
      'Hide the label to save space.',
    ],
  },

  tokens: [
    'colorTheme/color.brand',
    'colorTheme/color.background',
    'colorTheme/color.background-inverse',
    'colorTheme/color.text',
    'colorTheme/color.text-inverse',
    'colorTheme/color.border',
    'colorTheme/color.brand-tint',
    'system/color.background-disabled-default',
    'system/color.background-disabled-inverse',
    'system/color.border-disabled',
    'spacing/spacing.2xs',
    'spacing/spacing.xs',
    'radius/border.radius.full',
    'borderWidth/border.width.sm',
    'borderWidth/border.width.md',
    'borderWidth/border.width.focus ring',
    'fontTheme/font.family.body',
    'typography/font.size.label',
    'typography/font.line height.label',
    'typography/font.size.caption',
    'typography/font.line height.caption',
    'typography/font.weight.semibold',
    'typography/font.weight.regular',
    'primitives/color.grayscale.000',
    'primitives/color.grayscale.1000',
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
    {
      trigger: 'Start or stop dragging, or keyboard focus',
      property: 'Value indicator fades in or out',
      duration: 'motion/duration.fast',
      easing: 'motion/easing.standard',
      reducedMotion: 'Appears instantly.',
    },
  ],

  figma: {
    componentKey: null,
    url: 'https://www.figma.com/design/tRoAewIghL1YbnTio6fkkw/Themis-Design-System?node-id=1874-2404',
    properties: {
      label: { figmaProperty: 'Label', type: 'TEXT' },
      isDisabled: { figmaProperty: 'state', type: 'VARIANT', values: { true: 'disabled' } },
    },
  },

  related: ['Switch', 'SegmentedControl'],
  notes: [
    'Figma\'s `progress` variants are just example values; in code it\'s `value` / `defaultValue` between `minValue` and `maxValue`.',
    'Figma\'s `indicator` variants show the value pill; in code it appears only while dragging or using the keyboard, and floats over the label row rather than reserving space above the track.',
    'The thumb (Figma "Thumb", default/activated/focused/disabled) grows to 36px while dragging (Figma `activated`); hover (32px) is not drawn in Figma.',
    'Figma\'s focused thumb draws its own 8/8 dashed ring; code uses the shared black/white ring.',
    'Single thumb only. Range sliders, tick marks (`stops`) and vertical sliders are not designed yet.',
  ],
});
