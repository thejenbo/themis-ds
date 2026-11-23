import * as stylex from '@stylexjs/stylex';
import { type ReactNode, useState } from 'react';
import {
  composeRenderProps,
  ToggleButton as AriaToggleButton,
  type ToggleButtonProps as AriaToggleButtonProps,
  type ToggleButtonRenderProps,
} from 'react-aria-components';

import { spacing } from '../../tokens/spacing.stylex';
import { focusRing } from '../../utils/focus-ring';
import { interactiveCursor } from '../../utils/interactive-cursor';
import { pressMotion } from '../../utils/press-motion';
import { racStyles } from '../../utils/stylex-rac';
import { touchTarget } from '../../utils/touch-target';
import { baseStyles as styles, blockPadding, type ButtonSize, disabledSurfaces, layers, surfaces } from '../Button/button-base';

export type ToggleButtonSize = ButtonSize;

export interface ToggleButtonProps extends Omit<AriaToggleButtonProps, 'className' | 'style'> {
  /**
   * Height, matching Button and IconButton of the same size: 24/32/40px on every screen.
   * @default 'small'
   */
  size?: ToggleButtonSize;
  /** Icon shown before the label. Decorative: it is hidden from screen readers, so the label must make sense alone. */
  iconLeft?: ReactNode;
  /** Icon shown after the label. Decorative: it is hidden from screen readers, so the label must make sense alone. */
  iconRight?: ReactNode;
  /**
   * Whether pressing it while on turns it off. `false` for one of a set where one must always be chosen (pick a plan):
   * then, while on, presses do nothing, and it shows no hover or press effect and keeps the default cursor, so it
   * doesn't look like pressing it would change anything.
   * @default true
   */
  isDeselectable?: boolean;
  /** Layout-only StyleX overrides (margin, flex, grid placement). Do not restyle colors or type. */
  xstyle?: stylex.StyleXStyles;
}

/**
 * A button that stays on or off, such as a filter or a "Bold" control. Built on React Aria `ToggleButton`,
 * which sets `aria-pressed` so screen readers announce the state.
 *
 * Off looks like an outline Button, on looks like a default (filled) Button, both in the brand tone.
 * Keep the label the same in both states: screen readers already say "pressed" or "not pressed".
 */
export function ToggleButton({
  size = 'small',
  iconLeft,
  iconRight,
  isDeselectable = true,
  xstyle,
  children,
  isSelected: isSelectedProp,
  defaultSelected = false,
  onChange,
  ...props
}: ToggleButtonProps) {
  // Kept here when uncontrolled, so a press that can't turn it off can be ignored.
  const [ownSelected, setOwnSelected] = useState(defaultSelected);
  const isSelected = isSelectedProp ?? ownSelected;
  const locked = !isDeselectable && isSelected;
  return (
    <AriaToggleButton
      {...props}
      isSelected={isSelected}
      onChange={(next) => {
        if (!next && !isDeselectable) return;
        setOwnSelected(next);
        onChange?.(next);
      }}
      data-themis-touch-target=""
      {...racStyles<ToggleButtonRenderProps>((s) => [
        styles.root,
        touchTarget.area,
        focusRing.base,
        s.isFocusVisible && focusRing.visible,
        s.isDisabled ? interactiveCursor.disabled : locked ? lockedStyles.cursor : interactiveCursor.enabled,
        xstyle,
      ])}
    >
      {composeRenderProps(children, (children, s) => {
        // Figma `activated=true` is Button's default look; `activated=false` is its outline look.
        const look = s.isSelected ? 'default' : 'outline';
        // On and can't be turned off: pressing changes nothing, so no hover or press effect.
        const active = (s.isHovered || s.isPressed) && !s.isDisabled && !locked;
        return (
          <span
            data-themis-part="surface"
            {...stylex.props(
              styles.surface,
              label.surface,
              pressMotion.base,
              blockPadding[size],
              surfaces.brand[look],
              layers.brand[look],
              active && styles.stateLayerOn,
              s.isPressed && !s.isDisabled && !locked && pressMotion.pressed,
              s.isDisabled && disabledSurfaces[look],
            )}
          >
            {iconLeft != null && (
              <span aria-hidden="true" {...stylex.props(styles.slot)}>
                {iconLeft}
              </span>
            )}
            <span {...stylex.props(styles.slot)}>{children}</span>
            {iconRight != null && (
              <span aria-hidden="true" {...stylex.props(styles.slot)}>
                {iconRight}
              </span>
            )}
          </span>
        );
      })}
    </AriaToggleButton>
  );
}

const lockedStyles = stylex.create({ cursor: { cursor: 'default' } });

const label = stylex.create({
  surface: { paddingInline: spacing.sm },
});
