import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';
import {
  Button,
  type ButtonRenderProps,
  FieldError,
  Group,
  type GroupRenderProps,
  Input,
  Label,
  NumberField,
  type NumberFieldProps,
  type NumberFieldRenderProps,
  Text,
  type ValidationResult,
} from 'react-aria-components';

import { border as borderWidth } from '../../tokens/borderWidth.stylex';
import { spacing } from '../../tokens/spacing.stylex';
import { color as system } from '../../tokens/system.stylex';
import { focusRing } from '../../utils/focus-ring';
import { interactiveCursor } from '../../utils/interactive-cursor';
import { pressMotion } from '../../utils/press-motion';
import { racStyles } from '../../utils/stylex-rac';
import { fieldStyles } from '../TextInput/field-base';

interface NumberInputBaseProps extends Omit<NumberFieldProps, 'className' | 'style' | 'children'> {
  /** Shown in the box while it's empty, e.g. "0". A hint, never a replacement for the label. */
  placeholder?: string;
  /** Help text under the box. Linked to the field for screen readers. */
  description?: ReactNode;
  /**
   * Shown under the box when the field is invalid (`isInvalid`, or a failed `isRequired`/`validate` check).
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
  /**
   * Names of the up and down buttons for screen readers. Pass translations here.
   * @default { increment: 'Increase', decrement: 'Decrease' }
   */
  stepperLabels?: { increment: string; decrement: string };
  /** Layout-only StyleX overrides (margin, flex, grid placement). Do not restyle colours or size. */
  xstyle?: stylex.StyleXStyles;
}

/** A visible `label` is expected; `aria-label` (or `aria-labelledby`) only when the layout really can't show one. */
export type NumberInputProps = NumberInputBaseProps &
  (
    | { /** The field's name, shown above the box, e.g. "Guests". */ label: ReactNode; 'aria-label'?: string }
    | { label?: undefined; 'aria-label': string }
    | { label?: undefined; 'aria-label'?: string; 'aria-labelledby': string }
  );

/**
 * A number field with up and down buttons, such as a quantity or a number of guests. Built on React Aria
 * `NumberField`: the number is parsed and formatted for the locale (`formatOptions` for decimals, percent or
 * currency), Up/Down arrows and the buttons step by `step`, and values are kept between `minValue` and `maxValue`.
 */
export function NumberInput({
  label,
  placeholder,
  description,
  errorMessage,
  isOptional = false,
  optionalText = 'optional',
  stepperLabels = { increment: 'Increase', decrement: 'Decrease' },
  xstyle,
  ...props
}: NumberInputProps) {
  return (
    <NumberField {...props} {...racStyles<NumberFieldRenderProps>(() => [fieldStyles.field, xstyle])}>
      {({ isDisabled }) => (
        <>
          {label != null && (
            <Label {...stylex.props(fieldStyles.label)}>
              {label}
              {isOptional && <span {...stylex.props(fieldStyles.optional)}> ({optionalText})</span>}
            </Label>
          )}
          <Group
            {...racStyles<GroupRenderProps>((g) => [
              fieldStyles.box,
              g.isInvalid && fieldStyles.boxInvalid,
              g.isDisabled && fieldStyles.boxDisabled,
              focusRing.base,
              // Like TextInput: the ring shows inside the box whenever the field has focus, since that's where typing goes.
              g.isFocusWithin && focusRing.visible,
              g.isFocusWithin && focusRing.inset,
              g.isFocusWithin && fieldStyles.boxRing,
            ])}
          >
            <Input placeholder={placeholder} {...stylex.props(fieldStyles.input, isDisabled && fieldStyles.inputDisabled)} />
            {/* Figma "Icon Right": up and down, out of the tab order (Up/Down arrows do the same). Each greys out at
                its limit. */}
            <span {...stylex.props(styles.steppers)}>
              <Button slot="increment" aria-label={stepperLabels.increment} data-themis-touch-target="" {...racStyles<ButtonRenderProps>((b) => stepperStyles(b, 'up'))}>
                {({ isPressed }) => (
                  <span aria-hidden="true" {...stylex.props(styles.chevron, pressMotion.base, isPressed && pressMotion.pressed)}>
                    <ChevronIcon direction="up" />
                  </span>
                )}
              </Button>
              <Button slot="decrement" aria-label={stepperLabels.decrement} data-themis-touch-target="" {...racStyles<ButtonRenderProps>((b) => stepperStyles(b, 'down'))}>
                {({ isPressed }) => (
                  <span aria-hidden="true" {...stylex.props(styles.chevron, pressMotion.base, isPressed && pressMotion.pressed)}>
                    <ChevronIcon direction="down" />
                  </span>
                )}
              </Button>
            </span>
          </Group>
          {description != null && (
            <Text slot="description" {...stylex.props(fieldStyles.contextRow, fieldStyles.caption)}>
              {description}
            </Text>
          )}
          <FieldError {...stylex.props(fieldStyles.error)}>
            {(validation) => (typeof errorMessage === 'function' ? errorMessage(validation) : (errorMessage ?? validation.validationErrors.join(' ')))}
          </FieldError>
        </>
      )}
    </NumberField>
  );
}

