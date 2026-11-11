import { defineComponentDocs } from '../../docs/component-docs';

export default defineComponentDocs({
  name: 'Avatar',
  status: 'beta',
  category: 'Data display',
  summary: 'A person\'s photo or initials at a fixed size, with an optional status dot.',
  base: null,

  usage: {
    whenToUse: [
      'Showing who did something or who owns something: comment authors, assignees, the signed-in user.',
      'Lists of people, next to their names.',
    ],
    whenNotToUse: [
      { scenario: 'A logo or product image.', useInstead: 'an image' },
      { scenario: 'A status on its own, with no person.', useInstead: 'Chip' },
    ],
  },

  anatomy: [
    { part: 'Avatar', description: 'A square with the medium radius (it follows the radius mode, up to a circle).', required: true },
    { part: 'Avatar Content', description: 'The photo (`src`), filling the avatar, or the initials in the heading font. Falls back to the initials if the photo fails to load.', required: true },
    { part: 'Border', description: 'Outline variant only: a brand border drawn on top of the content, so it adds no size.', required: false },
    { part: 'Indicator', description: 'Status dot with a thin ring, on the bottom-right corner\'s curve.', required: false },
  ],

  variants: {
    size: {
      xs: '24px. Dense lists and inline mentions.',
      sm: '32px. Table rows and compact lists.',
      md: '40px. The default: comments, lists, menus.',
      lg: '48px. Cards and headers.',
      xl: '56px. Profile headers.',
    },
    variant: {
      solid: 'Brand fill with light initials. The default.',
      outline: 'Background fill with a brand border and brand initials. Quieter; works on brand-coloured surfaces too.',
    },
    status: {
      online: 'Green dot. Read out as part of the name ("Taylor Brooks, online").',
    },
  },

  accessibility: {
    providedByBase: [],
    keyboard: [],
    requirements: [
      'Always pass `name`: it\'s the accessible name (role="img"), so screen readers say who it is. The initials and photo are hidden from them.',
      'If the name is shown right next to the avatar, set `isDecorative` so it isn\'t read twice.',
      'The status dot is not colour alone: its meaning is included in the accessible name. Translate it with `statusLabels`.',
      'The avatar isn\'t interactive. To link to a profile, wrap it in a link or Button with its own accessible name.',
    ],
  },

  guidelines: {
    do: [
      'Use the same size for every avatar in a list.',
      'Prefer a photo when there is one; initials are the fallback.',
    ],
    dont: [
      'Use the status dot for anything other than presence.',
      'Put text or icons other than initials inside an avatar.',
    ],
  },

  tokens: [
    'colorTheme/color.brand',
    'colorTheme/color.background',
    'colorTheme/color.text-inverse',
    'colorTheme/color.text-brand',
    'colorTheme/color.border-brand',
    'colorTheme/color.border',
    'colorTheme/color.success',
    'radius/border.radius.md',
    'radius/border.radius.full',
    'borderWidth/border.width.mandatory',
    'borderWidth/border.width.xs',
    'fontTheme/font.family.heading',
    'typography/font.weight.bold',
    'components/avatar.font.size.xs',
    'components/avatar.font.size.sm',
    'components/avatar.font.size.md',
    'components/avatar.font.size.lg',
    'components/avatar.font.size.xl',
    'radius/components.avatar.indicator-offset.xs',
    'radius/components.avatar.indicator-offset.sm',
    'radius/components.avatar.indicator-offset.md',
    'radius/components.avatar.indicator-offset.lg',
    'radius/components.avatar.indicator-offset.xl',
  ],

  figma: {
    componentKey: null,
    url: 'https://www.figma.com/design/tRoAewIghL1YbnTio6fkkw/Themis-Design-System?node-id=1875-2687',
    properties: {
      size: { figmaProperty: 'size', type: 'VARIANT' },
      variant: { figmaProperty: 'variant', type: 'VARIANT' },
      status: { figmaProperty: 'indicator', type: 'VARIANT', values: { online: 'true' } },
      src: { figmaProperty: 'image', type: 'VARIANT' },
    },
  },

  related: ['Chip'],
  notes: [
    'Read-only, so there is no React Aria base: it renders a <span role="img">.',
    'Initials sizes come from Figma\'s Component Tokens (avatar/font/size: 10/12/16/20/22px). They don\'t grow on desktop, because the avatar doesn\'t.',
    'The dot\'s position comes from the radius collection (components/avatar/indicator-offset, per radius mode and size): the distance from the square corner to the curve, so the dot sits on the rounded edge in every radius mode.',
    'The outline border sits on Figma\'s Avatar Content frame (the clipping frame that holds the photo), so it draws over the photo. Code does the same with a layer on top of the content: outline and solid avatars are the same size.',
    'Figma\'s `indicator` boolean is `status="online"`; its `image` boolean is on when `src` is passed.',
  ],
});
