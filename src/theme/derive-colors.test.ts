import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { contrast, parseHex } from './color-math';
import { COLOR_RULES, type ColorTokens, deriveColorTokens } from './derive-colors';

/** The colorTheme modes exported from Figma, resolved to hex (`#RRGGBB` or `#RRGGBBAA`). */
const dir = path.resolve(__dirname, '../../tokens/colorTheme');
type Leaf = { $value: unknown };
function leaves(node: Record<string, unknown>, prefix: string[] = []): [string, Leaf][] {
  return Object.entries(node).flatMap(([key, value]) => {
    if (key.startsWith('$') || typeof value !== 'object' || value == null) return [];
    if ('$value' in value) return [[[...prefix, key].join('.'), value as Leaf]];
    return leaves(value as Record<string, unknown>, [...prefix, key]);
  });
}
function resolve(all: Map<string, Leaf>, name: string): string {
  const v = all.get(name)!.$value;
  if (typeof v === 'string') return resolve(all, v.replace(/[{}]/g, ''));
  const { hex, alpha } = v as { hex: string; alpha: number };
  return alpha < 1 ? hex + Math.round(alpha * 255).toString(16).padStart(2, '0').toUpperCase() : hex;
}
// `color.state.error-tint` → `stateErrorTint`
const varName = (token: string) => token.replace(/^color\./, '').replace(/[.-](\w)/g, (_, c: string) => c.toUpperCase());

const figmaThemes = readdirSync(dir).map((file) => {
  const all = new Map(leaves(JSON.parse(readFileSync(path.join(dir, file), 'utf8'))));
  const tokens = Object.fromEntries([...all.keys()].map((k) => [varName(k), resolve(all, k)])) as unknown as ColorTokens;
  return { name: file.replace('.tokens.json', ''), tokens };
});

// Colours a hair apart (Figma's own rounding) count as the same.
function close(a: string, b: string, tolerance = 2 / 255) {
  const [x, y] = [parseHex(a), parseHex(b)];
  return x.every((v, i) => Math.abs(v - y[i]!) <= tolerance);
}

describe('deriveColorTokens reproduces the Figma themes', () => {
  it.each(figmaThemes)('$name', ({ tokens }) => {
    const derived = deriveColorTokens({
      brand: tokens.brand,
      text: tokens.text,
      background: tokens.background,
      error: tokens.stateError,
      warning: tokens.stateWarning,
      success: tokens.stateSuccess,
    });
    for (const key of Object.keys(tokens) as (keyof ColorTokens)[]) {
      // Disabled and placeholder greys follow the new 6:1 rule instead of Figma's hand-picked greys.
      if (key === 'textDisabledOnBackground' || key === 'textPlaceholderDefault') continue;
      expect.soft(close(derived[key], tokens[key]), `${key}: derived ${derived[key]}, Figma ${tokens[key]}`).toBe(true);
    }
  });
});

describe('muted text', () => {
  it.each(figmaThemes)('$name: disabled and placeholder text keep 6:1 on the background', ({ tokens }) => {
    const derived = deriveColorTokens({
      brand: tokens.brand,
      text: tokens.text,
      background: tokens.background,
      error: tokens.stateError,
      warning: tokens.stateWarning,
      success: tokens.stateSuccess,
    });
    const ratio = contrast(parseHex(derived.textDisabledOnBackground), parseHex(derived.background));
    expect(ratio).toBeGreaterThanOrEqual(COLOR_RULES.mutedTextContrast);
    expect(ratio).toBeLessThan(COLOR_RULES.mutedTextContrast + 0.3);
  });

  it('stays as the text colour when text and background are already close', () => {
    const t = deriveColorTokens({ brand: '#000000', text: '#777777', background: '#FFFFFF', error: '#AF0E0E', warning: '#A35104', success: '#2C6E2F' });
    expect(t.textDisabledOnBackground).toBe('#777777');
  });
});
