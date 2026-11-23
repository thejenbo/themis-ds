import { BLACK, contrast, luminance, mix, parseHex, type RGBA, toHex, WHITE, withAlpha } from './color-math';

/** The six colors a theme is made from. Hex codes (`#RRGGBB`). */
export interface ThemeColors {
  brand: string;
  text: string;
  background: string;
  error: string;
  warning: string;
  success: string;
}

/** Every colorTheme token (as the StyleX variable names in `src/tokens/colorTheme.stylex.ts`), as hex. */
export interface ColorTokens {
  brand: string;
  background: string;
  backgroundInverse: string;
  text: string;
  textBrand: string;
  textInverse: string;
  border: string;
  borderBrand: string;
  borderInverse: string;
  overlayTint: string;
  textDisabledOnBackground: string;
  textPlaceholderDefault: string;
  brandHover: string;
  backgroundInverseHover: string;
  brandTint: string;
  backgroundHover: string;
  borderBrandHover: string;
  inverseTint: string;
  stateError: string;
  stateWarning: string;
  stateSuccess: string;
  stateErrorHover: string;
  stateWarningHover: string;
  stateSuccessHover: string;
  stateErrorTint: string;
  stateWarningTint: string;
  stateSuccessTint: string;
}

/** The rules' numbers, from the Themis Figma themes (see the `$description` on each colorTheme variable). */
export const COLOR_RULES = {
  /** Filled surfaces, hovered: this much toward black (toward white when too dark to darken visibly). */
  hoverShift: 0.07,
  /** Below this luminance a fill lightens on hover instead of darkening. */
  darkFillLuminance: 0.02,
  /** See-through hover tints: this opacity. */
  tintAlpha: 0.07,
  /** Overlay behind dialogs: the background at this opacity. */
  overlayAlpha: 0.6,
  /** border-brand-hover: this much of the way from brand to the background. */
  borderBrandHoverMix: 0.6,
  /** Disabled and placeholder text: a gray from text toward the background, stopping at this contrast. */
  mutedTextContrast: 6,
} as const;

/** A filled surface's hover: 7% darker, or 7% lighter when it's too dark to darken visibly (e.g. black). */
function hover(fill: RGBA): RGBA {
  const towards = luminance(fill) < COLOR_RULES.darkFillLuminance ? WHITE : BLACK;
  return mix(fill, towards, COLOR_RULES.hoverShift);
}

/**
 * The muted gray for disabled and placeholder text: from `text` toward `background`, as far as it can go while
 * keeping `mutedTextContrast` against the background (or `text` itself, if even that is lower).
 */
function mutedText(text: RGBA, background: RGBA): RGBA {
  if (contrast(text, background) <= COLOR_RULES.mutedTextContrast) return text;
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (contrast(mix(text, background, mid), background) >= COLOR_RULES.mutedTextContrast) lo = mid;
    else hi = mid;
  }
  // Round to whole channel values, then step back toward text until the contrast holds after rounding.
  let gray = parseHex(toHex(mix(text, background, lo)));
  for (let t = lo; contrast(gray, background) < COLOR_RULES.mutedTextContrast && t > 0; t -= 0.002) {
    gray = parseHex(toHex(mix(text, background, t)));
  }
  return gray;
}

/** Every color token of a theme, worked out from its six colors with the Themis rules. */
export function deriveColorTokens(colors: ThemeColors): ColorTokens {
  const brand = parseHex(colors.brand);
  const text = parseHex(colors.text);
  const background = parseHex(colors.background);
  const error = parseHex(colors.error);
  const warning = parseHex(colors.warning);
  const success = parseHex(colors.success);
  const hex = toHex;
  const muted = hex(mutedText(text, background));
  return {
    brand: hex(brand),
    background: hex(background),
    backgroundInverse: hex(text),
    text: hex(text),
    textBrand: hex(brand),
    textInverse: hex(background),
    border: hex(text),
    borderBrand: hex(brand),
    borderInverse: hex(background),
    overlayTint: hex(withAlpha(background, COLOR_RULES.overlayAlpha)),
    textDisabledOnBackground: muted,
    textPlaceholderDefault: muted,
    brandHover: hex(hover(brand)),
    backgroundInverseHover: hex(hover(text)),
    brandTint: hex(withAlpha(brand, COLOR_RULES.tintAlpha)),
    backgroundHover: hex(withAlpha(text, COLOR_RULES.tintAlpha)),
    borderBrandHover: hex(mix(brand, background, COLOR_RULES.borderBrandHoverMix)),
    inverseTint: hex(withAlpha(background, COLOR_RULES.tintAlpha)),
    stateError: hex(error),
    stateWarning: hex(warning),
    stateSuccess: hex(success),
    stateErrorHover: hex(hover(error)),
    stateWarningHover: hex(hover(warning)),
    stateSuccessHover: hex(hover(success)),
    stateErrorTint: hex(withAlpha(error, COLOR_RULES.tintAlpha)),
    stateWarningTint: hex(withAlpha(warning, COLOR_RULES.tintAlpha)),
    stateSuccessTint: hex(withAlpha(success, COLOR_RULES.tintAlpha)),
  };
}
