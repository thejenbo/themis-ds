/**
 * DTCG → StyleX token compiler.
 *
 * Input:  tokens/<collection>/<mode>.tokens.json   (one file per Figma collection × mode)
 *         tokens/<collection>.tokens.json          (single-mode collection; mode = "default")
 *         tokens/collections.json                  (optional: mode order + default mode per collection)
 *
 * Output (all generated — never edit by hand):
 *   src/tokens/<collection>.stylex.ts  one `stylex.defineVars` per top-level group, default-mode values
 *   src/tokens/themes.ts               per multi-mode collection: its modes and one `stylex.createTheme` per mode
 *   src/tokens/tokens.json             flat catalogue (all modes, alias chains, $extensions) for
 *                                      Storybook docs, the Figma manifest and AI tooling
 *
 * Aliases (`{group.token}`) are resolved first within the same collection + mode, then across other
 * collections (same mode name if it exists, else that collection's default mode). StyleX vars must be
 * statically analysable, so resolved literal values are emitted; the alias chain is kept in tokens.json.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const TOKENS_DIR = path.join(ROOT, 'tokens');
const OUT_DIR = path.join(ROOT, 'src/tokens');
const DEFAULT_MODE_NAMES = ['default', 'light', 'base', 'mode 1', 'mode-1', 'value'];
/**
 * Figma exports every FLOAT variable as `$type: "number"` with no unit, in px. Tokens under these path prefixes get
 * a unit; everything else of type `number` stays unitless (scale, opacity…), rounded to 4 decimals.
 *
 * REM_PATHS scale with the user's browser text size (Figma px ÷ 16). PX_PATHS stay fixed: hairlines and shadows
 * should stay crisp. Values of 1000px or more (e.g. a 9999px "full" radius) stay px.
 */
const REM_PATHS = ['spacing', 'border.radius', 'font.size', 'font.line height'];
const PX_PATHS = ['border.width', 'drop shadow.blur', 'drop shadow.x', 'drop shadow.y'];
const MS_PATHS = ['duration'];
const ROOT_FONT_SIZE = 16;
const under = (prefixes: string[], p: string[]) => prefixes.some((prefix) => `${p.join('.')}.`.startsWith(`${prefix}.`));

/** Map Figma's loose types onto DTCG ones: lengths and durations exported as numbers, font families as strings. */
function cssTypeOf(t: { type: string | undefined; path: string[]; extensions?: { [k: string]: unknown } }) {
  if (t.type === 'number' && under(REM_PATHS, t.path)) return 'remDimension';
  if (t.type === 'number' && under(PX_PATHS, t.path)) return 'dimension';
  if (t.type === 'number' && under(MS_PATHS, t.path)) return 'duration';
  const scopes = t.extensions?.['com.figma.scopes'];
  const isFamilyPath = t.path[0] === 'font' && t.path[1] === 'family';
  if (t.type === 'string' && (isFamilyPath || (Array.isArray(scopes) && scopes.includes('FONT_FAMILY')))) return 'fontFamily';
  return t.type;
}

type Json = null | boolean | number | string | Json[] | { [k: string]: Json };
type JsonObject = { [k: string]: Json };

interface RawToken {
  collection: string;
  mode: string;
  path: string[];
  type: string | undefined;
  value: Json;
  description?: string;
  extensions?: JsonObject;
}

// ---------------------------------------------------------------------------------------------
// 1. Load files
// ---------------------------------------------------------------------------------------------

const isObject = (v: Json | undefined): v is JsonObject =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

function loadFiles(): { collection: string; mode: string; json: JsonObject }[] {
  const out: { collection: string; mode: string; json: JsonObject }[] = [];
  const read = (file: string) => JSON.parse(fs.readFileSync(file, 'utf8')) as JsonObject;
  const strip = (f: string) => f.replace(/\.tokens\.json$|\.json$/, '');

  for (const entry of fs.readdirSync(TOKENS_DIR, { withFileTypes: true })) {
    const full = path.join(TOKENS_DIR, entry.name);
    if (entry.isDirectory()) {
      for (const f of fs.readdirSync(full).filter((f) => f.endsWith('.tokens.json'))) {
        out.push({ collection: entry.name, mode: strip(f), json: read(path.join(full, f)) });
      }
    } else if (entry.name.endsWith('.tokens.json')) {
      out.push({ collection: strip(entry.name), mode: 'default', json: read(full) });
    }
  }
  if (out.length === 0) throw new Error(`No token files found in ${TOKENS_DIR}`);
  return out;
}

