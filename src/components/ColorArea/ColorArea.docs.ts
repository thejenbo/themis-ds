import { defineComponentDocs } from '../../docs/component-docs';

export default defineComponentDocs({
  name: 'ColorArea',
  status: 'beta',
  category: 'Color',
  summary: 'Picks a colour by dragging a thumb over a square of colours that changes along two channels.',
  base: {
    package: 'react-aria-components',
    component: 'ColorArea',
    docsUrl: 'https://react-spectrum.adobe.com/react-aria/ColorArea.html',
  },

  usage: {
    whenToUse: [
      'Free colour choice, usually saturation and lightness (or brightness) for the hue chosen in a ColorSlider.',
      'The main surface of a colour picker.',
    ],
    whenNotToUse: [
      { scenario: 'Changing a single channel.', useInstead: 'ColorSlider' },
      { scenario: 'Choosing from a fixed set of colours.', useInstead: 'a swatch picker (coming later)' },
    ],
  },

  anatomy: [
    { part: 'Area', description: 'The two-channel gradient (x channel left to right, y channel bottom to top), with border/radius/md corners and a border/width/md border in color/border drawn inside it. Fills its container\'s width at 345 × 284 proportions.', required: true },
    { part: 'Thumb', description: '"Bullseye": a 32px circle with a black border, a white ring inside it, and the current colour in the middle with its own black border (border/width/mandatory each).', required: true },
  ],

  variants: {
    'xChannel / yChannel': {
      'saturation / lightness': 'The default for hsl colours.',
      'saturation / brightness': 'The default for hsb colours.',
      'red / green (or any two RGB channels)': 'For rgb colours; the third channel stays fixed.',
    },
  },

  accessibility: {
    providedByBase: [
      'The thumb holds two native range inputs, one per channel, described as a "2D slider", with the colour announced as it changes.',
      'Left/Right arrows change the x channel and Up/Down the y channel; Page Up/Down and Shift+arrows take bigger steps; Home/End jump.',
      'Clicking or tapping the area moves the thumb there.',
      'On touch screens, swiping changes one channel at a time.',
    ],
    keyboard: [
      { keys: 'Left / Right arrow', action: 'Changes the x channel by one step.' },
      { keys: 'Up / Down arrow', action: 'Changes the y channel by one step.' },
      { keys: 'Shift + arrows, Page Up / Page Down', action: 'Change by a bigger step.' },
      { keys: 'Home / End', action: 'Jump the x channel to its minimum / maximum.' },
    ],
    requirements: [
      'Give it an `aria-label` that says what the colour is for, e.g. "Background colour".',
      'Show the chosen colour as text (e.g. its hex value) next to it, for people who can\'t judge colours by eye.',
    ],
  },

  guidelines: {
    do: [
      'Pair it with a hue ColorSlider and a ColorSwatch preview.',
      'Save with `onChangeEnd`, and use `onChange` only to preview.',
    ],
    dont: [
      'Make it so small that the thumb covers much of it.',
    ],
  },

  tokens: [
    'colorTheme/color.border',
    'system/color.background-disabled-default',
    'system/color.background-disabled-inverse',
    'system/color.border-disabled',
    'primitives/color.grayscale.000',
    'primitives/color.grayscale.030',
    'primitives/color.grayscale.1000',
    'radius/border.radius.md',
    'radius/border.radius.full',
    'borderWidth/border.width.md',
    'borderWidth/border.width.mandatory',
    'borderWidth/border.width.sm',
    'borderWidth/border.width.focus ring',
  ],

  figma: {
    componentKey: null,
    url: 'https://www.figma.com/design/tRoAewIghL1YbnTio6fkkw/Themis-Design-System?node-id=2335-273',
    properties: {
      isDisabled: { figmaProperty: 'state', type: 'VARIANT', values: { true: 'disabled' } },
    },
    differences: [
      { topic: 'Size', figma: '345 × 284px.', code: 'Fills its container\'s width at the same proportions; set the size through `xstyle`.', action: 'annotate-figma', done: '2026-11-14' },
    ],
  },

  related: ['ColorSlider', 'ColorSwatch'],
  notes: [
    'The thumb doesn\'t grow on hover or while dragging, as in Figma; the slider thumbs do.',
  ],
});
