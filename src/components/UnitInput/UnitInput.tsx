import * as stylex from '@stylexjs/stylex';
import { Children, isValidElement, type ReactNode, useId, useRef, useState } from 'react';
import {
  Button,
  type ButtonRenderProps,
  FieldError,
  Group,
  type GroupRenderProps,
  Input,
  type InputRenderProps,
  type Key,
  Label,
  NumberField,
  type NumberFieldProps,
  type NumberFieldRenderProps,
  Select,
  SelectValue,
  Text,
  type ValidationResult,
} from 'react-aria-components';

import { border as borderWidth } from '../../tokens/borderWidth.stylex';
import { font as fontTheme } from '../../tokens/fontTheme.stylex';
import { border as radius } from '../../tokens/radius.stylex';
import { spacing } from '../../tokens/spacing.stylex';
import { font } from '../../tokens/typography.stylex';
import { focusRing } from '../../utils/focus-ring';
import { interactiveCursor } from '../../utils/interactive-cursor';
import { racStyles } from '../../utils/stylex-rac';
import { CaretIcon, Dropdown, DropdownItem, type DropdownItemProps, triggerStyles } from '../Select/dropdown';
import { fieldStyles } from '../TextInput/field-base';

interface UnitInputBaseProps extends Omit<NumberFieldProps, 'className' | 'style' | 'children'> {
  /** The units, as `UnitInputItem`s, e.g. `<UnitInputItem id="kg">kg</UnitInputItem>`. */
  children: ReactNode;
  /** The chosen unit's `id` (controlled). */
  unit?: Key | null;
  /** The unit chosen at first (uncontrolled). */
  defaultUnit?: Key | null;
  /** Called with the new unit's `id` when one is chosen. */
  onUnitChange?: (unit: Key | null) => void;
  /**
   * Added after the label to name the unit button for screen readers ("Weight unit"). Pass a translation here.
   * @default 'unit'
   */
  unitLabel?: string;
  /** Form field name for the unit, submitted alongside `name`. */
  unitName?: string;
  /**
   * Shown in the unit button while no unit is chosen.
   * @default 'Unit'
   */
  unitPlaceholder?: string;
  /** Shown in the box while it's empty, e.g. "0". */
  placeholder?: string;
  /** Help text under the box. Linked to the field for screen readers. */
  description?: ReactNode;
  /** Shown under the box when the field is invalid. A function receives React Aria's validation result. */
  errorMessage?: ReactNode | ((validation: ValidationResult) => ReactNode);
  /** Adds "(optional)" after the label. */
  isOptional?: boolean;
  /**
   * The word added after the label when `isOptional` is set. Pass a translation here.
   * @default 'optional'
   */
  optionalText?: string;
  /** Layout-only StyleX overrides (margin, flex, grid placement). Do not restyle colors or size. */
  xstyle?: stylex.StyleXStyles;
}

/** A visible `label` is expected; `aria-label` (or `aria-labelledby`) only when the layout really can't show one. */
export type UnitInputProps = UnitInputBaseProps &
  (
    | { /** The field's name, shown above the box, e.g. "Weight". */ label: ReactNode; 'aria-label'?: string }
    | { label?: undefined; 'aria-label': string }
    | { label?: undefined; 'aria-label'?: string; 'aria-labelledby': string }
  );

/**
 * A number with its unit, such as a weight in kg or lb, or a length in cm or in, in one box. Built on React Aria
 * `NumberField` (locale formatting, min/max/step, Up/Down arrows to step, a number keyboard on phones) with a
 * React Aria `Select` for the unit, sharing Select's dropdown. Use `value` / `onChange` for the number and
 * `unit` / `onUnitChange` for the unit's `id`.
 */
