import { defineComponentDocs } from '../../docs/component-docs';

export default defineComponentDocs({
  name: 'ActionMenu',
  status: 'beta',
  category: 'Overlays',
  summary: 'A list of actions that opens from a button, such as "Rename / Duplicate / Delete" for a row or card.',
  base: {
    package: 'react-aria-components',
    component: 'Menu',
    docsUrl: 'https://react-spectrum.adobe.com/react-aria/Menu.html',
  },

  usage: {
    whenToUse: [
      'Several actions for one thing (a row, card or file) that would crowd the layout as buttons.',
      'Secondary actions next to a primary Button ("Save" + a ⋮ menu with "Save as…", "Export").',
    ],
    whenNotToUse: [
      { scenario: 'Choosing a value for a form field.', useInstead: 'Select (coming later)' },
      { scenario: 'One or two actions that fit on screen.', useInstead: 'Button or IconButton' },
      { scenario: 'Navigating between pages.', useInstead: 'links' },
      { scenario: 'Switching between views of the same content.', useInstead: 'Tabs or SegmentedControl' },
    ],
  },

  anatomy: [
    { part: 'Action Menu Trigger', description: 'Wraps the trigger button and the menu (`ActionMenuTrigger`). The trigger is usually a micro subtle IconButton (⋮).', required: true },
    { part: 'Action Menu', description: 'The panel (`ActionMenu`): background, border, radius md, drop shadow, 8px padding, 4px between items. Opens 8px from the trigger.', required: true },
    { part: 'Action Menu Item', description: 'One action (`ActionMenuItem`): optional icon and a label, 32px tall. Highlighted with a pale tint on hover and keyboard focus.', required: true },
  ],

  variants: {
    isDanger: {
      true: 'Destructive actions such as "Delete": error-coloured label and icon, error-tinted highlight. Put them last.',
      false: 'Every other action. The default.',
    },
    placement: {
      'bottom start': 'Below the trigger, lined up with its start edge. The default.',
      'bottom end': 'Below, lined up with its end edge. For triggers at the right of a row or card.',
      'top start': 'Above, lined up with its start edge. For triggers near the bottom of the screen.',
      'top end': 'Above, lined up with its end edge.',
    },
  },

  accessibility: {
    providedByBase: [
      'The trigger has aria-haspopup and aria-expanded; the menu has role="menu" and each item role="menuitem".',
      'Opening moves focus into the menu; Escape or choosing an action closes it and returns focus to the trigger.',
      'Arrow keys move between items (disabled items are skipped), Home/End jump to the ends, and typing jumps to the item starting with those letters.',
      'Clicking outside closes the menu. It flips above the trigger, or scrolls, if there isn\'t room.',
    ],
    keyboard: [
      { keys: 'Enter / Space / Down arrow', action: 'On the trigger: opens the menu.' },
      { keys: 'Up / Down arrow', action: 'Moves between items.' },
      { keys: 'Enter / Space', action: 'Runs the highlighted action and closes the menu.' },
      { keys: 'Escape', action: 'Closes the menu and returns focus to the trigger.' },
      { keys: 'Letters', action: 'Jumps to the next item starting with them.' },
    ],
    requirements: [
      'An icon-only trigger needs an `aria-label` that says whose actions these are, e.g. "Actions for Invoice 1042".',
      'Item icons are decorative; the label must say what the action does.',
      'Destructive actions should ask for confirmation (e.g. a danger Modal) or offer Undo (e.g. a Toast action).',
    ],
  },

  guidelines: {
    do: [
      'Start labels with a verb: "Rename", "Duplicate", "Delete".',
      'Keep menus short (up to about 7 items) and put the most common actions first.',
      'Put destructive actions last.',
    ],
    dont: [
      'Put the only way to do something important in a menu.',
      'Nest menus or put form fields inside them.',
      'Disable an item without saying why somewhere nearby; hide it if it never applies.',
    ],
  },

  tokens: [
    'colorTheme/color.background',
    'colorTheme/color.text',
    'colorTheme/color.border',
    'colorTheme/color.brand',
    'colorTheme/color.state.error',
    'colorTheme/color.brand-tint',
    'colorTheme/color.state.error-tint',
    'colorTheme/color.text-disabled-on-background',
    'spacing/spacing.3xs',
    'spacing/spacing.2xs',
    'spacing/spacing.xs',
    'spacing/spacing.sm',
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
    'typography/font.weight.semibold',
    'primitives/color.grayscale.000',
    'primitives/color.grayscale.1000',
    'motion/duration.fast',
    'motion/duration.base',
    'motion/easing.standard',
  ],

  motion: [
    {
      trigger: 'Menu opens',
      property: 'Fades in and slides 4px away from the trigger',
      duration: 'motion/duration.base',
      easing: 'motion/easing.standard',
      reducedMotion: 'Fades in, no movement.',
    },
    {
      trigger: 'Menu closes',
      property: 'Fades out',
      duration: 'motion/duration.base',
      easing: 'motion/easing.standard',
      reducedMotion: 'Unchanged.',
    },
    {
      trigger: 'Item highlighted (hover or arrow keys)',
      property: 'Tint fades in',
      duration: 'motion/duration.fast',
      easing: 'motion/easing.standard',
      reducedMotion: 'Appears instantly.',
    },
  ],

  figma: {
    componentKey: null,
    url: 'https://www.figma.com/design/tRoAewIghL1YbnTio6fkkw/Themis-Design-System?node-id=2194-12291',
    properties: {},
    differences: [
      { topic: 'Width', figma: 'A fixed 305px menu.', code: 'Fits the labels: at least as wide as the trigger (and 160px), at most 320px. Long labels end with an ellipsis.', action: 'annotate-figma', done: '2026-11-13' },
      { topic: 'Open trigger', figma: 'Not shown.', code: 'While the menu is open, its trigger keeps its hover tint (not the press shrink), so it\'s clear which button opened it.', action: 'annotate-figma', done: '2026-11-13' },
      { topic: 'Position', figma: 'The menu drawn below the trigger.', code: '8px below the trigger, lined up with its start edge; it flips above when there isn\'t room.', action: 'annotate-figma', done: '2026-11-13' },
    ],
  },

  related: ['IconButton', 'Button', 'Modal', 'Toast'],
  notes: [
    'Items: Figma "Action Menu Item" (node 2194-12252). `state` comes from interaction (hovered and focused are both the highlighted item, since React Aria moves focus with the pointer); `danger` is `isDanger`; `iconLeft` is on when `icon` is passed.',
    'Trigger: Figma "Action Menu Trigger" (node 2194-12854), a micro subtle IconButton, with the menu 8px below it, lined up with its start edge.',
    'Separators, section headings, submenus and checkable items are not designed yet.',
  ],
});
