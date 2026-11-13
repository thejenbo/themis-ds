import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';
import {
  CheckboxButton,
  type CheckboxButtonRenderProps,
  CheckboxField,
  type CheckboxFieldProps,
  type CheckboxFieldRenderProps,
  composeRenderProps,
  FieldError,
  Text,
  type ValidationResult,
} from 'react-aria-components';

import { border as borderWidth } from '../../tokens/borderWidth.stylex';
import { color } from '../../tokens/colorTheme.stylex';
import { font as fontTheme } from '../../tokens/fontTheme.stylex';
import { duration, easing } from '../../tokens/motion.stylex';
import { border as radius } from '../../tokens/radius.stylex';
import { spacing } from '../../tokens/spacing.stylex';
import { color as system } from '../../tokens/system.stylex';
import { font } from '../../tokens/typography.stylex';
import { focusRing } from '../../utils/focus-ring';
import { interactiveCursor } from '../../utils/interactive-cursor';
import { pressMotion } from '../../utils/press-motion';
import { racStyles } from '../../utils/stylex-rac';
import { touchTarget } from '../../utils/touch-target';
import { fieldStyles } from '../TextInput/field-base';

export interface CheckboxProps extends Omit<CheckboxFieldProps, 'className' | 'style' | 'children'> {
  /** The label. Clicking it toggles the checkbox too. Say what ticking it means ("Email me about new features"). */
  children: ReactNode;
  /** Help text under the checkbox. Linked to it for screen readers. */
  description?: ReactNode;
  /**
   * Shown under the checkbox when it's invalid (`isInvalid`, or a failed `isRequired`/`validate` check).
   * A function receives React Aria's validation result.
   */
  errorMessage?: ReactNode | ((validation: ValidationResult) => ReactNode);
  /** Layout-only StyleX overrides (margin, flex, grid placement). Do not restyle colours or size. */
  xstyle?: stylex.StyleXStyles;
}

/**
 * A single yes/no choice that takes effect when a form is submitted, such as agreeing to terms or opting into
 * emails. Built on React Aria `CheckboxField`: a native checkbox (Space toggles it), with the label, description and
 * error linked for screen readers. `isIndeterminate` shows a dash for "some but not all", e.g. a "select all" box.
 */
export function Checkbox({ children, description, errorMessage, xstyle, ...props }: CheckboxProps) {
  return (
    <CheckboxField {...props} {...racStyles<CheckboxFieldRenderProps>(() => [fieldStyles.field, styles.field, xstyle])}>
      <CheckboxButton
        data-themis-touch-target=""
        {...racStyles<CheckboxButtonRenderProps>((s) => [
          styles.row,
          touchTarget.area,
          focusRing.base,
          s.isFocusVisible && focusRing.visible,
          s.isFocusVisible && focusRing.radiusSm,
          s.isDisabled ? interactiveCursor.disabled : interactiveCursor.enabled,
        ])}
      >
        {composeRenderProps(children, (children, s) => (
          <>
            <span
              aria-hidden="true"
              {...stylex.props(styles.box, s.isDisabled && styles.boxDisabled, pressMotion.base, s.isPressed && !s.isDisabled && pressMotion.pressed)}
            >
              {/* The viewBox frames the check at about 55% of the space inside the border (Figma: 7.8px in 14px). */}
              <svg viewBox="1.4 1.5 21.2 21.2" fill="none" {...stylex.props(styles.icon)}>
                {s.isIndeterminate ? (
                  <path d="M7.75 12h8.5" pathLength={1} {...stylex.props(styles.mark, styles.drawn)} />
                ) : (
                  <path d="M6.26 13.87l3.96 3.24 7.68-10" pathLength={1} {...stylex.props(styles.mark, s.isSelected && styles.drawn)} />
                )}
              </svg>
            </span>
            <span {...stylex.props(styles.label, s.isDisabled && styles.labelDisabled)}>{children}</span>
          </>
        ))}
      </CheckboxButton>
      {description != null && (
        <Text slot="description" {...stylex.props(fieldStyles.contextRow, fieldStyles.caption)}>
          {description}
        </Text>
      )}
      <FieldError {...stylex.props(fieldStyles.error)}>
        {(validation) => (typeof errorMessage === 'function' ? errorMessage(validation) : (errorMessage ?? validation.validationErrors.join(' ')))}
      </FieldError>
    </CheckboxField>
  );
}

const boxSize = '1.5rem';

const styles = stylex.create({
  // Only as wide as its content, so clicks beside a short label don't toggle it.
  field: { width: 'auto', alignItems: 'flex-start' },
  // Figma "Checkbox": the box, then the label 8px after it. The whole row toggles it.
  row: {
    position: 'relative',
    display: 'flex',
    alignItems: 'flex-start',
    gap: spacing.xs,
    // The focus ring follows these corners (Figma "Focus Box", radius sm).
    borderRadius: radius.radiusSm,
    outline: 'none',
    WebkitTapHighlightColor: 'transparent',
  },
  // 24px, so it fills the label's first line: border/width/sm in color/border, radius xs, the background fill.
  box: {
    display: 'inline-flex',
    flexShrink: 0,
    boxSizing: 'border-box',
    width: boxSize,
    height: boxSize,
    borderStyle: 'solid',
    borderWidth: borderWidth.widthSm,
    borderColor: color.border,
    borderRadius: radius.radiusXs,
    backgroundColor: color.background,
    color: color.backgroundInverse,
  },
  boxDisabled: { borderColor: system.borderDisabled, backgroundColor: system.backgroundDisabledInverse, color: system.backgroundDisabledDefault },
  // The mark fills the space inside the border, so a thicker border (or a rounder box) shrinks it with room to spare.
  icon: { display: 'block', width: '100%', height: '100%' },
  // Figma "Check": a 2px rounded stroke. It draws itself in when ticked; under reduced motion it just appears.
  mark: {
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    strokeDasharray: 1,
    strokeDashoffset: 1,
    transitionProperty: 'stroke-dashoffset',
    transitionDuration: { default: duration.fast, '@media (prefers-reduced-motion: reduce)': '0s' },
    transitionTimingFunction: easing.standard,
  },
  drawn: { strokeDashoffset: 0 },
  // Figma type/input/base, regular weight like the radio options.
  label: {
    fontFamily: fontTheme.familyBody,
    fontSize: font.sizeInput,
    lineHeight: font.lineHeightInput,
    fontWeight: font.weightRegular,
    color: color.text,
  },
  labelDisabled: { color: system.textDisabledOnBackground },
});