export function UnitInput({
  label,
  children,
  unit,
  defaultUnit,
  onUnitChange,
  unitLabel = 'unit',
  unitName,
  unitPlaceholder = 'Unit',
  placeholder,
  description,
  errorMessage,
  isOptional = false,
  optionalText = 'optional',
  xstyle,
  ...props
}: UnitInputProps) {
  // The unit list lines up with, and matches the width of, the whole box.
  const boxRef = useRef<HTMLDivElement>(null);
  const [numberFocused, setNumberFocused] = useState(false);
  const labelId = useId();
  const unitWordId = useId();
  const valueId = useId();
  // The unit button reads "Weight unit, kg": the field's label, the word "unit", then the chosen unit.
  const fieldLabelledBy = props['aria-labelledby'] ?? (label != null ? labelId : undefined);
  const unitWord = fieldLabelledBy ? unitLabel : `${props['aria-label'] ?? ''} ${unitLabel}`.trim();
  // Every unit's text, stacked invisibly in the button so it's as wide as the widest unit and the divider never moves.
  const unitTexts = Children.toArray(children).flatMap((child) =>
    isValidElement<DropdownItemProps>(child) ? [child.props.textValue ?? (typeof child.props.children === 'string' ? child.props.children : '')] : [],
  );

  return (
    <NumberField {...props} {...racStyles<NumberFieldRenderProps>(() => [fieldStyles.field, xstyle])}>
      {({ isDisabled, isInvalid }) => (
        <>
          {label != null && (
            <Label id={labelId} {...stylex.props(fieldStyles.label)}>
              {label}
              {isOptional && <span {...stylex.props(fieldStyles.optional)}> ({optionalText})</span>}
            </Label>
          )}
          <Group
            ref={boxRef}
            {...racStyles<GroupRenderProps>(() => [
              fieldStyles.box,
              styles.box,
              isInvalid && fieldStyles.boxInvalid,
              isDisabled && fieldStyles.boxDisabled,
            ])}
          >
            {/* An input can't draw the ring itself, so this wrapper carries it. Like TextInput, it shows whenever the
                number has focus, since that's where typing goes. */}
            <span
              data-themis-number=""
              {...stylex.props(
                styles.number,
                focusRing.base,
                numberFocused && focusRing.visible,
                numberFocused && focusRing.inset,
                numberFocused && styles.numberRing,
              )}
            >
              <Input
                placeholder={placeholder}
                onFocus={() => setNumberFocused(true)}
                onBlur={() => setNumberFocused(false)}
                {...racStyles<InputRenderProps>(() => [fieldStyles.input, styles.numberInput, isDisabled && fieldStyles.inputDisabled])}
              />
            </span>
            <Select
              value={unit}
              defaultValue={defaultUnit}
              onChange={onUnitChange}
              name={unitName}
              isDisabled={isDisabled}
              placeholder={unitPlaceholder}
              aria-label={fieldLabelledBy ? undefined : unitWord}
              aria-labelledby={fieldLabelledBy ? `${fieldLabelledBy} ${unitWordId}` : undefined}
              {...stylex.props(styles.unitField)}
            >
              <Button
                aria-labelledby={[fieldLabelledBy, unitWordId, valueId].filter(Boolean).join(' ')}
                {...racStyles<ButtonRenderProps>((b) => [
                  styles.unit,
                  focusRing.base,
                  b.isFocusVisible && focusRing.visible,
                  b.isFocusVisible && focusRing.inset,
                  b.isFocusVisible && styles.unitRing,
                  b.isDisabled ? interactiveCursor.disabled : interactiveCursor.enabled,
                ])}
              >
                <span id={unitWordId} {...stylex.props(fieldStyles.visuallyHidden)}>
                  {unitWord}
                </span>
                <span {...stylex.props(styles.unitText)}>
                  {unitTexts.map((text, i) => (
                    <span key={i} aria-hidden="true" {...stylex.props(styles.stack, styles.sizer)}>
                      {text}
                    </span>
                  ))}
                  <span id={valueId} {...stylex.props(styles.stack)}>
                    <SelectValue />
                  </span>
                </span>
                <span aria-hidden="true" {...stylex.props(fieldStyles.icon, isDisabled && triggerStyles.caretDisabled)}>
                  <CaretIcon />
                </span>
              </Button>
              <Dropdown triggerRef={boxRef}>{children}</Dropdown>
            </Select>
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

export type UnitInputItemProps = DropdownItemProps;

/** One unit in a `UnitInput`. The chosen one shows a ✓. */
export const UnitInputItem = DropdownItem;

// Inside rings: the corners follow the box on the outer side only (Figma "Focus Ring" in each half).
const ringRadius = `max(0px, calc(${radius.radiusMd} - ${spacing['3xs']} - ${borderWidth.widthMandatory}))`;

/** The box's two halves (text and a format/unit button), shared with ColorField. */
export const unitBoxStyles = stylex.create({
  // The two halves fill the box and draw their own padding, so each can carry its own focus ring.
  box: { alignItems: 'stretch', paddingBlock: 0, paddingInline: 0 },
  number: {
    position: 'relative',
    display: 'flex',
    flexGrow: 1,
    minWidth: 0,
  },
  // The padding is on the input, so a click anywhere in the left half puts the cursor in it.
  numberInput: { alignSelf: 'stretch', paddingInline: `calc(${spacing.sm} - ${borderWidth.widthMandatory})` },
  numberRing: {
    '::before': {
      borderStartStartRadius: ringRadius,
      borderEndStartRadius: ringRadius,
      borderStartEndRadius: 0,
      borderEndEndRadius: 0,
    },
  },
  // Passes the box's border color on to the divider (the button's `inherit` would otherwise get the text color).
  unitField: { display: 'flex', flexShrink: 0, borderColor: 'inherit' },
  // Figma "Select Box": a divider on its left in the box's border color (red when invalid, gray when disabled).
  unit: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    margin: 0,
    paddingBlock: 0,
    paddingInline: `calc(${spacing.sm} - ${borderWidth.widthMandatory})`,
    borderWidth: 0,
    borderInlineStartWidth: borderWidth.widthMandatory,
    borderInlineStartStyle: 'solid',
    borderInlineStartColor: 'inherit',
    borderStartEndRadius: 'inherit',
    borderEndEndRadius: 'inherit',
    backgroundColor: 'transparent',
    color: 'inherit',
    // Figma type/input/base, the same as the number.
    fontFamily: fontTheme.familyBody,
    fontSize: font.sizeInput,
    lineHeight: font.lineHeightInput,
    fontWeight: font.weightRegular,
    textAlign: 'start',
  },
  unitRing: {
    '::before': {
      borderStartStartRadius: 0,
      borderEndStartRadius: 0,
      borderStartEndRadius: ringRadius,
      borderEndEndRadius: ringRadius,
    },
  },
  // Every unit stacked in one grid cell: the cell is as wide as the widest, and only the chosen one shows.
  unitText: { display: 'grid', whiteSpace: 'nowrap' },
  stack: { gridArea: '1 / 1' },
  sizer: { visibility: 'hidden' },
});

const styles = unitBoxStyles;
