import { type ColorFormat, parseThemisConfig, type ThemeColors, type ThemisConfig } from 'themis-ds';

/**
 * The tool keeps your work in this browser between visits: the theme file and which theme was open.
 * Storage can be missing or full (private windows, blocked site data), so every read and write is allowed to fail;
 * the tool then just starts fresh.
 */
const KEY = 'themis-config:v1';

interface Saved {
  config: ThemisConfig;
  selected: string;
}

/** The saved work, if there is any and it's still a valid theme file. */
export function loadSaved(): Saved | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as { config?: unknown; selected?: unknown };
    const { config } = parseThemisConfig(data.config);
    if (!config) return null;
    const names = Object.keys(config.themes);
    const selected = typeof data.selected === 'string' && names.includes(data.selected) ? data.selected : names[0]!;
    return { config, selected };
  } catch {
    return null;
  }
}

export function save(saved: Saved) {
  try {
    localStorage.setItem(KEY, JSON.stringify(saved));
  } catch {
    // Not saved this time; the work is still on screen.
  }
}

/** The sidebar sections that can be closed. */
export type SectionId = 'colors' | 'borders' | 'fonts';
const SECTIONS_KEY = 'themis-config:collapsed';

/** Which sidebar sections were closed last time (none on a first visit). */
export function loadCollapsed(): Set<SectionId> {
  try {
    const data = JSON.parse(localStorage.getItem(SECTIONS_KEY) ?? '[]') as unknown;
    return new Set(Array.isArray(data) ? data.filter((id): id is SectionId => ['colors', 'borders', 'fonts'].includes(id)) : []);
  } catch {
    return new Set();
  }
}

export function saveCollapsed(collapsed: ReadonlySet<SectionId>) {
  try {
    localStorage.setItem(SECTIONS_KEY, JSON.stringify([...collapsed]));
  } catch {
    // Not remembered this time.
  }
}

/** The color code each field shows (HEX, RGB…), per theme. A field that isn't listed shows HEX. */
export type ColorFormats = Partial<Record<keyof ThemeColors, ColorFormat>>;
const FORMATS_KEY = 'themis-config:color-formats';
const FORMAT_VALUES: readonly string[] = ['hex', 'rgb', 'hsl', 'hsb'];
const COLOR_KEYS: readonly string[] = ['brand', 'text', 'background', 'error', 'warning', 'success'];

/** Each theme's color codes from last time, by theme name. */
export function loadColorFormats(): Record<string, ColorFormats> {
  try {
    const data = JSON.parse(localStorage.getItem(FORMATS_KEY) ?? '{}') as unknown;
    if (!data || typeof data !== 'object') return {};
    return Object.fromEntries(
      Object.entries(data as Record<string, unknown>).map(([theme, formats]) => [
        theme,
        Object.fromEntries(
          Object.entries(formats && typeof formats === 'object' ? formats : {}).filter(
            ([key, format]) => COLOR_KEYS.includes(key) && FORMAT_VALUES.includes(format as string),
          ),
        ) as ColorFormats,
      ]),
    );
  } catch {
    return {};
  }
}

export function saveColorFormats(formats: Record<string, ColorFormats>) {
  try {
    localStorage.setItem(FORMATS_KEY, JSON.stringify(formats));
  } catch {
    // Not remembered this time.
  }
}

const SHARE_KEY = 'themis-config:preview-share';

/** On tablet, how much of the height the preview had last time (0.4 on a first visit), kept within `min` and `max`. */
export function loadPreviewShare(min: number, max: number, fallback = 0.4): number {
  try {
    const value = Number(localStorage.getItem(SHARE_KEY));
    return localStorage.getItem(SHARE_KEY) !== null && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;
  } catch {
    return fallback;
  }
}

export function savePreviewShare(share: number) {
  try {
    localStorage.setItem(SHARE_KEY, String(Math.round(share * 1000) / 1000));
  } catch {
    // Not remembered this time.
  }
}
