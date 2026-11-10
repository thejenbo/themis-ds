import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';
import {
  Button as AriaButton,
  type ButtonProps as AriaButtonProps,
  type ButtonRenderProps,
  composeRenderProps,
  ProgressBar,
} from 'react-aria-components';

import { color } from '../../tokens/colorTheme.stylex';
import { border as radius } from '../../tokens/radius.stylex';
import { spacing } from '../../tokens/spacing.stylex';
import { color as system } from '../../tokens/system.stylex';
import { font } from '../../tokens/typography.stylex';
import { focusRing } from '../../utils/focus-ring';
import { interactiveCursor } from '../../utils/interactive-cursor';
import { pressMotion } from '../../utils/press-motion';
import { racStyles } from '../../utils/stylex-rac';
import { touchTarget } from '../../utils/touch-target';
import {
  baseStyles as styles,
  type ButtonSize,
  type ButtonTone,
  type ButtonVariant,
  disabledSurfaces,
  layers,
  surfaces,
} from '../Button/button-base';

export type IconButtonVariant = ButtonVariant;
export type IconButtonSize = ButtonSize;
export type IconButtonTone = ButtonTone | 'neutral-inverse';

interface IconButtonBaseProps extends Omit<AriaButtonProps, 'className' | 'style' | 'children' | 'aria-label'> {
  /**
   * Accessible name, announced by screen readers. Required: the button has no visible text, so this is the
   * only way assistive technology knows what it does. Describe the action, e.g. "Delete project".
   */
  'aria-label': string;
  /** The icon. Decorative (hidden from screen readers): `aria-label` names the button. */
  children: ReactNode;
  /**
   * Square size, matching the height of a Button of the same size so they line up in a row.
   * @default 'small'
   */
  size?: IconButtonSize;
  /**
   * Text announced to screen readers while `isPending` is true.
   * @default 'Loading'
   */
  pendingLabel?: string;
  /** Layout-only StyleX overrides (margin, flex, grid placement). Do not restyle colours or size. */
  xstyle?: stylex.StyleXStyles;
}

interface IconButtonStandardTone {
  /**
   * Visual emphasis.
   * `default`: filled, for the main action in a region.
   * `outline`: bordered, for secondary actions.
   * `subtle`: no fill or border until hovered, for toolbars and repeated row actions.
   * @default 'default'
   */
  variant?: IconButtonVariant;
  /**
   * Colour family. Same as Button: `brand` for most actions, `neutral` where the brand colour would compete,
   * `danger` only for destructive actions. `neutral-inverse` (subtle only) is for icon buttons on brand or dark
   * fills, such as the close button in a Modal header.
   * @default 'brand'
   */
  tone?: ButtonTone;
}

interface IconButtonInverseTone {
  /** `neutral-inverse` only comes in the subtle variant. */
  variant: 'subtle';
  /** Light icon with a see-through hover, for icon buttons on brand or dark fills (e.g. a Modal header). */
  tone: 'neutral-inverse';
}

export type IconButtonProps = IconButtonBaseProps & (IconButtonStandardTone | IconButtonInverseTone);

/**
 * A button that shows only an icon, for compact actions such as toolbars and table rows.
 * Shares Button's tones, State Layer, focus ring, touch target and press motion.
 *
 * Always pass `aria-label`. Prefer a labelled Button when there is room: icons alone are often ambiguous.
 */
export function IconButton({
  variant = 'default',
  size = 'small',
  tone = 'brand',
  pendingLabel = 'Loading',
  xstyle,
  children,
  ...props
}: IconButtonProps) {
  const isMicro = size === 'micro';
  return (
    <AriaButton
      {...props}
      data-themis-touch-target=""
      {...racStyles<ButtonRenderProps>((s) => [
        styles.root,
        isMicro && square.radiusSm,
        touchTarget.area,
        focusRing.base,
        s.isFocusVisible && focusRing.visible,
        s.isFocusVisible && isMicro && focusRing.radiusSm,
        s.isDisabled ? interactiveCursor.disabled : s.isPending ? interactiveCursor.pending : interactiveCursor.enabled,
        xstyle,
      ])}
    >
      {composeRenderProps(children, (children, s) => {
        const active = (s.isHovered || s.isPressed) && !s.isDisabled;
        // neutral-inverse sits on coloured fills, so its hover is a see-through tint, not Button's opaque one.
        // Neutral subtle uses Figma's see-through tint too (Icon Button - Neutral).
        const look =
          tone === 'neutral-inverse'
            ? [see.inverse, see.inverseLayer, s.isDisabled && see.inverseDisabled]
            : [
                surfaces[tone][variant],
                layers[tone][variant],
                tone === 'neutral' && variant === 'subtle' && see.neutralLayer,
                s.isDisabled && (tone === 'neutral' && variant === 'subtle' ? see.neutralDisabled : disabledSurfaces[variant]),
              ];
        return (
          <span
            data-themis-part="surface"
            {...stylex.props(
              styles.surface,
              pressMotion.base,
              square[size],
              isMicro && square.radiusSm,
              ...look,
              active && styles.stateLayerOn,
              s.isPressed && !s.isDisabled && pressMotion.pressed,
            )}
          >
            <span aria-hidden="true" {...stylex.props(styles.slot, square.icon, s.isPending && styles.hidden)}>
              {children}
            </span>
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

/** See-through looks for icon buttons that sit on other surfaces (Figma: Icon Button - Neutral / Neutral Inverse). */
const see = stylex.create({
  inverse: { backgroundColor: 'transparent', color: color.background },
  inverseLayer: { '::before': { backgroundColor: color.transform20, backgroundImage: 'none' } },
  inverseDisabled: { color: system.textDisabledInverse },
  neutralLayer: { '::before': { backgroundColor: color.transform5Inverse, backgroundImage: 'none' } },
  neutralDisabled: { backgroundColor: 'transparent', color: system.textDisabledDefault },
});

/*
 * Square sizing: the icon sits in a box as tall as Button's label line, padded equally on all sides with
 * Button's block padding. So an IconButton is always exactly as tall as a Button of the same size
 * (24/32/40px with the current tokens), and stays aligned if the typography tokens change.
 */
const square = stylex.create({
  micro: { padding: 0 },
  small: { padding: spacing['2xs'] },
  medium: { padding: spacing.xs },
  icon: {
    width: font.lineHeightSm,
    height: font.lineHeightSm,
    justifyContent: 'center',
  },
  // Figma: micro uses the small radius; small and medium use the medium radius like Button.
  radiusSm: { borderRadius: radius.radiusSm },
});
