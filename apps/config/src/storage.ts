import { parseThemisConfig, type ThemisConfig } from 'themis-ds';

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
