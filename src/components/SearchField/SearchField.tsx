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
  SearchField as AriaSearchField,
  type SearchFieldProps as AriaSearchFieldProps,
  type SearchFieldRenderProps,
  Text,
  type ValidationResult,
} from 'react-aria-components';

import { color } from '../../tokens/colorTheme.stylex';
import { border as radius } from '../../tokens/radius.stylex';
import { spacing } from '../../tokens/spacing.stylex';
import { color as system } from '../../tokens/system.stylex';
import { duration, easing } from '../../tokens/motion.stylex';
import { focusRing } from '../../utils/focus-ring';
import { interactiveCursor } from '../../utils/interactive-cursor';
import { pressMotion } from '../../utils/press-motion';
import { racStyles } from '../../utils/stylex-rac';
import { touchTarget } from '../../utils/touch-target';
import { Icon } from '../Icon';
import { fieldStyles } from '../TextInput/field-base';

interface SearchFieldBaseProps extends Omit<AriaSearchFieldProps, 'className' | 'style' | 'children'> {
  /** Help text under the box, e.g. "Search by name or category." Linked to the input for screen readers. */
  description?: ReactNode;
  /**
   * Shown under the box when the field is invalid (`isInvalid`, or a failed `validate`/`isRequired` check).
   * A function receives React Aria's validation result.
   */
  errorMessage?: ReactNode | ((validation: ValidationResult) => ReactNode);
  /** Text shown in the box while it's empty, e.g. "Button, inputs…". A hint, never a replacement for the label. */
  placeholder?: string;
  /** Hide the search icon at the start of the box, e.g. when the label or the layout already says it's a search. */
  hideIcon?: boolean;
  /** Layout-only StyleX overrides (margin, flex, grid placement). Do not restyle colors or size. */
  xstyle?: stylex.StyleXStyles;
}

/** A visible `label` is expected; `aria-label` (or `aria-labelledby`) only when the layout really can't show one. */
export type SearchFieldProps = SearchFieldBaseProps &
  (
    | { /** The field's name, shown above the box, e.g. "Find a component". */ label: ReactNode; 'aria-label'?: string }
    | { label?: undefined; 'aria-label': string }
    | { label?: undefined; 'aria-labelledby': string }
  );

/**
 * A text field for search terms: a search icon at the start, and a round clear button at the end once something's
 * typed. Escape clears it too, and Enter calls `onSubmit`. Built on React Aria `SearchField`, with the TextInput box.
 */
export function SearchField({ label, description, errorMessage, placeholder, hideIcon = false, xstyle, ...props }: SearchFieldProps) {
  return (
    <AriaSearchField {...props} {...racStyles<SearchFieldRenderProps>(() => [fieldStyles.field, xstyle])}>
      {({ isEmpty, isDisabled }) => (
        <>
          {label != null && <Label {...stylex.props(fieldStyles.label)}>{label}</Label>}
          <Group
            {...racStyles<GroupRenderProps>((g) => [
              fieldStyles.box,
              g.isInvalid && fieldStyles.boxInvalid,
              g.isDisabled && fieldStyles.boxDisabled,
              focusRing.base,
              // As TextInput: the ring shows whenever the field has focus, inside the box.
              g.isFocusWithin && focusRing.visible,
              g.isFocusWithin && focusRing.inset,
              g.isFocusWithin && fieldStyles.boxRing,
            ])}
          >
            {!hideIcon && (
              <span aria-hidden="true" {...stylex.props(fieldStyles.icon, styles.searchIcon)}>
                <Icon name="search" size="medium" />
              </span>
            )}
            <Input placeholder={placeholder} {...stylex.props(fieldStyles.input, styles.input, isDisabled && fieldStyles.inputDisabled)} />
            {/* React Aria labels it ("Clear search") and keeps it out of the tab order: Escape clears from the keyboard. */}
            <Button
              {...racStyles<ButtonRenderProps>((b) => [
                styles.clear,
                isEmpty && styles.clearHidden,
                touchTarget.area,
                b.isDisabled ? interactiveCursor.disabled : interactiveCursor.enabled,
              ])}
            >
              {({ isHovered, isPressed, isDisabled: clearDisabled }) => (
                <span
                  aria-hidden="true"
                  {...stylex.props(
                    styles.clearSurface,
                    isHovered && !clearDisabled && styles.clearSurfaceHovered,
                    clearDisabled && styles.clearSurfaceDisabled,
                    pressMotion.base,
                    isPressed && !clearDisabled && pressMotion.pressed,
                  )}
                >
                  <Icon name="x" size="xsmall" />
                </span>
              )}
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
        </>
      )}
    </AriaSearchField>
  );
}

const styles = stylex.create({
  // The search icon starts the box, 8px before the text.
  searchIcon: { marginInlineStart: 0, marginInlineEnd: spacing.xs },
  // The browser's own clear button would sit next to Themis's.
  input: {
    '::-webkit-search-cancel-button': { appearance: 'none' },
    '::-webkit-search-decoration': { appearance: 'none' },
  },
  // The clickable area: 20px, the size of the box's icons, 8px after the text (44px on touch screens).
  clear: {
    position: 'relative',
    display: 'inline-flex',
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    width: '1.25rem',
    height: '1.25rem',
    marginInlineStart: spacing.xs,
    padding: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
    outline: 'none',
  },
  // Gone until there's something to clear, without moving the text.
  clearHidden: { visibility: 'hidden' },
  // A filled circle in background-inverse with the X in text-inverse, like a filled IconButton.
  clearSurface: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    borderRadius: radius.radiusFull,
    backgroundColor: color.backgroundInverse,
    color: color.textInverse,
    transitionProperty: 'background-color, transform',
    transitionDuration: { default: duration.fast, '@media (prefers-reduced-motion: reduce)': '0s' },
    transitionTimingFunction: easing.standard,
  },
  clearSurfaceHovered: { backgroundColor: color.backgroundInverseHover },
  clearSurfaceDisabled: { backgroundColor: system.backgroundDisabledDefault, color: system.textDisabledInverse },
});
