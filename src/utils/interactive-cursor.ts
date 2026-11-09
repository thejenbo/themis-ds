import * as stylex from '@stylexjs/stylex';

/**
 * Cursor for interactive elements: `pointer` when enabled, `not-allowed` when disabled, `progress` while
 * pending (the element is busy and ignores presses, but isn't disabled).
 *
 * Use on every clickable control (buttons, links, checkboxes, switches, tabs, menu items…). Don't use it
 * where a different cursor is expected: text inputs (`text`), draggable items (`grab`/`grabbing`),
 * resize handles, and so on.
 *
 * Pick the style from React Aria render props:
 *   s.isDisabled ? interactiveCursor.disabled : s.isPending ? interactiveCursor.pending : interactiveCursor.enabled
 */
export const interactiveCursor = stylex.create({
  enabled: { cursor: 'pointer' },
  disabled: { cursor: 'not-allowed' },
  pending: { cursor: 'progress' },
});
