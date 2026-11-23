import { describe, expect, it } from 'vitest';

import { color } from '../tokens/colorTheme.stylex';
import { googleFontsHref, parseThemisConfig, type ThemeSettings, themeVariables } from './theme-config';

const light: ThemeSettings = {
  colors: { brand: '#7406EB', text: '#000000', background: '#FFFFFF', error: '#AF0E0E', warning: '#A35104', success: '#2C6E2F' },
  borderWidth: 'large',
  radius: 'none',
  fonts: { heading: 'Playfair Display', body: { family: 'Fredoka One', weights: [400] } },
};

describe('parseThemisConfig', () => {
  it('accepts a valid file', () => {
    const { config, errors } = parseThemisConfig({ version: 1, themes: { light } });
    expect(errors).toEqual([]);
    expect(config?.themes.light?.radius).toBe('none');
  });

  it('reports every problem, with where it is', () => {
    const { config, errors } = parseThemisConfig({
      version: 2,
      theme: {},
      themes: { dark: { colors: { ...light.colors, brand: 'purple' }, radius: 'huge', color: {} } },
    });
    expect(config).toBeNull();
    expect(errors).toEqual(
      expect.arrayContaining([
        '"version" must be 1.',
        'Unknown key "theme".',
        'themes.dark: unknown key "color".',
        'themes.dark.colors.brand must be a hex color like "#7406EB" (got "purple").',
        'themes.dark.radius must be one of none, small, medium, large.',
      ]),
    );
  });
});

describe('themeVariables', () => {
  it('sets every color token and the fonts', () => {
    const vars = themeVariables(light);
    const brandProperty = /var\((--[^)]+)\)/.exec(color.brand as unknown as string)![1]!;
    expect(vars[brandProperty]).toBe('#7406EB');
    expect(Object.keys(vars)).toHaveLength(27 + 2);
    expect(Object.values(vars)).toContain('"Playfair Display"');
  });
});

describe('googleFontsHref', () => {
  it('asks for each family once, with the weights it has', () => {
    expect(googleFontsHref(light)).toBe(
      'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Fredoka+One:wght@400&display=swap',
    );
    expect(googleFontsHref({ colors: light.colors })).toBeNull();
  });
});
