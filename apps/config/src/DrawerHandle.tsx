import * as stylex from '@stylexjs/stylex';
import { type KeyboardEvent, type PointerEvent, type RefObject, useRef } from 'react';
import { mergeProps, useFocusRing } from 'react-aria';

import { color } from '../../../src/tokens/colorTheme.stylex';
import { border as radius } from '../../../src/tokens/radius.stylex';
import { spacing } from '../../../src/tokens/spacing.stylex';
import { focusRing } from '../../../src/utils/focus-ring';

/** How much of the height the preview can take: enough of each part stays in view to grab the handle again. */
export const MIN_SHARE = 0.15;
export const MAX_SHARE = 0.85;
/** Arrow keys move the handle 5% of the height; Page Up / Page Down 20%. */
const STEP = 0.05;
const BIG_STEP = 0.2;

const clamp = (share: number) => Math.min(MAX_SHARE, Math.max(MIN_SHARE, share));

interface DrawerHandleProps {
  /** The share of `containerRef`'s height above the handle (the preview), 0 to 1. */
  value: number;
  onChange: (value: number) => void;
  /** The element the share is measured against: the preview and the settings together. */
  containerRef: RefObject<HTMLElement | null>;
  /** The id of the preview, which the handle resizes. */
  controls: string;
}

/**
 * The grab handle at the top of the tablet settings drawer: drag it up or down to give the preview or the settings
 * more room. A window splitter (WAI-ARIA `separator`), so it can be focused and moved with the arrow keys too, and
 * says how much of the height the preview has.
 */
export function DrawerHandle({ value, onChange, containerRef, controls }: DrawerHandleProps) {
  const { focusProps, isFocusVisible } = useFocusRing();
  // Where in the handle it was grabbed, so the drawer moves with the pointer instead of jumping to it.
  const grabOffset = useRef(0);

  const shareAt = (clientY: number) => {
    const box = containerRef.current?.getBoundingClientRect();
    return box && box.height > 0 ? clamp((clientY - grabOffset.current - box.top) / box.height) : value;
  };
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    const box = containerRef.current?.getBoundingClientRect();
    grabOffset.current = box ? e.clientY - (box.top + value * box.height) : 0;
    e.currentTarget.setPointerCapture(e.pointerId);
    e.currentTarget.focus({ preventScroll: true });
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) onChange(shareAt(e.clientY));
  };
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const next = {
      ArrowUp: value - STEP,
      ArrowDown: value + STEP,
      PageUp: value - BIG_STEP,
      PageDown: value + BIG_STEP,
      Home: MIN_SHARE,
      End: MAX_SHARE,
    }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    onChange(clamp(next));
  };

  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      aria-label="Resize the preview"
      aria-controls={controls}
      aria-valuemin={Math.round(MIN_SHARE * 100)}
      aria-valuemax={Math.round(MAX_SHARE * 100)}
      aria-valuenow={Math.round(value * 100)}
      aria-valuetext={`Preview ${Math.round(value * 100)}% of the height`}
      tabIndex={0}
      {...mergeProps(focusProps, { onPointerDown, onPointerMove, onKeyDown })}
      {...stylex.props(styles.handle)}
    >
      <span {...stylex.props(styles.grip, focusRing.base, isFocusVisible && focusRing.visible)} />
    </div>
  );
}

const styles = stylex.create({
  // The whole strip is the grab area (24px tall, the drawer's width); the pill in the middle shows it.
  handle: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    height: spacing.md,
    marginBlockEnd: `calc(-1 * ${spacing.xs})`,
    cursor: 'row-resize',
    touchAction: 'none',
    outlineStyle: 'none',
  },
  grip: {
    position: 'relative',
    width: spacing.xl,
    height: spacing['2xs'],
    borderRadius: radius.radiusFull,
    backgroundColor: color.border,
  },
});