function flatten(json: JsonObject, collection: string, mode: string): RawToken[] {
  const tokens: RawToken[] = [];
  const walk = (node: JsonObject, trail: string[], inheritedType?: string) => {
    const type = typeof node.$type === 'string' ? node.$type : inheritedType;
    if ('$value' in node) {
      tokens.push({
        collection,
        mode,
        path: trail,
        type,
        value: node.$value as Json,
        description: typeof node.$description === 'string' ? node.$description : undefined,
        extensions: isObject(node.$extensions) ? node.$extensions : undefined,
      });
      return;
    }
    for (const [key, child] of Object.entries(node)) {
      if (key.startsWith('$') || !isObject(child)) continue;
      walk(child, [...trail, key], type);
    }
  };
  walk(json, []);
  return tokens;
}

// ---------------------------------------------------------------------------------------------
// 2. Index + alias resolution
// ---------------------------------------------------------------------------------------------

const files = loadFiles();
const raw = files.flatMap((f) => flatten(f.json, f.collection, f.mode));

const modesByCollection = new Map<string, string[]>();
for (const f of files) {
  const modes = modesByCollection.get(f.collection) ?? [];
  modes.push(f.mode);
  modesByCollection.set(f.collection, modes);
}
const CONFIG_FILE = path.join(TOKENS_DIR, 'collections.json');
const config = (fs.existsSync(CONFIG_FILE) ? JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8')) : {}) as Record<
  string,
  { modes?: string[]; defaultMode?: string; media?: Record<string, string> }
>;
for (const [collection, cfg] of Object.entries(config)) {
  if (collection.startsWith('$')) continue;
  const found = modesByCollection.get(collection);
  if (!found) throw new Error(`collections.json: no token files for collection "${collection}"`);
  if (cfg.defaultMode && cfg.media?.[cfg.defaultMode]) {
    throw new Error(`collections.json: "${collection}" default mode can't have a media query (it's the mobile-first base)`);
  }
  for (const m of [...(cfg.modes ?? []), ...(cfg.defaultMode ? [cfg.defaultMode] : []), ...Object.keys(cfg.media ?? {})]) {
    if (!found.includes(m)) throw new Error(`collections.json: "${collection}" has no mode "${m}" (found: ${found.join(', ')})`);
  }
}

const defaultMode = (collection: string) => {
  const modes = modesByCollection.get(collection)!;
  return (
    config[collection]?.defaultMode ??
    modes.find((m) => DEFAULT_MODE_NAMES.includes(m.toLowerCase())) ??
    [...modes].sort()[0]!
  );
};

// Order each collection's modes: collections.json order, else default first then alphabetical.
for (const [collection, modes] of modesByCollection) {
  const order = config[collection]?.modes ?? [defaultMode(collection)];
  const rank = (m: string) => (order.includes(m) ? order.indexOf(m) : order.length);
  modes.sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
}

const key = (collection: string, mode: string, p: string) => `${collection}::${mode}::${p}`;
const index = new Map(raw.map((t) => [key(t.collection, t.mode, t.path.join('.')), t]));

const ALIAS = /^\{([^}]+)\}$/;

function lookup(ref: string, from: { collection: string; mode: string }): RawToken | undefined {
  const own = index.get(key(from.collection, from.mode, ref));
  if (own) return own;
  for (const collection of modesByCollection.keys()) {
    if (collection === from.collection) continue;
    const modes = modesByCollection.get(collection)!;
    const mode = modes.includes(from.mode) ? from.mode : defaultMode(collection);
    const hit = index.get(key(collection, mode, ref));
    if (hit) return hit;
  }
  return undefined;
}

/** Resolve a value (recursively for composites), returning the literal plus the alias chain. */
function resolve(token: RawToken, value: Json = token.value, seen = new Set<string>()): { value: Json; aliasOf?: string[] } {
  if (value === token.value) {
    // Figma exports cross-collection aliases as resolved literals plus `com.figma.aliasData`.
    const figma = token.extensions?.['com.figma.aliasData'];
    if (isObject(figma) && typeof figma.targetVariableName === 'string') {
      const setName = String(figma.targetVariableSetName ?? '');
      const target = [...modesByCollection.keys()].find((c) => c.toLowerCase() === setName.toLowerCase()) ?? setName;
      return { value, aliasOf: [`${target}/${figma.targetVariableName.split('/').join('.')}`] };
    }
  }
  if (typeof value === 'string') {
    const m = ALIAS.exec(value);
    if (!m) return { value };
    const ref = m[1]!;
    const id = `${token.collection}/${token.mode}/${ref}`;
    if (seen.has(id)) throw new Error(`Circular alias at ${token.path.join('.')} → ${ref}`);
    seen.add(id);
    const target = lookup(ref, token);
    if (!target) throw new Error(`Unresolved alias {${ref}} in ${token.collection}/${token.mode}: ${token.path.join('.')}`);
    const inner = resolve(target, target.value, seen);
    return { value: inner.value, aliasOf: [`${target.collection}/${ref}`, ...(inner.aliasOf ?? [])] };
  }
  if (Array.isArray(value)) return { value: value.map((v) => resolve(token, v, seen).value) };
  if (isObject(value)) {
    return { value: Object.fromEntries(Object.entries(value).map(([k, v]) => [k, resolve(token, v, seen).value])) };
  }
  return { value };
}

