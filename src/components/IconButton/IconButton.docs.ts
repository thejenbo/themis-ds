import { defineComponentDocs } from '../../docs/component-docs';

export default defineComponentDocs({
  name: 'IconButton',
  status: 'beta',
  category: 'Actions',
  summary: 'A button that shows only an icon, for compact actions such as toolbars and table rows.',
  base: {
    package: 'react-aria-components',
    component: 'Button',
    docsUrl: 'https://react-spectrum.adobe.com/react-aria/Button.html',
  },

  usage: {
    whenToUse: [
      'Space is tight and the action is common enough that its icon is widely understood (close, edit, delete, more).',
      'The same action repeats on every row of a list or table.',
      'Toolbars where several related actions sit side by side.',
    ],
    whenNotToUse: [
      { scenario: 'There is room for a label, or the icon could be misread.', useInstead: 'Button' },
      { scenario: 'Navigating to another page or URL.', useInstead: 'Link' },
      { scenario: 'Turning something on or off (e.g. bold in a text editor).', useInstead: 'ToggleButton' },
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
      description: 'The visible square: fill, border (outline variant) and padding. Shrinks slightly while pressed.',
      required: true,
    },
    {
      part: 'State Layer',
      description:
        'Overlay shown on hover and press. Its color is calculated from the Surface: lightening on dark colors, darkening on light ones.',
      required: true,
    },
    { part: 'Icon', description: 'The icon, passed as children. Decorative: `aria-label` names the button.', required: true },
  ],

  variants: {
    variant: {
      default: 'Filled. The main action in a region.',
      outline: 'Bordered. Secondary actions next to a default button.',
      subtle: 'No fill or border until hovered. Toolbars and repeated row actions. Only on `background`-colored surfaces, except neutral-inverse.',
    },
    size: {
      micro: '24px square, small radius. Dense UIs. On touch screens, leave at least 20px between micro icon buttons in every direction (see Touch targets).',
      small: '32px square. The default; lines up with a small Button.',
      medium: '40px square. Lines up with a medium Button.',
    },
    tone: {
      brand: 'The brand color of the current color theme. The default.',
      neutral: 'Black and white (inverted in dark themes), for actions that should not compete with the brand color.',
      danger: 'The error color. Only for destructive actions, such as deleting a row.',
      warning: 'The warning color, for icon buttons inside a warning message (e.g. a Toast\'s close button).',
      success: 'The success color, for icon buttons inside a success message (e.g. a Toast\'s close button).',
      'neutral-inverse':
        'Subtle only. An icon in `text-inverse` with a see-through hover, for icon buttons on filled surfaces: `background-inverse`, `brand`, `error`, `warning` or `success`, such as the Modal header close button.',
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
      '`aria-label` is required (TypeScript enforces it). Name the action, not the icon: "Delete project", not "Trash can".',
      'Icons alone are ambiguous for many people. Add a tooltip with the same text once Tooltip exists, or use a labeled Button.',
      'Micro icon buttons are 24px: on touch screens, keep at least 20px between them in every direction so their 44px touch areas do not overlap.',
      'Pass a localised `pendingLabel` when using `isPending`.',
    ],
  },

  guidelines: {
    do: [
      'Use widely recognized icons (close, edit, delete, more, search).',
      'Keep the same icon for the same action across the product.',
      'Match sizes in a row: a small IconButton next to a small Button.',
      'Put subtle icon buttons on `background`-colored surfaces, and neutral-inverse ones on `background-inverse`, `brand`, `error`, `warning` or `success` surfaces. Those are the pairs whose icon and hover colors are rated.',
    ],
    dont: [
      'Use an IconButton for an action people need to read to understand.',
      'Reuse one icon for different actions.',
      'Use the danger tone for anything that is not destructive.',
      'Put a subtle icon button on any other surface, such as a tinted panel, an image or another tone\'s fill: its icon and hover are not rated there.',
    ],
  },

  tokens: [
    'colorTheme/color.brand',
    'typography/font.line height.label',
    'colorTheme/color.state.error',
    'colorTheme/color.state.warning',
    'colorTheme/color.state.success',
    'colorTheme/color.background',
    'colorTheme/color.background-inverse',
    'colorTheme/color.text',
    'colorTheme/color.text-brand',
    'colorTheme/color.text-inverse',
    'colorTheme/color.border',
    'colorTheme/color.border-brand',
    'colorTheme/color.brand-hover',
    'colorTheme/color.background-inverse-hover',
    'colorTheme/color.state.error-hover',
    'colorTheme/color.state.warning-hover',
    'colorTheme/color.state.success-hover',
    'colorTheme/color.brand-tint',
    'colorTheme/color.background-hover',
    'colorTheme/color.state.error-tint',
    'colorTheme/color.state.warning-tint',
    'colorTheme/color.state.success-tint',
    'colorTheme/color.inverse-tint',
    'system/color.background-disabled-default',
    'system/color.background-disabled-inverse',
    'system/color.text-disabled-default',
    'system/color.text-disabled-inverse',
    'system/color.border-disabled',
    'spacing/spacing.3xs',
    'spacing/spacing.2xs',
    'spacing/spacing.xs',
    'radius/border.radius.sm',
    'radius/border.radius.md',
    'borderWidth/border.width.sm',
    'borderWidth/border.width.mandatory',
    'borderWidth/border.width.focus ring',
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
      reducedMotion: 'Unchanged (color change only, no movement).',
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
    url: 'https://www.figma.com/design/tRoAewIghL1YbnTio6fkkw/Themis-Design-System?node-id=2098-19172',
    properties: {
      tone: { figmaProperty: 'tone', type: 'VARIANT' },
      variant: { figmaProperty: 'variant', type: 'VARIANT' },
      size: { figmaProperty: 'size', type: 'VARIANT' },
      isDisabled: { figmaProperty: 'state', type: 'VARIANT', values: { true: 'disabled' } },
      isPending: { figmaProperty: 'state', type: 'VARIANT', values: { true: 'pending' } },
    },
  },

  related: ['Button', 'ToggleButton', 'Tooltip'],
  notes: [
    'Shares its styles with Button (src/components/Button/button-base.ts), so tones, disabled colors and the State Layer stay identical.',
    'Subtle hovers are see-through tints toward the icon color: the tone\'s `*-tint` (`background-hover` for neutral), and `inverse-tint` for neutral-inverse. Filled hovers use the solid `*-hover` tokens, as in Button.',
    'Figma\'s `state` property also has `hovered` and `focused`. In code these come from interaction, not props.',
  ],
});
