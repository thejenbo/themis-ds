import { defineComponentDocs } from '../../docs/component-docs';

export default defineComponentDocs({
  name: 'Tabs',
  status: 'beta',
  category: 'Navigation',
  summary: 'Switches between panels of related content in the same place, such as "Overview / Activity / Settings".',
  base: {
    package: 'react-aria-components',
    component: 'Tabs',
    docsUrl: 'https://react-spectrum.adobe.com/react-aria/Tabs.html',
  },

  usage: {
    whenToUse: [
      'Splitting related content into 2–7 sections that people switch between, on one page.',
      'Sections that are equally important and don\'t need to be seen at the same time.',
    ],
    whenNotToUse: [
      { scenario: 'Changing a setting or filtering what\'s shown.', useInstead: 'SegmentedControl' },
      { scenario: 'Moving between pages or steps.', useInstead: 'navigation links or a stepper' },
      { scenario: 'Content people need to compare side by side.', useInstead: 'one page with headings' },
      { scenario: 'Long content where people may want several sections open.', useInstead: 'AccordionGroup' },
    ],
  },

  anatomy: [
    { part: 'Tabs', description: 'Wraps the tab list and its panels (`Tabs`).', required: true },
    { part: 'Tab Container', description: 'The row of tabs (`TabList`). Scrolls sideways if the tabs don\'t fit.', required: true },
    { part: 'Tab Item', description: 'One tab (`Tab`): heading-font label, 40px tall.', required: true },
    { part: 'Tab indicator', description: 'A 4px rounded bar under the label. Selected: brand, and it slides between tabs. Hovered: pale brand (brand with transform-60 on top).', required: true },
    { part: 'Tab Content', description: 'The panel (`TabPanel`) for the selected tab, 16px below the tabs.', required: true },
  ],

  variants: {},

  accessibility: {
    providedByBase: [
      'role="tablist" / "tab" / "tabpanel", with each tab linked to its panel, so screen readers announce "Activity, tab, 2 of 3, selected".',
      'Arrow keys move between tabs and select them; Home and End jump to the first and last. Disabled tabs are skipped.',
      'Tab moves focus from the tab list to the panel (the panel is focusable when it has nothing focusable inside).',
      'Focus ring shown for keyboard focus only (isFocusVisible).',
    ],
    keyboard: [
      { keys: 'Tab', action: 'Moves focus to the selected tab, then into its panel.' },
      { keys: 'Left / Right arrow', action: 'Selects the previous / next tab.' },
      { keys: 'Home / End', action: 'Selects the first / last tab.' },
    ],
    requirements: [
      'Give each `Tab` an `id`, and its `TabPanel` the same `id`.',
      'When a page has more than one set of tabs, name each `TabList` with `aria-label` (e.g. "Project sections").',
      'Keep labels short and distinct; they\'re read out as the tab names.',
      'The indicator bar is the selected cue (a shape, not a colour), so it works without colour vision.',
    ],
  },

  guidelines: {
    do: [
      'Use one or two words per tab, in sentence case.',
      'Order tabs by how often they\'re used, most common first.',
      'Use `keyboardActivation="manual"` if switching tabs loads something slow, so arrowing past a tab doesn\'t load it.',
    ],
    dont: [
      'Nest tabs inside tabs.',
      'Use tabs for a sequence of steps.',
      'Hide important actions behind a tab people may never open.',
    ],
  },

  tokens: [
    'colorTheme/color.text',
    'colorTheme/color.brand',
    'colorTheme/color.border-brand',
    'colorTheme/color.transform-60',
    'system/color.text-disabled-default',
    'spacing/spacing.3xs',
    'spacing/spacing.2xs',
    'spacing/spacing.xs',
    'spacing/spacing.sm',
    'radius/border.radius.sm',
    'borderWidth/border.width.focus ring',
    'fontTheme/font.family.heading',
    'typography/font.size.sm',
    'typography/font.line height.sm',
    'typography/font.weight.bold',
    'primitives/color.grayscale.000',
    'primitives/color.grayscale.1000',
    'motion/duration.base',
    'motion/easing.standard',
  ],

  motion: [
    {
      trigger: 'Select a tab',
      property: 'The brand indicator slides (and resizes) from the previous tab to the new one',
      duration: 'motion/duration.base',
      easing: 'motion/easing.standard',
      reducedMotion: 'The indicator moves instantly.',
    },
    {
      trigger: 'Hover a tab that isn\'t selected',
      property: 'Pale brand indicator fades in',
      duration: 'motion/duration.base',
      easing: 'motion/easing.standard',
      reducedMotion: 'Appears instantly.',
    },
  ],

  figma: {
    componentKey: null,
    url: 'https://www.figma.com/design/tRoAewIghL1YbnTio6fkkw/Themis-Design-System?node-id=2064-17412',
    properties: {},
  },

  related: ['SegmentedControl', 'AccordionGroup'],
  notes: [
    'Tab items: Figma "Tab Item" (node 2064-17395). Its `state` variants map to React Aria states: active = selected, hovered, focused, disabled.',
    'The 4px indicator height comes from Figma\'s Component Tokens (tabs/item/indicator/height/default); it\'s a constant in code until that collection is exported.',
    'Figma\'s `track` variant was removed; there is no line under the whole row for now.',
    'Focus ring: the shared black/white dashed ring around the label (Figma\'s focused tab draws a solid 2px box in the same place), so it never overlaps the indicator bar and the scrolling row doesn\'t clip it.',
    'The sliding motion and scrolling for overflow are not drawn in Figma.',
  ],
});