// ---------------------------------------------------------------------------------------------
// 3. DTCG value → CSS string
// ---------------------------------------------------------------------------------------------

const round = (n: number) => Math.round(n * 1000) / 1000;

function dimension(v: Json): string {
  if (typeof v === 'number') return `${v}px`;
  if (typeof v === 'string') return v;
  if (isObject(v) && typeof v.value === 'number') return `${round(v.value)}${String(v.unit ?? 'px')}`;
  throw new Error(`Bad dimension: ${JSON.stringify(v)}`);
}

function color(v: Json): string {
  if (typeof v === 'string') return v;
  if (!isObject(v)) throw new Error(`Bad color: ${JSON.stringify(v)}`);
  const alpha = typeof v.alpha === 'number' ? v.alpha : 1;
  if (typeof v.hex === 'string' && (v.colorSpace === 'srgb' || v.colorSpace === undefined)) {
    if (alpha >= 1) return v.hex;
    const a = Math.round(alpha * 255).toString(16).padStart(2, '0');
    return `${v.hex.slice(0, 7)}${a}`;
  }
  const comps = (v.components as Json[]).map((c) => (c === 'none' ? 'none' : round(Number(c))));
  const space = String(v.colorSpace ?? 'srgb');
  const a = alpha < 1 ? ` / ${round(alpha)}` : '';
  if (['srgb', 'srgb-linear', 'display-p3', 'a98-rgb', 'prophoto-rgb', 'rec2020', 'xyz-d50', 'xyz-d65'].includes(space)) {
    return `color(${space} ${comps.join(' ')}${a})`;
  }
  return `${space}(${comps.join(' ')}${a})`; // hsl, hwb, lab, lch, oklab, oklch
}

function fontFamily(v: Json): string {
  const list = Array.isArray(v) ? v : [v];
  return list.map((f) => (/\s/.test(String(f)) ? `"${String(f)}"` : String(f))).join(', ');
}

function duration(v: Json): string {
  if (isObject(v)) return `${v.value}${String(v.unit ?? 'ms')}`;
  return typeof v === 'number' ? `${v}ms` : String(v);
}

function shadow(v: Json): string {
  const one = (s: JsonObject) =>
    [s.inset ? 'inset' : '', dimension(s.offsetX ?? 0), dimension(s.offsetY ?? 0), dimension(s.blur ?? 0), dimension(s.spread ?? 0), color(s.color ?? '#000')]
      .filter(Boolean)
      .join(' ');
  return (Array.isArray(v) ? v : [v]).map((s) => one(s as JsonObject)).join(', ');
}

/** Returns one or more [suffix, cssValue] pairs (composites like typography expand). */
function toCss(type: string | undefined, v: Json): [string, string][] {
  switch (type) {
    case 'color': return [['', color(v)]];
    case 'dimension': return [['', dimension(v)]];
    case 'fontFamily': return [['', fontFamily(v)]];
    case 'fontWeight': return [['', String(v)]];
    case 'duration': return [['', duration(v)]];
    case 'cubicBezier': return [['', `cubic-bezier(${(v as number[]).join(', ')})`]];
    case 'number': return [['', String(typeof v === 'number' ? Math.round(v * 1e4) / 1e4 : v)]];
    case 'remDimension': {
      const px = Number(v);
      if (!Number.isFinite(px)) throw new Error(`Bad length: ${JSON.stringify(v)}`);
      return [['', px === 0 ? '0' : px >= 1000 ? `${px}px` : `${Math.round((px / ROOT_FONT_SIZE) * 1e4) / 1e4}rem`]];
    }
    case 'shadow': return [['', shadow(v)]];
    case 'typography': {
      const t = v as JsonObject;
      const pairs: [string, string][] = [];
      if (t.fontFamily !== undefined) pairs.push(['FontFamily', fontFamily(t.fontFamily)]);
      if (t.fontSize !== undefined) pairs.push(['FontSize', dimension(t.fontSize)]);
      if (t.fontWeight !== undefined) pairs.push(['FontWeight', String(t.fontWeight)]);
      if (t.lineHeight !== undefined) pairs.push(['LineHeight', typeof t.lineHeight === 'number' ? String(t.lineHeight) : dimension(t.lineHeight)]);
      if (t.letterSpacing !== undefined) pairs.push(['LetterSpacing', dimension(t.letterSpacing)]);
      return pairs;
    }
    default:
      if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') return [['', String(v)]];
      throw new Error(`Unsupported token $type "${type}" with value ${JSON.stringify(v)}`);
  }
}

