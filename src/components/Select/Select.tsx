import * as stylex from '@stylexjs/stylex';
import { type ReactNode, type RefObject, useContext, useRef, useState } from 'react';
import {
  Button,
  type ButtonRenderProps,
  FieldError,
  type Key,
  Label,
  Select as AriaSelect,
  type SelectProps as AriaSelectProps,
  type SelectRenderProps,
  type SelectState,
  SelectStateContext,
  SelectValue,
  type SelectValueRenderProps,
  Text,
  type ValidationResult,
} from 'react-aria-components';

import { focusRing } from '../../utils/focus-ring';
import { interactiveCursor } from '../../utils/interactive-cursor';
import { racStyles } from '../../utils/stylex-rac';
import { fieldStyles } from '../TextInput/field-base';
import { CaretIcon, Dropdown, DropdownItem, type DropdownItemProps, DropdownSeparator, triggerStyles } from './dropdown';

interface SelectBaseProps<T extends object>
  extends Omit<
    AriaSelectProps<T, 'single'>,
    'className' | 'style' | 'children' | 'selectionMode' | 'selectedKey' | 'defaultSelectedKey' | 'onSelectionChange' | 'placeholder'
  > {
  /** `SelectItem`s, or a function that renders one per entry in `items`. */
  children: ReactNode | ((item: T) => ReactNode);
  /** Help text under the box. Linked to the select for screen readers. */
  description?: ReactNode;
  /** Shown under the box when the select is invalid. A function receives React Aria's validation result. */
  errorMessage?: ReactNode | ((validation: ValidationResult) => ReactNode);
  /**
   * Shown in the box while nothing is chosen.
   * @default 'Select an option'
   */
  placeholder?: string;
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

/** A visible `label` is expected; `aria-label` (or `aria-labelledby`) only when the layout really can't show one. */
export type SelectProps<T extends object = object> = SelectBaseProps<T> &
  (
    | { /** The field's name, shown above the box, e.g. "Country". */ label: ReactNode; 'aria-label'?: string }
    | { label?: undefined; 'aria-label': string }
    | { label?: undefined; 'aria-label'?: string; 'aria-labelledby': string }
  );

/**
 * Picks one option from a list that opens below the field, such as a country or a role. Built on React Aria
 * `Select`: the arrow keys and typing a letter move through options, Escape closes the list, and the label,
 * description and error are linked for screen readers. Use `value` / `onChange` for the chosen option's `id`.
 * An option with `onAction` (e.g. "Add new…") runs it instead of becoming the value.
 */
export function Select<T extends object>({
  value,
  defaultValue,
  onChange,
  label,
  description,
  errorMessage,
  placeholder = 'Select an option',
  isOptional = false,
  optionalText = 'optional',
  children,
  xstyle,
  ...props
}: SelectProps<T>) {
  // React Aria's Select would make an action option the value, so the value is kept here and actions are run instead.
  const [uncontrolledValue, setUncontrolledValue] = useState<Key | null>(defaultValue ?? null);
  const isControlled = value !== undefined;
  const stateRef = useRef<SelectState<T, 'single'> | null>(null);
  const handleChange = (key: Key | null) => {
    const state = stateRef.current;
    const onAction: unknown = key != null ? state?.collection.getItem(key)?.props?.onAction : undefined;
    if (typeof onAction === 'function') {
      // Only from the open list: typing a letter on the closed box shouldn't run an action.
      if (state?.isOpen) onAction();
      return;
    }
    if (!isControlled) setUncontrolledValue(key);
    onChange?.(key);
  };

  return (
    <AriaSelect<T, 'single'>
      {...props}
      value={isControlled ? value : uncontrolledValue}
      onChange={handleChange}
      placeholder={placeholder}
      {...racStyles<SelectRenderProps>(() => [fieldStyles.field, xstyle])}
    >
      {({ isDisabled, isInvalid }) => (
        <>
          <SelectStateRef stateRef={stateRef} />
          {label != null && (
            <Label {...stylex.props(fieldStyles.label)}>
              {label}
              {isOptional && <span {...stylex.props(fieldStyles.optional)}> ({optionalText})</span>}
            </Label>
          )}
          <Button
            {...racStyles<ButtonRenderProps>((b) => [
              fieldStyles.box,
              styles.trigger,
              isInvalid && fieldStyles.boxInvalid,
              b.isDisabled && fieldStyles.boxDisabled,
              focusRing.base,
              b.isFocusVisible && focusRing.visible,
              // Inside the box, as in Figma (and the other inputs).
              b.isFocusVisible && focusRing.inset,
              b.isFocusVisible && fieldStyles.boxRing,
              b.isDisabled ? interactiveCursor.disabled : interactiveCursor.enabled,
            ])}
          >
            <SelectValue<T> {...racStyles<SelectValueRenderProps<T>>((v) => [fieldStyles.input, styles.value, v.isPlaceholder && triggerStyles.placeholder])} />
            {/* Figma "Icon Right": the caret, the same whether the list is open or not. */}
            <span aria-hidden="true" {...stylex.props(fieldStyles.icon, isDisabled && triggerStyles.caretDisabled)}>
              <CaretIcon />
            </span>
          </Button>
          {description != null && (
            <Text slot="description" {...stylex.props(fieldStyles.contextRow, fieldStyles.caption)}>
              {description}
            </Text>
          )}
          <FieldError {...stylex.props(fieldStyles.error)}>
            {(validation) => (typeof errorMessage === 'function' ? errorMessage(validation) : (errorMessage ?? validation.validationErrors.join(' ')))}
          </FieldError>
          <Dropdown<T>>{children}</Dropdown>
        </>
      )}
    </AriaSelect>
  );
}

/** Keeps a handle on React Aria's select state, so `onChange` can tell an action option from a value. */
function SelectStateRef<T extends object>({ stateRef }: { stateRef: RefObject<SelectState<T, 'single'> | null> }) {
  // Written each render, so it is never stale.
  stateRef.current = useContext(SelectStateContext) as SelectState<T, 'single'> | null;
  return null;
}

export type SelectItemProps = DropdownItemProps;

/** One option in a `Select`. The chosen one shows a ✓. */
export const SelectItem = DropdownItem;

/** A 1px line between groups of options, e.g. before an "Add new…" option at the end. Screen readers skip it. */
export const SelectSeparator = DropdownSeparator;

const styles = stylex.create({
  // The box is a button: full width, value on the left, caret on the right.
  trigger: { width: '100%', margin: 0, textAlign: 'start', font: 'inherit' },
  value: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
});
