import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';
import {
  composeRenderProps,
  Menu,
  MenuItem,
  type MenuItemProps,
  type MenuItemRenderProps,
  type MenuProps,
  MenuTrigger,
  type MenuTriggerProps,
  Popover,
  type PopoverProps,
  type PopoverRenderProps,
} from 'react-aria-components';

import { border as borderWidth } from '../../tokens/borderWidth.stylex';
import { color } from '../../tokens/colorTheme.stylex';
import { font as fontTheme } from '../../tokens/fontTheme.stylex';
import { duration, easing } from '../../tokens/motion.stylex';
import { border as radius } from '../../tokens/radius.stylex';
import { dropShadow } from '../../tokens/shadows.stylex';
import { spacing } from '../../tokens/spacing.stylex';
import { font } from '../../tokens/typography.stylex';
import { focusRing } from '../../utils/focus-ring';
import { interactiveCursor } from '../../utils/interactive-cursor';
import { racStyles } from '../../utils/stylex-rac';

export type ActionMenuPlacement = 'bottom start' | 'bottom end' | 'top start' | 'top end';

export interface ActionMenuTriggerProps extends MenuTriggerProps {
  /** The trigger (usually an IconButton with an `aria-label`, or a Button), then the `ActionMenu`. */
  children: ReactNode;
}

/** Connects a button to the `ActionMenu` it opens. Pressing the button, or Enter/Space/Down arrow on it, opens the menu. */
export function ActionMenuTrigger(props: ActionMenuTriggerProps) {
  return <MenuTrigger {...props} />;
}

export interface ActionMenuProps<T extends object>
  extends Omit<MenuProps<T>, 'className' | 'style' | 'selectionMode' | 'selectedKeys' | 'defaultSelectedKeys' | 'onSelectionChange'> {
  /** `ActionMenuItem`s. */
  children: MenuProps<T>['children'];
  /**
   * Where the menu opens, relative to the trigger. It flips if there isn't room.
   * @default 'bottom start'
   */
  placement?: ActionMenuPlacement;
  /** Popover options other than placement, e.g. `shouldFlip`. */
  popoverProps?: Omit<PopoverProps, 'className' | 'style' | 'children' | 'placement' | 'offset'>;
}

/**
 * A list of actions that opens from a button, such as "Rename / Duplicate / Delete" for a row. Built on React Aria
 * `Menu` in a `Popover`: arrow keys move, Enter runs an action, typing jumps to an item, Escape closes it and focus
 * returns to the trigger. Use inside an `ActionMenuTrigger`.
 */
export function ActionMenu<T extends object>({ placement = 'bottom start', popoverProps, ...props }: ActionMenuProps<T>) {
  return (
    <Popover
      {...popoverProps}
      placement={placement}
      offset={8}
      containerPadding={16}
      {...racStyles<PopoverRenderProps>((s) => [
        styles.popover,
        s.isEntering && enter[s.placement ?? 'bottom'],
        s.isExiting && styles.exit,
      ])}
    >
      <Menu {...props} {...stylex.props(styles.menu)} />
    </Popover>
  );
}

export interface ActionMenuItemProps extends Omit<MenuItemProps, 'className' | 'style' | 'children'> {
  /** The action's label, e.g. "Rename". Start with a verb. */
  children: ReactNode;
  /** Decorative icon before the label (hidden from screen readers). */
  icon?: ReactNode;
  /** A destructive action, such as "Delete". Shown in the error colour. Put it last. */
  isDanger?: boolean;
}

