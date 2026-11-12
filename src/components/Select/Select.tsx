import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';
import {
  Button,
  type ButtonRenderProps,
  composeRenderProps,
  FieldError,
  type Key,
  Label,
  ListBox,
  ListBoxItem,
  type ListBoxItemProps,
  type ListBoxItemRenderProps,
  Popover,
  type PopoverRenderProps,
  Select as AriaSelect,
  type SelectProps as AriaSelectProps,
  type SelectRenderProps,
  SelectValue,
  type SelectValueRenderProps,
  Text,
  type ValidationResult,
} from 'react-aria-components';

import { border as borderWidth } from '../../tokens/borderWidth.stylex';
import { color } from '../../tokens/colorTheme.stylex';
import { duration, easing } from '../../tokens/motion.stylex';
import { border as radius } from '../../tokens/radius.stylex';
import { font as fontTheme } from '../../tokens/fontTheme.stylex';
import { dropShadow } from '../../tokens/shadows.stylex';
import { spacing } from '../../tokens/spacing.stylex';
import { color as system } from '../../tokens/system.stylex';
import { font } from '../../tokens/typography.stylex';
import { focusRing } from '../../utils/focus-ring';
import { interactiveCursor } from '../../utils/interactive-cursor';
import { racStyles } from '../../utils/stylex-rac';
import { fieldStyles } from '../TextInput/field-base';

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
 */
export function Select<T extends object>({
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
  return (
    <AriaSelect<T, 'single'> {...props} placeholder={placeholder} {...racStyles<SelectRenderProps>(() => [fieldStyles.field, xstyle])}>
      {({ isDisabled, isInvalid }) => (
        <>
          {label != null && (
            <Label {...stylex.props(fieldStyles.label, isDisabled && fieldStyles.labelDisabled)}>
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
              b.isFocusVisible && focusRing.aroundBorderMandatory,
              b.isDisabled ? interactiveCursor.disabled : interactiveCursor.enabled,
            ])}
          >
            <SelectValue<T> {...racStyles<SelectValueRenderProps<T>>((v) => [fieldStyles.input, styles.value, v.isPlaceholder && styles.placeholder])} />
            {/* Figma "Icon Right": the caret, the same whether the list is open or not. */}
            <span aria-hidden="true" {...stylex.props(fieldStyles.icon, isDisabled && styles.caretDisabled)}>
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
          <Popover
            offset={4}
            containerPadding={16}
            {...racStyles<PopoverRenderProps>((p) => [styles.popover, p.isEntering && enter[p.placement ?? 'bottom'], p.isExiting && styles.exit])}
          >
            <ListBox<T> {...stylex.props(styles.listbox)}>{children}</ListBox>
          </Popover>
        </>
      )}
    </AriaSelect>
  );
}

export interface SelectItemProps extends Omit<ListBoxItemProps, 'className' | 'style' | 'children'> {
  /** Unique within the select; this is what `value` and `onChange` use. */
  id: Key;
  /** The option's label. */
  children: ReactNode;
}

/** One option in a `Select`. The chosen one shows a ✓. */
export function SelectItem({ children, textValue, ...props }: SelectItemProps) {
  return (
    <ListBoxItem
      {...props}
      textValue={textValue ?? (typeof children === 'string' ? children : undefined)}
      {...racStyles<ListBoxItemRenderProps>((s) => [
        styles.option,
        // Tint the option under the pointer, or the keyboard-focused one while using the keyboard. (Opening with the
        // mouse focuses the chosen option without a visible ring, so it isn't tinted next to the hovered one.)
        (s.isHovered || s.isFocusVisible) && !s.isDisabled && styles.highlighted,
        s.isDisabled && styles.optionDisabled,
        focusRing.base,
        s.isFocusVisible && focusRing.visible,
        s.isFocusVisible && focusRing.inset,
        s.isFocusVisible && styles.ringCorners,
        s.isDisabled ? interactiveCursor.disabled : interactiveCursor.enabled,
      ])}
    >
      {composeRenderProps(children, (children, s) => (
        <>
          <span {...stylex.props(styles.optionLabel)}>{children}</span>
          {s.isSelected && (
            <span aria-hidden="true" {...stylex.props(styles.check)}>
              <CheckIcon />
            </span>
          )}
        </>
      ))}
    </ListBoxItem>
  );
}

