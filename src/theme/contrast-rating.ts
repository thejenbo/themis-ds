import { contrast, over, parseHex, type RGBA, toHex } from './color-math';
import { type ColorTokens, deriveColorTokens, type ThemeColors } from './derive-colors';

export type ContrastLevel = 'AAA' | 'AA' | 'Fail';

/**
 * WCAG levels for text: 7:1 AAA, 4.5:1 AA, below that a fail. WCAG's 3:1 for large text doesn't apply: every pair a
 * theme color is rated in has normal-size text on it (button labels, chips, error messages).
 */
export function contrastLevel(ratio: number): ContrastLevel {
  return ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : 'Fail';
}

export interface RatedPair {
  /** The pair's id in `tokens/contrast-pairs.json`. */
  id: string;
  text: keyof ColorTokens;
  surface: keyof ColorTokens;
  /** A see-through layer between the surface and the text (a hover tint). */
  overlay?: keyof ColorTokens;
  /** Shown, but left out of the rating: WCAG exempts it (disabled text). */
  advisory?: true;
}

/**
 * The text-on-surface pairs from `tokens/contrast-pairs.json` that each of the six colors takes part in (a unit test
 * keeps these in step with that file).
 */
export const RATED_PAIRS: Record<keyof ThemeColors, RatedPair[]> = {
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
    { id: 'disabled', text: 'textDisabledOnBackground', surface: 'background', advisory: true },
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

/** One pair a color is checked in, measured. */
export interface ContrastCheck extends RatedPair {
  ratio: number;
  level: ContrastLevel;
  /** The text color, and the surface it's on (with any see-through layer composited), as hex. */
  textHex: string;
  surfaceHex: string;
}

export interface ColorRating {
  /** The lowest contrast among the pairs this color is rated in (advisory ones left out). */
  ratio: number;
  level: ContrastLevel;
  /** The pair with that lowest contrast, from `tokens/contrast-pairs.json`. */
  worstPair: string;
  /** Every pair this color is checked in, advisory ones included. */
  checks: ContrastCheck[];
}

/** Rates each of a theme's six colors by its worst text contrast, for the config tool's badges. */
export function rateThemeColors(colors: ThemeColors): Record<keyof ThemeColors, ColorRating> {
  const tokens = deriveColorTokens(colors);
  const rgba = (key: keyof ColorTokens): RGBA => parseHex(tokens[key]);
  const result = {} as Record<keyof ThemeColors, ColorRating>;
  for (const [key, pairs] of Object.entries(RATED_PAIRS) as [keyof ThemeColors, RatedPair[]][]) {
    const checks = pairs.map((pair): ContrastCheck => {
      const surface = pair.overlay ? over(rgba(pair.overlay), rgba(pair.surface)) : rgba(pair.surface);
      const ratio = contrast(rgba(pair.text), surface);
      return { ...pair, ratio, level: contrastLevel(ratio), textHex: tokens[pair.text], surfaceHex: toHex(surface) };
    });
    const worst = checks.filter((c) => !c.advisory).reduce((a, b) => (b.ratio < a.ratio ? b : a));
    result[key] = { ratio: worst.ratio, level: worst.level, worstPair: worst.id, checks };
  }
  return result;
}

/**
 * The nearest lighter or darker shade of a color (same hue and saturation, in HSL) that brings it to AA (4.5:1)
 * everywhere it's rated, with the theme's other colors as they are. Null when no shade gets there (e.g. a mid-gray
 * background, where neither black nor white text has room).
 */
export function suggestPassingColor(colors: ThemeColors, key: keyof ThemeColors): string | null {
  const [h, s, l] = rgbToHsl(parseHex(colors[key]));
  let best: { distance: number; hex: string } | null = null;
  for (const direction of [-1, 1]) {
    for (let distance = 0.005; distance <= 1; distance += 0.005) {
      const lightness = l + direction * distance;
      if (lightness < 0 || lightness > 1) break;
      const hex = toHex(hslToRgb(h, s, lightness));
      if (rateThemeColors({ ...colors, [key]: hex })[key].ratio >= 4.5) {
        if (!best || distance < best.distance) best = { distance, hex };
        break;
      }
    }
  }
  return best?.hex ?? null;
}

function rgbToHsl([r, g, b]: RGBA): [number, number, number] {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h / 6, s, l];
}

function hslToRgb(h: number, s: number, l: number): RGBA {
  if (s === 0) return [l, l, l, 1];
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const channel = (t: number) => {
    const u = (t + 1) % 1;
    return u < 1 / 6 ? p + (q - p) * 6 * u : u < 1 / 2 ? q : u < 2 / 3 ? p + (q - p) * (2 / 3 - u) * 6 : p;
  };
  return [channel(h + 1 / 3), channel(h), channel(h - 1 / 3), 1];
}
