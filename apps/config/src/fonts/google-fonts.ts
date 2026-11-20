import type { FontChoice } from 'themis-ds';

/** A Google Fonts family: its name, category, and the upright weights it has. */
export interface GoogleFont {
  family: string;
  category: string;
  weights: number[];
}

type Entry = [family: string, category: string, weights: number[]];

let catalogue: Promise<GoogleFont[]> | null = null;

/**
 * Every Latin-script Google Fonts family, most popular first (built by `npm run fonts`). Loaded on first use, so it
 * isn't part of the tool's first download.
 */
export function loadGoogleFonts(): Promise<GoogleFont[]> {
  catalogue ??= import('./google-fonts.json').then(({ default: entries }) =>
    (entries as Entry[]).map(([family, category, weights]) => ({ family, category, weights })),
  );
  return catalogue;
}

/** The weights Themis uses: regular, semibold (labels, buttons) and bold (headings). */
const WANTED = [400, 600, 700];

/**
 * What a theme stores for a family. Just the name when the family has all of Themis's weights; otherwise the name
 * and the closest weights it does have, since Google's stylesheet request fails outright if it asks for one that
 * doesn't exist (and that would leave both fonts unloaded). The browser then fakes any missing bold.
 */
export function fontChoiceFor(font: GoogleFont): FontChoice {
  if (WANTED.every((w) => font.weights.includes(w))) return font.family;
  const nearest = WANTED.map((w) => font.weights.reduce((best, a) => (Math.abs(a - w) < Math.abs(best - w) ? a : best)));
  return { family: font.family, weights: [...new Set(nearest)].sort((a, b) => a - b) };
}

/**
 * The families to list for what's typed: an exact name first, then names that start with it, then names that contain
 * it, each most popular first, up to `limit`. Empty: the most popular families.
 */
export function searchFonts(fonts: GoogleFont[], query: string, limit = 50): GoogleFont[] {
  const q = query.trim().toLowerCase();
  if (!q) return fonts.slice(0, limit);
  const exact: GoogleFont[] = [];
  const starts: GoogleFont[] = [];
  const contains: GoogleFont[] = [];
  for (const f of fonts) {
    const name = f.family.toLowerCase();
    if (name === q) exact.push(f);
    else if (name.startsWith(q)) starts.push(f);
    else if (name.includes(q)) contains.push(f);
    if (starts.length >= limit) break;
  }
  return [...exact, ...starts, ...contains].slice(0, limit);
}
