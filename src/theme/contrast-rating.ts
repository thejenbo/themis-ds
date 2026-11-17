import { contrast, over, parseHex, type RGBA } from './color-math';
import { type ColorTokens, deriveColorTokens, type ThemeColors } from './derive-colors';

export type ContrastLevel = 'AAA' | 'AA' | 'AA Large' | 'Fail';

/** WCAG levels: 7:1 AAA, 4.5:1 AA, 3:1 AA for large text (and the edges of controls), below that a fail. */
export function contrastLevel(ratio: number): ContrastLevel {
  return ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : ratio >= 3 ? 'AA Large' : 'Fail';
}

/**
 * The text-on-surface pairs from `tokens/contrast-pairs.json` that each of the six colours takes part in (a unit test
 * keeps these in step with that file). `overlay` is a see-through layer between the surface and the text.
 */
export const RATED_PAIRS: Record<keyof ThemeColors, { id: string; text: keyof ColorTokens; surface: keyof ColorTokens; overlay?: keyof ColorTokens }[]> = {
  brand: [
    { id: 'text-brand', text: 'textBrand', surface: 'background' },
    { id: 'inverse-on-brand', text: 'textInverse', surface: 'brand' },
    { id: 'inverse-on-brand-hover', text: 'textInverse', surface: 'brandHover' },
    { id: 'text-brand-on-brand-tint', text: 'textBrand', surface: 'background', overlay: 'brandTint' },
  ],
  text: [
    { id: 'text', text: 'text', surface: 'background' },
    { id: 'text-on-background-hover', text: 'text', surface: 'background', overlay: 'backgroundHover' },
    { id: 'inverse-on-neutral', text: 'textInverse', surface: 'backgroundInverse' },
    { id: 'inverse-on-neutral-hover', text: 'textInverse', surface: 'backgroundInverseHover' },
  ],
  background: [
    { id: 'text', text: 'text', surface: 'background' },
    { id: 'disabled', text: 'textDisabledOnBackground', surface: 'background' },
  ],
  error: [
    { id: 'error', text: 'stateError', surface: 'background' },
    { id: 'inverse-on-error', text: 'textInverse', surface: 'stateError' },
    { id: 'inverse-on-error-hover', text: 'textInverse', surface: 'stateErrorHover' },
    { id: 'error-on-error-tint', text: 'stateError', surface: 'background', overlay: 'stateErrorTint' },
  ],
  warning: [
    { id: 'warning', text: 'stateWarning', surface: 'background' },
    { id: 'inverse-on-warning', text: 'textInverse', surface: 'stateWarning' },
    { id: 'inverse-on-warning-hover', text: 'textInverse', surface: 'stateWarningHover' },
    { id: 'warning-on-warning-tint', text: 'stateWarning', surface: 'background', overlay: 'stateWarningTint' },
  ],
  success: [
    { id: 'success', text: 'stateSuccess', surface: 'background' },
    { id: 'inverse-on-success', text: 'textInverse', surface: 'stateSuccess' },
    { id: 'inverse-on-success-hover', text: 'textInverse', surface: 'stateSuccessHover' },
    { id: 'success-on-success-tint', text: 'stateSuccess', surface: 'background', overlay: 'stateSuccessTint' },
  ],
};

export interface ColorRating {
  /** The lowest contrast among the pairs this colour takes part in. */
  ratio: number;
  level: ContrastLevel;
  /** The pair with that lowest contrast, from `tokens/contrast-pairs.json`. */
  worstPair: string;
}

/** Rates each of a theme's six colours by its worst text contrast, for the config tool's badges. */
export function rateThemeColors(colors: ThemeColors): Record<keyof ThemeColors, ColorRating> {
  const tokens = deriveColorTokens(colors);
  const rgba = (key: keyof ColorTokens): RGBA => parseHex(tokens[key]);
  const result = {} as Record<keyof ThemeColors, ColorRating>;
  for (const [key, pairs] of Object.entries(RATED_PAIRS) as [keyof ThemeColors, (typeof RATED_PAIRS)[keyof ThemeColors]][]) {
    let worst = { ratio: Infinity, worstPair: '' };
    for (const pair of pairs) {
      const surface = pair.overlay ? over(rgba(pair.overlay), rgba(pair.surface)) : rgba(pair.surface);
      const ratio = contrast(rgba(pair.text), surface);
      if (ratio < worst.ratio) worst = { ratio, worstPair: pair.id };
    }
    result[key] = { ...worst, level: contrastLevel(worst.ratio) };
  }
  return result;
}
