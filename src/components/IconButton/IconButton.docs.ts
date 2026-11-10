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
        'Overlay shown on hover and press. Its colour is calculated from the Surface: lightening on dark colours, darkening on light ones.',
      required: true,
    },
    { part: 'Icon', description: 'The icon, passed as children. Decorative: `aria-label` names the button.', required: true },
  ],

  variants: {
    variant: {
      default: 'Filled. The main action in a region.',
      outline: 'Bordered. Secondary actions next to a default button.',
      subtle: 'No fill or border until hovered. Toolbars and repeated row actions.',
    },
    size: {
      micro: '24px square, small radius. Dense UIs. On touch screens, leave at least 20px between micro icon buttons in every direction (see Touch targets).',
      small: '32px square. The default; lines up with a small Button.',
      medium: '40px square. Lines up with a medium Button.',
    },
    tone: {
      brand: 'The brand colour of the current colour theme. The default.',
      neutral: 'Black and white (inverted in dark themes), for actions that should not compete with the brand colour.',
      danger: 'The error colour. Only for destructive actions, such as deleting a row.',
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
      'Icons alone are ambiguous for many people. Add a tooltip with the same text once Tooltip exists, or use a labelled Button.',
      'Micro icon buttons are 24px: on touch screens, keep at least 20px between them in every direction so their 44px touch areas do not overlap.',
      'Pass a localised `pendingLabel` when using `isPending`.',
    ],
  },

  guidelines: {
    do: [
      'Use widely recognised icons (close, edit, delete, more, search).',
      'Keep the same icon for the same action across the product.',
      'Match sizes in a row: a small IconButton next to a small Button.',
    ],
    dont: [
      'Use an IconButton for an action people need to read to understand.',
      'Reuse one icon for different actions.',
      'Use the danger tone for anything that is not destructive.',
    ],
  },

  tokens: [
    'colorTheme/color.brand',
    'colorTheme/color.error',
    'colorTheme/color.background',
    'colorTheme/color.background-inverse',
    'colorTheme/color.text',
    'colorTheme/color.text-brand',
    'colorTheme/color.text-inverse',
    'colorTheme/color.border',
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
    'radius/border.radius.sm',
    'radius/border.radius.md',
    'borderWidth/border.width.sm',
    'borderWidth/border.width.mandatory',
    'borderWidth/border.width.focus ring',
    'typography/font.line height.sm',
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
    url: 'https://www.figma.com/design/tRoAewIghL1YbnTio6fkkw/Themis-Design-System?node-id=1343-7408',
    properties: {
      variant: { figmaProperty: 'variant', type: 'VARIANT' },
      size: { figmaProperty: 'size', type: 'VARIANT' },
      isDisabled: { figmaProperty: 'state', type: 'VARIANT', values: { true: 'disabled' } },
    },
  },

  related: ['Button', 'ToggleButton', 'Tooltip'],
  notes: [
    'Shares its styles with Button (src/components/Button/button-base.ts), so tones, disabled colours and the State Layer stay identical.',
    'Figma\'s "Icon Button" set is brand only. Neutral and danger use the same colours as the matching Button tones until they are designed.',
    'Figma\'s `state` property also has `hovered` and `focused`. In code these come from interaction, not props. Pressed (hover look plus shrink) is not drawn in Figma.',
    'Figma draws the focus ring with extra padding; in code the ring sits outside the button and never changes its size.',
    'Figma: the outline / small / disabled variant is 34×34px; every other small variant (and the code) is 32×32px.',
    '`isPending` (spinner) is not designed in Figma yet.',
  ],
});
