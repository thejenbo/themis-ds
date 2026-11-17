import { color } from '../tokens/colorTheme.stylex';
import { font } from '../tokens/fontTheme.stylex';
import { collectionModes, type ModeOf } from '../tokens/themes';
import { parseHex } from './color-math';
import { type ColorTokens, deriveColorTokens, type ThemeColors } from './derive-colors';

export type { ThemeColors } from './derive-colors';

/** The theme file format version this package reads and writes. */
export const THEME_CONFIG_VERSION = 1;

/**
 * A Google Fonts family: its name ("Playfair Display"), or the name with the weights it has. A plain name loads
 * 400, 600 and 700 (the weights Themis uses); give the weights for families that don't have all three.
 */
export type FontChoice = string | { family: string; weights: number[] };

export interface ThemeSettings {
  /** The six colours; every other colour token is worked out from them. */
  colors: ThemeColors;
  /** How heavy borders are across the system. Defaults to `medium`. */
  borderWidth?: ModeOf<'borderWidth'>;
  /** How rounded corners are across the system. Defaults to `medium`. */
  radius?: ModeOf<'radius'>;
  /** Heading and body fonts, from Google Fonts. Defaults to the Themis fonts. */
  fonts?: { heading: FontChoice; body: FontChoice };
}

/** A Themis theme file (`themis.theme.json`): one or more named themes, e.g. `light` and `dark`. */
export interface ThemisConfig {
  $schema?: string;
  version: typeof THEME_CONFIG_VERSION;
  themes: Record<string, ThemeSettings>;
}

export const fontFamily = (choice: FontChoice) => (typeof choice === 'string' ? choice : choice.family);
export const fontWeights = (choice: FontChoice) => (typeof choice === 'string' ? [400, 600, 700] : choice.weights);

const COLOR_KEYS = ['brand', 'text', 'background', 'error', 'warning', 'success'] as const;

/**
 * Checks a theme file (e.g. one read from JSON) and returns it typed, or the problems found. Unknown keys are
 * reported too, so typos don't go unnoticed.
 */
export function parseThemisConfig(value: unknown): { config: ThemisConfig; errors: [] } | { config: null; errors: string[] } {
  const errors: string[] = [];
  const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v != null && !Array.isArray(v);
  if (!isObject(value)) return { config: null, errors: ['The theme file must be a JSON object.'] };
  if (value.version !== THEME_CONFIG_VERSION) errors.push(`"version" must be ${THEME_CONFIG_VERSION}.`);
  for (const key of Object.keys(value)) if (!['$schema', 'version', 'themes'].includes(key)) errors.push(`Unknown key "${key}".`);
  if (!isObject(value.themes) || Object.keys(value.themes).length === 0) {
    errors.push('"themes" must name at least one theme, e.g. { "light": { … } }.');
  } else {
    for (const [name, theme] of Object.entries(value.themes)) {
      const at = `themes.${name}`;
      if (!isObject(theme)) {
        errors.push(`${at} must be an object.`);
        continue;
      }
      for (const key of Object.keys(theme)) if (!['colors', 'borderWidth', 'radius', 'fonts'].includes(key)) errors.push(`${at}: unknown key "${key}".`);
      if (!isObject(theme.colors)) errors.push(`${at}.colors is missing.`);
      else
        for (const key of COLOR_KEYS) {
          const c = theme.colors[key];
          if (typeof c !== 'string') errors.push(`${at}.colors.${key} is missing.`);
          else {
            try {
              parseHex(c);
            } catch {
              errors.push(`${at}.colors.${key} must be a hex colour like "#7406EB" (got "${c}").`);
            }
          }
        }
      for (const [key, modes] of [['borderWidth', collectionModes.borderWidth], ['radius', collectionModes.radius]] as const) {
        if (theme[key] !== undefined && !(modes as readonly unknown[]).includes(theme[key])) errors.push(`${at}.${key} must be one of ${modes.join(', ')}.`);
      }
      if (theme.fonts !== undefined) {
        const fonts = theme.fonts;
        for (const slot of ['heading', 'body'] as const) {
          const f = isObject(fonts) ? fonts[slot] : undefined;
          const ok = typeof f === 'string' ? f.trim() !== '' : isObject(f) && typeof f.family === 'string' && Array.isArray(f.weights) && f.weights.every((w) => typeof w === 'number');
          if (!ok) errors.push(`${at}.fonts.${slot} must be a font name, or { "family": "…", "weights": [400, 700] }.`);
        }
      }
    }
  }
  return errors.length ? { config: null, errors } : { config: value as unknown as ThemisConfig, errors: [] };
}

/** `var(--x1abc)` → `--x1abc`: the CSS custom property behind a StyleX variable. */
const property = (stylexVar: string) => /^var\((--[^,)]+)/.exec(stylexVar)?.[1] ?? stylexVar;

/**
 * The CSS custom properties a theme sets: every colour token, and the heading and body fonts. ThemeProvider applies
 * these inline; they can also be written into a stylesheet.
 */
export function themeVariables(theme: ThemeSettings): Record<string, string> {
  const tokens: ColorTokens = deriveColorTokens(theme.colors);
  const vars: Record<string, string> = {};
  for (const [name, value] of Object.entries(tokens)) vars[property(color[name as keyof ColorTokens] as unknown as string)] = value;
  if (theme.fonts) {
    vars[property(font.familyHeading as unknown as string)] = JSON.stringify(fontFamily(theme.fonts.heading));
    vars[property(font.familyBody as unknown as string)] = JSON.stringify(fontFamily(theme.fonts.body));
  }
  return vars;
}

/** The Google Fonts stylesheet URL for a theme's fonts, or null when it doesn't set any. */
export function googleFontsHref(theme: ThemeSettings): string | null {
  if (!theme.fonts) return null;
  const families = new Map<string, Set<number>>();
  for (const choice of [theme.fonts.heading, theme.fonts.body]) {
    const name = fontFamily(choice);
    families.set(name, new Set([...(families.get(name) ?? []), ...fontWeights(choice)]));
  }
  const params = [...families].map(([name, weights]) => {
    const w = [...weights].sort((a, b) => a - b);
    return `family=${encodeURIComponent(name).replace(/%20/g, '+')}${w.length ? `:wght@${w.join(';')}` : ''}`;
  });
  return `https://fonts.googleapis.com/css2?${params.join('&')}&display=swap`;
}
