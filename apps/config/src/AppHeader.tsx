import * as stylex from '@stylexjs/stylex';
import { useLayoutEffect, useRef, useState } from 'react';
import { VisuallyHidden } from 'react-aria';
import { Link, type LinkRenderProps } from 'react-aria-components';
import { Icon } from 'themis-ds';

import { border as borderWidth } from '../../../src/tokens/borderWidth.stylex';
import { color } from '../../../src/tokens/colorTheme.stylex';
import { font as fontTheme } from '../../../src/tokens/fontTheme.stylex';
import { duration, easing } from '../../../src/tokens/motion.stylex';
import { spacing } from '../../../src/tokens/spacing.stylex';
import { font } from '../../../src/tokens/typography.stylex';
import { focusRing } from '../../../src/utils/focus-ring';
import { racStyles } from '../../../src/utils/stylex-rac';
import { Logomark } from './illustrations/Logomark';

export type Page = 'simulator' | 'components';

/** The full Storybook ("docs" in the header). Set VITE_STORYBOOK_URL once it's hosted; locally it's `npm run storybook`. */
export const STORYBOOK_URL = import.meta.env.VITE_STORYBOOK_URL ?? 'http://localhost:6006';

interface AppHeaderProps {
  page: Page;
}

/** The logo and the page links (Figma 2422:35488). Sticks to the top of the window. */
export function AppHeader({ page }: AppHeaderProps) {
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
    <header {...stylex.props(styles.header)}>
      <Link href="#simulator" aria-label="Themis config" {...racStyles<LinkRenderProps>((s) => [styles.brand, focusRing.base, s.isFocusVisible && focusRing.visible])}>
        <Logomark xstyle={styles.logomark} />
        <span {...stylex.props(styles.wordmark)}>Themis Config</span>
      </Link>
      <nav aria-label="Pages" {...stylex.props(styles.nav)}>
        {(['simulator', 'components'] as const).map((p) => (
          <Link
            key={p}
            ref={(el) => {
              links.current[p] = el;
            }}
            href={`#${p}`}
            aria-current={page === p ? 'page' : undefined}
            {...racStyles<LinkRenderProps>((s) => [styles.link, page !== p && styles.hoverable, focusRing.base, s.isFocusVisible && focusRing.visible])}
          >
            {p}
          </Link>
        ))}
        {/* Not a page of the tool: it opens the full Storybook in a new tab. */}
        <Link
          href={STORYBOOK_URL}
          target="_blank"
          rel="noopener noreferrer"
          {...racStyles<LinkRenderProps>((s) => [styles.link, styles.external, styles.hoverable, focusRing.base, s.isFocusVisible && focusRing.visible])}
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
  logomark: { width: '2.5rem', height: 'auto' },
  // Figma type/heading/base (bold), held at its 24px size: the typography tokens grow it to 32px on wide screens.
  wordmark: {
    fontFamily: fontTheme.familyHeading,
    fontSize: '1.5rem',
    lineHeight: '2rem',
    fontWeight: font.weightBold,
  },
  nav: { position: 'relative', display: 'flex', alignItems: 'center', gap: spacing.xl, flexGrow: 1 },
  // Figma type/input/base; the current page is underlined.
  link: {
    position: 'relative',
    color: color.text,
    textDecoration: 'none',
    fontFamily: fontTheme.familyBody,
    fontSize: font.sizeInput,
    lineHeight: font.lineHeightInput,
    borderBlockEndWidth: borderWidth.widthSm,
    borderBlockEndStyle: 'solid',
    borderBlockEndColor: 'transparent',
  },
  // Other pages show the underline on hover; the current page's comes from the sliding indicator.
  // "docs" sits at the far end of the header, its icon 4px after the text.
  external: { marginInlineStart: 'auto', display: 'inline-flex', alignItems: 'center', gap: spacing['2xs'] },
  hoverable: { borderBlockEndColor: { default: 'transparent', ':hover': color.border } },
  indicator: {
    position: 'absolute',
    insetInlineStart: 0,
    insetBlockEnd: 0,
    height: borderWidth.widthSm,
    backgroundColor: color.border,
    pointerEvents: 'none',
  },
  indicatorAnimated: {
    transitionProperty: 'translate, width',
    transitionDuration: { default: duration.base, '@media (prefers-reduced-motion: reduce)': '0s' },
    transitionTimingFunction: easing.standard,
  },
});
