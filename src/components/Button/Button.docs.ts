import { defineComponentDocs } from '../../docs/component-docs';

export default defineComponentDocs({
  name: 'Button',
  status: 'draft',
  category: 'Actions',
  summary: 'Triggers an action or event, such as submitting a form, opening a dialog or saving a change.',
  base: {
    package: 'react-aria-components',
    component: 'Button',
    docsUrl: 'https://react-spectrum.adobe.com/react-aria/Button.html',
  },

  usage: {
    whenToUse: [
      'The user needs to perform an action on the current page (save, submit, delete, open).',
      'Confirming or cancelling a dialog or form.',
    ],
    whenNotToUse: [
      { scenario: 'Navigating to another page or URL.', useInstead: 'Link' },
      { scenario: 'Toggling a setting on or off.', useInstead: 'Switch' },
      { scenario: 'Choosing one option from a small set.', useInstead: 'SegmentedControl' },
    ],
  },

  anatomy: [
    { part: 'Container', description: 'The pressable surface; carries background, border and focus ring.', required: true },
    { part: 'Label', description: 'Text describing the action, sentence case, starting with a verb.', required: true },
    { part: 'Spinner', description: 'Replaces the label visually while `isPending` is true; the label width is preserved.', required: false },
  ],

  variants: {
    variant: {
      primary: 'The single most important action in a view. Use at most one per region.',
      secondary: 'All other actions, including "Cancel" next to a primary action.',
    },
    size: {
      sm: 'Dense UIs such as tables and toolbars.',
      md: 'Default for forms and dialogs.',
      lg: 'Prominent calls to action and touch-first layouts.',
    },
  },

  accessibility: {
    providedByBase: [
      'Renders a native <button> with correct role and type.',
      'Press events unified across mouse, touch, keyboard and screen readers.',
      'Focus ring shown for keyboard focus only (isFocusVisible).',
      'isDisabled removes the button from interaction; isPending keeps it focusable and announces progress.',
    ],
    keyboard: [
      { keys: 'Enter', action: 'Activates the button.' },
      { keys: 'Space', action: 'Activates the button.' },
      { keys: 'Tab', action: 'Moves focus to / away from the button.' },
    ],
    requirements: [
      'Icon-only buttons must have an `aria-label`.',
      'Pass a localised `pendingLabel` when using `isPending`.',
      'Do not nest interactive elements inside a Button.',
    ],
  },

  guidelines: {
    do: [
      'Start labels with a verb: "Save changes", "Add member".',
      'Pair a primary action with a secondary "Cancel".',
      'Use `isPending` instead of disabling while an action is in progress.',
    ],
    dont: [
      'Place more than one primary button in the same region.',
      'Use a Button to navigate — use Link.',
      'Override colours via `xstyle`; it is for layout only.',
    ],
  },

  content: {
    guidance: ['Sentence case.', 'Keep to 1–3 words where possible.', 'No trailing punctuation.'],
  },

  tokens: [
    'colorTheme/color.brand',
    'colorTheme/color.background',
    'colorTheme/color.text',
    'colorTheme/color.text-inverse',
    'colorTheme/color.border',
    'colorTheme/color.border-brand',
    'colorTheme/color.transform-5-inverse',
    'primitives/border.radius.6',
    'primitives/border.radius.9999',
    'primitives/spacing.8',
    'primitives/spacing.12',
    'primitives/spacing.16',
    'primitives/spacing.24',
    'typography/font.size.xs',
    'typography/font.size.sm',
    'typography/font.size.md',
    'typography/font.weight.regular',
    'fontTheme/font.family.body',
  ],

  figma: {
    componentKey: null,
    url: null,
    properties: {
      variant: { figmaProperty: 'Variant', type: 'VARIANT', values: { primary: 'Primary', secondary: 'Secondary' } },
      size: { figmaProperty: 'Size', type: 'VARIANT', values: { sm: 'Small', md: 'Medium', lg: 'Large' } },
      isDisabled: { figmaProperty: 'Disabled', type: 'BOOLEAN' },
      isPending: { figmaProperty: 'Pending', type: 'BOOLEAN' },
      children: { figmaProperty: 'Label', type: 'TEXT' },
    },
  },

  related: ['Link', 'ToggleButton'],
  notes: ['Placeholder variants/tokens — align with the Figma component set once tokens are imported.'],
});
