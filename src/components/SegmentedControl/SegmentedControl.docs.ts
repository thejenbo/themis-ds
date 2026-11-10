import { defineComponentDocs } from '../../docs/component-docs';

export default defineComponentDocs({
  name: 'SegmentedControl',
  status: 'beta',
  category: 'Selection',
  summary: 'A row of joined buttons for picking one option that takes effect straight away, such as units or views.',
  base: {
    package: 'react-aria-components',
    component: 'ToggleButtonGroup',
    docsUrl: 'https://react-spectrum.adobe.com/react-aria/ToggleButtonGroup.html',
  },

  usage: {
    whenToUse: [
      'Switching between 2–5 short options that change what is shown right away (cm / in, List / Grid, Day / Week / Month).',
      'Filters where exactly one option applies.',
    ],
    whenNotToUse: [
      { scenario: 'More than about five options, or long labels.', useInstead: 'Select' },
      { scenario: 'A choice in a form that is only applied when the form is submitted.', useInstead: 'RadioGroup' },
      { scenario: 'Turning one thing on or off.', useInstead: 'Switch or ToggleButton' },
      { scenario: 'Switching between panels of content.', useInstead: 'Tabs' },
    ],
  },

  anatomy: [
    { part: 'Container', description: 'The outer border (border-brand, radius sm). Drawn on top of the items, so it adds no size.', required: true },
    { part: 'Item', description: 'One option. Selected: brand fill. Not selected: background fill, brand label.', required: true },
    { part: 'State Layer', description: 'Hover and press overlay on items that are not selected.', required: true },
  ],

  variants: {
    size: {
      micro: '24px tall. Dense UIs. On touch screens items are at least 44px wide.',
      small: '32px tall. The default.',
      medium: '40px tall.',
    },
    isFullWidth: {
      true: 'Stretches to the container; every item gets the same width. Good for mobile filters.',
      false: 'Fits its content. The default.',
    },
  },

  accessibility: {
    providedByBase: [
      'role="radiogroup" with one role="radio" per item, so screen readers announce "1 of 3, selected".',
      'Arrow keys move between items; Tab moves into the control (onto the selected item) and out of it.',
      'One item is always selected.',
      'Focus ring shown for keyboard focus only (isFocusVisible).',
    ],
    keyboard: [
      { keys: 'Tab', action: 'Moves focus to the selected item, or out of the control.' },
      { keys: 'Arrow keys', action: 'Move focus between items.' },
      { keys: 'Space / Enter', action: 'Selects the focused item.' },
    ],
    requirements: [
      'Name the control with `aria-label` or `aria-labelledby` (TypeScript enforces one of them), e.g. "Units".',
      'Icon-only items need their own `aria-label`.',
      'Colour is not the only cue: the selected item is filled, the others are not.',
    ],
  },

  guidelines: {
    do: [
      'Keep labels to a word or two, and similar in length.',
      'Apply the change as soon as an item is selected.',
      'Match sizes in a row: a small SegmentedControl next to a small Button.',
    ],
    dont: [
      'Use it for actions; each item is a choice, not a command.',
      'Mix icons-only and text items in one control.',
      'Wrap it onto two lines.',
    ],
  },

  tokens: [
    'colorTheme/color.brand',
    'colorTheme/color.background',
    'colorTheme/color.border-brand',
    'colorTheme/color.text-brand',
    'colorTheme/color.text-inverse',
    'colorTheme/color.transform-90',
    'system/color.background-disabled-default',
    'system/color.background-disabled-inverse',
    'system/color.text-disabled-default',
    'system/color.text-disabled-inverse',
    'system/color.border-disabled',
    'spacing/spacing.3xs',
    'spacing/spacing.2xs',
    'spacing/spacing.xs',
    'radius/border.radius.sm',
    'borderWidth/border.width.mandatory',
    'borderWidth/border.width.focus ring',
    'fontTheme/font.family.body',
    'typography/font.size.label',
    'typography/font.line height.sm',
    'typography/font.weight.semibold',
    'primitives/color.grayscale.000',
    'primitives/color.grayscale.1000',
    'motion/duration.base',
    'motion/easing.standard',
  ],

  motion: [
    {
      trigger: 'Select an item',
      property: 'Fill and label colour fade to the selected look',
      duration: 'motion/duration.base',
      easing: 'motion/easing.standard',
      reducedMotion: 'Changes instantly.',
    },
    {
      trigger: 'Hover or press (items not selected)',
      property: 'State Layer fades in',
      duration: 'motion/duration.base',
      easing: 'motion/easing.standard',
      reducedMotion: 'Unchanged (colour change only, no movement).',
    },
  ],

  figma: {
    componentKey: null,
    url: 'https://www.figma.com/design/tRoAewIghL1YbnTio6fkkw/Themis-Design-System?node-id=2052-12626',
    properties: {
      size: { figmaProperty: 'size', type: 'VARIANT' },
      isDisabled: { figmaProperty: 'state', type: 'VARIANT', values: { true: 'disabled' } },
    },
  },

  related: ['ToggleButton', 'Switch', 'RadioGroup', 'Tabs'],
  notes: [
    'Items: Figma "Segmented Control Item" (node 2052-12657). Its `left` / `right` corner variants are automatic in code (first and last item).',
    'The selected item has no hover (selecting it again does nothing) and keeps the default cursor.',
    'No press shrink: a segment shrinking inside the shared border looks broken. Hover and press show the State Layer only.',
    'Figma\'s focus ring colour is replaced by the shared black/white ring, lifted above neighbouring items.',
    'Radius sm at every size is intentional (unlike Button, which uses md for small and medium).',
  ],
});
