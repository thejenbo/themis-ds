import { defineComponentDocs } from '../../docs/component-docs';

export default defineComponentDocs({
  name: 'Checkbox',
  status: 'beta',
  category: 'Inputs',
  summary: 'A single yes/no choice that takes effect when a form is submitted, such as agreeing to terms or opting into emails.',
  base: {
    package: 'react-aria-components',
    component: 'CheckboxField',
    docsUrl: 'https://react-spectrum.adobe.com/react-aria/Checkbox.html',
  },

  usage: {
    whenToUse: [
      'Agreeing to something or opting in, as part of a form ("I agree to the terms", "Email me about new features").',
      'A "select all" control for a list, with `isIndeterminate` while only some items are chosen.',
    ],
    whenNotToUse: [
      { scenario: 'A setting that applies straight away.', useInstead: 'Switch' },
      { scenario: 'Choosing exactly one of several options.', useInstead: 'RadioGroup' },
      { scenario: 'Choosing several options under one question.', useInstead: 'a Checkbox for each for now (a CheckboxGroup is coming later)' },
    ],
  },

  anatomy: [
    { part: 'Box', description: '24px, filling the label\'s first line: border/width/mandatory in color/border (so it keeps its border when the border width is none), radius xs, background fill. The `check` icon (or `minus` when indeterminate), 16px, in background-inverse; like every icon it follows the border width and radius.', required: true },
    { part: 'Label', description: 'The input text style, 8px after the box. Wraps under itself, with the box on the first line. Clicking it toggles the box.', required: true },
    { part: 'Description / Error message', description: 'Help text (caption) and the error message, 4px below, as in the other inputs.', required: false },
  ],

  variants: {},

  accessibility: {
    providedByBase: [
      'A native checkbox input, named by its label, so it works with every screen reader, browser autofill and form submission.',
      'Indeterminate is announced as "mixed".',
      'The description and error message are linked; `isRequired` validation shows its message on submit.',
    ],
    keyboard: [
      { keys: 'Tab', action: 'Moves focus to the checkbox and on.' },
      { keys: 'Space', action: 'Ticks or unticks it.' },
    ],
    requirements: [
      'Write the label as a statement that\'s true when ticked ("Email me about new features"), never a question.',
      'Say what an error means in the message: the box itself doesn\'t change colour (Figma).',
    ],
  },

  guidelines: {
    do: ['Leave opt-in boxes unticked by default.', 'Keep the label short; put details in the description.'],
    dont: ['Use a checkbox to apply a setting immediately; use a Switch.', 'Write negative labels ("Don\'t send me emails").'],
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
    'radius/border.radius.xs',
    'radius/border.radius.sm',
    'borderWidth/border.width.mandatory',
    'borderWidth/border.width.focus ring',
    'fontTheme/font.family.body',
    'typography/font.size.input',
    'typography/font.line height.input',
    'typography/font.size.caption',
    'typography/font.line height.caption',
    'typography/font.size.sm',
    'typography/font.line height.sm',
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
      trigger: 'Ticked',
      property: 'The check draws itself in, from left to right',
      duration: 'motion/duration.fast',
      easing: 'motion/easing.standard',
      reducedMotion: 'The check appears instantly.',
    },
    {
      trigger: 'Pressed',
      property: 'The box shrinks to scale.pressed (0.96), as in Radio and Switch',
      duration: 'motion/duration.fast',
      easing: 'motion/easing.standard',
      reducedMotion: 'No shrink.',
    },
  ],

  figma: {
    componentKey: null,
    url: 'https://www.figma.com/design/tRoAewIghL1YbnTio6fkkw/Themis-Design-System?node-id=2248-16469',
    properties: {
      isSelected: { figmaProperty: 'selected', type: 'VARIANT' },
      isDisabled: { figmaProperty: 'state', type: 'VARIANT', values: { true: 'disabled' } },
      isInvalid: { figmaProperty: 'state', type: 'VARIANT', values: { true: 'errored' } },
      isIndeterminate: { figmaProperty: 'selected', type: 'VARIANT', values: { true: 'indeterminate' } },
    },
  },

  related: ['RadioGroup', 'Switch'],
  notes: [
    'Errors show only as the message, as in RadioGroup; the box doesn\'t turn red.',
    'The focus ring is the shared black/white ring around the whole row, radius sm corners, keyboard focus only. On touch screens the row\'s target is at least 44px tall.',
    'Not built yet: CheckboxGroup (a question label, help and error around several checkboxes).',
  ],
});
