import type { GoogleFont } from './google-fonts';

/**
 * Shows each listed font's name in that font, cheaply: Google Fonts can send just the letters asked for (`text=`), so
 * each preview is a file of a few KB holding only the letters of the names in its batch.
 *
 * The faces are renamed ("Themis preview Lobster") before use. Google names them like the real fonts, and a later
 * partial face with the same name would win over a theme's full one, leaving letters missing from the preview.
 */

const loaded = new Set<string>();
const BATCH = 25;
const PREFIX = 'Themis preview ';

/**
 * The CSS font-family that shows `family` in its preview face, then `fallback` (the tool's own font) until it loads.
 * (`inherit` isn't allowed in a list of fonts, so the fallback has to be named.)
 */
export const previewFontFamily = (family: string, fallback: string) => `${JSON.stringify(PREFIX + family)}, ${fallback}`;

/** Loads preview faces for the fonts that don't have one yet. Failures are quiet: the name shows in the tool's font. */
export function loadFontPreviews(fonts: GoogleFont[]) {
  if (typeof document === 'undefined') return;
  // Respect the browser's data saver.
  if ((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData) return;
  const todo = fonts.filter((f) => !loaded.has(f.family) && f.weights.length > 0);
  for (let i = 0; i < todo.length; i += BATCH) void loadBatch(todo.slice(i, i + BATCH));
}

async function loadBatch(fonts: GoogleFont[]) {
  for (const f of fonts) loaded.add(f.family);
  // Each family at its regular weight, or the closest it has.
  const families = fonts.map((f) => {
    const weight = f.weights.includes(400) ? null : f.weights.reduce((best, w) => (Math.abs(w - 400) < Math.abs(best - 400) ? w : best));
    return `family=${encodeURIComponent(f.family).replace(/%20/g, '+')}${weight ? `:wght@${weight}` : ''}`;
  });
  const letters = [...new Set(fonts.map((f) => f.family).join(''))].sort().join('');
  const url = `https://fonts.googleapis.com/css2?${families.join('&')}&text=${encodeURIComponent(letters)}&display=swap`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(String(res.status));
    const css = (await res.text()).replace(/font-family: '([^']+)'/g, (_, name: string) => `font-family: '${PREFIX}${name}'`);
    const style = document.createElement('style');
    style.dataset.themisFontPreviews = '';
    style.textContent = css;
    document.head.append(style);
  } catch {
    // Not this time: let a later list try again.
    for (const f of fonts) loaded.delete(f.family);
  }
}
