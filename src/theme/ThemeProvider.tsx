import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';

import { color } from '../tokens/colorTheme.stylex';
import { themes, type Modes, type ThemeCollection } from '../tokens/themes';
import { font } from '../tokens/fontTheme.stylex';

export interface ThemeProviderProps {
  /**
   * Mode per Figma variable collection, e.g. `{ colorTheme: 'dark demo', radius: 'small' }`.
   * Collections left out inherit from the parent provider, or use their default mode at the root.
   */
  modes?: Modes;
  children: ReactNode;
  /** Layout-only StyleX overrides for the wrapper element. */
  xstyle?: stylex.StyleXStyles;
}

/**
 * Applies Themis token modes (e.g. colour theme, font theme, radius and border width severity) to everything inside it.
 * Each collection is switched independently. Providers can be nested; the innermost one wins per collection.
 */
export function ThemeProvider({ modes = {}, children, xstyle }: ThemeProviderProps) {
  const entries = Object.entries(modes).filter(([, mode]) => mode !== undefined) as [ThemeCollection, string][];
  const overrides = entries.flatMap(([collection, mode]) => (themes[collection] as Record<string, readonly stylex.Theme<any>[]>)[mode] ?? []);
  const dataAttrs = Object.fromEntries(entries.map(([collection, mode]) => [`data-themis-${collection}`, mode]));
  return (
    <div {...dataAttrs} {...stylex.props(...overrides, styles.root, xstyle)}>
      {children}
    </div>
  );
}

const styles = stylex.create({
  root: {
    backgroundColor: color.background,
    color: color.text,
    fontFamily: font.familyBody,
  },
});
