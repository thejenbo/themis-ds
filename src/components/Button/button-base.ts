import * as stylex from '@stylexjs/stylex';

import { border as borderWidth } from '../../tokens/borderWidth.stylex';
import { color } from '../../tokens/colorTheme.stylex';
import { font as fontTheme } from '../../tokens/fontTheme.stylex';
import { duration, easing } from '../../tokens/motion.stylex';
import { border as radius } from '../../tokens/radius.stylex';
import { spacing } from '../../tokens/spacing.stylex';
import { color as system } from '../../tokens/system.stylex';
import { font } from '../../tokens/typography.stylex';
import { stateLayer } from '../../utils/state-layer.stylex';

/**
 * Styles shared by Button and IconButton: the clickable root, the Surface with its State Layer, tones,
 * disabled looks and the pending spinner. Both components use the same Figma token roles, so a fix here
 * applies to both. Component-specific layout (label padding, square icon sizing) stays in each component.
 */

export type ButtonVariant = 'default' | 'outline' | 'subtle';
export type ButtonSize = 'micro' | 'small' | 'medium';
export type ButtonTone = 'brand' | 'neutral' | 'danger';

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

/** Padding per size. Button pads the block axis; IconButton pads all sides to stay square. */
export const blockPadding = stylex.create({
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
export const surfaces = { brand: brandSurfaces, neutral: neutralSurfaces, danger: dangerSurfaces } satisfies Record<ButtonTone, unknown>;
/** State Layer (hover/press) per tone, then per variant. */
export const layers = { brand: brandLayers, neutral: neutralLayers, danger: dangerLayers } satisfies Record<ButtonTone, unknown>;
/** Icon colour per tone and variant, where it differs from the label. */
export const icons: Record<ButtonTone, Partial<Record<ButtonVariant, stylex.StyleXStyles>>> = {
  brand: {},
  neutral: {},
  danger: dangerIcons,
};

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
