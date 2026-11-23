import { defineComponentDocs } from '../../docs/component-docs';

export default defineComponentDocs({
  name: 'Modal',
  status: 'beta',
  category: 'Overlays',
  summary: 'A dialog shown on top of the page, which people must respond to or close before going back.',
  base: {
    package: 'react-aria-components',
    component: 'Modal',
    docsUrl: 'https://react-spectrum.adobe.com/react-aria/Modal.html',
  },

  usage: {
    whenToUse: [
      'A decision is needed before continuing, such as confirming a destructive action.',
      'A short, self-contained task (a small form) that shouldn\'t lose the page\'s context.',
      'Important information people must acknowledge.',
    ],
    whenNotToUse: [
      { scenario: 'Long or multi-page tasks.', useInstead: 'A full page' },
      { scenario: 'Status messages that don\'t need a response.', useInstead: 'Toast or Banner' },
      { scenario: 'Extra detail that can sit on the page.', useInstead: 'Accordion' },
    ],
  },

  anatomy: [
    { part: 'Overlay', description: 'Covers the page with overlay-tint and a 10px blur. Clicking it closes the modal (unless turned off).', required: true },
    { part: 'Header', description: 'Optional. Brand or error fill, the title (heading level 2) and an optional close button.', required: false },
    { part: 'Close button', description: 'A micro subtle IconButton: neutral-inverse in the header, neutral in the content when there is no header.', required: false },
    { part: 'Content', description: 'At least 150px tall. Scrolls when it doesn\'t fit; the header and actions stay in view.', required: true },
    { part: 'Actions', description: 'Optional buttons, right-aligned: secondary first, primary last. Optional line above.', required: false },
  ],

  variants: {
    size: {
      small: '400px. Confirmations and short messages.',
      medium: '560px. Forms and most modals. The default.',
      large: '800px. Rich content such as tables or previews.',
    },
    tone: {
      brand: 'Brand header. The default.',
      danger: 'Error-color header for destructive confirmations. Becomes an alert dialog that clicks outside don\'t close.',
    },
  },

  accessibility: {
    providedByBase: [
      'role="dialog" (or "alertdialog") with aria-modal; the title names it via aria-labelledby.',
      'Focus moves into the modal on open, is trapped inside it, and returns to the trigger on close.',
      'The page behind is hidden from screen readers and can\'t be scrolled.',
      'Escape closes the modal.',
    ],
    keyboard: [
      { keys: 'Escape', action: 'Closes the modal.' },
      { keys: 'Tab / Shift+Tab', action: 'Moves between controls inside the modal only.' },
    ],
    requirements: [
      'Without a title, pass `aria-label` (TypeScript enforces it).',
      'Give a cancel button `slot="close"` (or call `close` from the `actions` function) so there is always a visible way out.',
      'For destructive confirmations use `tone="danger"`, say exactly what will happen in the title ("Delete project?"), and use a danger-tone primary button.',
      'Pass a localised `closeLabel` if the close button is shown.',
    ],
  },

  guidelines: {
    do: [
      'Put the secondary action first and the primary action last (on the right).',
      'Label buttons with the action ("Delete project"), not "Yes" / "OK".',
      'Keep content short; if it needs to scroll a lot, it probably belongs on a page.',
    ],
    dont: [
      'Open a modal from another modal.',
      'Open modals the user didn\'t ask for.',
      'Use the danger tone for anything that isn\'t destructive.',
    ],
  },

  tokens: [
    'colorTheme/color.brand',
    'colorTheme/color.state.error',
    'colorTheme/color.background',
    'colorTheme/color.border',
    'colorTheme/color.text',
    'colorTheme/color.text-inverse',
    'colorTheme/color.overlay-tint',
    'shadows/drop shadow.x.default',
    'shadows/drop shadow.y.default',
    'shadows/drop shadow.blur.default',
    'shadows/drop shadow.color.default',
    'spacing/spacing.xs',
    'spacing/spacing.sm',
    'spacing/spacing.lg',
    'radius/border.radius.md',
    'borderWidth/border.width.sm',
    'fontTheme/font.family.heading',
    'fontTheme/font.family.body',
    'typography/font.size.sm',
    'typography/font.line height.sm',
    'typography/font.weight.semibold',
    'typography/font.weight.regular',
    'motion/duration.base',
    'motion/easing.standard',
    'motion/scale.pressed',
  ],

  motion: [
    {
      trigger: 'Open',
      property: 'Overlay fades in; modal fades in and grows from motion/scale.pressed to full size',
      duration: 'motion/duration.base',
      easing: 'motion/easing.standard',
      reducedMotion: 'Fade only, no growing.',
    },
    {
      trigger: 'Close',
      property: 'The reverse',
      duration: 'motion/duration.base',
      easing: 'motion/easing.standard',
      reducedMotion: 'Fade only, no shrinking.',
    },
  ],

  figma: {
    componentKey: null,
    url: 'https://www.figma.com/design/tRoAewIghL1YbnTio6fkkw/Themis-Design-System?node-id=2064-17124',
    properties: {
      size: { figmaProperty: 'size', type: 'VARIANT' },
      showCloseButton: { figmaProperty: 'Close Button', type: 'VARIANT' },
      hideActionBorder: { figmaProperty: 'Hide Action Border', type: 'VARIANT' },
    },
    differences: [
      { topic: 'Height', figma: 'Fixed example heights.', code: 'Stays spacing.lg from the top and bottom of the screen; the content scrolls.', action: 'annotate-figma', done: '2026-11-13' },
      { topic: 'Overlay blur', figma: 'overlay-tint with a 10px blur.', code: 'The same, but the blur is removed when the user asks for reduced transparency.', action: 'annotate-figma', done: '2026-11-13' },
      { topic: 'Close button', figma: 'A `Close Button` variant, which can be combined with actions when there is a header (added 2026-11-23).', code: '`showCloseButton` is on by default when there are no actions, and can be shown alongside actions too.', action: 'annotate-figma', done: '2026-11-13' },
    ],
  },

  related: ['Button', 'IconButton'],
  notes: [
    'Figma\'s Header, Primary Action and Secondary Action variants map to `title` and the buttons passed to `actions`. "Swap Actions" isn\'t a prop: the order is the order you pass them, and Themis recommends secondary first, primary last.',
    'The danger tone is the Figma `tone` variant (brand | danger) on the Modal set.',
    'The modal renders inside the nearest ThemeProvider, so it keeps that provider\'s theme.',
  ],
});
