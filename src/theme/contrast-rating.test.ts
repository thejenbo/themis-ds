import { readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { contrastLevel, RATED_PAIRS, rateThemeColors, suggestPassingColor } from './contrast-rating';

const pairsFile = JSON.parse(readFileSync(path.resolve(__dirname, '../../tokens/contrast-pairs.json'), 'utf8')) as {
  pairs: { id: string; text: string; surface: string; overlay?: string; level?: string }[];
};
// `colorTheme/color.state.error-tint` → `stateErrorTint`
const varName = (id: string) => id.replace(/^colorTheme\/color\./, '').replace(/[.-](\w)/g, (_, c: string) => c.toUpperCase());

describe('RATED_PAIRS', () => {
  it('matches tokens/contrast-pairs.json', () => {
    for (const pairs of Object.values(RATED_PAIRS)) {
      for (const pair of pairs) {
        const source = pairsFile.pairs.find((p) => p.id === pair.id);
        expect(source, pair.id).toBeDefined();
        expect(varName(source!.text), `${pair.id} text`).toBe(pair.text);
        expect(varName(source!.surface), `${pair.id} surface`).toBe(pair.surface);
        expect(source!.overlay ? varName(source!.overlay) : undefined, `${pair.id} overlay`).toBe(pair.overlay);
        // Advisory pairs (disabled text) are shown but not rated.
        expect(source!.level === 'advisory', `${pair.id} advisory`).toBe(pair.advisory === true);
      }
    }
  });
});

describe('rateThemeColors', () => {
  it('rates the light demo theme', () => {
    const r = rateThemeColors({ brand: '#7406EB', text: '#000000', background: '#FFFFFF', error: '#AF0E0E', warning: '#A35104', success: '#2C6E2F' });
    expect(r.text.level).toBe('AAA');
    expect(r.brand.level).toBe('AA');
    for (const rating of Object.values(r)) expect(rating.ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('flags a colour that fails, and names the pair', () => {
    const r = rateThemeColors({ brand: '#7406EB', text: '#000000', background: '#FFFFFF', error: '#AF0E0E', warning: '#FFD000', success: '#2C6E2F' });
    expect(r.warning.level).toBe('Fail');
    expect(r.warning.worstPair).toMatch(/warning/);
  });

  it('uses the WCAG thresholds for normal-size text (no "AA Large": every rated pair has normal-size text)', () => {
    expect([7, 6.99, 4.5, 4.49, 3, 2.99].map(contrastLevel)).toEqual(['AAA', 'AA', 'AA', 'Fail', 'Fail', 'Fail']);
  });

  it('lists every check, but leaves disabled text out of the rating (WCAG exempts it)', () => {
    // A mid-grey text colour: the disabled grey (worked out from text and background) is lower than text itself.
    const r = rateThemeColors({ brand: '#7406EB', text: '#595959', background: '#FFFFFF', error: '#AF0E0E', warning: '#A35104', success: '#2C6E2F' });
    const disabled = r.background.checks.find((c) => c.id === 'disabled')!;
    expect(disabled.advisory).toBe(true);
    expect(r.background.worstPair).toBe('text');
    expect(r.background.checks.map((c) => c.id)).toEqual(['text', 'disabled']);
    // Each check carries the colours it measured, with hover tints composited.
    const tint = r.brand.checks.find((c) => c.id === 'text-brand-on-brand-tint')!;
    expect(tint.textHex).toBe('#7406EB');
    expect(tint.surfaceHex).toMatch(/^#[0-9A-F]{6}$/);
  });
});

describe('suggestPassingColor', () => {
  const base = { brand: '#7406EB', text: '#000000', background: '#FFFFFF', error: '#AF0E0E', warning: '#A35104', success: '#2C6E2F' };

  it('finds the nearest shade of the same hue that reaches AA', () => {
    const colors = { ...base, warning: '#E89A2C' };
    expect(rateThemeColors(colors).warning.level).toBe('Fail');
    const fix = suggestPassingColor(colors, 'warning')!;
    expect(rateThemeColors({ ...colors, warning: fix }).warning.ratio).toBeGreaterThanOrEqual(4.5);
    // Darker, and only just: a step lighter fails again.
    expect(fix).not.toBe('#E89A2C');
  });

  it('lightens on a dark background', () => {
    const colors = { ...base, text: '#FFFFFF', background: '#000000', brand: '#5A2BA8' };
    const fix = suggestPassingColor(colors, 'brand')!;
    expect(rateThemeColors({ ...colors, brand: fix }).brand.level).not.toBe('Fail');
  });

  it('gives up when no shade gets there', () => {
    // On a mid-grey background, brand can't reach 4.5:1 with both the page and white text at once.
    expect(suggestPassingColor({ ...base, background: '#777777', text: '#000000' }, 'brand')).toBeNull();
  });
});
