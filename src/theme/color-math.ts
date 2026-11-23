/**
 * Small sRGB color helpers for the theme engine: parsing, mixing, opacity and WCAG contrast. Channels are 0–1.
 */

export type RGBA = readonly [r: number, g: number, b: number, a: number];

/** Reads `#RGB`, `#RRGGBB` or `#RRGGBBAA` (case-insensitive). Throws on anything else. */
export function parseHex(input: string): RGBA {
  const h = input.trim().replace(/^#/, '');
  const full = h.length === 3 ? [...h].map((c) => c + c).join('') : h;
  if (!/^[0-9a-f]{6}([0-9a-f]{2})?$/i.test(full)) throw new Error(`Not a hex color: "${input}"`);
  const n = (i: number) => parseInt(full.slice(i, i + 2), 16) / 255;
  return [n(0), n(2), n(4), full.length === 8 ? n(6) : 1];
}

/** `#RRGGBB`, or `#RRGGBBAA` when see-through. Upper case, like Figma's exports. */
export function toHex([r, g, b, a]: RGBA): string {
  const byte = (v: number) => Math.round(Math.min(1, Math.max(0, v)) * 255).toString(16).padStart(2, '0');
  return `#${byte(r)}${byte(g)}${byte(b)}${a < 1 ? byte(a) : ''}`.toUpperCase();
}

/** `amount` of the way from `from` to `to` (0 = from, 1 = to). Opaque. */
export function mix(from: RGBA, to: RGBA, amount: number): RGBA {
  return [0, 1, 2].map((i) => from[i]! + (to[i]! - from[i]!) * amount).concat(1) as unknown as RGBA;
}

export function withAlpha([r, g, b]: RGBA, alpha: number): RGBA {
  return [r, g, b, alpha];
}

/** A see-through color laid over an opaque one. */
export function over(top: RGBA, base: RGBA): RGBA {
  const a = top[3];
  return [0, 1, 2].map((i) => top[i]! * a + base[i]! * (1 - a)).concat(1) as unknown as RGBA;
}

const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);

/** WCAG relative luminance, 0 (black) to 1 (white). */
export function luminance([r, g, b]: RGBA): number {
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/** WCAG contrast ratio, 1 to 21. */
export function contrast(a: RGBA, b: RGBA): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

export const BLACK: RGBA = [0, 0, 0, 1];
export const WHITE: RGBA = [1, 1, 1, 1];