/** Placeholder icons until the icon library exists. */
function CaretIcon() {
  return (
    <svg width="12" height="8" viewBox="0 0 12 8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1.5 1.75L6 6.25l4.5-4.5" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 7.5l3.2 3L12 3.5" />
    </svg>
  );
}

const fadeOut = stylex.keyframes({ to: { opacity: 0 } });
const fadeIn = stylex.keyframes({ from: { opacity: 0 } });
const fromAbove = stylex.keyframes({ from: { opacity: 0, transform: 'translateY(-4px)' } });
const fromBelow = stylex.keyframes({ from: { opacity: 0, transform: 'translateY(4px)' } });

const styles = stylex.create({
  // The box is a button: full width, value on the left, caret on the right.
  trigger: { width: '100%', margin: 0, textAlign: 'start', font: 'inherit' },
  value: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  placeholder: { color: system.placeholderDefault },
  // Figma: the caret goes background-disabled-default when the select is disabled.
  caretDisabled: { color: system.backgroundDisabledDefault },
  // Figma "Dropdown": as wide as the box, 4px below it, 8px padding inside a 2px border (the same as ActionMenu).
  popover: {
    display: 'flex',
    flexDirection: 'column',
    width: 'var(--trigger-width)',
    padding: `calc(${spacing.xs} - ${borderWidth.widthMandatory})`,
    borderStyle: 'solid',
    borderWidth: borderWidth.widthMandatory,
    borderColor: color.border,
    borderRadius: radius.radiusMd,
    backgroundColor: color.background,
    boxShadow: `${dropShadow.xDefault} ${dropShadow.yDefault} ${dropShadow.blurDefault} ${dropShadow.colorDefault}`,
    outline: 'none',
    animationDuration: duration.base,
    animationTimingFunction: easing.standard,
  },
  exit: { animationName: fadeOut, animationFillMode: 'forwards' },
  // Long lists scroll inside the dropdown (about 6 options before scrolling, depending on the space).
  listbox: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing['2xs'],
    maxHeight: '15rem',
    minHeight: 0,
    overflowY: 'auto',
    outline: 'none',
  },
  // Figma "Dropdown Option": 32px (4px + 24px input line + 4px), 8px sides, radius md, input text style.
  option: {
    position: 'relative',
    // Keep the 32px height; a long list scrolls instead of squashing its options.
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingBlock: spacing['2xs'],
    paddingInline: spacing.xs,
    borderRadius: radius.radiusMd,
    color: color.text,
    // Figma type/input/base, the same as the chosen value in the box.
    fontFamily: fontTheme.familyBody,
    fontSize: font.sizeInput,
    lineHeight: font.lineHeightInput,
    fontWeight: font.weightRegular,
    outline: 'none',
    userSelect: 'none',
    // Highlight tint, as in ActionMenu: brand with transform-90 on top, fading as one layer.
    '::after': {
      content: "''",
      position: 'absolute',
      inset: 0,
      zIndex: -1,
      borderRadius: 'inherit',
      backgroundColor: color.brand,
      backgroundImage: `linear-gradient(${color.transform90}, ${color.transform90})`,
      opacity: 0,
      pointerEvents: 'none',
      transitionProperty: 'opacity',
      transitionDuration: { default: duration.fast, '@media (prefers-reduced-motion: reduce)': '0s' },
      transitionTimingFunction: easing.standard,
    },
  },
  highlighted: { '::after': { opacity: 1 } },
  optionDisabled: { color: system.textDisabledOnBackground },
  optionLabel: {
    flexGrow: 1,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  check: { display: 'inline-flex', flexShrink: 0 },
  ringCorners: { '::before': { borderRadius: `max(0px, calc(${radius.radiusMd} - ${spacing['3xs']}))` } },
});

/** Opens with a 4px slide away from the box; fade only with reduced motion. */
const enter = stylex.create({
  bottom: { animationName: { default: fromAbove, '@media (prefers-reduced-motion: reduce)': fadeIn } },
  top: { animationName: { default: fromBelow, '@media (prefers-reduced-motion: reduce)': fadeIn } },
  left: { animationName: fadeIn },
  right: { animationName: fadeIn },
  center: { animationName: fadeIn },
});