// ---------------------------------------------------------------------------------------------
// 4. Build the model
// ---------------------------------------------------------------------------------------------

const camel = (parts: string[]) =>
  parts
    .flatMap((p) => p.split(/[^a-zA-Z0-9]+/).filter(Boolean))
    .map((p, i) => (i === 0 ? p.charAt(0).toLowerCase() + p.slice(1) : p.charAt(0).toUpperCase() + p.slice(1)))
    .join('');
const ident = (s: string) => {
  const c = camel([s]);
  return /^[0-9]/.test(c) ? `_${c}` : c;
};

interface CatalogueEntry {
  id: string; // "colorTheme/color.background-inverse"
  collection: string;
  path: string;
  type: string | undefined;
  description?: string;
  stylex: { file: string; export: string; key: string };
  modes: Record<string, { value: string; px?: string; aliasOf?: string[] }>;
  extensions?: JsonObject;
}

const catalogue: CatalogueEntry[] = [];
// collection → group → key → mode → css
const vars = new Map<string, Map<string, Map<string, Map<string, string>>>>();

for (const t of raw) {
  if (t.path.length < 2) throw new Error(`Token "${t.path.join('.')}" must sit inside a group (e.g. color.x)`);
  const [group, ...rest] = t.path as [string, ...string[]];
  const resolved = resolve(t);
  const cssType = cssTypeOf(t);
  for (const [suffix, css] of toCss(cssType, resolved.value)) {
    const varKey = camel(rest) + suffix;
    const g = vars.get(t.collection) ?? new Map();
    vars.set(t.collection, g);
    const k = g.get(group) ?? new Map();
    g.set(group, k);
    const m = k.get(varKey) ?? new Map();
    k.set(varKey, m);
    m.set(t.mode, css);

    const id = `${t.collection}/${t.path.join('.')}${suffix ? `#${suffix}` : ''}`;
    let entry = catalogue.find((e) => e.id === id);
    if (!entry) {
      entry = {
        id,
        collection: t.collection,
        path: t.path.join('.'),
        type: t.type,
        description: t.description,
        stylex: { file: `src/tokens/${t.collection}.stylex.ts`, export: ident(group), key: varKey },
        modes: {},
        extensions: t.extensions,
      };
      catalogue.push(entry);
    }
    // Keep Figma's px next to converted rem values so docs can show both.
    const px = cssType === 'remDimension' && css.endsWith('rem') ? `${resolved.value}px` : undefined;
    entry.modes[t.mode] = { value: css, ...(px ? { px } : {}), ...(resolved.aliasOf ? { aliasOf: resolved.aliasOf } : {}) };
  }
}

// ---------------------------------------------------------------------------------------------
// 5. Emit
// ---------------------------------------------------------------------------------------------

const HEADER = `// AUTO-GENERATED by scripts/build-tokens.ts from /tokens — do not edit by hand.\n`;
const q = JSON.stringify;

fs.rmSync(OUT_DIR, { recursive: true, force: true });
fs.mkdirSync(OUT_DIR, { recursive: true });

const themeLines: string[] = [];
const themeImports: string[] = [];
// collection → mode → createTheme consts
const themeEntries = new Map<string, Map<string, string[]>>();
const mediaOf = (collection: string) => config[collection]?.media;
// Responsive collections (with `media`) switch by viewport, so they never become ThemeProvider themes.
const isThemed = (collection: string) => modesByCollection.get(collection)!.length > 1 && !mediaOf(collection);

