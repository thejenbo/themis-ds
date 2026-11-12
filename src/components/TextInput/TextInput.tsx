import * as stylex from '@stylexjs/stylex';
import { type ReactNode, useState } from 'react';
import {
  FieldError,
  Group,
  type GroupRenderProps,
  Input,
  Label,
  Text,
  TextField,
  type TextFieldProps,
  type TextFieldRenderProps,
  type ValidationResult,
} from 'react-aria-components';

import { focusRing } from '../../utils/focus-ring';
import { racStyles } from '../../utils/stylex-rac';
import { fieldStyles as styles } from './field-base';

interface TextInputBaseProps extends Omit<TextFieldProps, 'className' | 'style' | 'children' | 'maxLength'> {
  /** Help text under the box, e.g. "We'll only use this to send receipts." Linked to the input for screen readers. */
  description?: ReactNode;
  /**
   * Shown under the box when the field is invalid (`isInvalid`, or a failed `validate`/`isRequired` check).
   * A function receives React Aria's validation result.
   */
  errorMessage?: ReactNode | ((validation: ValidationResult) => ReactNode);
  /**
   * Show a character count ("12/150"). People can type past it; the count and border turn red and the field is
   * marked invalid, instead of silently cutting off what they typed or pasted.
   */
  characterLimit?: number;
  /** Text shown in the box while it's empty. A hint about the format, never a replacement for the label. */
  placeholder?: string;
  /** Decorative icon on the right of the box. Replaced by the error icon while the field is invalid. */
  icon?: ReactNode;
  /** Adds "(optional)" after the label. Mark the optional fields rather than the required ones. */
  isOptional?: boolean;
  /**
   * The word added after the label when `isOptional` is set. Pass a translation here.
   * @default 'optional'
   */
  optionalText?: string;
  /**
   * The input type. Use `email`, `tel` or `url` so phones show the right keyboard.
   * @default 'text'
   */
  type?: 'text' | 'email' | 'tel' | 'url' | 'search' | 'password';
  /** Layout-only StyleX overrides (margin, flex, grid placement). Do not restyle colours or size. */
  xstyle?: stylex.StyleXStyles;
}

/** A visible `label` is expected; `aria-label` (or `aria-labelledby`) only when the layout really can't show one. */
export type TextInputProps = TextInputBaseProps &
  (
    | { /** The field's name, shown above the box, e.g. "Email". */ label: ReactNode; 'aria-label'?: string }
    | { label?: undefined; 'aria-label': string }
    | { label?: undefined; 'aria-labelledby': string }
  );

/**
 * A single-line text field with a label, optional help text, character count and error message. Built on React Aria
 * `TextField`, which links the label, description and error to the input and handles validation.
 */
export function TextInput({
  label,
  description,
  errorMessage,
  characterLimit,
  placeholder,
  icon,
  isOptional = false,
  optionalText = 'optional',
  type = 'text',
  xstyle,
  value,
  defaultValue,
  onChange,
  isInvalid,
  ...props
}: TextInputProps) {
  // Track the length for the character count, whether the field is controlled or not.
  const [uncontrolledLength, setUncontrolledLength] = useState((defaultValue ?? '').length);
  const length = value !== undefined ? value.length : uncontrolledLength;
  const over = characterLimit !== undefined ? length - characterLimit : 0;
  const hasContext = description != null || characterLimit !== undefined;

  return (
    <TextField
      {...props}
      type={type}
      value={value}
      defaultValue={defaultValue}
      isInvalid={isInvalid || over > 0 || undefined}
      onChange={(next) => {
        if (value === undefined) setUncontrolledLength(next.length);
        onChange?.(next);
      }}
      {...racStyles<TextFieldRenderProps>(() => [styles.field, xstyle])}
    >
      {({ isDisabled, isInvalid: invalid }) => (
        <>
          {label != null && (
            <Label {...stylex.props(styles.label, isDisabled && styles.labelDisabled)}>
              {label}
              {isOptional && <span {...stylex.props(styles.optional)}> ({optionalText})</span>}
            </Label>
          )}
          <Group
            {...racStyles<GroupRenderProps>((g) => [
              styles.box,
              g.isInvalid && styles.boxInvalid,
              g.isDisabled && styles.boxDisabled,
              focusRing.base,
              // Text fields show the ring whenever they have focus (clicked or tabbed into), since that's where typing goes.
              g.isFocusWithin && focusRing.visible,
              // The box has a real 2px border, so the white ring has to clear it.
              g.isFocusWithin && focusRing.aroundBorderMandatory,
            ])}
          >
            <Input placeholder={placeholder} {...stylex.props(styles.input, isDisabled && styles.inputDisabled)} />
            {invalid ? (
              <span aria-hidden="true" {...stylex.props(styles.icon, styles.iconInvalid)}>
                <ErrorIcon />
              </span>
            ) : (
              icon != null && (
                <span aria-hidden="true" {...stylex.props(styles.icon)}>
                  {icon}
                </span>
              )
            )}
          </Group>
          {hasContext && (
            // One description for screen readers: the help text, then the count ("12 of 150 characters").
            <Text slot="description" {...stylex.props(styles.contextRow, styles.caption)}>
              {description != null && <span {...stylex.props(styles.description)}>{description}</span>}
              {characterLimit !== undefined && (
                <span {...stylex.props(styles.count, over > 0 && styles.countOver)}>
                  <span aria-hidden="true">
                    {length}/{characterLimit}
                  </span>
                  <span {...stylex.props(styles.visuallyHidden)}>
                    {' '}
                    {length} of {characterLimit} characters
                  </span>
                </span>
              )}
            </Text>
          )}
          {characterLimit !== undefined && (
            // Announced as soon as the limit is passed, not only on the next focus.
            <span aria-live="polite" {...stylex.props(styles.visuallyHidden)}>
              {over > 0 ? `${over} ${over === 1 ? 'character' : 'characters'} over the limit` : ''}
            </span>
          )}
          <FieldError {...stylex.props(styles.error)}>
            {(validation) => (typeof errorMessage === 'function' ? errorMessage(validation) : (errorMessage ?? validation.validationErrors.join(' ')))}
          </FieldError>
        </>
      )}
    </TextField>
  );
}

/** Placeholder error icon (Figma "Icon Right", errored) until the icon library exists. */
function ErrorIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M10 5v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="10" cy="14.5" r="1.25" fill="currentColor" />
    </svg>
  );
}
