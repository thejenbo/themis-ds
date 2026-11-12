import { defineComponentDocs } from '../../docs/component-docs';

export default defineComponentDocs({
  name: 'Button',
  status: 'beta',
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
      { scenario: 'The button shows only an icon, with no visible label.', useInstead: 'IconButton' },
      { scenario: 'Toggling a setting on or off.', useInstead: 'Switch' },
      { scenario: 'Signalling an error without an action (e.g. a failed save).', useInstead: 'an inline message, not a danger Button' },
    ],
  },

  anatomy: [
    {
      part: 'Button',
      description:
        'The clickable element. Carries the focus ring and, on touch screens, an invisible 44×44px touch area. It never changes size.',
      required: true,
    },
    {
      part: 'Surface',
      description: 'The visible button: fill, border (outline variant) and padding. Shrinks slightly while pressed.',
      required: true,
    },
    {
      part: 'State Layer',
      description:
        'Overlay shown on hover and press. Its colour is calculated from the Surface: lightening on dark colours, darkening on light ones.',
      required: true,
    },
    { part: 'Icon Left', description: 'Optional decorative icon before the label.', required: false },
    { part: 'Label', description: 'Text describing the action, sentence case, starting with a verb.', required: true },
    { part: 'Icon Right', description: 'Optional decorative icon after the label.', required: false },
  ],

  variants: {
    variant: {
      default: 'Filled. The main action in a region. Use at most one per region.',
      outline: 'Bordered. Secondary actions next to a default button, such as "Cancel".',
      subtle: 'No fill or border until hovered. Low-priority or repeated actions, such as in toolbars and lists.',
    },
    size: {
      micro: 'Dense UIs such as tables and toolbars. Keep enough space around it on touch screens (see Touch targets).',
      small: 'Default for forms and dialogs.',
      medium: 'Prominent calls to action.',
    },
    tone: {
      brand: 'The brand colour of the current colour theme. The default for most actions.',
      neutral: 'Black and white (inverted in dark themes). For actions that should not compete with the brand colour, such as toolbars and secondary flows.',
      danger: 'The error colour. Only for destructive or irreversible actions, such as "Delete project". Pair with a confirmation step.',
      warning: 'The warning colour. For an action inside a warning message, such as "Review" in a warning Toast.',
      success: 'The success colour. For an action inside a success message, such as "View" in a success Toast.',
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
      { keys: 'Tab', action: 'Moves focus to or away from the button.' },
    ],
    requirements: [
      'The label must make sense on its own: icons are decorative and hidden from screen readers.',
      'Pass a localised `pendingLabel` when using `isPending`.',
      'Do not nest interactive elements inside a Button.',
      'On touch screens, leave enough space between buttons that their 44×44px touch areas do not overlap (see Foundations / Touch targets).',
      'Sticky headers and footers must not cover a focused button (WCAG 2.4.11), for example by setting `scroll-padding` on the page.',
    ],
  },

  guidelines: {
    do: [
      'Start labels with a verb: "Save changes", "Add member".',
      'Pair a default button with an outline "Cancel".',
      'Use `isPending` instead of disabling while an action is in progress, unless the action must not be retried.',
    ],
    dont: [
      'Place more than one default button in the same region.',
      'Use the danger tone for anything that is not destructive. Its meaning wears off if it is used for emphasis.',
      'Use a Button to navigate. Use Link.',
      'Override colours via `xstyle`; it is for layout only.',
    ],
  },

  content: {
    guidance: ['Sentence case.', 'Keep to 1–3 words where possible.', 'No trailing punctuation.'],
  },

  tokens: [
    'colorTheme/color.brand',
    'colorTheme/color.error',
    'colorTheme/color.background',
    'colorTheme/color.background-inverse',
    'colorTheme/color.text',
    'colorTheme/color.border',
    'colorTheme/color.text-brand',
    'colorTheme/color.text-inverse',
    'colorTheme/color.warning',
    'colorTheme/color.success',
    'colorTheme/color.border-brand',
    'colorTheme/color.transform-20',
    'colorTheme/color.transform-90',
    'system/color.background-disabled-default',
    'system/color.background-disabled-inverse',
    'system/color.text-disabled-default',
    'system/color.text-disabled-inverse',
    'system/color.border-disabled',
    'spacing/spacing.3xs',
    'spacing/spacing.2xs',
    'spacing/spacing.xs',
    'spacing/spacing.sm',
    'radius/border.radius.md',
    'borderWidth/border.width.sm',
    'borderWidth/border.width.mandatory',
    'borderWidth/border.width.focus ring',
    'typography/font.size.label',
    'typography/font.line height.label',
    'typography/font.weight.semibold',
    'fontTheme/font.family.body',
    'primitives/color.grayscale.000',
    'primitives/color.grayscale.1000',
    'motion/duration.fast',
    'motion/duration.base',
    'motion/duration.slow',
    'motion/easing.standard',
    'motion/scale.pressed',
  ],

  motion: [
    {
      trigger: 'Hover or press',
      property: 'State Layer fades in',
      duration: 'motion/duration.base',
      easing: 'motion/easing.standard',
      reducedMotion: 'Unchanged (colour change only, no movement).',
    },
    {
      trigger: 'Press (pointer, Space or Enter)',
      property: 'Surface shrinks to motion/scale.pressed; the clickable area does not',
      duration: 'motion/duration.fast',
      easing: 'motion/easing.standard',
      reducedMotion: 'No shrink.',
    },
    {
      trigger: 'Release',
      property: 'Surface returns to full size',
      duration: 'motion/duration.slow',
      easing: 'motion/easing.standard',
      reducedMotion: 'No shrink.',
    },
  ],

  figma: {
    componentKey: null,
    url: 'https://www.figma.com/design/tRoAewIghL1YbnTio6fkkw/Themis-Design-System?node-id=1010-80',
    properties: {
      variant: { figmaProperty: 'variant', type: 'VARIANT' },
      size: { figmaProperty: 'size', type: 'VARIANT' },
      isDisabled: { figmaProperty: 'state', type: 'VARIANT', values: { true: 'disabled' } },
      iconLeft: { figmaProperty: 'iconLeft', type: 'VARIANT', values: { set: 'true', unset: 'false' } },
      iconRight: { figmaProperty: 'iconRight', type: 'VARIANT', values: { set: 'true', unset: 'false' } },
    },
  },

  related: ['Link', 'IconButton'],
  notes: [
    'Figma\'s `state` property also has `hovered` and `focused`. In code these come from interaction, not props.',
    'The `tone` prop maps to a Figma component set, not to a property: "Button - Brand" (node 1010:80), "Button - Neutral" (2092:18429) and "Button - Danger" (2092:18796).',
    'Danger outline and subtle buttons keep a `text`-coloured label with an `error`-coloured icon, as in Figma.',
    'Figma draws the danger focus ring in red. Code uses the system-wide black and white ring for every tone (see Foundations / Focus ring).',
    'Pressed is not drawn in Figma: Figma can\'t scale variables, so a scaled copy loses its token bindings. In code it is the hover look plus the shrink described under Motion.',
    'Figma draws the focus ring with extra padding; in code the ring sits outside the button and never changes its size.',
    '`isPending` (spinner) is not designed in Figma yet.',
  ],
});
