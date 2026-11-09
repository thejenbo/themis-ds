import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';
import {
  Button as AriaButton,
  type ButtonProps as AriaButtonProps,
  type ButtonRenderProps,
  composeRenderProps,
  ProgressBar,
} from 'react-aria-components';

import { border as borderWidth } from '../../tokens/borderWidth.stylex';
import { color } from '../../tokens/colorTheme.stylex';
import { font as fontTheme } from '../../tokens/fontTheme.stylex';
import { border as radius } from '../../tokens/radius.stylex';
import { spacing } from '../../tokens/spacing.stylex';
import { color as system } from '../../tokens/system.stylex';
import { duration, easing } from '../../tokens/motion.stylex';
import { font } from '../../tokens/typography.stylex';
import { focusRing } from '../../utils/focus-ring';
import { interactiveCursor } from '../../utils/interactive-cursor';
import { pressMotion } from '../../utils/press-motion';
import { stateLayer } from '../../utils/state-layer.stylex';
import { touchTarget } from '../../utils/touch-target';
import { racStyles } from '../../utils/stylex-rac';

export type ButtonVariant = 'default' | 'outline' | 'subtle';
export type ButtonSize = 'micro' | 'small' | 'medium';
export type ButtonTone = 'brand' | 'neutral' | 'danger';

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
              pressMotion.base,
              sizes[size],
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

const spin = stylex.keyframes({
  from: { transform: 'rotate(0deg)' },
  to: { transform: 'rotate(360deg)' },
});

const styles = stylex.create({
  // The clickable element. Never padded or scaled, so the hit area stays put.
  root: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'stretch',
    padding: 0,
    margin: 0,
    borderWidth: 0,
    borderRadius: radius.radiusMd,
    backgroundColor: 'transparent',
    // WCAG 2.5.8: a target is never smaller than 24×24, whatever the tokens say.
    minHeight: '24px',
    minWidth: '24px',
    userSelect: 'none',
    WebkitTapHighlightColor: 'transparent',
    verticalAlign: 'middle',
  },
  // Figma's "Surface" + "State Layer" layers.
  surface: {
    position: 'relative',
    flexGrow: 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingInline: spacing.sm,
    borderRadius: radius.radiusMd,
    fontFamily: fontTheme.familyBody,
    fontSize: font.sizeSm,
    lineHeight: font.lineHeightSm,
    fontWeight: font.weightSemibold,
    whiteSpace: 'nowrap',
    // State Layer. It holds the full hovered look (hover Surface + overlay) and fades in as one piece,
    // so variants whose Surface changes on hover (outline, subtle) don't flash a darker midpoint.
    '::before': {
      content: "''",
      position: 'absolute',
      inset: 0,
      borderRadius: 'inherit',
      opacity: 0,
      pointerEvents: 'none',
      transitionProperty: 'opacity',
      transitionDuration: duration.base,
      transitionTimingFunction: easing.standard,
    },
    // Inside border for the outline variant. Drawn on top, so it adds no size (Figma strokes are inside).
    '::after': {
      content: "''",
      position: 'absolute',
      inset: 0,
      borderRadius: 'inherit',
      borderStyle: 'solid',
      borderWidth: 0,
      borderColor: 'transparent',
      pointerEvents: 'none',
    },
  },
  stateLayerOn: {
    '::before': { opacity: 1 },
  },
  // Label and icon slots sit above the State Layer.
  slot: { position: 'relative', display: 'inline-flex', alignItems: 'center' },
  hidden: { visibility: 'hidden' },
  spinnerWrap: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    width: '1em',
    height: '1em',
    borderRadius: '50%',
    borderWidth: borderWidth.widthSm,
    borderStyle: 'solid',
    borderColor: 'currentColor',
    borderTopColor: 'transparent',
    animationName: spin,
    animationDuration: '800ms',
    animationIterationCount: 'infinite',
    animationTimingFunction: 'linear',
  },
});

const sizes = stylex.create({
  micro: { paddingBlock: 0 },
  small: { paddingBlock: spacing['2xs'] },
  medium: { paddingBlock: spacing.xs },
});

/*
 * Tones. Each comes from a Figma component set ("Button - Brand", "- Neutral", "- Danger") and supplies:
 *   fill    default variant's Surface, and the hover/press Surface of every variant
 *   border  outline variant's border
 *   label   outline and subtle label colour (default variant labels use text-inverse on the fill)
 * The State Layer overlay's direction is calculated from `fill` (see utils/state-layer.stylex.ts); amounts come
 * from Figma: default uses transform-20, outline and subtle transform-90. Browsers without relative colour syntax
 * fall back to Figma's fixed transform tokens.
 */
const brandOverlay20 = `oklch(from ${color.brand} ${stateLayer.direction} 0 0 / 0.2)`;
const brandOverlay90 = `oklch(from ${color.brand} ${stateLayer.direction} 0 0 / 0.9)`;
const neutralOverlay20 = `oklch(from ${color.backgroundInverse} ${stateLayer.direction} 0 0 / 0.2)`;
const neutralOverlay90 = `oklch(from ${color.backgroundInverse} ${stateLayer.direction} 0 0 / 0.9)`;
const dangerOverlay20 = `oklch(from ${color.error} ${stateLayer.direction} 0 0 / 0.2)`;
const dangerOverlay90 = `oklch(from ${color.error} ${stateLayer.direction} 0 0 / 0.9)`;

