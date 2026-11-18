import * as stylex from '@stylexjs/stylex';
import { useLayoutEffect, useRef, useState } from 'react';
import { Link, type LinkRenderProps } from 'react-aria-components';
import { Button } from 'themis-ds';

import { border as borderWidth } from '../../../src/tokens/borderWidth.stylex';
import { color } from '../../../src/tokens/colorTheme.stylex';
import { font as fontTheme } from '../../../src/tokens/fontTheme.stylex';
import { duration, easing } from '../../../src/tokens/motion.stylex';
import { spacing } from '../../../src/tokens/spacing.stylex';
import { font } from '../../../src/tokens/typography.stylex';
import { focusRing } from '../../../src/utils/focus-ring';
import { racStyles } from '../../../src/utils/stylex-rac';
import { Logomark } from './illustrations/Logomark';

export type Page = 'simulator' | 'docs';

interface AppHeaderProps {
  page: Page;
  /** Export is off while a new theme is being named: it isn't part of the file yet. */
  isExportDisabled: boolean;
  onExport: () => void;
}

/** Figma "Frame 106": the logo, the page links and Export. Sticks to the top of the window. */
export function AppHeader({ page, isExportDisabled, onExport }: AppHeaderProps) {
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
        <Logomark />
        <span {...stylex.props(styles.wordmark)}>Themis</span>
        <span {...stylex.props(styles.suffix)}>config</span>
      </Link>
      <nav aria-label="Pages" {...stylex.props(styles.nav)}>
        {(['simulator', 'docs'] as const).map((p) => (
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
        {indicator && (
          <span
            aria-hidden="true"
            {...stylex.props(styles.indicator, indicator.animate && styles.indicatorAnimated)}
            style={{ width: indicator.width, translate: `${indicator.left}px 0` }}
          />
        )}
      </nav>
      <Button size="medium" isDisabled={isExportDisabled} onPress={onExport}>
        Export
      </Button>
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
    // Figma: 108px from the logo to the links (not a token).
    gap: '6.75rem',
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
  // Figma type/heading/md.
  wordmark: {
    fontFamily: fontTheme.familyHeading,
    fontSize: font.size2xl,
    lineHeight: font.lineHeightLg,
    fontWeight: font.weightBold,
  },
  // Figma type/caption/base, sitting on the wordmark's baseline.
  suffix: {
    alignSelf: 'flex-end',
    marginInlineStart: `calc(${spacing['2xs']} - ${spacing.xs})`,
    paddingBlockEnd: '5px',
    fontFamily: fontTheme.familyBody,
    fontSize: font.sizeCaption,
    lineHeight: font.lineHeightCaption,
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
