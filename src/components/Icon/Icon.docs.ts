import { defineComponentDocs } from '../../docs/component-docs';

export default defineComponentDocs({
  name: 'Icon',
  status: 'beta',
  category: 'Data display',
  summary: 'A line icon from the Themis set (a chosen subset of Lucide), whose stroke and corners follow the theme.',
  base: null,

  usage: {
    whenToUse: [
      'Next to a label, to help people find or recognize an action (Button `iconLeft`/`iconRight`).',
      'On its own in an IconButton, when the action is well known (close, more, delete) and the button has an `aria-label`.',
      'Status beside text, e.g. a warning icon before an error message.',
    ],
    whenNotToUse: [
      { scenario: 'An icon that is the only way to tell people something.', useInstead: 'Text, or an Icon with `aria-label`' },
      { scenario: 'A clickable icon.', useInstead: 'IconButton' },
      { scenario: 'A picture of a person or brand.', useInstead: 'Avatar, or an image' },
    ],
  },

  anatomy: [
    { part: 'Icon', description: 'A 24 × 24 line drawing scaled to 12, 16, 20, 24 or 32px, in the current text color (`currentColor`).', required: true },
  ],

  variants: {
    size: {
      xsmall: '12px. In Chip, next to caption-size text.',
      small: '16px. Next to labels and in IconButton. The default.',
      medium: '20px.',
      large: '24px.',
      xlarge: '32px. Empty states and other large displays.',
    },
    name: {
      '(each icon)': 'See the Gallery story for the whole set. Names are Lucide\'s, without version numbers.',
    },
  },

  accessibility: {
    providedByBase: [],
    keyboard: [],
    requirements: [
      'Decorative by default (hidden from screen readers). When the icon carries meaning that no visible text gives, pass `aria-label`: it becomes an image with that name.',
      'Inside Button, IconButton and inputs, leave `aria-label` out; name the control instead.',
      'Color comes from the surrounding text, so icons get the same contrast as their text.',
    ],
  },

  guidelines: {
    do: [
      'Use the same icon for the same meaning everywhere.',
      'Pair icons with text unless the meaning is universal.',
      'Ask for a new icon to be added to the set (it gets checked with every border width and radius) rather than drawing one inline.',
    ],
    dont: [
      'Set the icon\'s color or stroke yourself; it follows the text color and the theme.',
      'Use an icon in place of a word people need to read.',
    ],
  },

  tokens: ['borderWidth/border.width.mandatory', 'radius/border.radius.xs', 'motion/duration.fast', 'motion/easing.standard'],

  motion: [
    {
      trigger: '`drawn` turns true (or false)',
      property: 'The lines draw themselves in (or disappear); dots fade',
      duration: 'motion/duration.fast',
      easing: 'motion/easing.standard',
      reducedMotion: 'Appears and disappears instantly.',
    },
  ],

  figma: {
    componentKey: null,
    url: 'https://www.figma.com/design/tRoAewIghL1YbnTio6fkkw/Themis-Design-System?node-id=1544-6241',
    properties: {
      name: { figmaProperty: 'name', type: 'VARIANT' },
    },
    differences: [
      {
        topic: 'Theming',
        figma: 'Strokes are bound to border/width/mandatory and the round and sharp drawings switch with icon/round and icon/sharp, but Figma can\'t apply the per-size limits (12px instances use a fixed 1.5px) or the lighter "!".',
        code: 'Lines are as thick as `border/width/mandatory` (at least 1.25px, at most 1.5px at 12px, 2px at 16px, 2.25px at 20px, 2.5px at 24px and 2.75px at 32px). With radius `none`, joins turn sharp, line ends flat (dots square), rectangles lose their rounding, and the sharp versions replace their icons.',
        action: 'annotate-figma',
        done: '2026-11-16',
      },
    ],
  },

  related: ['Button', 'IconButton'],
  notes: [
    'Icons are drawn from Lucide\'s shape data (https://lucide.dev, ISC license), not from Lucide\'s React components, so Themis controls every line.',
    'Small marks inside an outline (TriangleAlert\'s "!") are at most 2 grid units thick, so they keep clear of thick outlines.',
    '`caret-down` is drawn for Themis (it isn\'t in Lucide): the wider arrow on Select, ComboBox and UnitInput triggers.',
  ],
});
