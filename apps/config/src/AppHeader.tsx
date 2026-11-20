import * as stylex from '@stylexjs/stylex';
import { useLayoutEffect, useRef, useState } from 'react';
import { VisuallyHidden } from 'react-aria';
import { Link, type LinkRenderProps } from 'react-aria-components';
import { ActionMenu, ActionMenuItem, ActionMenuTrigger, Icon, IconButton } from 'themis-ds';

import { border as borderWidth } from '../../../src/tokens/borderWidth.stylex';
import { color } from '../../../src/tokens/colorTheme.stylex';
import { font as fontTheme } from '../../../src/tokens/fontTheme.stylex';
import { duration, easing } from '../../../src/tokens/motion.stylex';
import { border as radius } from '../../../src/tokens/radius.stylex';
import { spacing } from '../../../src/tokens/spacing.stylex';
import { font } from '../../../src/tokens/typography.stylex';
import { focusRing } from '../../../src/utils/focus-ring';
import { racStyles } from '../../../src/utils/stylex-rac';
import { Logomark } from './illustrations/Logomark';

export type Page = 'simulator' | 'components';
const PAGES: Page[] = ['simulator', 'components'];

/** The full Storybook ("docs" in the header). Set VITE_STORYBOOK_URL once it's hosted; locally it's `npm run storybook`. */
export const STORYBOOK_URL = import.meta.env.VITE_STORYBOOK_URL ?? 'http://localhost:6006';

interface AppHeaderProps {
  page: Page;
  /** Small screens (Figma 2443:14356): a smaller logo, and the links in a menu behind a hamburger button. */
  compact?: boolean;
  /** Desktop, with the sidebar on the left: the page links start 24px after the sidebar's divider. */
  besideSidebar?: boolean;
  /** The brand colour of the theme being edited: the logomark is filled with it. */
  brand?: string;
  /** A colour in the theme fails contrast: the logomark's scales tip. */
  isUnbalanced?: boolean;
}

/** The logo and the page links (Figma 2422:35488). Sticks to the top of the window. */
export function AppHeader({ page, compact = false, besideSidebar = false, brand, isUnbalanced = false }: AppHeaderProps) {
  const links = useRef<Partial<Record<Page, HTMLAnchorElement | null>>>({});
  // Where the current page's underline sits. It slides between links, as the Tabs indicator does; `animate` stays
  // off for the first placement so it doesn't slide in from the left on load.
  const [indicator, setIndicator] = useState<{ left: number; width: number; animate: boolean } | null>(null);
  useLayoutEffect(() => {
    const el = links.current[page];
    if (!el) return;
    const place = () => setIndicator((prev) => ({ left: el.offsetLeft, width: el.offsetWidth, animate: prev != null }));
    place();
    // Fonts arriving (or the window resizing) change the link widths.
    const observer = new ResizeObserver(place);
    observer.observe(el);
    return () => observer.disconnect();
  }, [page]);

  return (
    <header {...stylex.props(styles.header, compact && styles.headerCompact, besideSidebar && styles.headerBesideSidebar)}>
      <Link href="#simulator" aria-label="Themis config" {...racStyles<LinkRenderProps>((s) => [styles.brand, besideSidebar && styles.brandBesideSidebar, focusRing.base, s.isFocusVisible && focusRing.visible])}>
        <Logomark brand={brand} isUnbalanced={isUnbalanced} xstyle={[styles.logomark, compact && styles.logomarkCompact]} />
        <span {...stylex.props(styles.wordmark, compact && styles.wordmarkCompact)}>Themis Config</span>
      </Link>
      {compact ? (
        <ActionMenuTrigger>
          <IconButton aria-label="Pages" variant="subtle" tone="neutral" size="small" xstyle={styles.menuButton}>
            <Icon name="menu" />
          </IconButton>
          <ActionMenu placement="bottom end">
            {PAGES.map((p) => (
              <ActionMenuItem key={p} id={p} href={`#${p}`} textValue={p}>
                {/* The current page is underlined, as it is in the full header. Menu items don't pass on aria-current,
                    so screen readers hear it in the name. */}
                <span {...stylex.props(page === p && styles.menuCurrent)}>{p}</span>
                {page === p && <VisuallyHidden> (current page)</VisuallyHidden>}
              </ActionMenuItem>
            ))}
            <ActionMenuItem id="docs" href={STORYBOOK_URL} target="_blank" rel="noopener noreferrer" textValue="docs">
              <span {...stylex.props(styles.menuExternal)}>
                docs
                <Icon name="external-link" size="small" />
                <VisuallyHidden>(opens in a new tab)</VisuallyHidden>
              </span>
            </ActionMenuItem>
          </ActionMenu>
        </ActionMenuTrigger>
      ) : (
      <nav aria-label="Pages" {...stylex.props(styles.nav, besideSidebar && styles.navBesideSidebar)}>
        {PAGES.map((p) => (
          <Link
            key={p}
            ref={(el) => {
              links.current[p] = el;
            }}
            href={`#${p}`}
            aria-current={page === p ? 'page' : undefined}
            {...racStyles<LinkRenderProps>((s) => [
              styles.link,
              page !== p && s.isHovered && styles.hovered,
              focusRing.base,
              s.isFocusVisible && focusRing.visible,
            ])}
          >
            {p}
          </Link>
        ))}
        {/* Not a page of the tool: it opens the full Storybook in a new tab. */}
        <Link
          href={STORYBOOK_URL}
          target="_blank"
          rel="noopener noreferrer"
          {...racStyles<LinkRenderProps>((s) => [
            styles.link,
            styles.external,
            s.isHovered && styles.hovered,
            focusRing.base,
            s.isFocusVisible && focusRing.visible,
          ])}
        >
          docs
          <Icon name="external-link" size="small" />
          <VisuallyHidden>(opens in a new tab)</VisuallyHidden>
        </Link>
        {indicator && (
          <span
            aria-hidden="true"
            {...stylex.props(styles.indicator, indicator.animate && styles.indicatorAnimated)}
            style={{ width: indicator.width, translate: `${indicator.left}px 0` }}
          />
        )}
      </nav>
      )}
    </header>
  );
}

