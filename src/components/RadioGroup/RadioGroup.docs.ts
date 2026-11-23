import { defineComponentDocs } from '../../docs/component-docs';

export default defineComponentDocs({
  name: 'RadioGroup',
  status: 'beta',
  category: 'Inputs',
  summary: 'Picks exactly one of a few options that are all visible at once, such as a delivery speed or a plan.',
  base: {
    package: 'react-aria-components',
    component: 'RadioGroup',
    docsUrl: 'https://react-spectrum.adobe.com/react-aria/RadioGroup.html',
  },

  usage: {
    whenToUse: [
      'Choosing one of 2–6 options that people should compare side by side before choosing.',
      'Form questions where every option needs a sentence of explanation-free label ("Standard (3–5 days)").',
    ],
    whenNotToUse: [
      { scenario: 'More than about 6 options, or options people already know.', useInstead: 'Select' },
      { scenario: 'An on/off setting that applies right away.', useInstead: 'Switch' },
      { scenario: '2–5 short options that switch a view.', useInstead: 'SegmentedControl' },
      { scenario: 'Choosing several options.', useInstead: 'a Checkbox for each (a CheckboxGroup is coming later)' },
    ],
  },

  anatomy: [
    { part: 'Label', description: 'The question (`label`), label style. "(optional)" is added with `isOptional`.', required: true },
    { part: 'Radio Buttons', description: 'The options, 16px apart: stacked (`vertical`) or side by side, wrapping (`horizontal`).', required: true },
    { part: 'Radio Button', description: 'A 28px circle (border/width/mandatory in color/border, so it keeps its border when the border width is none, background fill, a 12px dot when chosen) and its label 8px after it, in the input text style. The whole row is clickable.', required: true },
    { part: 'Description / Error message', description: 'Help text (caption) and the error message, as in TextInput.', required: false },
  ],

  variants: {
    orientation: {
      vertical: 'The default. Options stacked, 16px apart.',
      horizontal: 'Options side by side, 16px apart, wrapping onto new lines when there isn\'t room. For two or three short options.',
    },
  },

  accessibility: {
    providedByBase: [
      'The group is a radiogroup named by its label; each option is a native radio input, so it works with every screen reader and browser autofill.',
      'One Tab stop for the whole group: Tab lands on the chosen option (or the first), arrow keys move and choose, and disabled options are skipped.',
      'The description and error message are linked to the group; `isRequired` validation shows its message on submit.',
    ],
    keyboard: [
      { keys: 'Tab', action: 'Moves into the group (to the chosen option) and out of it.' },
      { keys: 'Arrow keys', action: 'Move to the next or previous option and choose it.' },
      { keys: 'Space', action: 'Chooses the focused option, if it isn\'t chosen yet.' },
    ],
    requirements: [
      'Always give the group a `label` that asks the question; the options\' labels answer it.',
      'Say what an error means in the message: the circles themselves don\'t change color (Figma).',
    ],
  },

  guidelines: {
    do: [
      'Preselect the option most people want, unless choosing it should be a deliberate act.',
      'Order options logically: cheapest to most expensive, slowest to fastest, or by how often they\'re chosen.',
    ],
    dont: ['Use a single radio on its own; use a checkbox or Switch.', 'Make options that overlap, so more than one could be true.'],
  },

  tokens: [
    'colorTheme/color.background',
    'colorTheme/color.background-inverse',
    'colorTheme/color.text',
    'colorTheme/color.border',
    'colorTheme/color.state.error',
    'system/color.background-disabled-inverse',
    'system/color.background-disabled-default',
    'system/color.border-disabled',
    'colorTheme/color.text-disabled-on-background',
    'spacing/spacing.3xs',
    'spacing/spacing.2xs',
    'spacing/spacing.xs',
    'spacing/spacing.sm',
    'radius/border.radius.sm',
    'radius/border.radius.full',
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
      trigger: 'Option chosen',
      property: 'The dot grows in from the center',
      duration: 'motion/duration.fast',
      easing: 'motion/easing.standard',
      reducedMotion: 'The dot appears instantly.',
    },
    {
      trigger: 'Option pressed',
      property: 'The circle shrinks to scale.pressed (0.96), as in Switch',
      duration: 'motion/duration.fast',
      easing: 'motion/easing.standard',
      reducedMotion: 'No shrink.',
    },
  ],

  figma: {
    componentKey: null,
    url: 'https://www.figma.com/design/tRoAewIghL1YbnTio6fkkw/Themis-Design-System?node-id=2248-16566',
    properties: {
      isDisabled: { figmaProperty: 'state', type: 'VARIANT', values: { true: 'disabled' } },
      isInvalid: { figmaProperty: 'state', type: 'VARIANT', values: { true: 'errored' } },
      orientation: { figmaProperty: 'layout', type: 'VARIANT' },
      description: { figmaProperty: 'description', type: 'VARIANT' },
    },
  },

  related: ['Checkbox', 'Select', 'SegmentedControl', 'Switch'],
  notes: [
    'Figma "Radio Input" is a RadioGroup with a label; "Radio Button Group" (node 1342-6478) is one without a visible label (give it an `aria-label`); "Radio Button" (node 1342-6439) is `Radio`.',
    'Errored groups look like the default ones apart from the error message (Figma). `disabledErrored` looks disabled.',
    'The focus ring is the shared black/white ring around the whole row (circle and label), with radius sm corners, for keyboard focus only.',
    'On touch screens each row\'s target is 44px tall; with 16px between 28px rows, neighboring targets meet without overlapping.',
  ],
});
