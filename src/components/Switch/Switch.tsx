import * as stylex from '@stylexjs/stylex';
import { type ReactNode, useId } from 'react';
import {
  composeRenderProps,
  Switch as AriaSwitch,
  type SwitchProps as AriaSwitchProps,
  type SwitchRenderProps,
} from 'react-aria-components';

import { border as borderWidth } from '../../tokens/borderWidth.stylex';
import { color } from '../../tokens/colorTheme.stylex';
import { font as fontTheme } from '../../tokens/fontTheme.stylex';
import { duration, easing } from '../../tokens/motion.stylex';
import { border as radius } from '../../tokens/radius.stylex';
import { spacing } from '../../tokens/spacing.stylex';
import { color as system } from '../../tokens/system.stylex';
import { font } from '../../tokens/typography.stylex';
import { focusRing } from '../../utils/focus-ring';
import { interactiveCursor } from '../../utils/interactive-cursor';
import { pressMotion } from '../../utils/press-motion';
import { racStyles } from '../../utils/stylex-rac';
import { touchTarget } from '../../utils/touch-target';
import { baseStyles, layers } from '../Button/button-base';
import { Icon, type IconSize } from '../Icon';

export type SwitchSize = 'micro' | 'small' | 'medium';
export type SwitchLabelPosition = 'right' | 'left';

export interface SwitchProps extends Omit<AriaSwitchProps, 'className' | 'style' | 'children'> {
  /**
   * The visible label. Clicking it toggles the switch too. Name the setting, not the action:
   * "Email notifications", not "Turn on email notifications". Without a label, pass `aria-label`.
   */
  children?: ReactNode;
  /** Optional helper text under the label. Announced by screen readers as the switch's description. */
  description?: ReactNode;
  /**
   * Which side of the switch the label sits on. `left` suits settings lists, where switches line up on the right.
   * @default 'right'
   */
  labelPosition?: SwitchLabelPosition;
  /**
   * Track height, matching Button of the same size so they line up: 24/32/40px on every screen.
   * @default 'small'
   */
  size?: SwitchSize;
  /** Layout-only StyleX overrides (margin, flex, grid placement). Do not restyle colors or size. */
  xstyle?: stylex.StyleXStyles;
}

/**
 * Turns a setting on or off straight away, such as "Email notifications". Built on React Aria `Switch`,
 * which renders a native checkbox with `role="switch"`, so screen readers announce "on" or "off".
 *
 * Structure: the `<label>` holds the track and the text, so the whole row is clickable. The track's outer
 * span carries the focus ring and touch area; the inner span is the visible track (fill, border, State Layer)
 * and shrinks while pressed. The thumb slides across; the ✓ and × icons cross-fade.
 */
