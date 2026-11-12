import * as stylex from '@stylexjs/stylex';
import { type ReactNode, useState } from 'react';
import { Text } from 'react-aria-components';

import { fieldStyles as styles } from './field-base';

interface CharacterCountOptions {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  characterLimit?: number;
  isInvalid?: boolean;
}

/**
 * Tracks the length for the character count, whether the field is controlled or not, and marks the field invalid
 * once it's over the limit. Spread `fieldProps` onto the React Aria `TextField`. Shared by TextInput and TextArea.
 */
export function useCharacterCount({ value, defaultValue, onChange, characterLimit, isInvalid }: CharacterCountOptions) {
  const [uncontrolledLength, setUncontrolledLength] = useState((defaultValue ?? '').length);
  const length = value !== undefined ? value.length : uncontrolledLength;
  const over = characterLimit !== undefined ? length - characterLimit : 0;
  return {
    length,
    over,
    fieldProps: {
      value,
      defaultValue,
      isInvalid: isInvalid || over > 0 || undefined,
      onChange: (next: string) => {
        if (value === undefined) setUncontrolledLength(next.length);
        onChange?.(next);
      },
    },
  };
}

interface FieldContextProps {
  description?: ReactNode;
  characterLimit?: number;
  length: number;
  over: number;
}

/**
 * Figma "Context": the help text on the left and the count ("12/150") on the right, linked to the field as one
 * description ("… 12 of 150 characters"), plus a live message the moment the limit is passed.
 */
export function FieldContext({ description, characterLimit, length, over }: FieldContextProps) {
  return (
    <>
      {(description != null || characterLimit !== undefined) && (
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
    </>
  );
}
