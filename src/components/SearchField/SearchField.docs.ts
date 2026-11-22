import { defineComponentDocs } from '../../docs/component-docs';

export default defineComponentDocs({
  name: 'SearchField',
  status: 'beta',
  category: 'Inputs',
  summary: 'A text field for search terms, with a search icon and a round button that clears what was typed.',
  base: {
    package: 'react-aria-components',
    component: 'SearchField',
    docsUrl: 'https://react-spectrum.adobe.com/react-aria/SearchField.html',
  },

  usage: {
    whenToUse: ['Filtering a list or page as people type, or searching on Enter.'],
    whenNotToUse: [
      { scenario: 'Picking one option from a known list.', useInstead: 'ComboBox or Select' },
      { scenario: 'Any other short free-text answer.', useInstead: 'TextInput' },
    ],
  },

  anatomy: [
    { part: 'Label', description: 'The field\'s name (`label`), label style.', required: true },
    { part: 'Input Box', description: 'The TextInput box: 40px, background, 2px border (error colour when invalid), radius md, input text style.', required: true },
    { part: 'Search icon', description: 'At the start of the box, 8px before the text. Hide it with `hideIcon`.', required: false },
    { part: 'Clear button', description: 'A 20px circle in background-inverse with an X in text-inverse, 8px after the text. Shows once something is typed; pointer cursor; 44px touch area on touch screens.', required: false },
    { part: 'Context', description: 'Caption row under the box with the description.', required: false },
    { part: 'Error message', description: 'Shown below when the field is invalid, in the error colour.', required: false },
  ],

  variants: {},

  accessibility: {
    providedByBase: [
      'The input is a searchbox, linked to its label, description and error message.',
      'The clear button is labelled "Clear search" (translated by React Aria) and kept out of the tab order, since Escape clears from the keyboard.',
      'Clearing moves focus back to the input.',
    ],
    keyboard: [
      { keys: 'Escape', action: 'Clears the field.' },
      { keys: 'Enter', action: 'Calls `onSubmit` with the search term.' },
    ],
    requirements: [
      'Always give a visible `label` (or `aria-label` when a search box really can\'t show one). A placeholder is not a label.',
      'When results update as people type, say how many there are somewhere a screen reader will announce it.',
    ],
  },

  guidelines: {
    do: ['Say what can be searched in the label or placeholder ("Find a component").', 'Show a message when nothing matches.'],
    dont: ['Hide the icon without another sign that it\'s a search.', 'Make people press a button to clear the field.'],
  },

  motion: [
    {
      trigger: 'Clear button hovered',
      property: 'Its fill fades to background-inverse-hover',
      duration: 'motion/duration.fast',
      easing: 'motion/easing.standard',
      reducedMotion: 'The colour changes instantly.',
    },
    {
      trigger: 'Clear button pressed',
      property: 'The circle shrinks to scale.pressed (0.96), as Button does',
      duration: 'motion/duration.fast',
      easing: 'motion/easing.standard',
      reducedMotion: 'No shrink.',
    },
  ],

  tokens: [
    'colorTheme/color.background',
    'colorTheme/color.text',
    'colorTheme/color.border',
    'colorTheme/color.state.error',
    'colorTheme/color.background-inverse',
    'colorTheme/color.background-inverse-hover',
    'colorTheme/color.text-inverse',
    'colorTheme/color.text-placeholder-default',
    'system/color.background-disabled-inverse',
    'system/color.background-disabled-default',
    'system/color.border-disabled',
    'system/color.text-disabled-default',
    'system/color.text-disabled-inverse',
    'spacing/spacing.2xs',
    'spacing/spacing.xs',
    'spacing/spacing.sm',
    'radius/border.radius.md',
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
    'typography/font.weight.semibold',
    'typography/font.weight.regular',
    'motion/duration.fast',
    'motion/easing.standard',
    'motion/scale.pressed',
  ],

  figma: {
    componentKey: null,
    url: 'https://www.figma.com/design/tRoAewIghL1YbnTio6fkkw/Themis-Design-System?node-id=2478-2802',
    properties: {
      isDisabled: { figmaProperty: 'state', type: 'VARIANT', values: { true: 'disabled' } },
      isInvalid: { figmaProperty: 'state', type: 'VARIANT', values: { true: 'errored' } },
      description: { figmaProperty: 'description', type: 'VARIANT' },
      hideIcon: { figmaProperty: 'searchIcon', type: 'BOOLEAN', values: { true: 'false', false: 'true' } },
    },
  },

  related: ['TextInput', 'ComboBox'],
  notes: [
    'Shares the TextInput box (src/components/TextInput/field-base.ts), so the two always line up.',
    'The clear button keeps its space while hidden, so the text never moves when it appears.',
  ],
});
