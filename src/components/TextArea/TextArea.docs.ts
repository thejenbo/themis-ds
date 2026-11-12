import { defineComponentDocs } from '../../docs/component-docs';

export default defineComponentDocs({
  name: 'TextArea',
  status: 'beta',
  category: 'Inputs',
  summary: 'A multi-line text field for longer answers, such as a bio, feedback or a message.',
  base: {
    package: 'react-aria-components',
    component: 'TextField',
    docsUrl: 'https://react-spectrum.adobe.com/react-aria/TextField.html',
  },

  usage: {
    whenToUse: ['Answers that can run to several sentences: descriptions, bios, feedback, notes, messages.'],
    whenNotToUse: [
      { scenario: 'Short answers on one line (a name, a title, an email address).', useInstead: 'TextInput' },
      { scenario: 'Formatted text (bold, lists, links).', useInstead: 'a rich text editor (not part of Themis yet)' },
    ],
  },

  anatomy: [
    { part: 'Label', description: 'The field\'s name (`label`), label style. "(optional)" is added with `isOptional`.', required: true },
    { part: 'Textarea Box', description: '130px tall to start, then grows with the text up to `maxRows` lines and scrolls inside. Same border, radius, padding and text style as TextInput\'s box.', required: true },
    { part: 'Context', description: 'Caption row under the box: description on the left, character count on the right (red over the limit).', required: false },
    { part: 'Error message', description: 'Shown below the context row when the field is invalid, in the error colour.', required: false },
  ],

  variants: {},

  accessibility: {
    providedByBase: [
      'The label is linked to the text area, and the description, count and error message are read as its description.',
      'aria-invalid is set when the field is invalid; the error message is linked so it\'s read with the field.',
      'Built-in validation (`isRequired`, `validate`, `minLength`) shows its messages when the form is submitted.',
    ],
    keyboard: [
      { keys: 'Tab', action: 'Moves focus into and out of the field.' },
      { keys: 'Enter', action: 'Starts a new line (it doesn\'t submit the form).' },
    ],
    requirements: [
      'Always give a visible `label`. A placeholder is not a label: it disappears as soon as someone types.',
      'Over the character limit, the field is marked invalid and the overage is announced; say so in the error message too if you block submitting.',
    ],
  },

  guidelines: {
    do: [
      'Say roughly how much to write in the description ("A sentence or two").',
      'Set `characterLimit` when there is a real limit, so people see it before they hit it.',
    ],
    dont: ['Use a text area for one-line answers.', 'Cut off pasted text at the limit; let people trim it themselves.'],
  },

  tokens: [
    'colorTheme/color.background',
    'colorTheme/color.text',
    'colorTheme/color.border',
    'colorTheme/color.error',
    'system/color.background-disabled-inverse',
    'system/color.border-disabled',
    'system/color.text-disabled-default',
    'system/color.placeholder-default',
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
  ],

  figma: {
    componentKey: null,
    url: 'https://www.figma.com/design/tRoAewIghL1YbnTio6fkkw/Themis-Design-System?node-id=1843-8705',
    properties: {
      isDisabled: { figmaProperty: 'state', type: 'VARIANT', values: { true: 'disabled' } },
      isInvalid: { figmaProperty: 'state', type: 'VARIANT', values: { true: 'errored' } },
      description: { figmaProperty: 'description', type: 'VARIANT' },
      characterLimit: { figmaProperty: 'charLimit', type: 'VARIANT' },
    },
  },

  related: ['TextInput'],
  notes: [
    'Built on Figma "Textarea" and "Textarea Box" (node 1843-9407), with the shared field styles from TextInput.',
    'Figma\'s box is a fixed 130px; in code that\'s the starting height, and the box grows with the text up to `maxRows` (10 lines by default), then scrolls. There is no drag handle.',
    'The character count works as in TextInput: people can type past it; the count and border turn red, the field is marked invalid, and the overage is announced.',
    'No error icon (Figma): in a tall box it would sit away from the text. The red border and message show the error.',
    'The focus ring sits inside the box, 2px in from the border, and shows whenever the field has focus.',
  ],
});
