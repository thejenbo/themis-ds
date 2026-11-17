import * as stylex from '@stylexjs/stylex';
import { type CSSProperties, type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { UNSAFE_PortalProvider } from 'react-aria';

import { color } from '../tokens/colorTheme.stylex';
import { iconStyle } from './icon-style.stylex';
import { themes, type Modes, type ThemeCollection } from '../tokens/themes';
import { font } from '../tokens/fontTheme.stylex';
import { googleFontsHref, type ThemeSettings, themeVariables } from './theme-config';

export interface ThemeProviderProps {
  /**
   * Mode per Figma variable collection, e.g. `{ colorTheme: 'dark demo', radius: 'small' }`.
   * Collections left out inherit from the parent provider, or use their default mode at the root.
   */
  modes?: Modes;
  /**
   * A theme from a Themis theme file (`themis.theme.json`, made with the Themis config tool): its six colours (every
   * other colour is worked out from them), border width, radius and fonts. Use `modes` to override any of its
   * collections, e.g. `shadows`.
   */
  theme?: ThemeSettings;
  /**
   * Load the theme's fonts from Google Fonts (a stylesheet link in the page head, added once). Turn off when your app
   * hosts the fonts itself.
   * @default true
   */
  loadFonts?: boolean;
  children: ReactNode;
  /** Layout-only StyleX overrides for the wrapper element. */
  xstyle?: stylex.StyleXStyles;
}

/**
 * Applies Themis token modes (e.g. colour theme, font theme, radius and border width severity) to everything inside it.
 * Each collection is switched independently. Providers can be nested; the innermost one wins per collection.
 *
 * Overlays opened inside it (Modal, and later popovers and tooltips) are rendered into this provider's element
 * rather than at the end of <body>, so they keep its theme.
 *
 * With `theme`, it applies a theme from a Themis theme file: the colours and fonts as CSS variables on its element, and
 * the border width and radius as modes.
 */
export function ThemeProvider({ modes: modesProp = {}, theme, loadFonts = true, children, xstyle }: ThemeProviderProps) {
  const modes: Modes = { borderWidth: theme?.borderWidth, radius: theme?.radius, ...withoutUndefined(modesProp) };
  const themeStyle = useMemo(() => (theme ? (themeVariables(theme) as CSSProperties) : undefined), [theme]);
  const fontsHref = theme && loadFonts ? googleFontsHref(theme) : null;
  useEffect(() => {
    if (fontsHref) addStylesheet(fontsHref);
  }, [fontsHref]);
  const entries = Object.entries(modes).filter(([, mode]) => mode !== undefined) as [ThemeCollection, string][];
  const overrides = entries.flatMap(([collection, mode]) => (themes[collection] as Record<string, readonly stylex.Theme<any>[]>)[mode] ?? []);
  // Icons draw sharp corners with radius `none` (see icon-style.stylex.ts). Set both ways, so nested providers can
  // turn it back off.
  if (modes.radius !== undefined) overrides.push(modes.radius === 'none' ? sharpIcons : roundIcons);
  const dataAttrs = Object.fromEntries(entries.map(([collection, mode]) => [`data-themis-${collection.toLowerCase()}`, mode]));
  // State, not a ref: overlays that are open on the first render (e.g. `defaultOpen`) render nothing until the
  // container exists, and re-render into it once it does.
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const getContainer = useCallback(() => container, [container]);
  return (
    <div ref={setContainer} data-themis="" {...dataAttrs} {...stylex.props(...overrides, styles.root, xstyle)} style={themeStyle}>
      <UNSAFE_PortalProvider getContainer={getContainer}>{children}</UNSAFE_PortalProvider>
    </div>
  );
}

const withoutUndefined = (modes: Modes): Modes => Object.fromEntries(Object.entries(modes).filter(([, v]) => v !== undefined));

/** Adds a stylesheet link (and Google Fonts' preconnects) to the page head, once per URL. */
function addStylesheet(href: string) {
  if (typeof document === 'undefined' || document.querySelector(`link[data-themis-fonts="${CSS.escape(href)}"]`)) return;
  for (const origin of ['https://fonts.googleapis.com', 'https://fonts.gstatic.com']) {
    if (document.querySelector(`link[rel="preconnect"][href="${origin}"]`)) continue;
    const pre = document.createElement('link');
    pre.rel = 'preconnect';
    pre.href = origin;
    if (origin.includes('gstatic')) pre.crossOrigin = '';
    document.head.appendChild(pre);
  }
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  link.dataset.themisFonts = href;
  document.head.appendChild(link);
}

const sharpIcons = stylex.createTheme(iconStyle, { join: 'miter', cap: 'butt', dotCap: 'square', round: 'none', sharp: 'inline' });
const roundIcons = stylex.createTheme(iconStyle, { join: 'round', cap: 'round', dotCap: 'round', round: 'inline', sharp: 'none' });

const styles = stylex.create({
  root: {
    backgroundColor: color.background,
    color: color.text,
    fontFamily: font.familyBody,
  },
});