function stepperStyles(b: ButtonRenderProps, direction: 'up' | 'down') {
  return [
    styles.stepper,
    direction === 'up' ? styles.up : styles.down,
    direction === 'up' ? touch.up : touch.down,
    b.isDisabled && styles.stepperDisabled,
    b.isDisabled ? interactiveCursor.disabled : interactiveCursor.enabled,
  ];
}

/** Placeholder chevrons until the icon library exists. Together they make Figma's 6×18 up/down icon. */
function ChevronIcon({ direction }: { direction: 'up' | 'down' }) {
  return (
    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={direction === 'up' ? 'M1.5 4.75L5 1.25l3.5 3.5' : 'M1.5 1.25L5 4.75l3.5-3.5'} />
    </svg>
  );
}

// The box's padding above and below the text (8px less the border), which the buttons reach into.
const boxPaddingBlock = `calc(${spacing.xs} - ${borderWidth.widthMandatory})`;

const styles = stylex.create({
  // 16px from the number (Figma "Icon Right"), the full height of the box inside its border.
  steppers: {
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    alignSelf: 'stretch',
    marginInlineStart: spacing.sm,
    marginBlock: `calc(-1 * ${boxPaddingBlock})`,
  },
  stepper: {
    position: 'relative',
    display: 'flex',
    flexGrow: 1,
    flexBasis: 0,
    justifyContent: 'center',
    width: '1.25rem',
    margin: 0,
    padding: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
    color: 'inherit',
    outline: 'none',
  },
  // The two chevrons sit 8px apart in the middle of the box, as in Figma's single icon.
  up: { alignItems: 'flex-end', paddingBottom: '0.25rem' },
  down: { alignItems: 'flex-start', paddingTop: '0.25rem' },
  // Figma: the icon goes background-disabled-default when disabled, as Select's caret does; also at min/max.
  stepperDisabled: { color: system.backgroundDisabledDefault },
  chevron: { display: 'inline-flex' },
});

/**
 * Touch screens: each button's target is its half of the box (top or bottom, out to the box's edge), 44px wide.
 * Two stacked 44px squares would overlap, so they split the box between them instead.
 */
const touch = stylex.create({
  up: {
    '::after': {
      content: "''",
      position: 'absolute',
      left: '50%',
      width: '2.75rem',
      transform: 'translateX(-50%)',
      top: `calc(-1 * ${borderWidth.widthMandatory})`,
      bottom: 0,
      display: { default: 'none', '@media (pointer: coarse)': 'block' },
    },
  },
  down: {
    '::after': {
      content: "''",
      position: 'absolute',
      left: '50%',
      width: '2.75rem',
      transform: 'translateX(-50%)',
      top: 0,
      bottom: `calc(-1 * ${borderWidth.widthMandatory})`,
      display: { default: 'none', '@media (pointer: coarse)': 'block' },
    },
  },
});
