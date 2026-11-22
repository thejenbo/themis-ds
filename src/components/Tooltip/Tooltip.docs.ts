import { defineComponentDocs } from '../../docs/component-docs';

export default defineComponentDocs({
  name: 'Tooltip',
  status: 'beta',
  category: 'Overlays',
  summary: 'A short hint about a control, shown when it is hovered or focused, such as "Copy link" on an icon button.',
  base: {
    package: 'react-aria-components',
    component: 'Tooltip',
    docsUrl: 'https://react-spectrum.adobe.com/react-aria/Tooltip.html',
  },

  usage: {
    whenToUse: [
      'Naming an icon-only button visually ("Copy link"), alongside its aria-label.',
      'A short extra hint about a control, such as a keyboard shortcut.',
    ],
    whenNotToUse: [
      { scenario: 'Information people need to complete a task.', useInstead: 'visible help text' },
      { scenario: 'Anything with links, buttons or other controls.', useInstead: 'a Popover (coming later) or Modal' },
      { scenario: 'Explaining a form field\'s rules or errors.', useInstead: 'the field\'s description or error message' },
      { scenario: 'Content on touch screens: tooltips never show on touch.', useInstead: 'visible text' },
    ],
  },

  anatomy: [
    { part: 'Tooltip Trigger', description: 'Wraps the control and the tooltip (`TooltipTrigger`). The control must be focusable, such as a Button or IconButton.', required: true },
    { part: 'Tooltip Content', description: 'The box: background fill, border (border/width/mandatory, so it keeps an outline when border widths are "none"), radius md, drop shadow. At most 320px wide.', required: true },
    { part: 'Tooltip Heading', description: 'Optional short heading (`title`), label style.', required: false },
    { part: 'Text', description: 'The hint (`children`), body style.', required: true },
    { part: 'Arrow', description: 'Points at the middle of the trigger. Joined to the box: the border runs around it.', required: true },
  ],

  variants: {
    placement: {
      top: 'Above the trigger, centred. The default.',
      bottom: 'Below the trigger, centred. For triggers at the top of the screen.',
      left: 'To the left, centred vertically.',
      right: 'To the right, centred vertically. Good for items in a side navigation.',
      'top start': 'Above, lined up with the trigger\'s start edge. For triggers near the left of the screen.',
      'top end': 'Above, lined up with the trigger\'s end edge. For triggers near the right of the screen.',
      'bottom start': 'Below, lined up with the trigger\'s start edge.',
      'bottom end': 'Below, lined up with the trigger\'s end edge.',
    },
  },

  accessibility: {
    providedByBase: [
      'The tooltip has role="tooltip" and is linked to the trigger with aria-describedby, so screen readers read it as the trigger\'s description.',
      'Shows on keyboard focus straight away, and on hover after a delay.',
      'Escape closes it without moving focus.',
      'The pointer can move from the trigger onto the tooltip without it closing (WCAG 1.4.13).',
      'Flips to the other side, or slides along, when there is no room.',
    ],
    keyboard: [
      { keys: 'Tab', action: 'Focusing the trigger shows the tooltip; moving away hides it.' },
      { keys: 'Escape', action: 'Hides the tooltip.' },
    ],
    requirements: [
      'Never put essential information only in a tooltip: it doesn\'t show on touch screens.',
      'An icon-only button still needs its own `aria-label`; the tooltip is read as a description, not a name.',
      'Keep it to plain text. Nothing inside a tooltip can be focused or clicked.',
      'The trigger must be focusable (Button, IconButton, ToggleButton). Don\'t put tooltips on disabled controls: they can\'t be focused.',
    ],
  },

  guidelines: {
    do: [
      'Keep it to a few words, or one short sentence.',
      'Use a heading only when the hint needs a name, such as a keyboard shortcut under its action.',
    ],
    dont: [
      'Repeat the trigger\'s visible label.',
      'Use tooltips for errors or confirmations.',
    ],
  },

  tokens: [
    'colorTheme/color.background',
    'colorTheme/color.text',
    'colorTheme/color.border',
    'spacing/spacing.2xs',
    'spacing/spacing.xs',
    'spacing/spacing.sm',
    'radius/border.radius.md',
    'borderWidth/border.width.mandatory',
    'shadows/drop shadow.x.default',
    'shadows/drop shadow.y.default',
    'shadows/drop shadow.blur.default',
    'shadows/drop shadow.color.default',
    'fontTheme/font.family.body',
    'typography/font.size.label',
    'typography/font.line height.label',
    'typography/font.size.sm',
    'typography/font.line height.sm',
    'typography/font.weight.semibold',
    'typography/font.weight.regular',
    'motion/duration.base',
    'motion/easing.standard',
  ],

  motion: [
    {
      trigger: 'Tooltip shows',
      property: 'Fades in and slides 4px (spacing.2xs) away from the trigger',
      duration: 'motion/duration.base',
      easing: 'motion/easing.standard',
      reducedMotion: 'Fades in, no movement.',
    },
    {
      trigger: 'Tooltip hides',
      property: 'Fades out',
      duration: 'motion/duration.base',
      easing: 'motion/easing.standard',
      reducedMotion: 'Unchanged.',
    },
  ],

  figma: {
    componentKey: null,
    url: 'https://www.figma.com/design/tRoAewIghL1YbnTio6fkkw/Themis-Design-System?node-id=2064-17480',
    properties: {
      placement: { figmaProperty: 'position', type: 'VARIANT' },
      title: { figmaProperty: 'heading', type: 'VARIANT' },
    },
    differences: [
      { topic: 'Delay', figma: 'Not shown.', code: 'Shows after 400ms of hover (React Aria\'s default is 1500ms) or straight away on keyboard focus. Change it per trigger with `TooltipTrigger delay`.', action: 'annotate-figma', done: '2026-11-13' },
      { topic: 'Spacing', figma: 'Not drawn.', code: '4px (spacing.2xs) from the trigger to the arrow tip.', action: 'annotate-figma', done: '2026-11-13' },
      { topic: 'Width', figma: 'Hugs the example text.', code: 'Up to 320px, never closer than 16px to the screen edges; text wraps.', action: 'annotate-figma', done: '2026-11-13' },
    ],
  },

  related: ['IconButton', 'Button', 'Modal'],
  notes: [
    'Figma\'s `position` is `placement` in code, with the same values. Figma\'s `heading` is on when `title` is passed.',
    'The arrow always points at the middle of the trigger (React Aria\'s behaviour). With start/end placements the box lines up with the trigger\'s edge, so on wide triggers the arrow sits further along the box. It stays at least 8px (spacing.xs) from the box\'s ends, so with very small triggers it can sit slightly off their middle.',
  ],
});