export function Switch({
  size = 'small',
  labelPosition = 'right',
  description,
  xstyle,
  children,
  ...props
}: SwitchProps) {
  const labelId = useId();
  const descriptionId = useId();
  const hasDescription = description != null;
  return (
    <AriaSwitch
      // With a description, name the switch from the label only and describe it with the helper text.
      aria-labelledby={hasDescription && children != null ? labelId : undefined}
      aria-describedby={hasDescription ? descriptionId : undefined}
      {...props}
      {...racStyles<SwitchRenderProps>((s) => [
        styles.root,
        s.isDisabled ? interactiveCursor.disabled : interactiveCursor.enabled,
        xstyle,
      ])}
    >
      {composeRenderProps(children, (children, s) => {
        const look = s.isSelected ? 'on' : 'off';
        const active = (s.isHovered || s.isPressed) && !s.isDisabled;
        const track = (
          <span
            data-themis-touch-target=""
            {...stylex.props(
              styles.trackOuter,
              sizes[size],
              touchTarget.area,
              focusRing.base,
              s.isFocusVisible && focusRing.visible,
              s.isFocusVisible && focusRing.radiusFull,
            )}
          >
            <span
              data-themis-part="surface"
              {...stylex.props(
                baseStyles.surface,
                styles.track,
                pressMotion.base,
                trackLooks[look],
                layers.brand[s.isSelected ? 'default' : 'outline'],
                active && baseStyles.stateLayerOn,
                s.isPressed && !s.isDisabled && pressMotion.pressed,
                s.isDisabled && disabledLooks[look],
              )}
            >
              <span aria-hidden="true" {...stylex.props(styles.icon, icons[size], styles.iconStart, !s.isSelected && styles.iconHidden)}>
                <Icon name="check" size={iconSizes[size]} />
              </span>
              <span aria-hidden="true" {...stylex.props(styles.icon, icons[size], styles.iconEnd, s.isSelected && styles.iconHidden)}>
                <Icon name="x" size={iconSizes[size]} />
              </span>
              <span
                {...stylex.props(
                  styles.thumb,
                  thumbs[size],
                  thumbLooks[look],
                  s.isSelected && thumbOn[size],
                  s.isDisabled && disabledThumbs[look],
                )}
              />
            </span>
          </span>
        );
        const text =
          children != null || hasDescription ? (
            <span {...stylex.props(styles.text)}>
              {children != null && (
                <span id={labelId} {...stylex.props(styles.label, s.isDisabled && styles.textDisabled)}>
                  {children}
                </span>
              )}
              {hasDescription && (
                <span id={descriptionId} {...stylex.props(styles.description, s.isDisabled && styles.textDisabled)}>
                  {description}
                </span>
              )}
            </span>
          ) : null;
        return labelPosition === 'left' ? (
          <>
            {text}
            {track}
          </>
        ) : (
          <>
            {track}
            {text}
          </>
        );
      })}
    </AriaSwitch>
  );
}


/*
 * Geometry (Figma, mobile): track 47×24 / 60×32 / 72×40, thumb 16 / 24 / 32, icon 11 / 16 / 20.
 * Track height follows Button's height for the same size (label line height + block padding), so a Switch
 * lines up with Buttons. The rest is derived from it:
 *   thumb  = track height − 2 × spacing.2xs
 *   width  = spacing.xs + icon + spacing.xs + thumb + spacing.2xs
 *   travel = 2 × spacing.xs + icon − spacing.2xs   (how far the thumb slides)
 * Icon sizes are fixed: Figma has no token for them.
 */
const H = {
  micro: font.lineHeightLabel,
  small: `calc(${font.lineHeightLabel} + 2 * ${spacing['2xs']})`,
  medium: `calc(${font.lineHeightLabel} + 2 * ${spacing.xs})`,
};
const ICON = { micro: '0.6875rem', small: '1rem', medium: '1.25rem' };
// ✓ on the "on" side, × on the "off" side: the Icon closest to each box (micro's 12px icon overhangs its 11px box by
// half a pixel each side).
const iconSizes: Record<SwitchSize, IconSize> = { micro: 'xsmall', small: 'small', medium: 'medium' };

const sizes = stylex.create({
  micro: {
    height: H.micro,
    width: `calc(2 * ${spacing.xs} + ${ICON.micro} + ${H.micro} - ${spacing['2xs']})`,
  },
  small: {
    height: H.small,
    width: `calc(2 * ${spacing.xs} + ${ICON.small} + ${H.small} - ${spacing['2xs']})`,
  },
  medium: {
    height: H.medium,
    width: `calc(2 * ${spacing.xs} + ${ICON.medium} + ${H.medium} - ${spacing['2xs']})`,
  },
});

const thumbs = stylex.create({
  micro: { width: `calc(${H.micro} - 2 * ${spacing['2xs']})`, height: `calc(${H.micro} - 2 * ${spacing['2xs']})` },
  small: { width: `calc(${H.small} - 2 * ${spacing['2xs']})`, height: `calc(${H.small} - 2 * ${spacing['2xs']})` },
  medium: { width: `calc(${H.medium} - 2 * ${spacing['2xs']})`, height: `calc(${H.medium} - 2 * ${spacing['2xs']})` },
});