for (const [collection, groups] of vars) {
  const dm = defaultMode(collection);
  const lines = [HEADER, `import * as stylex from '@stylexjs/stylex';\n`];
  const themedExports: string[] = [];
  for (const [group, keys] of groups) {
    const name = ident(group);
    lines.push(`export const ${name} = stylex.defineVars({`);
    const media = mediaOf(collection);
    for (const [k, modes] of keys) {
      const v = modes.get(dm) ?? [...modes.values()][0]!;
      const responsive = Object.entries(media ?? {}).filter(([mode]) => modes.has(mode) && modes.get(mode) !== v);
      if (responsive.length === 0) {
        lines.push(`  ${q(k)}: ${q(v)},`);
        continue;
      }
      const conds = responsive.map(([mode, query]) => `${q(`@media ${query}`)}: ${q(modes.get(mode))}`);
      lines.push(`  ${q(k)}: { default: ${q(v)}, ${conds.join(', ')} },`);
    }
    lines.push(`});\n`);

    // Every mode (default included) gets a theme, so a nested provider can switch back to the default.
    if (!isThemed(collection)) continue;
    for (const mode of modesByCollection.get(collection)!) {
      const overrides = [...keys].filter(([, m]) => m.has(mode)).map(([k, m]) => `  ${q(k)}: ${q(m.get(mode))},`);
      if (overrides.length === 0) continue;
      if (!themedExports.includes(name)) themedExports.push(name);
      const alias = `${ident(collection)}_${name}`;
      const themeConst = `${ident(collection)}_${name}_${ident(mode)}`;
      themeLines.push(`const ${themeConst} = stylex.createTheme(${alias}, {\n${overrides.join('\n')}\n});\n`);
      const byMode = themeEntries.get(collection) ?? new Map<string, string[]>();
      themeEntries.set(collection, byMode);
      byMode.set(mode, [...(byMode.get(mode) ?? []), themeConst]);
    }
  }
  fs.writeFileSync(path.join(OUT_DIR, `${collection}.stylex.ts`), lines.join('\n'));
  if (themedExports.length === 0) continue;
  themeImports.push(
    `import { ${themedExports.map((n) => `${n} as ${ident(collection)}_${n}`).join(', ')} } from './${collection}.stylex';`,
  );
}

// Each multi-mode collection is an independent theme axis (e.g. colorTheme: light demo/dark demo, radius: none…large).
// Single-mode collections are always on and have no theme.
const themed = [...modesByCollection.keys()].filter(isThemed);
const themesFile = [
  HEADER,
  `import * as stylex from '@stylexjs/stylex';`,
  ...themeImports,
  '',
  ...themeLines,
  `/** Modes of each multi-mode collection, in Figma order. */`,
  `export const collectionModes = {`,
  ...themed.map((c) => `  ${q(c)}: ${q(modesByCollection.get(c))},`),
  `} as const;\n`,
  `export type ThemeCollection = keyof typeof collectionModes;`,
  `export type ModeOf<C extends ThemeCollection> = (typeof collectionModes)[C][number];`,
  `/** A mode per collection. Collections left out inherit from the parent provider (or use the default). */`,
  `export type Modes = { [C in ThemeCollection]?: ModeOf<C> };\n`,
  `/** Default mode per collection. Its values are baked into the StyleX vars. */`,
  `export const defaultModes = {`,
  ...themed.map((c) => `  ${q(c)}: ${q(defaultMode(c))},`),
  `} as const satisfies Required<Modes>;\n`,
  `/** Theme overrides per collection and mode. Spread into \`stylex.props(...)\` on a container. */`,
  `export const themes: { [C in ThemeCollection]: Record<ModeOf<C>, readonly stylex.Theme<any>[]> } = {`,
  ...themed.map(
    (c) =>
      `  ${q(c)}: {\n${modesByCollection
        .get(c)!
        .map((m) => `    ${q(m)}: [${(themeEntries.get(c)?.get(m) ?? []).join(', ')}],`)
        .join('\n')}\n  },`,
  ),
  `};\n`,
].join('\n');
fs.writeFileSync(path.join(OUT_DIR, 'themes.ts'), themesFile);

fs.writeFileSync(
  path.join(OUT_DIR, 'tokens.json'),
  JSON.stringify(
    {
      $generated: 'scripts/build-tokens.ts',
      collections: Object.fromEntries([...modesByCollection].map(([c, modes]) => [c, { modes, defaultMode: defaultMode(c) }])),
      tokens: catalogue,
    },
    null,
    2,
  ),
);

console.log(
  `✓ tokens: ${catalogue.length} tokens · ${modesByCollection.size} collections (${[...modesByCollection]
    .map(([c, m]) => `${c}: ${m.join('/')}`)
    .join(', ')}) → src/tokens/`,
);
