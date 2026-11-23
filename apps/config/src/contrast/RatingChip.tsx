import * as stylex from '@stylexjs/stylex';
import { useRef } from 'react';
import { Button, type ButtonRenderProps } from 'react-aria-components';
import { Chip, type ChipTone, type ContrastLevel, Icon, type ThemeColors, Tooltip, TooltipTrigger } from 'themis-ds';

import { border as radius } from '../../../../src/tokens/radius.stylex';
import { spacing } from '../../../../src/tokens/spacing.stylex';
import { focusRing } from '../../../../src/utils/focus-ring';
import { interactiveCursor } from '../../../../src/utils/interactive-cursor';
import { pressMotion } from '../../../../src/utils/press-motion';
import { racStyles } from '../../../../src/utils/stylex-rac';
import { touchTarget } from '../../../../src/utils/touch-target';
import { COLOR_LABELS, PAIR_COPY } from './contrast-copy';

export const LEVEL_TONE: Record<ContrastLevel, ChipTone> = { AAA: 'success', AA: 'success', Fail: 'danger' };

/** "4.62:1" */
export const ratioText = (ratio: number) => `${ratio.toFixed(2)}:1`;

/**
 * A color's contrast rating, beside its field's label: a chip that's a button. Hovering or focusing it shows the
 * lowest contrast in a sentence; pressing it opens the contrast modal on that color.
 */
export function RatingChip({
  colorKey,
  level,
  ratio,
  worstPair,
  onOpen,
}: {
  colorKey: keyof ThemeColors;
  level: ContrastLevel;
  ratio: number;
  /** The id of the pair with the lowest contrast. */
  worstPair: string;
  onOpen: (key: keyof ThemeColors) => void;
}) {
  const rating = { level, ratio };
  const where = PAIR_COPY[worstPair]?.where.toLowerCase() ?? worstPair;
  // The tooltip points at the info icon rather than the middle of the chip.
  const iconAnchor = useRef<HTMLSpanElement>(null);
  return (
    <TooltipTrigger>
      <Button
        aria-label={`${COLOR_LABELS[colorKey]} contrast: ${rating.level}, lowest ${rating.ratio.toFixed(2)} to 1. Show details`}
        onPress={() => onOpen(colorKey)}
        {...racStyles<ButtonRenderProps>((s) => [
          styles.button,
          interactiveCursor.enabled,
          touchTarget.area,
          focusRing.base,
          s.isFocusVisible && focusRing.visible,
        ])}
      >
        {({ isPressed }) => (
          // No hover tint: the pointer cursor and the info icon say it's clickable.
          <span {...stylex.props(styles.surface, pressMotion.base, isPressed && pressMotion.pressed)}>
            <Chip tone={LEVEL_TONE[rating.level]} iconRight={<Icon name="info" size="xsmall" />}>
              {rating.level}
            </Chip>
            <span ref={iconAnchor} aria-hidden="true" {...stylex.props(styles.iconAnchor)} />
          </span>
        )}
      </Button>
      <Tooltip triggerRef={iconAnchor}>
        Lowest {ratioText(rating.ratio)}: {where}. Select for details.
      </Tooltip>
    </TooltipTrigger>
  );
}

const styles = stylex.create({
  button: {
    position: 'relative',
    display: 'inline-flex',
    padding: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
    // The focus ring follows the chip's corners.
    borderRadius: radius.radiusXs,
  },
  surface: { position: 'relative', display: 'inline-flex' },
  // An invisible box centered on the info icon (the chip's 8px padding plus half the 12px icon in from its end), 24px
  // wide: React Aria keeps the arrow within its trigger's edges, so it needs more room than the 18px arrow.
  iconAnchor: {
    position: 'absolute',
    insetBlock: 0,
    insetInlineEnd: `calc(${spacing.xs} + 0.375rem - 0.75rem)`,
    width: '1.5rem',
    pointerEvents: 'none',
  },
});
