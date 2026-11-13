import { defineComponentDocs } from '../../docs/component-docs';

export default defineComponentDocs({
  name: 'Toast',
  status: 'beta',
  category: 'Feedback',
  summary: 'A brief message in a corner of the screen about something that just happened, such as "Changes saved".',
  base: {
    package: 'react-aria-components',
    component: 'Toast',
    docsUrl: 'https://react-spectrum.adobe.com/react-aria/Toast.html',
  },

  usage: {
    whenToUse: [
      'Confirming that something worked in the background ("Changes saved", "Invite sent").',
      'Reporting a failure the user didn\'t cause directly, such as a lost connection.',
      'Offering one quick follow-up, such as "Undo" after deleting.',
    ],
    whenNotToUse: [
      { scenario: 'A form error the user has to fix.', useInstead: 'an inline error next to the field' },
      { scenario: 'Something the user must read or decide before carrying on.', useInstead: 'Modal' },
      { scenario: 'A message that belongs to one part of the page, or stays relevant.', useInstead: 'an inline message' },
      { scenario: 'Information that must not be missed, with several actions.', useInstead: 'Modal' },
    ],
  },

  anatomy: [
    { part: 'Toast Region', description: 'The landmark that holds the toasts, fixed in one corner (`ToastRegion`). Render once near the app root.', required: true },
    { part: 'Toast', description: 'One message: background fill, 2px border in the tone colour, drop shadow. Focusable, so keyboard users can reach its buttons.', required: true },
    { part: 'Status Icon', description: 'Placeholder icon per tone, before the first line. Decorative.', required: false },
    { part: 'Heading', description: 'Optional `title`, in the tone colour (label style).', required: false },
    { part: 'Content', description: 'The message (`description`, body style).', required: true },
    { part: 'Action Button', description: 'Optional small outline Button in the tone. Pressing it also closes the toast.', required: false },
    { part: 'Close Button', description: 'Micro subtle IconButton (×) in the tone. Always shown on toasts that don\'t close by themselves.', required: false },
  ],

  variants: {
    tone: {
      info: 'Neutral. General updates that need no attention. Closes after 5 seconds.',
      brand: 'Product messages in the brand colour, such as "New: dark mode". Closes after 5 seconds. No icon by default.',
      success: 'Something worked ("Project published"). Closes after 5 seconds.',
      warning: 'Something needs attention but nothing failed ("Storage almost full"). Closes after 5 seconds.',
      danger: 'Something failed ("Couldn\'t save changes"). Stays until closed, so it can\'t be missed.',
    },
    placement: {
      'bottom-right': 'The default. Out of the way of most content and navigation.',
      'bottom-left': 'When the bottom right holds a chat widget or other floating button.',
      'top-right': 'When the bottom of the screen holds fixed controls.',
      'top-left': 'Rarely; for right-to-left layouts or apps with right-hand panels.',
    },
  },

  accessibility: {
    providedByBase: [
      'The region is a landmark ("Notifications"): F6 moves focus to it and back, from anywhere on the page.',
      'Each toast is announced by screen readers when it appears (role="alert"), without moving focus.',
      'Each toast is a non-modal alert dialog, named by its heading (or message) and described by its message.',
      'Timers pause while the pointer is over the region or focus is inside it.',
      'When a focused toast closes, focus moves to the next toast, or back to where it was before.',
    ],
    keyboard: [
      { keys: 'F6 / Shift+F6', action: 'Moves focus into the toast region, and back to the page.' },
      { keys: 'Tab / Shift+Tab', action: 'Moves between toasts and their buttons.' },
      { keys: 'Enter / Space', action: 'Presses the focused action or close button.' },
    ],
    requirements: [
      'Keep messages short: they may be read aloud as soon as they appear.',
      'Don\'t put the only way to do something in a toast. A toast can close before someone reaches it, so offer the action elsewhere too.',
      'Danger toasts and toasts with an action stay until closed by default. Only shorten that if the action is also available elsewhere.',
      'Status is not conveyed by colour alone: each tone has an icon, and screen readers hear a status word first ("Error: …"). Translate those words with `statusLabels`.',
    ],
  },

  guidelines: {
    do: [
      'Say what happened in plain words: "Changes saved", not "Success!".',
      'Use one action at most, with a one- or two-word label ("Undo", "View").',
      'Show one toast per event; don\'t stack several for the same thing.',
    ],
    dont: [
      'Use toasts for errors in a form; show those next to the field.',
      'Use the danger tone for anything that didn\'t fail.',
      'Put links or long text in the message.',
    ],
  },

  content: {
    guidance: [
      'Heading: two to four words, no full stop.',
      'Message: one sentence. Say what happened and, for problems, what to do next.',
    ],
  },

  tokens: [
    'colorTheme/color.background',
    'colorTheme/color.text',
    'colorTheme/color.text-brand',
    'colorTheme/color.border',
    'colorTheme/color.border-brand',
    'colorTheme/color.state.error',
    'colorTheme/color.state.warning',
    'colorTheme/color.state.success',
    'spacing/spacing.xs',
    'spacing/spacing.sm',
    'spacing/spacing.md',
    'radius/border.radius.md',
    'borderWidth/border.width.mandatory',
    'borderWidth/border.width.focus ring',
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
    'motion/duration.slow',
    'motion/easing.standard',
  ],

  motion: [
    {
      trigger: 'A toast appears',
      property: 'Slides in from the region\'s edge (down from the top, up from the bottom) and fades in',
      duration: 'motion/duration.slow',
      easing: 'motion/easing.standard',
      reducedMotion: 'Fades in, no movement.',
    },
    {
      trigger: 'A toast closes',
      property: 'Fades out',
      duration: 'motion/duration.base',
      easing: 'motion/easing.standard',
      reducedMotion: 'Unchanged.',
    },
    {
      trigger: 'The stack changes',
      property: 'The other toasts move smoothly into their new places',
      duration: 'motion/duration.slow',
      easing: 'motion/easing.standard',
      reducedMotion: 'They move instantly.',
    },
  ],

  figma: {
    componentKey: null,
    url: 'https://www.figma.com/design/tRoAewIghL1YbnTio6fkkw/Themis-Design-System?node-id=1377-451',
    properties: {
      tone: { figmaProperty: 'variant', type: 'VARIANT' },
      title: { figmaProperty: 'Heading', type: 'TEXT' },
      description: { figmaProperty: 'Content', type: 'TEXT' },
      icon: { figmaProperty: 'icon', type: 'VARIANT' },
      showCloseButton: { figmaProperty: 'close button', type: 'VARIANT' },
      action: { figmaProperty: 'action button', type: 'VARIANT' },
    },
  },

  related: ['Modal', 'Button', 'IconButton'],
  notes: [
    'Show toasts with `toast.show({ title, description, tone, action })` and render one `<ToastRegion placement="…" />` inside the ThemeProvider. The props listed here are the options `toast.show` takes, plus `timeout` and `onClose`.',
    'Figma\'s `variant` is `tone` in code, like Button. Figma\'s `heading` boolean is on when `title` is passed.',
    'Built on React Aria\'s toast, which is still marked UNSTABLE. It is used only inside Themis, so app code never depends on it.',
    'At most 3 toasts show at once (`createToastQueue({ maxVisibleToasts })`); the rest wait their turn.',
    'Placement, spacing and stacking aren\'t drawn in Figma: 24px (spacing.md) from the screen edges, plus the phone\'s safe area, and 8px (spacing.xs) between toasts. Under 768px wide (the typography tokens\' mobile breakpoint), toasts are full width minus the margins.',
    'Width: 500px, never wider than the screen minus the margins.',
    'The status icons are placeholders until the icon library exists.',
    'The × lines up with the heading, or with the message on one-line toasts. Figma draws it 4px above the message on one-line toasts; code centres it on the text.',
    'Enter, exit and restacking use the browser\'s View Transitions where supported; elsewhere toasts appear and disappear without animation.',
  ],
});