const brandSurfaces = stylex.create({
  default: { backgroundColor: color.brand, color: color.textInverse },
  outline: {
    backgroundColor: color.background,
    color: color.textBrand,
    '::after': { borderWidth: borderWidth.widthMandatory, borderColor: color.borderBrand },
  },
  subtle: { backgroundColor: 'transparent', color: color.textBrand },
});

const brandLayers = stylex.create({
  default: {
    '::before': {
      backgroundColor: color.brand,
      backgroundImage: stylex.firstThatWorks(
        `linear-gradient(${brandOverlay20}, ${brandOverlay20})`,
        `linear-gradient(${color.transform20}, ${color.transform20})`,
      ),
    },
  },
  outline: {
    '::before': {
      backgroundColor: color.brand,
      backgroundImage: stylex.firstThatWorks(
        `linear-gradient(${brandOverlay90}, ${brandOverlay90})`,
        `linear-gradient(${color.transform90}, ${color.transform90})`,
      ),
    },
  },
  subtle: {
    '::before': {
      backgroundColor: color.brand,
      backgroundImage: stylex.firstThatWorks(
        `linear-gradient(${brandOverlay90}, ${brandOverlay90})`,
        `linear-gradient(${color.transform90}, ${color.transform90})`,
      ),
    },
  },
});

const neutralSurfaces = stylex.create({
  default: { backgroundColor: color.backgroundInverse, color: color.textInverse },
  outline: {
    backgroundColor: color.background,
    color: color.text,
    '::after': { borderWidth: borderWidth.widthMandatory, borderColor: color.border },
  },
  subtle: { backgroundColor: 'transparent', color: color.text },
});

const neutralLayers = stylex.create({
  default: {
    '::before': {
      backgroundColor: color.backgroundInverse,
      backgroundImage: stylex.firstThatWorks(
        `linear-gradient(${neutralOverlay20}, ${neutralOverlay20})`,
        `linear-gradient(${color.transform20}, ${color.transform20})`,
      ),
    },
  },
  outline: {
    '::before': {
      backgroundColor: color.backgroundInverse,
      backgroundImage: stylex.firstThatWorks(
        `linear-gradient(${neutralOverlay90}, ${neutralOverlay90})`,
        `linear-gradient(${color.transform90}, ${color.transform90})`,
      ),
    },
  },
  subtle: {
    '::before': {
      backgroundColor: color.backgroundInverse,
      backgroundImage: stylex.firstThatWorks(
        `linear-gradient(${neutralOverlay90}, ${neutralOverlay90})`,
        `linear-gradient(${color.transform90}, ${color.transform90})`,
      ),
    },
  },
});

const dangerSurfaces = stylex.create({
  default: { backgroundColor: color.error, color: color.textInverse },
  outline: {
    backgroundColor: color.background,
    color: color.text,
    '::after': { borderWidth: borderWidth.widthMandatory, borderColor: color.error },
  },
  subtle: { backgroundColor: 'transparent', color: color.text },
});

const dangerLayers = stylex.create({
  default: {
    '::before': {
      backgroundColor: color.error,
      backgroundImage: stylex.firstThatWorks(
        `linear-gradient(${dangerOverlay20}, ${dangerOverlay20})`,
        `linear-gradient(${color.transform20}, ${color.transform20})`,
      ),
    },
  },
  outline: {
    '::before': {
      backgroundColor: color.error,
      backgroundImage: stylex.firstThatWorks(
        `linear-gradient(${dangerOverlay90}, ${dangerOverlay90})`,
        `linear-gradient(${color.transform90}, ${color.transform90})`,
      ),
    },
  },
  subtle: {
    '::before': {
      backgroundColor: color.error,
      backgroundImage: stylex.firstThatWorks(
        `linear-gradient(${dangerOverlay90}, ${dangerOverlay90})`,
        `linear-gradient(${color.transform90}, ${color.transform90})`,
      ),
    },
  },
});

/** Danger's outline and subtle icons use the error colour while the label stays `text` (per Figma). */
const dangerIcons = stylex.create({
  outline: { color: color.error },
  subtle: { color: color.error },
});

/** Resting look per tone, then per variant (Figma state=default). */
const surfaces = { brand: brandSurfaces, neutral: neutralSurfaces, danger: dangerSurfaces } satisfies Record<ButtonTone, unknown>;
/** State Layer (hover/press) per tone, then per variant. */
const layers = { brand: brandLayers, neutral: neutralLayers, danger: dangerLayers } satisfies Record<ButtonTone, unknown>;
/** Icon colour per tone and variant, where it differs from the label. */
const icons: Record<ButtonTone, Partial<Record<ButtonVariant, stylex.StyleXStyles>>> = {
  brand: {},
  neutral: {},
  danger: dangerIcons,
};

const disabledSurfaces = stylex.create({
  default: {
    backgroundColor: system.backgroundDisabledDefault,
    color: system.textDisabledInverse,
  },
  outline: {
    backgroundColor: system.backgroundDisabledInverse,
    color: system.textDisabledDefault,
    '::after': { borderColor: system.borderDisabled },
  },
  subtle: {
    backgroundColor: system.backgroundDisabledInverse,
    color: system.textDisabledDefault,
  },
});
