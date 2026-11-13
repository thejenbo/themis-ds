import { defineComponentDocs } from '../../docs/component-docs';

export default defineComponentDocs({
  name: 'Switch',
  status: 'beta',
  category: 'Selection',
  summary: 'Turns a setting on or off straight away, such as "Email notifications".',
  base: {
    package: 'react-aria-components',
    component: 'Switch',
    docsUrl: 'https://react-spectrum.adobe.com/react-aria/Switch.html',
  },

  usage: {
    whenToUse: [
      'A single setting that takes effect as soon as it changes, with no Save button.',
      'Settings lists, where each row turns one feature on or off.',
    ],
    whenNotToUse: [
      { scenario: 'A choice in a form that is only applied when the form is submitted.', useInstead: 'Checkbox' },
      { scenario: 'Choosing one option from several.', useInstead: 'RadioGroup' },
      { scenario: 'An on/off control in a toolbar or filter bar, next to buttons.', useInstead: 'ToggleButton' },
    ],
  },

  anatomy: [
    {
      part: 'Label',
      description: 'The `<label>` element holding the track and text. The whole thing is clickable.',
      required: true,
    },
    {
      part: 'Track',
      description:
        'The pill. Filled with the brand colour when on, outlined when off. Carries the focus ring and, on touch screens, a 44px touch area. Shrinks slightly while pressed.',
      required: true,
    },
    {
      part: 'State Layer',
      description:
        'Overlay on the track on hover and press. Its colour is calculated from the track: lightening on dark colours, darkening on light ones.',
      required: true,
    },
    { part: 'Thumb', description: 'The circle. Slides to the right when on, to the left when off.', required: true },
    { part: 'Icons', description: '✓ when on, × when off. Built in and decorative: screen readers announce "on" or "off".', required: true },
    { part: 'Label text', description: 'The setting\'s name (children). Use `aria-label` instead only where a visible label is impossible.', required: false },
    { part: 'Description', description: 'Optional helper text under the label, read out as the switch\'s description.', required: false },
  ],

  variants: {
    size: {
      micro: '24px tall. Dense UIs. On touch screens, keep at least 20px between micro switches in every direction (see Touch targets).',
      small: '32px tall. The default.',
      medium: '40px tall.',
    },
    labelPosition: {
      right: 'Label after the switch. The default; suits forms and short lists.',
      left: 'Label before the switch. Suits settings lists, where the switches line up on the right.',
    },
  },

  accessibility: {
    providedByBase: [
      'Renders a native checkbox with role="switch" inside a <label>, so screen readers announce the name and "on" or "off".',
      'Clicking anywhere on the label toggles it.',
      'Focus ring shown for keyboard focus only (isFocusVisible).',
      'isDisabled removes the switch from interaction; isReadOnly keeps it focusable but unchangeable.',
    ],
    keyboard: [
      { keys: 'Space', action: 'Turns the switch on or off.' },
      { keys: 'Tab', action: 'Moves focus to or away from the switch.' },
    ],
    requirements: [
      'Always give a visible label (children). If the layout really can\'t show one, pass `aria-label`.',
      'Name the setting, not the action: "Email notifications", not "Turn on email notifications". The switch already says on or off.',
      'Apply the change straight away. If it needs a Save button, use a Checkbox.',
      'Use `description` for extra context. It is linked with `aria-describedby`, so it is read after the name.',
      'Colour is not the only cue: the thumb position and the ✓ / × icons change too.',
    ],
  },

  guidelines: {
    do: [
      'Keep labels short and phrased as the thing being turned on.',
      'Use `labelPosition="left"` in settings lists so switches line up.',
      'Show the result of the change right away.',
    ],
    dont: [
      'Change the label text when the switch changes.',
      'Use a switch for something that needs confirming or saving.',
      'Use a switch to choose between two different options (e.g. "List / Grid").',
    ],
  },

  tokens: [
    'colorTheme/color.brand',
    'colorTheme/color.background',
    'colorTheme/color.text',
    'colorTheme/color.border-brand',
    'colorTheme/color.brand-hover',
    'colorTheme/color.brand-tint',
    'system/color.background-disabled-default',
    'system/color.background-disabled-inverse',
    'system/color.text-disabled-default',
    'system/color.border-disabled',
    'spacing/spacing.3xs',
    'spacing/spacing.2xs',
    'spacing/spacing.xs',
    'radius/border.radius.full',
    'borderWidth/border.width.mandatory',
    'borderWidth/border.width.focus ring',
    'fontTheme/font.family.body',
    'typography/font.size.label',
    'typography/font.size.caption',
    'typography/font.line height.caption',
    'typography/font.line height.label',
    'typography/font.weight.semibold',
    'typography/font.weight.regular',
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
      trigger: 'Turn on or off',
      property: 'Thumb slides across; ✓ and × cross-fade',
      duration: 'motion/duration.base',
      easing: 'motion/easing.standard',
      reducedMotion: 'Changes instantly.',
    },
    {
      trigger: 'Hover or press',
      property: 'State Layer fades in',
      duration: 'motion/duration.base',
      easing: 'motion/easing.standard',
      reducedMotion: 'Unchanged (colour change only, no movement).',
    },
    {
      trigger: 'Press (pointer or Space)',
      property: 'Track shrinks to motion/scale.pressed; the clickable area does not',
      duration: 'motion/duration.fast',
      easing: 'motion/easing.standard',
      reducedMotion: 'No shrink.',
    },
    {
      trigger: 'Release',
      property: 'Track returns to full size',
      duration: 'motion/duration.slow',
      easing: 'motion/easing.standard',
      reducedMotion: 'No shrink.',
    },
  ],

  figma: {
    componentKey: null,
    url: 'https://www.figma.com/design/tRoAewIghL1YbnTio6fkkw/Themis-Design-System?node-id=2052-12425',
    properties: {
      isSelected: { figmaProperty: 'activated', type: 'VARIANT' },
      size: { figmaProperty: 'size', type: 'VARIANT' },
      labelPosition: { figmaProperty: 'label position', type: 'VARIANT' },
      isDisabled: { figmaProperty: 'state', type: 'VARIANT', values: { true: 'disabled' } },
      children: { figmaProperty: 'Label', type: 'TEXT' },
      description: { figmaProperty: 'Description text', type: 'TEXT' },
    },
  },

  related: ['Checkbox', 'ToggleButton', 'RadioGroup'],
  notes: [
    'Brand tone only, matching Figma.',
    'Figma calls the on state `activated`; code uses React Aria\'s `isSelected`.',
    'Figma\'s `description` variant is a boolean; in code, passing `description` turns it on.',
    'Track height follows Button\'s height for each size: 24/32/40px on every screen.',
    'Figma draws the focus ring tight to the track with 6/6 dashes; code uses the shared Themis focus ring (2px gap, 4/4 dashes) so focus looks the same on every component.',
    'Animation and the pressed shrink are not drawn in Figma; they follow the Motion foundation.',
    'The ✓ and × are inline SVGs until the icon library exists.',
  ],
});