const thumbOn = stylex.create({
  micro: { transform: `translateX(calc(2 * ${spacing.xs} + ${ICON.micro} - ${spacing['2xs']}))` },
  small: { transform: `translateX(calc(2 * ${spacing.xs} + ${ICON.small} - ${spacing['2xs']}))` },
  medium: { transform: `translateX(calc(2 * ${spacing.xs} + ${ICON.medium} - ${spacing['2xs']}))` },
});

const icons = stylex.create({
  micro: { width: ICON.micro, height: ICON.micro },
  small: { width: ICON.small, height: ICON.small },
  medium: { width: ICON.medium, height: ICON.medium },
});

const styles = stylex.create({
  // The <label>: track plus text, all clickable.
  root: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacing.xs,
    color: color.text,
    WebkitTapHighlightColor: 'transparent',
    userSelect: 'none',
    verticalAlign: 'middle',
  },
  // Focus ring and touch area. Never scaled, so the hit area stays put.
  trackOuter: {
    position: 'relative',
    display: 'inline-flex',
    flexShrink: 0,
    borderRadius: radius.radiusFull,
  },
  // Figma's Surface + State Layer. baseStyles.surface supplies the State Layer (::before) and border (::after).
  track: {
    display: 'block',
    flexGrow: 1,
    borderRadius: radius.radiusFull,
    '::after': { borderWidth: borderWidth.widthMandatory, borderColor: color.borderBrand },
  },
  thumb: {
    position: 'absolute',
    top: spacing['2xs'],
    left: spacing['2xs'],
    borderRadius: radius.radiusFull,
    transitionProperty: 'transform, background-color',
    transitionDuration: { default: duration.base, '@media (prefers-reduced-motion: reduce)': '0s' },
    transitionTimingFunction: easing.standard,
  },
  icon: {
    position: 'absolute',
    top: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transform: 'translateY(-50%)',
    transitionProperty: 'opacity',
    transitionDuration: { default: duration.base, '@media (prefers-reduced-motion: reduce)': '0s' },
    transitionTimingFunction: easing.standard,
  },
  iconStart: { left: spacing.xs },
  iconEnd: { right: spacing.xs },
  iconHidden: { opacity: 0 },
  // Grows when the switch is stretched (e.g. a grid item), pushing a left-positioned label's switch to the end.
  text: { display: 'flex', flexDirection: 'column', gap: spacing['2xs'], flexGrow: 1 },
  label: {
    fontFamily: fontTheme.familyBody,
    fontSize: font.sizeLabel,
    lineHeight: font.lineHeightLabel,
    fontWeight: font.weightSemibold,
  },
  description: {
    fontFamily: fontTheme.familyBody,
    fontSize: font.sizeCaption,
    lineHeight: font.lineHeightCaption,
    fontWeight: font.weightRegular,
  },
  textDisabled: { color: system.textDisabledDefault },
});

/** Track colors. The ✓ icon takes the track's text color; the × icon uses the brand color. */
const trackLooks = stylex.create({
  on: { backgroundColor: color.brand, color: color.background },
  off: { backgroundColor: color.background, color: color.brand },
});

const thumbLooks = stylex.create({
  on: { backgroundColor: color.background },
  off: { backgroundColor: color.brand },
});

const disabledLooks = stylex.create({
  on: {
    backgroundColor: system.backgroundDisabledDefault,
    color: system.backgroundDisabledInverse,
    '::after': { borderColor: system.borderDisabled },
  },
  off: {
    backgroundColor: system.backgroundDisabledInverse,
    color: system.backgroundDisabledDefault,
    '::after': { borderColor: system.borderDisabled },
  },
});

const disabledThumbs = stylex.create({
  on: { backgroundColor: system.backgroundDisabledInverse },
  off: { backgroundColor: system.backgroundDisabledDefault },
});
