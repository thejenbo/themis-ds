import * as stylex from '@stylexjs/stylex';
import type { HTMLAttributes, ReactNode } from 'react';

import { border as borderWidth } from '../../tokens/borderWidth.stylex';
import { color } from '../../tokens/colorTheme.stylex';
import { font as fontTheme } from '../../tokens/fontTheme.stylex';
import { border as radius } from '../../tokens/radius.stylex';
import { spacing } from '../../tokens/spacing.stylex';
import { font } from '../../tokens/typography.stylex';

export type ChipTone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger';
export type ChipVariant = 'outline' | 'solid';

export interface ChipProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'className' | 'style' | 'children'> {
  /** The label: a word or two, such as "Paid" or "Overdue". It carries the meaning, so never leave it out. */
  children: ReactNode;
  /**
   * Color and meaning. `success`, `warning` and `danger` for statuses; `brand` to highlight; `neutral` for
   * everything else.
   * @default 'neutral'
   */
  tone?: ChipTone;
  /**
   * `outline`: colored border and text on the background, for most chips. `solid`: filled with the tone, for
   * the one status that should stand out most.
   * @default 'outline'
   */
  variant?: ChipVariant;
  /** Icon before the label. Decorative: hidden from screen readers. */
  iconLeft?: ReactNode;
  /** Icon after the label. Decorative: hidden from screen readers. */
  iconRight?: ReactNode;
  /** Layout-only StyleX overrides (margin, flex, grid placement). Do not restyle colors or size. */
  xstyle?: stylex.StyleXStyles;
}

/**
 * A small read-only label for a status or category, such as "Paid" or "Overdue" in a table row.
 * It isn't interactive: for chips people can select or remove, use a TagGroup (not built yet).
 */
export function Chip({ children, tone = 'neutral', variant = 'outline', iconLeft, iconRight, xstyle, ...props }: ChipProps) {
  const look = variant === 'solid' ? solid[tone] : outline[tone];
  return (
    <span {...props} {...stylex.props(styles.chip, variant === 'outline' && styles.border, look, xstyle)}>
      {iconLeft != null && (
        <span aria-hidden="true" {...stylex.props(styles.icon)}>
          {iconLeft}
        </span>
      )}
      <span {...stylex.props(styles.label)}>{children}</span>
      {iconRight != null && (
        <span aria-hidden="true" {...stylex.props(styles.icon)}>
          {iconRight}
        </span>
      )}
    </span>
  );
}

const styles = stylex.create({
  // Figma: 20px tall (2px padding + 16px caption line), radius xs.
  chip: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing['2xs'],
    paddingBlock: spacing['3xs'],
    paddingInline: spacing.xs,
    borderRadius: radius.radiusXs,
    verticalAlign: 'middle',
    whiteSpace: 'nowrap',
    fontFamily: fontTheme.familyBody,
    // Figma type/caption/base.
    fontSize: font.sizeCaption,
    lineHeight: font.lineHeightCaption,
    fontWeight: font.weightRegular,
  },
  // Drawn on top, like Figma's inside stroke, so it adds no size.
  border: {
    '::after': {
      content: "''",
      position: 'absolute',
      inset: 0,
      borderRadius: 'inherit',
      borderStyle: 'solid',
      borderWidth: borderWidth.widthMandatory,
      pointerEvents: 'none',
    },
  },
  label: { position: 'relative' },
  icon: { position: 'relative', display: 'inline-flex', alignItems: 'center', height: font.lineHeightCaption },
});

const outline = stylex.create({
  neutral: { backgroundColor: color.background, color: color.text, '::after': { borderColor: color.border } },
  brand: { backgroundColor: color.background, color: color.textBrand, '::after': { borderColor: color.borderBrand } },
  success: { backgroundColor: color.background, color: color.stateSuccess, '::after': { borderColor: color.stateSuccess } },
  warning: { backgroundColor: color.background, color: color.stateWarning, '::after': { borderColor: color.stateWarning } },
  danger: { backgroundColor: color.background, color: color.stateError, '::after': { borderColor: color.stateError } },
});

const solid = stylex.create({
  neutral: { backgroundColor: color.backgroundInverse, color: color.textInverse },
  brand: { backgroundColor: color.brand, color: color.textInverse },
  success: { backgroundColor: color.stateSuccess, color: color.textInverse },
  warning: { backgroundColor: color.stateWarning, color: color.textInverse },
  danger: { backgroundColor: color.stateError, color: color.textInverse },
});
