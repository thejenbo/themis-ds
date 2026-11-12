import * as stylex from '@stylexjs/stylex';
import { type ReactNode, useRef } from 'react';
import {
  Button,
  type ButtonRenderProps,
  ComboBox as AriaComboBox,
  type ComboBoxProps as AriaComboBoxProps,
  type ComboBoxRenderProps,
  FieldError,
  Group,
  type GroupRenderProps,
  Input,
  Label,
  Text,
  type ValidationResult,
} from 'react-aria-components';

import { focusRing } from '../../utils/focus-ring';
import { interactiveCursor } from '../../utils/interactive-cursor';
import { racStyles } from '../../utils/stylex-rac';
import { touchTarget } from '../../utils/touch-target';
import { CaretIcon, Dropdown, DropdownItem, type DropdownItemProps, triggerStyles } from '../Select/dropdown';
import { fieldStyles } from '../TextInput/field-base';

interface ComboBoxBaseProps<T extends object>
  extends Omit<AriaComboBoxProps<T>, 'className' | 'style' | 'children' | 'menuTrigger' | 'placeholder'> {
  /** `ComboBoxItem`s, or a function that renders one per entry in `items`. */
  children: ReactNode | ((item: T) => ReactNode);
  /** Help text under the box. Linked to the field for screen readers. */
  description?: ReactNode;
  /** Shown under the box when the field is invalid. A function receives React Aria's validation result. */
  errorMessage?: ReactNode | ((validation: ValidationResult) => ReactNode);
  /** Shown in the box while it's empty. Invite typing, e.g. "Search or choose a country". */
  placeholder?: string;
  /**
   * Shown in the list when nothing matches what was typed. Pass a translation here.
   * @default 'no results found :-('
   */
  emptyText?: ReactNode;
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
export type ComboBoxProps<T extends object = object> = ComboBoxBaseProps<T> &
  (
    | { /** The field's name, shown above the box, e.g. "Country". */ label: ReactNode; 'aria-label'?: string }
    | { label?: undefined; 'aria-label': string }
    | { label?: undefined; 'aria-label'?: string; 'aria-labelledby': string }
  );

/**
 * A text box that suggests options as you type, such as a country or a teammate, for lists too long to scroll
 * through. Built on React Aria `ComboBox`: typing filters the list (matching anywhere, ignoring case), Down arrow or
 * the caret shows every option, Enter chooses, and screen readers hear how many options match. By default people
 * must choose from the list; set `allowsCustomValue` to accept free text.
 */
export function ComboBox<T extends object>({
  label,
  description,
  errorMessage,
  placeholder,
  emptyText = 'no results found :-(',
  isOptional = false,
  optionalText = 'optional',
  children,
  xstyle,
  ...props
}: ComboBoxProps<T>) {
  // The list lines up with, and matches the width of, the whole box (not just the text inside it).
  const boxRef = useRef<HTMLDivElement>(null);
  return (
    <AriaComboBox<T>
      {...props}
      menuTrigger="input"
      // Show "no results found :-(" rather than closing the list when nothing matches.
      allowsEmptyCollection
      {...racStyles<ComboBoxRenderProps>(() => [fieldStyles.field, xstyle])}
    >
      {({ isDisabled }) => (
        <>
          {label != null && (
            <Label {...stylex.props(fieldStyles.label, isDisabled && fieldStyles.labelDisabled)}>
              {label}
              {isOptional && <span {...stylex.props(fieldStyles.optional)}> ({optionalText})</span>}
            </Label>
          )}
          <Group
            ref={boxRef}
            {...racStyles<GroupRenderProps>((g) => [
              fieldStyles.box,
              g.isInvalid && fieldStyles.boxInvalid,
              g.isDisabled && fieldStyles.boxDisabled,
              focusRing.base,
              // Like TextInput: the ring shows whenever the box has focus, since that's where typing goes.
              g.isFocusWithin && focusRing.visible,
              g.isFocusWithin && focusRing.aroundBorderMandatory,
            ])}
          >
            <Input placeholder={placeholder} {...stylex.props(fieldStyles.input, isDisabled && fieldStyles.inputDisabled)} />
            {/* The caret: a button that shows every option. Out of the tab order; Down arrow does the same. */}
            <Button
              data-themis-touch-target=""
              {...racStyles<ButtonRenderProps>((b) => [
                fieldStyles.icon,
                styles.caretButton,
                touchTarget.area,
                isDisabled && triggerStyles.caretDisabled,
                b.isDisabled ? interactiveCursor.disabled : interactiveCursor.enabled,
              ])}
            >
              <CaretIcon />
            </Button>
          </Group>
          {description != null && (
            <Text slot="description" {...stylex.props(fieldStyles.contextRow, fieldStyles.caption)}>
              {description}
            </Text>
          )}
          <FieldError {...stylex.props(fieldStyles.error)}>
            {(validation) => (typeof errorMessage === 'function' ? errorMessage(validation) : (errorMessage ?? validation.validationErrors.join(' ')))}
          </FieldError>
          <Dropdown<T> triggerRef={boxRef} emptyText={emptyText}>
            {children}
          </Dropdown>
        </>
      )}
    </AriaComboBox>
  );
}

export type ComboBoxItemProps = DropdownItemProps;

/** One option in a `ComboBox`. The chosen one shows a ✓. */
export const ComboBoxItem = DropdownItem;

const styles = stylex.create({
  caretButton: {
    position: 'relative',
    padding: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
    color: 'inherit',
    outline: 'none',
  },
});
