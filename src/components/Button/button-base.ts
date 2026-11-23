import * as stylex from '@stylexjs/stylex';

import { border as borderWidth } from '../../tokens/borderWidth.stylex';
import { color } from '../../tokens/colorTheme.stylex';
import { font as fontTheme } from '../../tokens/fontTheme.stylex';
import { duration, easing } from '../../tokens/motion.stylex';
import { border as radius } from '../../tokens/radius.stylex';
import { spacing } from '../../tokens/spacing.stylex';
import { color as system } from '../../tokens/system.stylex';
import { font } from '../../tokens/typography.stylex';

/**
 * Styles shared by Button and IconButton: the clickable root, the Surface with its State Layer, tones,
 * disabled looks and the pending spinner. Both components use the same Figma token roles, so a fix here
 * applies to both. Component-specific layout (label padding, square icon sizing) stays in each component.
 */

export type ButtonVariant = 'default' | 'outline' | 'subtle';
export type ButtonSize = 'micro' | 'small' | 'medium';
export type ButtonTone = 'brand' | 'neutral' | 'danger' | 'warning' | 'success';

const spin = stylex.keyframes({
  from: { transform: 'rotate(0deg)' },
  to: { transform: 'rotate(360deg)' },
});

export const baseStyles = stylex.create({
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
    borderRadius: radius.radiusMd,
    fontFamily: fontTheme.familyBody,
    // Figma type/label/base: a fixed label size on every breakpoint.
    fontSize: font.sizeLabel,
    lineHeight: font.lineHeightLabel,
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

/** Padding per size. Button pads the block axis; IconButton pads all sides to stay square. */
export const blockPadding = stylex.create({
  micro: { paddingBlock: 0 },
  small: { paddingBlock: spacing['2xs'] },
  medium: { paddingBlock: spacing.xs },
});

/*
 * Tones. Each comes from the Figma Button set's `tone` property and supplies:
 *   fill    default variant's Surface
 *   border  outline variant's border
 *   label   outline and subtle label and icon color (default variant labels use text-inverse on the fill)
 * Hover/press (the State Layer) uses Figma's hover tokens, computed per color theme:
 *   default  the solid `*-hover` fill: the fill shifted 7% away from its label, so contrast only goes up
 *   outline  the see-through `*-tint` over the background, so the layer is as opaque as the resting fill
 *   subtle   the see-through `*-tint` alone. Subtle buttons only sit on `background`-colored surfaces, where
 *            that pair is rated (tokens/contrast-pairs.json)
 */
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
  default: { '::before': { backgroundColor: color.brandHover } },
  outline: { '::before': { backgroundColor: color.background, backgroundImage: `linear-gradient(${color.brandTint}, ${color.brandTint})` } },
  subtle: { '::before': { backgroundColor: color.brandTint } },
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
  default: { '::before': { backgroundColor: color.backgroundInverseHover } },
  outline: { '::before': { backgroundColor: color.background, backgroundImage: `linear-gradient(${color.backgroundHover}, ${color.backgroundHover})` } },
  subtle: { '::before': { backgroundColor: color.backgroundHover } },
});

const dangerSurfaces = stylex.create({
  default: { backgroundColor: color.stateError, color: color.textInverse },
  outline: {
    backgroundColor: color.background,
    color: color.stateError,
    '::after': { borderWidth: borderWidth.widthMandatory, borderColor: color.stateError },
  },
  subtle: { backgroundColor: 'transparent', color: color.stateError },
});

const dangerLayers = stylex.create({
  default: { '::before': { backgroundColor: color.stateErrorHover } },
  outline: { '::before': { backgroundColor: color.background, backgroundImage: `linear-gradient(${color.stateErrorTint}, ${color.stateErrorTint})` } },
  subtle: { '::before': { backgroundColor: color.stateErrorTint } },
});

const warningSurfaces = stylex.create({
  default: { backgroundColor: color.stateWarning, color: color.textInverse },
  outline: {
    backgroundColor: color.background,
    color: color.stateWarning,
    '::after': { borderWidth: borderWidth.widthMandatory, borderColor: color.stateWarning },
  },
  subtle: { backgroundColor: 'transparent', color: color.stateWarning },
});

const warningLayers = stylex.create({
  default: { '::before': { backgroundColor: color.stateWarningHover } },
  outline: { '::before': { backgroundColor: color.background, backgroundImage: `linear-gradient(${color.stateWarningTint}, ${color.stateWarningTint})` } },
  subtle: { '::before': { backgroundColor: color.stateWarningTint } },
});

const successSurfaces = stylex.create({
  default: { backgroundColor: color.stateSuccess, color: color.textInverse },
  outline: {
    backgroundColor: color.background,
    color: color.stateSuccess,
    '::after': { borderWidth: borderWidth.widthMandatory, borderColor: color.stateSuccess },
  },
  subtle: { backgroundColor: 'transparent', color: color.stateSuccess },
});

const successLayers = stylex.create({
  default: { '::before': { backgroundColor: color.stateSuccessHover } },
  outline: { '::before': { backgroundColor: color.background, backgroundImage: `linear-gradient(${color.stateSuccessTint}, ${color.stateSuccessTint})` } },
  subtle: { '::before': { backgroundColor: color.stateSuccessTint } },
});

/** Resting look per tone, then per variant (Figma state=default). */
export const surfaces = {
  brand: brandSurfaces,
  neutral: neutralSurfaces,
  danger: dangerSurfaces,
  warning: warningSurfaces,
  success: successSurfaces,
} satisfies Record<ButtonTone, unknown>;
/** State Layer (hover/press) per tone, then per variant. */
export const layers = {
  brand: brandLayers,
  neutral: neutralLayers,
  danger: dangerLayers,
  warning: warningLayers,
  success: successLayers,
} satisfies Record<ButtonTone, unknown>;
export const disabledSurfaces = stylex.create({
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
