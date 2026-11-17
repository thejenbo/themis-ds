import { readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { contrastLevel, RATED_PAIRS, rateThemeColors } from './contrast-rating';

const pairsFile = JSON.parse(readFileSync(path.resolve(__dirname, '../../tokens/contrast-pairs.json'), 'utf8')) as {
  pairs: { id: string; text: string; surface: string; overlay?: string }[];
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

  it('uses the WCAG thresholds', () => {
    expect([7, 6.99, 4.5, 4.49, 3, 2.99].map(contrastLevel)).toEqual(['AAA', 'AA', 'AA', 'AA Large', 'AA Large', 'Fail']);
  });
});
