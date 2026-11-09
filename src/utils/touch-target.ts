import * as stylex from '@stylexjs/stylex';

/**
 * Minimum touch target: on devices whose main input is touch, the clickable area extends to at least
 * 44×44px around the element's centre, without changing its size or layout.
 *
 * Works with an invisible `::after`, so the element needs `position: relative`. Don't use `::after`
 * for anything else on the same element. Also set `data-themis-touch-target=""` on the element so the
 * "show touch areas" debug view (Foundations / Touch targets) can find it.
 *
 * Neighbouring targets must not overlap: see the spacing rule in Foundations / Touch targets.
 */
export const TOUCH_TARGET_PX = 44;

export const touchTarget = stylex.create({
  area: {
    '::after': {
      content: "''",
      position: 'absolute',
      top: '50%',
      left: '50%',
      width: 'max(100%, 44px)',
      height: 'max(100%, 44px)',
      transform: 'translate(-50%, -50%)',
      display: { default: 'none', '@media (pointer: coarse)': 'block' },
    },
  },
});