const styles = stylex.create({
  header: {
    position: 'sticky',
    insetBlockStart: 0,
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    // Figma: 113px from the logo to the links (not a token).
    gap: '7.0625rem',
    paddingBlock: spacing.sm,
    paddingInlineStart: spacing.md,
    paddingInlineEnd: spacing.sm,
    backgroundColor: color.background,
    borderBlockEndWidth: borderWidth.widthSm,
    borderBlockEndStyle: 'solid',
    borderBlockEndColor: color.border,
  },
  brand: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: spacing.xs,
    color: color.text,
    textDecoration: 'none',
    flexShrink: 0,
  },
  // The scales (48 × 40): 30px tall beside the 32px wordmark line, 24px tall in the compact header.
  logomark: { width: '2.25rem', height: 'auto' },
  logomarkCompact: { width: '1.8rem' },
  // Figma type/heading/base (bold), held at its 24px size: the typography tokens grow it to 32px on wide screens.
  wordmark: {
    fontFamily: fontTheme.familyHeading,
    fontSize: '1.5rem',
    lineHeight: '2rem',
    fontWeight: font.weightBold,
  },
  // Figma type/heading/sm at its 16px size.
  wordmarkCompact: { fontSize: '1rem', lineHeight: '1.5rem' },
  // The button is 32px; the icon lines up with the header's 24px row, as in Figma.
  menuButton: { marginInlineStart: 'auto', marginBlock: `calc(-1 * ${spacing['2xs']})` },
  nav: { position: 'relative', display: 'flex', alignItems: 'center', gap: spacing.xl, flexGrow: 1 },
  // Desktop: the logo's slot ends at the sidebar's edge (380px, App's sidebar column), and the links start 24px
  // after the divider, lined up with the preview's side.
  headerBesideSidebar: { gap: 0 },
  brandBesideSidebar: { width: `calc(23.75rem - ${spacing.md})` },
  navBesideSidebar: { marginInlineStart: spacing.md },
  // Figma type/input/base; the current page is underlined.
  link: {
    position: 'relative',
    color: color.text,
    textDecoration: 'none',
    fontFamily: fontTheme.familyBody,
    fontSize: font.sizeInput,
    lineHeight: font.lineHeightInput,
    // Room for the underline, which is drawn (rather than a border) so its ends can be rounded like the indicator's.
    paddingBlockEnd: borderWidth.widthSm,
    '::after': {
      content: "''",
      position: 'absolute',
      insetInline: 0,
      insetBlockEnd: 0,
      height: borderWidth.widthSm,
      borderRadius: radius.radiusSm,
      backgroundColor: color.border,
      opacity: 0,
      pointerEvents: 'none',
      transitionProperty: 'opacity',
      transitionDuration: { default: duration.base, '@media (prefers-reduced-motion: reduce)': '0s' },
      transitionTimingFunction: easing.standard,
    },
  },
  // Other pages show the underline on hover; the current page's comes from the sliding indicator.
  // "docs" sits at the far end of the header, its icon 4px after the text.
  external: { marginInlineStart: 'auto', display: 'inline-flex', alignItems: 'center', gap: spacing['2xs'] },
  // A text underline, not a border: the menu clips each label to its line, which would cut a border off.
  menuCurrent: {
    textDecorationLine: 'underline',
    textDecorationThickness: borderWidth.widthSm,
    textDecorationColor: color.border,
    textUnderlineOffset: spacing['2xs'],
  },
  menuExternal: { display: 'inline-flex', alignItems: 'center', gap: spacing['2xs'] },
  // No gap: the menu button pushes itself to the end.
  headerCompact: { gap: 0 },
  // Hover: a paler line than the current page's, fading in, like the Tabs hover indicator (40% of the line colour).
  hovered: { '::after': { opacity: 0.4 } },
  indicator: {
    position: 'absolute',
    insetInlineStart: 0,
    insetBlockEnd: 0,
    height: borderWidth.widthSm,
    // Rounded ends, like the settings sections' lines and the Tabs indicator.
    borderRadius: radius.radiusSm,
    backgroundColor: color.border,
    pointerEvents: 'none',
  },
  indicatorAnimated: {
    transitionProperty: 'translate, width',
    transitionDuration: { default: duration.base, '@media (prefers-reduced-motion: reduce)': '0s' },
    transitionTimingFunction: easing.standard,
  },
});
