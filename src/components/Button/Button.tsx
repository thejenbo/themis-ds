import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';
import {
  Button as AriaButton,
  type ButtonProps as AriaButtonProps,
  type ButtonRenderProps,
  composeRenderProps,
  ProgressBar,
} from 'react-aria-components';

import { spacing } from '../../tokens/spacing.stylex';
import { focusRing } from '../../utils/focus-ring';
import { interactiveCursor } from '../../utils/interactive-cursor';
import { pressMotion } from '../../utils/press-motion';
import { touchTarget } from '../../utils/touch-target';
import { racStyles } from '../../utils/stylex-rac';
import {
  baseStyles as styles,
  blockPadding,
  type ButtonSize,
  type ButtonTone,
  type ButtonVariant,
  disabledSurfaces,
  icons,
  layers,
  surfaces,
} from './button-base';

export type { ButtonSize, ButtonTone, ButtonVariant };

export interface ButtonProps extends Omit<AriaButtonProps, 'className' | 'style'> {
  /**
   * Visual emphasis.
   * `default`: filled, for the main action in a region.
   * `outline`: bordered, for secondary actions next to a `default` button.
   * `subtle`: no fill or border until hovered, for low-priority or repeated actions.
   * @default 'default'
   */
  variant?: ButtonVariant;
  /**
   * Vertical padding. All sizes share the same label size, so height follows the typography
   * tokens: 24/32/40px on mobile and 28/36/44px on desktop.
   * @default 'small'
   */
  size?: ButtonSize;
  /**
   * Colour family.
   * `brand`: the theme's brand colour, for most actions.
   * `neutral`: black and white (inverted in dark themes), for actions that shouldn't draw on the brand colour.
   * `danger`: the error colour, for destructive actions such as deleting.
   * @default 'brand'
   */
  tone?: ButtonTone;
  /** Icon shown before the label. Decorative: it is hidden from screen readers, so the label must make sense alone. */
  iconLeft?: ReactNode;
  /** Icon shown after the label. Decorative: it is hidden from screen readers, so the label must make sense alone. */
  iconRight?: ReactNode;
  /**
   * Text announced to screen readers while `isPending` is true.
   * @default 'Loading'
   */
  pendingLabel?: string;
  /** Layout-only StyleX overrides (margin, flex, grid placement). Do not restyle colours or type. */
  xstyle?: stylex.StyleXStyles;
}

/**
 * Triggers an action or event, such as submitting a form, opening a dialog or saving a change.
 * Built on React Aria `Button`. For navigation, use `Link` instead.
 *
 * Structure: the `<button>` element is the clickable area, focus ring and touch target, and never
 * changes size. Inside it, the Surface span is the visible button: it carries the fill, the State Layer
 * (hover and press overlay) and the pressed shrink.
 */
export function Button({
  variant = 'default',
  size = 'small',
  tone = 'brand',
  iconLeft,
  iconRight,
  pendingLabel = 'Loading',
  xstyle,
  children,
  ...props
}: ButtonProps) {
  return (
    <AriaButton
      {...props}
      data-themis-touch-target=""
      {...racStyles<ButtonRenderProps>((s) => [
        styles.root,
        touchTarget.area,
        focusRing.base,
        s.isFocusVisible && focusRing.visible,
        s.isDisabled ? interactiveCursor.disabled : s.isPending ? interactiveCursor.pending : interactiveCursor.enabled,
        xstyle,
      ])}
    >
      {composeRenderProps(children, (children, s) => {
        const active = (s.isHovered || s.isPressed) && !s.isDisabled;
        // Icon colour differs from the label in some tones; disabled always uses the disabled text colour.
        const iconStyle = !s.isDisabled && icons[tone][variant];
        return (
          <span
            data-themis-part="surface"
            {...stylex.props(
              styles.surface,
              label.surface,
              pressMotion.base,
              blockPadding[size],
              surfaces[tone][variant],
              layers[tone][variant],
              active && styles.stateLayerOn,
              s.isPressed && !s.isDisabled && pressMotion.pressed,
              s.isDisabled && disabledSurfaces[variant],
            )}
          >
            {iconLeft != null && (
              <span aria-hidden="true" {...stylex.props(styles.slot, iconStyle, s.isPending && styles.hidden)}>
                {iconLeft}
              </span>
            )}
            <span {...stylex.props(styles.slot, s.isPending && styles.hidden)}>{children}</span>
            {iconRight != null && (
              <span aria-hidden="true" {...stylex.props(styles.slot, iconStyle, s.isPending && styles.hidden)}>
                {iconRight}
              </span>
            )}
            {s.isPending && (
              <ProgressBar aria-label={pendingLabel} isIndeterminate {...stylex.props(styles.spinnerWrap)}>
                <span {...stylex.props(styles.spinner)} />
              </ProgressBar>
            )}
          </span>
        );
      })}
    </AriaButton>
  );
}

const label = stylex.create({
  surface: { paddingInline: spacing.sm },
});