/** One action in an `ActionMenu`. Give it an `id`, then handle it in the menu's `onAction`, or pass `onAction` here. */
export function ActionMenuItem({ children, icon, isDanger = false, textValue, ...props }: ActionMenuItemProps) {
  return (
    <MenuItem
      {...props}
      textValue={textValue ?? (typeof children === 'string' ? children : undefined)}
      {...racStyles<MenuItemRenderProps>((s) => [
        styles.item,
        isDanger ? tone.danger : tone.default,
        s.isFocused && !s.isDisabled && styles.highlighted,
        s.isDisabled && styles.disabled,
        focusRing.base,
        s.isFocusVisible && focusRing.visible,
        s.isFocusVisible && focusRing.inset,
        s.isFocusVisible && styles.ringCorners,
        s.isDisabled ? interactiveCursor.disabled : interactiveCursor.enabled,
      ])}
    >
      {composeRenderProps(children, (children) => (
        <>
          {icon != null && (
            <span aria-hidden="true" {...stylex.props(styles.icon)}>
              {icon}
            </span>
          )}
          <span {...stylex.props(styles.label)}>{children}</span>
        </>
      ))}
    </MenuItem>
  );
}

const fadeOut = stylex.keyframes({ to: { opacity: 0 } });
const fadeIn = stylex.keyframes({ from: { opacity: 0 } });
const fromAbove = stylex.keyframes({ from: { opacity: 0, transform: 'translateY(-4px)' } });
const fromBelow = stylex.keyframes({ from: { opacity: 0, transform: 'translateY(4px)' } });

const styles = stylex.create({
  // Figma "Action Menu": background, border, radius md, xs padding, default shadow.
  popover: {
    display: 'flex',
    flexDirection: 'column',
    // Figma is 299px; menus fit their labels between these limits.
    minWidth: 'max(var(--trigger-width), 10rem)',
    maxWidth: `min(20rem, calc(100vw - 2 * ${spacing.sm}))`,
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
  menu: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing['2xs'],
    minHeight: 0,
    overflowY: 'auto',
    outline: 'none',
  },
  // Figma "Action Menu Item": 32px tall (4px + 24px line + 4px), 8px sides, radius md.
  item: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: spacing.xs,
    paddingBlock: spacing['2xs'],
    paddingInline: spacing.xs,
    borderRadius: radius.radiusMd,
    fontFamily: fontTheme.familyBody,
    fontSize: font.sizeLabel,
    lineHeight: font.lineHeightLabel,
    fontWeight: font.weightSemibold,
    whiteSpace: 'nowrap',
    outline: 'none',
    userSelect: 'none',
    // The highlight tint (see `tone`), fading in and out. Behind the label (the item is its own stacking context).
    '::after': {
      content: "''",
      position: 'absolute',
      inset: 0,
      zIndex: -1,
      borderRadius: 'inherit',
      opacity: 0,
      pointerEvents: 'none',
      transitionProperty: 'opacity',
      transitionDuration: { default: duration.fast, '@media (prefers-reduced-motion: reduce)': '0s' },
      transitionTimingFunction: easing.standard,
    },
  },
  highlighted: { '::after': { opacity: 1 } },
  disabled: { color: color.textDisabledOnBackground },
  // The ring is drawn inside the item, so it doesn't run into its neighbours.
  ringCorners: { '::before': { borderRadius: `max(0px, calc(${radius.radiusMd} - ${spacing['3xs']}))` } },
  icon: { display: 'inline-flex', flexShrink: 0, alignItems: 'center', justifyContent: 'center', width: '1rem', height: '1rem' },
  label: { overflow: 'hidden', textOverflow: 'ellipsis' },
});

/** Label colour, and the highlight tint (hovered or keyboard-highlighted): the tone's see-through tint over the menu. */
const tone = stylex.create({
  default: {
    color: color.text,
    '::after': { backgroundColor: color.brandTint },
  },
  danger: {
    color: color.stateError,
    '::after': { backgroundColor: color.stateErrorTint },
  },
});

/** Opens with a 4px slide away from the trigger; fade only with reduced motion. */
const enter = stylex.create({
  bottom: { animationName: { default: fromAbove, '@media (prefers-reduced-motion: reduce)': fadeIn } },
  top: { animationName: { default: fromBelow, '@media (prefers-reduced-motion: reduce)': fadeIn } },
  left: { animationName: fadeIn },
  right: { animationName: fadeIn },
  center: { animationName: fadeIn },
});
