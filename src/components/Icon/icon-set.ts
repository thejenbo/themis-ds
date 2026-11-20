import {
  ArrowDown,
  ArrowUp,
  Bell,
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  CircleAlert,
  CircleCheck,
  Copy,
  CreditCard,
  EllipsisVertical,
  ExternalLink,
  Folder,
  Heart,
  type IconNode,
  Info,
  Mail,
  Menu,
  Minus,
  Plus,
  Search,
  Settings,
  Shuffle,
  Trash,
  TriangleAlert,
  User,
  X,
} from 'lucide';

/**
 * One shape of an icon: an SVG element name and its attributes, on Lucide's 24 × 24 grid. `detail: true` marks small
 * marks inside an outline (TriangleAlert's "!"), whose stroke stays at most the medium weight.
 */
export type IconShape = [tag: string, attributes: Record<string, string>, options?: { detail?: boolean }];

export interface IconDefinition {
  /** Lucide's drawing. */
  shapes: IconNode | IconShape[];
  /**
   * A hand-drawn version for radius `none`, for icons whose curves are part of the shape (so sharp joins and flat line
   * ends can't straighten them).
   */
  sharp?: IconShape[];
}

/**
 * The Themis icon set: a chosen subset of Lucide (https://lucide.dev, ISC licence). Names are Lucide's, without
 * version numbers. Check every new icon with radius `none` and each border width before adding it, and add a `sharp`
 * version when its corners stay round there.
 */
export const iconSet = {
  'arrow-down': { shapes: ArrowDown },
  'arrow-up': { shapes: ArrowUp },
  bell: { shapes: Bell },
  calendar: { shapes: Calendar },
  check: { shapes: Check },
  // Drawn for Themis (Figma's "caret-down"): the arrow on Select, ComboBox and UnitInput triggers. Wider than Lucide's
  // chevron-down (14.5 × 7.25 on the grid instead of 12 × 6), like the arrow Figma draws there.
  'caret-down': { shapes: [['path', { d: 'M4.75 8.5 12 15.75l7.25-7.25' }]] },
  'chevron-down': { shapes: ChevronDown },
  'chevron-up': { shapes: ChevronUp },
  'chevrons-up-down': { shapes: ChevronsUpDown },
  'circle-alert': { shapes: CircleAlert },
  'circle-check': { shapes: CircleCheck },
  copy: {
    shapes: Copy,
    // Square corners on the back square too (the front one is a rect, which follows the radius already).
    sharp: [
      ['rect', { width: '14', height: '14', x: '8', y: '8' }],
      ['path', { d: 'M4 16H2V2h14v2' }],
    ],
  },
  'credit-card': { shapes: CreditCard },
  'ellipsis-vertical': { shapes: EllipsisVertical },
  'external-link': {
    shapes: ExternalLink,
    // Square corners on the open box; the arrow already straightens with sharp joins.
    sharp: [
      ['path', { d: 'M15 3h6v6' }],
      ['path', { d: 'M10 14 21 3' }],
      ['path', { d: 'M18 13v8H3V6h8' }],
    ],
  },
  folder: {
    shapes: Folder,
    // Lucide's outline with square corners; the tab slopes up from the body at x 12 to x 10.
    sharp: [['path', { d: 'M22 20V6H12L10 3H2v17Z' }]],
  },
  heart: {
    shapes: Heart,
    // Round lobes meeting at a point at the top, straight sides to a point at the bottom.
    sharp: [
      [
        'path',
        { d: 'M12 6.2A5.4 5.4 0 0 1 21.8 9.5C21.8 11.8 20.4 13.5 18.9 15L12 21.4 5.1 15C3.6 13.5 2.2 11.8 2.2 9.5A5.4 5.4 0 0 1 12 6.2Z' },
      ],
    ],
  },
  info: { shapes: Info },
  mail: { shapes: Mail },
  // The "hamburger": three straight lines, so radius none only squares their ends.
  menu: { shapes: Menu },
  minus: { shapes: Minus },
  plus: { shapes: Plus },
  search: { shapes: Search },
  settings: {
    shapes: Settings,
    // Six flat-ended teeth with straight sides and flat-bottomed gaps; the same size and hub as Lucide's.
    sharp: [
      [
        'path',
        {
          d: 'M9.7 4.7L10.4 2.5L13.6 2.5L14.3 4.7L14.4 5.65L16.3 6.75L17.17 6.36L19.43 5.86L21.03 8.64L19.47 10.34L18.7 10.9L18.7 13.1L19.47 13.66L21.03 15.36L19.43 18.14L17.17 17.64L16.3 17.25L14.4 18.35L14.3 19.3L13.6 21.5L10.4 21.5L9.7 19.3L9.6 18.35L7.7 17.25L6.83 17.64L4.57 18.14L2.97 15.36L4.53 13.66L5.3 13.1L5.3 10.9L4.53 10.34L2.97 8.64L4.57 5.86L6.83 6.36L7.7 6.75L9.6 5.65Z',
        },
      ],
      ['circle', { cx: '12', cy: '12', r: '3' }],
    ],
  },
  shuffle: { shapes: Shuffle },
  trash: {
    shapes: Trash,
    // Square corners on the bin and the handle.
    sharp: [
      ['path', { d: 'M10 11v6' }],
      ['path', { d: 'M14 11v6' }],
      ['path', { d: 'M19 6v16H5V6' }],
      ['path', { d: 'M3 6h18' }],
      ['path', { d: 'M8 6V2h8v4' }],
    ],
  },
  'triangle-alert': {
    shapes: TriangleAlert,
    // Straight sides, taller than a plain triangle so the "!" has room. The "!" is a detail (at most the medium
    // weight) and starts a little lower than Lucide's, so it stays clear of the thick inner corner at the top: a gap
    // of at least 0.4 units up to a 3-unit stroke. Flat ends, so the stem is as long as Lucide's round-ended one.
    sharp: [
      ['path', { d: 'M12 3.4 21.4 20.4H2.6Z' }],
      ['path', { d: 'M12 9.4v4.6' }, { detail: true }],
      ['path', { d: 'M12 16.9h.01' }, { detail: true }],
    ],
  },
  user: { shapes: User },
  x: { shapes: X },
} satisfies Record<string, IconDefinition>;

export type IconName = keyof typeof iconSet;

/** Every icon name, in alphabetical order. */
export const iconNames = Object.keys(iconSet) as IconName[];
