import { defineComponentDocs } from '../../docs/component-docs';

export default defineComponentDocs({
  name: 'Accordion',
  status: 'beta',
  category: 'Disclosure',
  summary: 'A header that shows or hides a section of content. Group several with AccordionGroup.',
  base: {
    package: 'react-aria-components',
    component: 'Disclosure',
    docsUrl: 'https://react-spectrum.adobe.com/react-aria/Disclosure.html',
  },

  usage: {
    whenToUse: [
      'Long pages where people only need some sections, such as FAQs or settings groups.',
      'Secondary detail that would clutter the page if always shown.',
    ],
    whenNotToUse: [
      { scenario: 'Content everyone needs to read, or a short page. Hiding it adds a click.', useInstead: 'Plain headings and text' },
      { scenario: 'Switching between views of the same thing, where only one is shown at a time.', useInstead: 'Tabs' },
      { scenario: 'Content that should appear over the page.', useInstead: 'Dialog' },
    ],
  },

  anatomy: [
    {
      part: 'Container',
      description: 'The outer border around header and content, with rounded corners.',
      required: true,
    },
    {
      part: 'Header',
      description:
        'A button inside a heading. Brand fill, heading text and a chevron. Shows the State Layer on hover and press, and an inset focus ring.',
      required: true,
    },
    { part: 'Chevron', description: 'Points right when closed and down when open. Decorative.', required: true },
    { part: 'Content', description: 'The section revealed when open. Any content; body text by default.', required: true },
    { part: 'AccordionGroup', description: 'Stacks accordions with spacing.xs between them.', required: false },
  ],

  variants: {
    allowsMultipleExpanded: {
      true: 'AccordionGroup default: several accordions can be open at once.',
      false: 'Opening one accordion closes the others.',
    },
  },

  accessibility: {
    providedByBase: [
      'The header is a <button> inside a heading, with aria-expanded and aria-controls pointing at the content.',
      'The content is a region labelled by the header.',
      'Closed content is hidden with hidden="until-found", so the browser\'s find-in-page can still open it.',
      'Focus ring shown for keyboard focus only (isFocusVisible).',
    ],
    keyboard: [
      { keys: 'Enter', action: 'Opens or closes the accordion.' },
      { keys: 'Space', action: 'Opens or closes the accordion.' },
      { keys: 'Tab', action: 'Moves focus between headers and into open content.' },
    ],
    requirements: [
      'Set `headingLevel` to fit the page: one level below the nearest heading above the accordions.',
      'Write headers that say what is inside, so people can decide without opening them.',
      'Don\'t put essential instructions or errors inside a closed accordion.',
    ],
  },

  guidelines: {
    do: [
      'Use AccordionGroup for a set of related accordions.',
      'Open the most useful item by default when there is one: `defaultExpanded` on a single accordion, or the group\'s `defaultExpandedKeys` (with an `id` on each accordion) in an AccordionGroup.',
      'Keep headers short; they wrap if needed.',
    ],
    dont: [
      'Nest accordions inside accordions.',
      'Use an accordion for a single short paragraph.',
      'Hide form fields people must fill in.',
    ],
  },

  tokens: [
    'colorTheme/color.brand',
    'colorTheme/color.background',
    'colorTheme/color.border',
    'colorTheme/color.text',
    'colorTheme/color.text-inverse',
    'colorTheme/color.brand-hover',
    'system/color.background-disabled-default',
    'system/color.background-disabled-inverse',
    'system/color.text-disabled-default',
    'system/color.text-disabled-inverse',
    'system/color.border-disabled',
    'spacing/spacing.3xs',
    'spacing/spacing.xs',
    'spacing/spacing.sm',
    'radius/border.radius.md',
    'borderWidth/border.width.sm',
    'borderWidth/border.width.focus ring',
    'fontTheme/font.family.heading',
    'fontTheme/font.family.body',
    'typography/font.size.sm',
    'typography/font.line height.sm',
    'typography/font.weight.semibold',
    'typography/font.weight.regular',
    'primitives/color.grayscale.000',
    'primitives/color.grayscale.1000',
    'motion/duration.base',
    'motion/easing.standard',
  ],

  motion: [
    {
      trigger: 'Open or close',
      property: 'Content height animates; chevron rotates between right and down',
      duration: 'motion/duration.base',
      easing: 'motion/easing.standard',
      reducedMotion: 'Opens and closes instantly.',
    },
    {
      trigger: 'Hover or press',
      property: 'State Layer fades in on the header',
      duration: 'motion/duration.base',
      easing: 'motion/easing.standard',
      reducedMotion: 'Unchanged (colour change only, no movement).',
    },
  ],

  figma: {
    componentKey: null,
    url: 'https://www.figma.com/design/tRoAewIghL1YbnTio6fkkw/Themis-Design-System?node-id=2064-17367',
    properties: {
      defaultExpanded: { figmaProperty: 'open', type: 'VARIANT' },
      isDisabled: { figmaProperty: 'state', type: 'VARIANT', values: { true: 'disabled' } },
    },
  },

  related: ['Tabs', 'Dialog'],
  notes: [
    'Figma has a single item; AccordionGroup (stacking with spacing.xs, one-or-many open) is code-only for now.',
    'Figma draws a white-only dashed focus ring inside the header; code uses the shared black/white ring, drawn inset, so it keeps 3:1 contrast with any brand colour and never overlaps neighbours.',
    'No press shrink: the header is full width. Hover and press show the State Layer only.',
    'Animation is not drawn in Figma; it follows the Motion foundation.',
    'The chevron is an inline SVG until the icon library exists.',
  ],
});
