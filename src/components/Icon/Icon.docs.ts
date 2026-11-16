import { defineComponentDocs } from '../../docs/component-docs';

export default defineComponentDocs({
  name: 'Icon',
  status: 'beta',
  category: 'Data display',
  summary: 'A line icon from the Themis set (a chosen subset of Lucide), whose stroke and corners follow the theme.',
  base: null,

  usage: {
    whenToUse: [
      'Next to a label, to help people find or recognise an action (Button `iconLeft`/`iconRight`).',
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
    { part: 'Icon', description: 'A 24 × 24 line drawing scaled to 12, 16, 20, 24 or 32px, in the current text colour (`currentColor`).', required: true },
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
      'Colour comes from the surrounding text, so icons get the same contrast as their text.',
    ],
  },

  guidelines: {
    do: [
      'Use the same icon for the same meaning everywhere.',
      'Pair icons with text unless the meaning is universal.',
      'Ask for a new icon to be added to the set (it gets checked with every border width and radius) rather than drawing one inline.',
    ],
    dont: [
      'Set the icon\'s colour or stroke yourself; it follows the text colour and the theme.',
      'Use an icon in place of a word people need to read.',
    ],
  },

  tokens: ['borderWidth/border.width.mandatory', 'radius/border.radius.xs'],

  figma: {
    componentKey: null,
    url: null,
    properties: {},
    differences: [
      {
        topic: 'Icon set',
        figma: 'The Icons set holds ten placeholder icons at one size.',
        code: 'The Themis set of Lucide icons at 12, 16, 20, 24 and 32px, with sharp versions of Settings, Copy, Heart, Folder, Trash and TriangleAlert for radius `none`.',
        action: 'update-figma',
      },
      {
        topic: 'Theming',
        figma: 'Fixed strokes and corners.',
        code: 'Lines are as thick as `border/width/mandatory` (at least 1.25px, at most 1.5px at 12px, 2px at 16px, 2.25px at 20px, 2.5px at 24px and 2.75px at 32px). With radius `none`, joins turn sharp, line ends flat (dots square), rectangles lose their rounding, and the sharp versions replace their icons.',
        action: 'annotate-figma',
      },
    ],
  },

  related: ['Button', 'IconButton'],
  notes: [
    'Icons are drawn from Lucide\'s shape data (https://lucide.dev, ISC licence), not from Lucide\'s React components, so Themis controls every line.',
    'Small marks inside an outline (TriangleAlert\'s "!") are at most 2 grid units thick, so they keep clear of thick outlines.',
    '`caret-down` is drawn for Themis (it isn\'t in Lucide): the wider arrow on Select, ComboBox and UnitInput triggers.',
  ],
});
