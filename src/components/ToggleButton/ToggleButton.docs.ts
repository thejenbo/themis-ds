import { defineComponentDocs } from '../../docs/component-docs';

export default defineComponentDocs({
  name: 'ToggleButton',
  status: 'beta',
  category: 'Actions',
  summary: 'A button that stays on or off, such as a filter or a formatting control.',
  base: {
    package: 'react-aria-components',
    component: 'ToggleButton',
    docsUrl: 'https://react-spectrum.adobe.com/react-aria/ToggleButton.html',
  },

  usage: {
    whenToUse: [
      'Turning an option on or off where the result shows straight away, such as a filter or "Bold" in an editor.',
      'A short row of independent on/off options next to each other.',
    ],
    whenNotToUse: [
      { scenario: 'Triggering a one-off action (save, delete, open).', useInstead: 'Button' },
      { scenario: 'A setting in a form that is saved later, or a system setting such as "Notifications".', useInstead: 'Switch' },
      { scenario: 'Choosing one option from a set, where exactly one must be on.', useInstead: 'ToggleButtonGroup' },
    ],
  },

  anatomy: [
    {
      part: 'Button',
      description:
        'The clickable element. Carries `aria-pressed`, the focus ring and, on touch screens, an invisible 44×44px touch area. It never changes size.',
      required: true,
    },
    {
      part: 'Surface',
      description: 'The visible button. Outlined when off, filled when on. Shrinks slightly while pressed.',
      required: true,
    },
    {
      part: 'State Layer',
      description:
        'Overlay shown on hover and press. Its colour is calculated from the Surface: lightening on dark colours, darkening on light ones.',
      required: true,
    },
    { part: 'Label', description: 'The text. Stays the same whether the button is on or off.', required: true },
    { part: 'Icons', description: 'Optional `iconLeft` and `iconRight`. Decorative, hidden from screen readers.', required: false },
  ],

  variants: {
    isSelected: {
      true: 'On: filled with the brand colour, like a default Button.',
      false: 'Off: outlined, like an outline Button. Control it with `isSelected` and `onChange`, or let it manage itself with `defaultSelected`.',
    },
    size: {
      micro: '24px tall. Dense UIs. On touch screens, leave at least 20px between micro toggles in every direction (see Touch targets).',
      small: '32px tall. The default.',
      medium: '40px tall.',
    },
  },

  accessibility: {
    providedByBase: [
      'Renders a native <button> with `aria-pressed`, so screen readers announce "pressed" or "not pressed".',
      'Press events unified across mouse, touch, keyboard and screen readers.',
      'Focus ring shown for keyboard focus only (isFocusVisible).',
      'isDisabled removes the button from interaction.',
    ],
    keyboard: [
      { keys: 'Enter', action: 'Turns the button on or off.' },
      { keys: 'Space', action: 'Turns the button on or off.' },
      { keys: 'Tab', action: 'Moves focus to or away from the button.' },
    ],
    requirements: [
      'Keep the label the same in both states. Changing it (e.g. "Follow" to "Following") as well as the pressed state makes screen readers announce something confusing like "Following, pressed".',
      'Name what the button turns on, not the action: "In stock only", not "Filter".',
      'Colour is not the only cue: on is filled and off is outlined, so the difference survives greyscale and high-contrast modes.',
    ],
  },

  guidelines: {
    do: [
      'Use short labels (one to three words).',
      'Apply the change as soon as the button is pressed.',
      'Match sizes in a row: a small ToggleButton next to a small Button.',
    ],
    dont: [
      'Change the label when the state changes.',
      'Use a ToggleButton for an action that needs a separate Save step.',
      'Rely on an icon alone to show the state.',
    ],
  },

  tokens: [
    'colorTheme/color.brand',
    'colorTheme/color.background',
    'colorTheme/color.text-brand',
    'colorTheme/color.text-inverse',
    'colorTheme/color.border-brand',
    'colorTheme/color.transform-20',
    'colorTheme/color.transform-90',
    'system/color.background-disabled-default',
    'system/color.background-disabled-inverse',
    'system/color.text-disabled-default',
    'system/color.text-disabled-inverse',
    'system/color.border-disabled',
    'spacing/spacing.2xs',
    'spacing/spacing.xs',
    'spacing/spacing.sm',
    'radius/border.radius.md',
    'borderWidth/border.width.mandatory',
    'borderWidth/border.width.focus ring',
    'fontTheme/font.family.body',
    'typography/font.size.label',
    'typography/font.line height.label',
    'typography/font.weight.semibold',
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
      property: 'Surface returns to full size, now showing the new state',
      duration: 'motion/duration.slow',
      easing: 'motion/easing.standard',
      reducedMotion: 'No shrink.',
    },
  ],

  figma: {
    componentKey: null,
    url: 'https://www.figma.com/design/tRoAewIghL1YbnTio6fkkw/Themis-Design-System?node-id=2092-18091',
    properties: {
      isSelected: { figmaProperty: 'activated', type: 'VARIANT' },
      size: { figmaProperty: 'size', type: 'VARIANT' },
      isDisabled: { figmaProperty: 'state', type: 'VARIANT', values: { true: 'disabled' } },
      iconLeft: { figmaProperty: 'iconLeft', type: 'VARIANT' },
      iconRight: { figmaProperty: 'iconRight', type: 'VARIANT' },
    },
  },

  related: ['Button', 'IconButton', 'ToggleButtonGroup', 'Switch'],
  notes: [
    'Shares its styles with Button (src/components/Button/button-base.ts): off is the brand outline look, on is the brand default look.',
    'Brand tone only, matching Figma.',
    'Figma calls the on state `activated`; code uses React Aria\'s `isSelected`, so it is not confused with the pressed (shrink) state.',
    'Pressed (hover look plus shrink) is not drawn in Figma; it works the same as Button.',
    'Figma: the small / activated / hovered variant is 34px tall; every other small variant (and the code) is 32px.',
    'Figma binds medium vertical padding to `button/paddingY/md` (03 Component Tokens), which is not exported; it resolves to spacing/xs, which code uses.',
  ],
});
