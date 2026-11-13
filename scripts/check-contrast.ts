/**
 * Rates every text/surface pair in tokens/contrast-pairs.json in every colour theme (WCAG 2 contrast).
 *
 *   npm run contrast             report only
 *   npm run contrast -- --strict exit 1 if a required pair is under its minimum
 *
 * Reads the generated catalogue (src/tokens/tokens.json), so run `npm run tokens` first.
 *
 * A pair's `overlay` is a see-through token (a `*-tint`) composited over its `surface` the way browsers draw it:
 * an alpha blend of the sRGB values. Hover fills (`*-hover`) are solid tokens, so they are plain surfaces.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const strict = process.argv.includes('--strict');

interface Pair {
  id: string;
  text: string;
  surface: string;
  overlay?: string;
  minimum?: number;
  level?: 'advisory';
  usedBy: string[];
}
interface Token {
  id: string;
  modes: Record<string, { value: string }>;
}

const config = JSON.parse(fs.readFileSync(path.join(ROOT, 'tokens/contrast-pairs.json'), 'utf8')) as { minimum: number; pairs: Pair[] };
const catalogue = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/tokens/tokens.json'), 'utf8')) as {
  collections: Record<string, { modes: string[] }>;
  tokens: Token[];
};
const byId = new Map(catalogue.tokens.map((t) => [t.id, t]));
const themes = catalogue.collections.colorTheme!.modes;

type RGBA = [number, number, number, number];

function parseHex(hex: string): RGBA {
  const h = hex.replace('#', '');
  const n = (i: number) => parseInt(h.slice(i, i + 2), 16) / 255;
  return [n(0), n(2), n(4), h.length === 8 ? n(6) : 1];
}

/** A token's value in a colour theme. Collections without that mode (system, primitives) use their only value. */
function valueIn(id: string, theme: string): RGBA {
  const token = byId.get(id);
  if (!token) throw new Error(`contrast-pairs.json: no token "${id}"`);
  const mode = token.modes[theme] ?? Object.values(token.modes)[0]!;
  return parseHex(mode.value);
}

const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const luminance = ([r, g, b]: RGBA) => 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
const contrast = (a: RGBA, b: RGBA) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
};
const over = (top: RGBA, base: RGBA): RGBA => {
  const a = top[3];
  return [0, 1, 2].map((i) => top[i]! * a + base[i]! * (1 - a)).concat(1) as RGBA;
};
const hex = (c: RGBA) => `#${c.slice(0, 3).map((v) => Math.round(v * 255).toString(16).padStart(2, '0')).join('').toUpperCase()}`;

function rate(pair: Pair, theme: string) {
  const text = valueIn(pair.text, theme);
  let surface = valueIn(pair.surface, theme);
  if (pair.overlay) surface = over(valueIn(pair.overlay, theme), surface);
  return { ratio: contrast(text, surface), surface };
}

const pad = (s: string, n: number) => s + ' '.repeat(Math.max(0, n - s.length));
const idWidth = Math.max(...config.pairs.map((p) => p.id.length)) + 2;
const colWidth = Math.max(...themes.map((t) => t.length)) + 2;

console.log(`Contrast pairs (minimum ${config.minimum}:1 unless noted): ✗ under the minimum, ~ advisory\n`);
console.log(pad('pair', idWidth) + themes.map((t) => pad(t, colWidth)).join('') + 'min');

const failures: string[] = [];
for (const pair of config.pairs) {
  const minimum = pair.minimum ?? config.minimum;
  const cells = themes.map((theme) => {
    const r = rate(pair, theme);
    const under = r.ratio < minimum;
    if (under && pair.level !== 'advisory') failures.push(`${pair.id} in ${theme}: ${r.ratio.toFixed(2)}:1, needs ${minimum} (surface ${hex(r.surface)}) — ${pair.usedBy.join(', ')}`);
    return pad(`${r.ratio.toFixed(2)}${under ? (pair.level === 'advisory' ? '~' : '✗') : ' '}`, colWidth);
  });
  console.log(pad(pair.id, idWidth) + cells.join('') + minimum);
}

if (failures.length) {
  console.log(`\n${failures.length} pair(s) under their minimum:`);
  for (const f of failures) console.log(`  ${f}`);
  if (strict) process.exit(1);
} else {
  console.log('\n✓ every required pair passes');
}
