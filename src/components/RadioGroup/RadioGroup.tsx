import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';
import {
  composeRenderProps,
  FieldError,
  Label,
  Radio as AriaRadio,
  RadioGroup as AriaRadioGroup,
  type RadioGroupProps as AriaRadioGroupProps,
  type RadioGroupRenderProps,
  type RadioProps as AriaRadioProps,
  type RadioRenderProps,
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

interface RadioGroupBaseProps extends Omit<AriaRadioGroupProps, 'className' | 'style' | 'children' | 'orientation'> {
  /** The `Radio`s to choose from. */
  children: ReactNode;
  /**
   * Stack the options (`vertical`) or put them side by side, wrapping when there isn't room (`horizontal`).
   * Keep horizontal for two or three short options.
   * @default 'vertical'
   */
  orientation?: 'vertical' | 'horizontal';
  /** Help text under the options. Linked to the group for screen readers. */
  description?: ReactNode;
  /**
   * Shown under the options when the group is invalid (`isInvalid`, or a failed `isRequired`/`validate` check).
   * A function receives React Aria's validation result.
   */
  errorMessage?: ReactNode | ((validation: ValidationResult) => ReactNode);
  /** Adds "(optional)" after the label. */
  isOptional?: boolean;
  /**
   * The word added after the label when `isOptional` is set. Pass a translation here.
   * @default 'optional'
   */
  optionalText?: string;
  /** Layout-only StyleX overrides (margin, flex, grid placement). Do not restyle colours or size. */
  xstyle?: stylex.StyleXStyles;
}

/**
 * A visible `label` (the question) is expected; `aria-label` (or `aria-labelledby`) only when the layout already
 * shows the question somewhere else, as in Figma's "Radio Button Group".
 */
export type RadioGroupProps = RadioGroupBaseProps &
  (
    | { /** The question, shown above the options, e.g. "Delivery". */ label: ReactNode; 'aria-label'?: string }
    | { label?: undefined; 'aria-label': string }
    | { label?: undefined; 'aria-label'?: string; 'aria-labelledby': string }
  );

/**
 * Picks exactly one of a few options that are all visible at once, such as a delivery speed or a plan. Built on React
 * Aria `RadioGroup`: one Tab stop for the whole group, arrow keys move and choose, and the label, description and
 * error are linked for screen readers. Use `value` / `onChange` for the chosen option's `value`.
 */
export function RadioGroup({
  label,
  children,
  orientation = 'vertical',
  description,
  errorMessage,
  isOptional = false,
  optionalText = 'optional',
  xstyle,
  ...props
}: RadioGroupProps) {
  return (
    <AriaRadioGroup {...props} orientation={orientation} {...racStyles<RadioGroupRenderProps>(() => [fieldStyles.field, xstyle])}>
      {label != null && (
        <Label {...stylex.props(fieldStyles.label)}>
          {label}
          {isOptional && <span {...stylex.props(fieldStyles.optional)}> ({optionalText})</span>}
        </Label>
      )}
      <div {...stylex.props(styles.options, orientation === 'horizontal' && styles.horizontal)}>{children}</div>
      {description != null && (
        <Text slot="description" {...stylex.props(fieldStyles.contextRow, fieldStyles.caption)}>
          {description}
        </Text>
      )}
      <FieldError {...stylex.props(fieldStyles.error)}>
        {(validation) => (typeof errorMessage === 'function' ? errorMessage(validation) : (errorMessage ?? validation.validationErrors.join(' ')))}
      </FieldError>
    </AriaRadioGroup>
  );
}

export interface RadioProps extends Omit<AriaRadioProps, 'className' | 'style' | 'children'> {
  /** The value `onChange` reports when this option is chosen. Unique within the group. */
  value: string;
  /** The option's label. Clicking it chooses the option too. */
  children: ReactNode;
}

/** One option in a `RadioGroup`: the circle and its label. */
export function Radio({ children, ...props }: RadioProps) {
  return (
    <AriaRadio
      {...props}
      data-themis-touch-target=""
      {...racStyles<RadioRenderProps>((s) => [
        styles.radio,
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
            {...stylex.props(
              styles.circle,
              s.isSelected && styles.selected,
              s.isDisabled && styles.circleDisabled,
              pressMotion.base,
              s.isPressed && !s.isDisabled && pressMotion.pressed,
            )}
          />
          <span {...stylex.props(styles.label, s.isDisabled && styles.labelDisabled)}>{children}</span>
        </>
      ))}
    </AriaRadio>
  );
}

const circleSize = '1.75rem';
const dotSize = '0.75rem';

const styles = stylex.create({
  // Figma "Radio Buttons": 16px apart, so each 28px row's 44px touch target meets the next without overlapping.
  options: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: spacing.sm },
  horizontal: { flexDirection: 'row', flexWrap: 'wrap' },
  // Figma "Radio Button": the circle, then the label 8px after it. The whole row chooses the option.
  radio: {
    position: 'relative',
    display: 'flex',
    alignItems: 'flex-start',
    gap: spacing.xs,
    // The focus ring follows these corners (Figma "Focus Box", radius sm).
    borderRadius: radius.radiusSm,
    outline: 'none',
    WebkitTapHighlightColor: 'transparent',
  },
  // Figma "Radio": 28px, a border/width/sm stroke inside, the background fill.
  circle: {
    position: 'relative',
    display: 'inline-flex',
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    width: circleSize,
    height: circleSize,
    borderStyle: 'solid',
    borderWidth: borderWidth.widthMandatory,
    borderColor: color.border,
    borderRadius: radius.radiusFull,
    backgroundColor: color.background,
    // The 12px dot grows in when chosen; under reduced motion it just appears.
    '::after': {
      content: "''",
      width: dotSize,
      height: dotSize,
      borderRadius: radius.radiusFull,
      backgroundColor: color.backgroundInverse,
      transform: 'scale(0)',
      transitionProperty: 'transform',
      transitionDuration: { default: duration.fast, '@media (prefers-reduced-motion: reduce)': '0s' },
      transitionTimingFunction: easing.standard,
    },
  },
  selected: { '::after': { transform: 'scale(1)' } },
  circleDisabled: {
    borderColor: system.borderDisabled,
    backgroundColor: system.backgroundDisabledInverse,
    '::after': { backgroundColor: system.backgroundDisabledDefault },
  },
  // Figma type/input/base. The 24px line sits 2px down, centred on the 28px circle; long labels wrap under it.
  label: {
    paddingBlockStart: `calc((${circleSize} - ${font.lineHeightInput}) / 2)`,
    fontFamily: fontTheme.familyBody,
    fontSize: font.sizeInput,
    lineHeight: font.lineHeightInput,
    fontWeight: font.weightRegular,
    color: color.text,
  },
  labelDisabled: { color: color.textDisabledOnBackground },
});
