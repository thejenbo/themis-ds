import * as stylex from '@stylexjs/stylex';

import { duration, easing, scale } from '../tokens/motion.stylex';

/**
 * Press motion: a pressed control's visible layers shrink to `scale.pressed` (0.96).
 *
 * - Apply to the visible part only (e.g. Button's Surface), never to the clickable element, so the hit
 *   area doesn't shrink under the pointer and cancel the press.
 * - Keyboard presses (Space/Enter) shrink too: React Aria reports them through `isPressed`.
 * - Presses in fast (`duration.fast`) and releases slower (`duration.slow`). A CSS transition uses the
 *   duration of the state it's moving *to*, so `pressed` carries the press-in timing.
 * - No shrinking under `prefers-reduced-motion: reduce`.
 */
export const pressMotion = stylex.create({
  base: {
    transitionProperty: 'transform',
    transitionDuration: duration.slow,
    transitionTimingFunction: easing.standard,
  },
  pressed: {
    transform: {
      default: `scale(${scale.pressed})`,
      '@media (prefers-reduced-motion: reduce)': 'none',
    },
    transitionDuration: duration.fast,
  },
});
