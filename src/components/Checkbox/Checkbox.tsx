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
import { border as radius } from '../../tokens/radius.stylex';
import { spacing } from '../../tokens/spacing.stylex';
import { color as system } from '../../tokens/system.stylex';
import { font } from '../../tokens/typography.stylex';
import { focusRing } from '../../utils/focus-ring';
import { interactiveCursor } from '../../utils/interactive-cursor';
import { pressMotion } from '../../utils/press-motion';
import { racStyles } from '../../utils/stylex-rac';
import { touchTarget } from '../../utils/touch-target';
import { Icon } from '../Icon';
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
              {/*
                Themis icons, so the marks follow the border width and radius like every icon. Both stay in the box,
                stacked, and draw themselves in and out, so changing state never morphs one mark into the other.
              */}
              <span {...stylex.props(styles.marks)}>
                <Icon name="check" drawn={s.isSelected && !s.isIndeterminate} xstyle={styles.mark} />
                <Icon name="minus" drawn={s.isIndeterminate} xstyle={styles.mark} />
              </span>
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
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxSizing: 'border-box',
    width: boxSize,
    height: boxSize,
    borderStyle: 'solid',
    borderWidth: borderWidth.widthMandatory,
    borderColor: color.border,
    borderRadius: radius.radiusXs,
    backgroundColor: color.background,
    color: color.backgroundInverse,
  },
  marks: { display: 'grid' },
  mark: { gridArea: '1 / 1' },
  boxDisabled: { borderColor: system.borderDisabled, backgroundColor: system.backgroundDisabledInverse, color: system.backgroundDisabledDefault },
  // Figma type/input/base, regular weight like the radio options.
  label: {
    fontFamily: fontTheme.familyBody,
    fontSize: font.sizeInput,
    lineHeight: font.lineHeightInput,
    fontWeight: font.weightRegular,
    color: color.text,
  },
  labelDisabled: { color: color.textDisabledOnBackground },
});
