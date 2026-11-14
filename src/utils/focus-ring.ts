import * as stylex from '@stylexjs/stylex';

import { border as borderWidth } from '../tokens/borderWidth.stylex';
import { color as primitive } from '../tokens/primitives.stylex';
import { border as radius } from '../tokens/radius.stylex';
import { spacing } from '../tokens/spacing.stylex';

/**
 * Themis focus ring: 2px dashes alternating black and white, drawn outside the element.
 *
 * - Never changes the element's size: a dashed black `outline`, plus a solid white ring as `::before`
 *   underneath it, so the gaps between dashes show white. One of the two colours always has at least
 *   3:1 contrast with any background (WCAG 1.4.11), whatever theme the user picks.
 * - Apply `visible` only for keyboard focus (React Aria `isFocusVisible`), never on mouse clicks.
 * - Windows high-contrast mode replaces custom colours, so the white backing ring is dropped there
 *   and the outline uses the system colour.
 * - The element needs `position: relative` and a border radius of `radius.radiusMd` (the ring follows it),
 *   or `radius.radiusSm` together with `radiusSm`.
 *   `base` makes the element a stacking context, so the white ring can sit under the outline.
 *
 * Uses the element's `::before`. Don't use `::before` for anything else on the same element.
 */
const offset = spacing['3xs'];
const width = borderWidth.widthFocusRing;

export const focusRing = stylex.create({
  base: {
    outlineStyle: 'none',
    // Own stacking context, so the white backing ring (z-index -1) paints under the dashed outline
    // but never under the page behind the element.
    isolation: 'isolate',
  },
  visible: {
    outlineStyle: 'dashed',
    outlineWidth: width,
    outlineColor: primitive.grayscale1000,
    outlineOffset: offset,
    '::before': {
      content: "''",
      position: 'absolute',
      zIndex: -1,
      inset: `calc(-1 * (${offset} + ${width}))`,
      borderStyle: 'solid',
      borderWidth: width,
      borderColor: primitive.grayscale000,
      borderRadius: `calc(${radius.radiusMd} + ${offset} + ${width})`,
      pointerEvents: 'none',
      display: { default: 'block', '@media (forced-colors: active)': 'none' },
    },
  },
  /** Add after `visible` on elements using `radius.radiusSm` (e.g. micro IconButton), so the ring follows them. */
  radiusSm: {
    '::before': {
      borderRadius: `calc(${radius.radiusSm} + ${offset} + ${width})`,
    },
  },
  /**
   * Add after `visible` to draw the ring just inside the element instead of outside it, for full-width
   * elements where an outside ring would overlap neighbours or spill out of the container (e.g. Accordion
   * headers). Same 2px gap and black/white dashes. Set the `::before` border radius in the component to
   * the element's radius minus `spacing.3xs`.
   *
   * Inside the element, the ring has to paint above the element's children, so both colours move onto the
   * `::before` (white border + black dashed outline on top of it). Windows high-contrast mode drops the
   * `::before`, so the element's own outline is kept there.
   */
  inset: {
    outlineStyle: { default: 'none', '@media (forced-colors: active)': 'dashed' },
    outlineOffset: `calc(-1 * (${offset} + ${width}))`,
    '::before': {
      inset: offset,
      zIndex: 1,
      outlineStyle: 'dashed',
      outlineWidth: width,
      outlineColor: primitive.grayscale1000,
      outlineOffset: `calc(-1 * ${width})`,
    },
  },
  /**
   * Add after `visible` on elements with a real CSS border (most Themis components draw borders as an overlay
   * instead). `::before` is positioned from inside the border, so without this the white ring slides inward by the
   * border width and covers part of the border. One variant per border-width token in use.
   */
  aroundBorderSm: {
    '::before': {
      inset: `calc(-1 * (${offset} + ${width} + ${borderWidth.widthSm}))`,
    },
  },
  /** Add after `visible` on pill-shaped elements using `radius.radiusFull` (e.g. Switch's track). */
  radiusFull: {
    '::before': {
      borderRadius: radius.radiusFull,
    },
  },
});
