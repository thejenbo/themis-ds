/**
 * Builds the config tool's Google Fonts catalogue (apps/config/src/fonts/google-fonts.json) from Google's public font
 * metadata, so the font fields can search every family. Run with `npm run fonts` now and then to pick up new fonts;
 * the output is committed, since the metadata can't be fetched from the browser (no CORS).
 *
 * Each entry is [family, category, weights]: the upright weights the family has, so the tool only asks Google for
 * weights that exist (the stylesheet API rejects the whole request otherwise). Families are most popular first, and
 * limited to ones with Latin characters (the tool's text) that anyone can use (no brand-only fonts).
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const METADATA_URL = 'https://fonts.google.com/metadata/fonts';
const OUT = path.join(import.meta.dirname, '../apps/config/src/fonts/google-fonts.json');

interface Family {
  family: string;
  category: string;
  subsets: string[];
  fonts: Record<string, unknown>;
  popularity: number;
  isBrandFont?: boolean;
}

const CATEGORIES: Record<string, string> = {
  'Sans Serif': 'sans-serif',
  Serif: 'serif',
  Display: 'display',
  Handwriting: 'handwriting',
  Monospace: 'monospace',
};

const res = await fetch(METADATA_URL);
if (!res.ok) throw new Error(`Couldn't fetch ${METADATA_URL}: ${res.status}`);
// The response may start with a ")]}'" guard line.
const text = (await res.text()).replace(/^\)\]\}'\s*/, '');
const { familyMetadataList } = JSON.parse(text) as { familyMetadataList: Family[] };

const fonts = familyMetadataList
  .filter((f) => f.subsets.includes('latin') && !f.isBrandFont)
  .sort((a, b) => a.popularity - b.popularity)
  .map((f) => {
    const weights = Object.keys(f.fonts)
      .filter((style) => /^\d+$/.test(style))
      .map(Number)
      .sort((a, b) => a - b);
    return [f.family, CATEGORIES[f.category] ?? f.category.toLowerCase(), weights] as const;
  })
  .filter(([, , weights]) => weights.length > 0);

mkdirSync(path.dirname(OUT), { recursive: true });
writeFileSync(OUT, `${JSON.stringify(fonts)}\n`);
console.log(`google-fonts: ${fonts.length} families → ${path.relative(process.cwd(), OUT)}`);
