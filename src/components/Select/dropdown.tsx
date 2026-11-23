import * as stylex from '@stylexjs/stylex';
import type { ReactNode, RefObject } from 'react';
import {
  composeRenderProps,
  type Key,
  ListBox,
  ListBoxItem,
  type ListBoxItemProps,
  type ListBoxItemRenderProps,
  Popover,
  type PopoverRenderProps,
  Separator,
} from 'react-aria-components';

import { border as borderWidth } from '../../tokens/borderWidth.stylex';
import { color } from '../../tokens/colorTheme.stylex';
import { font as fontTheme } from '../../tokens/fontTheme.stylex';
import { duration, easing } from '../../tokens/motion.stylex';
import { border as radius } from '../../tokens/radius.stylex';
import { dropShadow } from '../../tokens/shadows.stylex';
import { spacing } from '../../tokens/spacing.stylex';
import { color as system } from '../../tokens/system.stylex';
import { font } from '../../tokens/typography.stylex';
import { focusRing } from '../../utils/focus-ring';
import { interactiveCursor } from '../../utils/interactive-cursor';
import { racStyles } from '../../utils/stylex-rac';
import { Icon } from '../Icon';

/**
 * Figma "Dropdown" and "Dropdown Option", shared by Select and ComboBox so the two lists can't drift apart.
 */

interface DropdownProps<T extends object> {
  children: ReactNode | ((item: T) => ReactNode);
  /** The element the list lines up with and matches the width of (the whole box). Defaults to React Aria's trigger. */
  triggerRef?: RefObject<Element | null>;
  /** Shown instead of the options when there are none (ComboBox: nothing matches what was typed). */
  emptyText?: ReactNode;
}

/** The list: as wide as the box, 4px below it (or above, if there isn't room). */
export function Dropdown<T extends object>({ children, triggerRef, emptyText }: DropdownProps<T>) {
  return (
    <Popover
      triggerRef={triggerRef}
      offset={4}
      containerPadding={16}
      {...racStyles<PopoverRenderProps>((p) => [styles.popover, p.isEntering && enter[p.placement ?? 'bottom'], p.isExiting && styles.exit])}
    >
      <ListBox<T>
        {...stylex.props(styles.listbox)}
        renderEmptyState={emptyText != null ? () => <div {...stylex.props(styles.option, styles.empty)}>{emptyText}</div> : undefined}
      >
        {children}
      </ListBox>
    </Popover>
  );
}

export interface DropdownItemProps extends Omit<ListBoxItemProps, 'className' | 'style' | 'children'> {
  /** Unique within the list; this is what `value` and `onChange` use. */
  id: Key;
  /** The option's label. */
  children: ReactNode;
  /**
   * Decorative icon before the label (hidden from screen readers), e.g. `<Icon name="plus" />` on an
   * "Add new…" option.
   */
  icon?: ReactNode;
}

/** One option. The chosen one shows a ✓. */
export function DropdownItem({ children, icon, textValue, ...props }: DropdownItemProps) {
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
          {/* Figma "Content": the icon sits 8px from the label (as in ActionMenu); the ✓ stays 16px away. */}
          <span {...stylex.props(styles.content)}>
            {icon != null && (
              <span aria-hidden="true" {...stylex.props(styles.icon)}>
                {icon}
              </span>
            )}
            <span {...stylex.props(styles.optionLabel)}>{children}</span>
          </span>
          {s.isSelected && (
            <span aria-hidden="true" {...stylex.props(styles.check)}>
              <Icon name="check" />
            </span>
          )}
        </>
      ))}
    </ListBoxItem>
  );
}

/** Figma "Dropdown Divider": a 1px line in the border color between groups of options. */
export function DropdownSeparator() {
  return <Separator {...stylex.props(styles.separator)} />;
}

/** The trigger's chevron (Figma "caret-down"). */
export function CaretIcon() {
  return <Icon name="caret-down" />;
}

const fadeOut = stylex.keyframes({ to: { opacity: 0 } });
const fadeIn = stylex.keyframes({ from: { opacity: 0 } });
const fromAbove = stylex.keyframes({ from: { opacity: 0, transform: 'translateY(-4px)' } });
const fromBelow = stylex.keyframes({ from: { opacity: 0, transform: 'translateY(4px)' } });

/** Styles for the box side of Select and ComboBox. */
export const triggerStyles = stylex.create({
  placeholder: { color: color.textPlaceholderDefault },
  // Figma: the caret goes background-disabled-default when disabled.
  caretDisabled: { color: system.backgroundDisabledDefault },
});

const styles = stylex.create({
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
    // Highlight tint, as in ActionMenu: the see-through brand tint over the list.
    '::after': {
      content: "''",
      position: 'absolute',
      inset: 0,
      zIndex: -1,
      borderRadius: 'inherit',
      backgroundColor: color.brandTint,
      opacity: 0,
      pointerEvents: 'none',
      transitionProperty: 'opacity',
      transitionDuration: { default: duration.fast, '@media (prefers-reduced-motion: reduce)': '0s' },
      transitionTimingFunction: easing.standard,
    },
  },
  highlighted: { '::after': { opacity: 1 } },
  optionDisabled: { color: color.textDisabledOnBackground },
  // Figma "no results": option text style, disabled-on-background color, nothing to choose.
  empty: { color: color.textDisabledOnBackground, cursor: 'default' },
  optionLabel: {
    flexGrow: 1,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  check: { display: 'inline-flex', flexShrink: 0 },
  content: { display: 'flex', alignItems: 'center', gap: spacing.xs, flexGrow: 1, minWidth: 0 },
  // At least 16px (an Icon); wider content, such as the config tool's color dots, keeps its own width.
  icon: { display: 'inline-flex', flexShrink: 0, alignItems: 'center', justifyContent: 'center', minWidth: '1rem', height: '1rem' },
  // 1px whatever the border-width theme, so it still shows with borders set to none. Hidden when filtering leaves
  // it at the start or end of the list.
  separator: {
    display: { default: 'block', ':first-child': 'none', ':last-child': 'none' },
    flexShrink: 0,
    height: '1px',
    marginBlock: spacing['3xs'],
    border: 'none',
    backgroundColor: color.border,
  },
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
