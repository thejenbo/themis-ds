import * as stylex from '@stylexjs/stylex';
import { type ReactNode, useCallback, useLayoutEffect, useRef } from 'react';
import {
  FieldError,
  Group,
  type GroupRenderProps,
  Label,
  TextArea as AriaTextArea,
  TextField,
  type TextFieldProps,
  type TextFieldRenderProps,
  type ValidationResult,
} from 'react-aria-components';

import { spacing } from '../../tokens/spacing.stylex';
import { focusRing } from '../../utils/focus-ring';
import { racStyles } from '../../utils/stylex-rac';
import { FieldContext, useCharacterCount } from '../TextInput/character-count';
import { fieldStyles } from '../TextInput/field-base';

interface TextAreaBaseProps extends Omit<TextFieldProps, 'className' | 'style' | 'children' | 'maxLength' | 'type'> {
  /** Help text under the box, e.g. "Shown on your public profile." Linked to the field for screen readers. */
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
  /** Text shown in the box while it's empty. A hint about what to write, never a replacement for the label. */
  placeholder?: string;
  /**
   * The box starts at Figma's 130px and grows with the text up to this many lines, then scrolls inside.
   * @default 10
   */
  maxRows?: number;
  /** Adds "(optional)" after the label. Mark the optional fields rather than the required ones. */
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
export type TextAreaProps = TextAreaBaseProps &
  (
    | { /** The field's name, shown above the box, e.g. "Bio". */ label: ReactNode; 'aria-label'?: string }
    | { label?: undefined; 'aria-label': string }
    | { label?: undefined; 'aria-labelledby': string }
  );

/**
 * A multi-line text field for longer answers, such as a bio, feedback or a message. Built on React Aria `TextField`
 * with its `TextArea`, which links the label, description and error to the field and handles validation. The box
 * grows with the text up to `maxRows` lines, then scrolls.
 */
export function TextArea({
  label,
  description,
  errorMessage,
  characterLimit,
  placeholder,
  maxRows = 10,
  isOptional = false,
  optionalText = 'optional',
  xstyle,
  value,
  defaultValue,
  onChange,
  isInvalid,
  ...props
}: TextAreaProps) {
  const { length, over, fieldProps } = useCharacterCount({ value, defaultValue, onChange, characterLimit, isInvalid });
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // Grow with the text: measure the content, then cap it at maxRows lines (the minimum comes from CSS).
  const resize = useCallback(() => {
    const el = textAreaRef.current;
    if (!el) return;
    const lineHeight = parseFloat(getComputedStyle(el).lineHeight) || 24;
    const max = lineHeight * maxRows;
    el.style.height = 'auto';
    const content = el.scrollHeight;
    el.style.height = `${Math.min(content, max)}px`;
    el.style.overflowY = content > max ? 'auto' : 'hidden';
  }, [maxRows]);

  // Re-measure when the text changes (typed, pasted or set from outside) and when the width changes the wrapping.
  useLayoutEffect(resize, [resize, value, length]);
  useLayoutEffect(() => {
    const el = textAreaRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    let width = el.clientWidth;
    const observer = new ResizeObserver(() => {
      if (el.clientWidth !== width) {
        width = el.clientWidth;
        resize();
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [resize]);

  return (
    <TextField {...props} {...fieldProps} {...racStyles<TextFieldRenderProps>(() => [fieldStyles.field, xstyle])}>
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
              styles.box,
              g.isInvalid && fieldStyles.boxInvalid,
              g.isDisabled && fieldStyles.boxDisabled,
              focusRing.base,
              // Like TextInput: the ring shows inside the box whenever the field has focus, since that's where typing goes.
              g.isFocusWithin && focusRing.visible,
              g.isFocusWithin && focusRing.inset,
              g.isFocusWithin && fieldStyles.boxRing,
            ])}
          >
            <AriaTextArea
              ref={textAreaRef}
              placeholder={placeholder}
              onInput={resize}
              {...stylex.props(fieldStyles.input, styles.textArea, isDisabled && fieldStyles.inputDisabled)}
            />
          </Group>
          <FieldContext description={description} characterLimit={characterLimit} length={length} over={over} />
          <FieldError {...stylex.props(fieldStyles.error)}>
            {(validation) => (typeof errorMessage === 'function' ? errorMessage(validation) : (errorMessage ?? validation.validationErrors.join(' ')))}
          </FieldError>
        </>
      )}
    </TextField>
  );
}

const styles = stylex.create({
  // Figma "Textarea Box": text starts at the top, 8px/16px in, like the single-line box.
  box: { alignItems: 'flex-start' },
  textArea: {
    display: 'block',
    width: '100%',
    // Figma: the box is 130px tall, so the text area is 130px less the box's 8px top and bottom (border included).
    minHeight: `calc(8.125rem - 2 * ${spacing.xs})`,
    resize: 'none',
    overflowY: 'hidden',
    overflowWrap: 'break-word',
  },
});
