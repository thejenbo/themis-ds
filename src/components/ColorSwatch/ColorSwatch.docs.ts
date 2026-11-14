import { defineComponentDocs } from '../../docs/component-docs';

export default defineComponentDocs({
  name: 'ColorSwatch',
  status: 'beta',
  category: 'Color',
  summary: 'Shows a colour as a small square, e.g. next to a colour\'s name or value.',
  base: {
    package: 'react-aria-components',
    component: 'ColorSwatch',
    docsUrl: 'https://react-spectrum.adobe.com/react-aria/ColorSwatch.html',
  },

  usage: {
    whenToUse: [
      'Showing a colour value next to its name or code, e.g. in a list of theme colours.',
      'A preview of the colour picked in a ColorSlider or ColorArea.',
    ],
    whenNotToUse: [
      { scenario: 'Choosing a colour by clicking a swatch.', useInstead: 'a swatch picker (coming later)' },
      { scenario: 'Status or meaning shown by colour alone.', useInstead: 'Chip, with a text label' },
    ],
  },

  anatomy: [
    { part: 'Swatch', description: 'A 24, 32 or 40px square with border/radius/md corners, filled with the colour. See-through colours show a grey and white checkerboard behind them.', required: true },
    { part: 'Outline', description: '`variant="outline"`: a border/width/sm border in color/border.', required: false },
  ],

  variants: {
    size: {
      small: '24px.',
      medium: '32px. The default.',
      large: '40px.',
    },
    variant: {
      solid: 'The colour only. The default.',
      outline: 'Adds a border, so colours close to the background (white on white, black on black) stay visible.',
    },
  },

  accessibility: {
    providedByBase: [
      'The swatch is an image (role="img", described as a "color swatch") whose name describes the colour, e.g. "dark vibrant blue".',
      '`colorName` replaces the generated description, and `aria-label` adds context after it (e.g. "dark vibrant blue, Primary").',
    ],
    keyboard: [],
    requirements: [
      'Show the colour\'s name or value as text next to the swatch when people need it; the swatch alone only shows it.',
      'Use `variant="outline"` when the colour may be close to the background behind it.',
    ],
  },

  guidelines: {
    do: [
      'Pass `colorName` for named colours (brand or palette names), so screen readers say the same name the page shows.',
      'Use `outline` in lists of user-chosen colours, where any colour can turn up.',
    ],
    dont: [
      'Use a swatch as a button. It isn\'t focusable or clickable.',
      'Rely on the swatch alone to tell colours apart.',
    ],
  },

  tokens: [
    'colorTheme/color.border',
    'radius/border.radius.md',
    'borderWidth/border.width.sm',
    'primitives/color.grayscale.000',
    'primitives/color.grayscale.030',
  ],

  figma: {
    componentKey: null,
    url: 'https://www.figma.com/design/tRoAewIghL1YbnTio6fkkw/Themis-Design-System?node-id=1859-2940',
    properties: {
      size: { figmaProperty: 'size', type: 'VARIANT' },
      variant: { figmaProperty: 'variant', type: 'VARIANT' },
    },
    differences: [],
  },

  related: ['ColorSlider', 'ColorArea'],
  notes: [
    'In Figma the colour is the "Swatch Content" fill; in code it\'s `color`, any CSS colour string or a `Color` from React Aria\'s `parseColor`.',
  ],
});
