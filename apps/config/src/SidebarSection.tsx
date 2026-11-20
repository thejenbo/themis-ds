import * as stylex from '@stylexjs/stylex';
import { type ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Button, type ButtonRenderProps, Disclosure, DisclosurePanel, Heading } from 'react-aria-components';
import { Icon } from 'themis-ds';

import { border as borderWidth } from '../../../src/tokens/borderWidth.stylex';
import { color } from '../../../src/tokens/colorTheme.stylex';
import { font as fontTheme } from '../../../src/tokens/fontTheme.stylex';
import { duration, easing } from '../../../src/tokens/motion.stylex';
import { spacing } from '../../../src/tokens/spacing.stylex';
import { font } from '../../../src/tokens/typography.stylex';
import { headingStyles } from '../../../src/styles/type-styles';
import { focusRing } from '../../../src/utils/focus-ring';
import { racStyles } from '../../../src/utils/stylex-rac';

interface SidebarSectionProps {
  title: string;
  /** Shown under the title while the section is closed: what's set inside, at a glance. */
  summary: ReactNode;
  isExpanded: boolean;
  onExpandedChange: (isExpanded: boolean) => void;
  children: ReactNode;
}

/**
 * A sidebar section (Colors, Borders, Fonts) that opens and closes. A lighter take on Accordion: the underlined
 * heading and a chevron, no fill or frame. The heading sticks below the theme row while its section scrolls past
 * (the sidebar sets `--theme-bar-height`); while stuck, the title's underline becomes a border across the
 * heading's bottom edge. Built on React Aria `Disclosure`:
 * an h2 holding a button with `aria-expanded`.
 */
export function SidebarSection({ title, summary, isExpanded, onExpandedChange, children }: SidebarSectionProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const titleRef = useRef<HTMLSpanElement>(null);
  const isStuck = useIsStuck(headingRef);
  // The underline is drawn by the heading (so it can stretch), sized to the title: keep its width up to date as the
  // font loads or the title changes.
  useLayoutEffect(() => {
    const titleEl = titleRef.current;
    if (!titleEl) return;
    const measure = () => headingRef.current?.style.setProperty('--title-width', `${titleEl.offsetWidth}px`);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(titleEl);
    return () => observer.disconnect();
  }, []);
  return (
    <Disclosure isExpanded={isExpanded} onExpandedChange={onExpandedChange} {...stylex.props(styles.section)}>
      <Heading
        ref={headingRef}
        level={2}
        data-stuck={isStuck || undefined}
        {...stylex.props(
          headingStyles.sm,
          styles.heading,
          !isExpanded && styles.headingClosed,
          isStuck && styles.headingStuck,
        )}
      >
        <Button
          slot="trigger"
          {...racStyles<ButtonRenderProps>((s) => [styles.trigger, focusRing.base, s.isFocusVisible && focusRing.visible])}
        >
          <span ref={titleRef} {...stylex.props(styles.title)}>
            {title}
          </span>
          {!isExpanded && <span {...stylex.props(styles.summary)}>{summary}</span>}
          <span
            aria-hidden="true"
            {...stylex.props(styles.chevron, !isExpanded && styles.chevronClosed)}
          >
            <Icon name="chevron-down" size="small" />
          </span>
        </Button>
      </Heading>
      <DisclosurePanel {...stylex.props(styles.panel, isExpanded && styles.panelOpen)}>{children}</DisclosurePanel>
    </Disclosure>
  );
}

/**
 * Whether a sticky element has reached its sticky offset (held there, or being pushed off by the end of its section)
 * rather than sitting in its place. Checked on scroll and resize of the nearest scrolling ancestor. (CSS scroll-state queries can
 * say this without JS, but only Chromium supports them so far.)
 */
/** How much of a heading being pushed out can still show when it drops its border. */
const LAST_FEW_PX = 8;

function useIsStuck(ref: React.RefObject<HTMLElement | null>) {
  const [isStuck, setIsStuck] = useState(false);
  useEffect(() => {
    const el = ref.current;
    let scroller = el?.parentElement ?? null;
    while (scroller && !/(auto|scroll)/.test(getComputedStyle(scroller).overflowY)) scroller = scroller.parentElement;
    if (!el || !scroller) return;
    const check = () => {
      const offset = parseFloat(getComputedStyle(el).insetBlockStart) || 0;
      const top = el.getBoundingClientRect().top - scroller.getBoundingClientRect().top;
      // Only once scrolled: at the top of the list a heading may sit exactly at its offset without being stuck. Still
      // stuck while the next section pushes it up under the theme row, so it keeps its border, except for the last few
      // pixels, where the border would sit right under the theme row's line and read as a double line.
      const showing = top + el.offsetHeight - offset;
      setIsStuck(scroller.scrollTop > 0 && top <= offset + 0.5 && showing > LAST_FEW_PX);
    };
    check();
    scroller.addEventListener('scroll', check, { passive: true });
    const observer = new ResizeObserver(check);
    observer.observe(scroller);
    return () => {
      scroller.removeEventListener('scroll', check);
      observer.disconnect();
    };
  }, [ref]);
  return isStuck;
}

const styles = stylex.create({
  section: { display: 'flex', flexDirection: 'column' },
  // Sticks under the theme row; a background strip as wide as the sidebar, so fields scroll out of sight under it.
  heading: {
    position: 'sticky',
    insetBlockStart: 'var(--theme-bar-height, 0px)',
    zIndex: 1,
    margin: 0,
    marginInline: `calc(-1 * ${spacing.md})`,
    paddingInline: spacing.md,
    paddingBlockStart: spacing.xs,
    // 8px, then the underline on the bottom edge (Figma 2437:2201: a 38px heading, plus 8px above for the sticky strip).
    paddingBlockEnd: `calc(${spacing.xs} + ${borderWidth.widthSm})`,
    backgroundColor: color.background,
    // The title's underline, the width of the text, on the heading's bottom edge. While stuck it becomes a border
    // across the heading's full width, between the heading and the fields scrolling under it, widening with a short,
    // subtle transition (none with reduced motion).
    '::after': {
      content: "''",
      position: 'absolute',
      insetInlineStart: spacing.md,
      insetBlockEnd: 0,
      width: 'var(--title-width, 0px)',
      height: borderWidth.widthSm,
      backgroundColor: color.border,
      pointerEvents: 'none',
      transitionProperty: 'inset-inline-start, width',
      transitionDuration: { default: duration.fast, '@media (prefers-reduced-motion: reduce)': '0s' },
      transitionTimingFunction: easing.standard,
    },
  },
  // Closed (Figma 2437:2652): the summary under the title, 16px, then a line across the content width.
  headingClosed: {
    paddingBlockEnd: `calc(${spacing.sm} + ${borderWidth.widthSm})`,
    '::after': { width: `calc(100% - 2 * ${spacing.md})` },
  },
  headingStuck: { '::after': { insetInlineStart: 0, width: '100%' } },
  // A grid: the title, the summary under it while closed, and the chevron at the end, centred on both.
  trigger: {
    position: 'relative',
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    alignItems: 'center',
    columnGap: spacing.xs,
    rowGap: spacing['2xs'],
    width: '100%',
    padding: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
    color: color.text,
    textAlign: 'start',
    font: 'inherit',
    cursor: 'pointer',
  },
  // The underline is the heading's ::after, so it can widen while stuck.
  title: { gridColumn: 1, gridRow: 1, justifySelf: 'start' },
  // Caption text in the muted colour (6:1 on the background), under the title.
  summary: {
    gridColumn: 1,
    gridRow: 2,
    display: 'flex',
    alignItems: 'center',
    gap: spacing['2xs'],
    minWidth: 0,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    fontFamily: fontTheme.familyBody,
    fontSize: font.sizeCaption,
    lineHeight: font.lineHeightCaption,
    fontWeight: font.weightRegular,
    color: color.textPlaceholderDefault,
  },
  chevron: {
    gridColumn: 2,
    gridRow: 1,
    display: 'flex',
    transitionProperty: 'transform',
    transitionDuration: { default: duration.fast, '@media (prefers-reduced-motion: reduce)': '0s' },
    transitionTimingFunction: easing.standard,
  },
  chevronClosed: { gridRow: '1 / span 2', transform: 'rotate(-90deg)' },
  // Its own stacking context, so raised parts of the fields inside (the colour code control's border) can't draw over
  // the sticky headings.
  panel: { isolation: 'isolate' },
  // Only while open: a closed panel is hidden with `hidden="until-found"`, which keeps its padding. 24px from the
  // underline to the fields, and 64px from the last field to the next title, counting the sections' 8px gap and the
  // heading's 8px top padding (Figma 2437:2201). Closed, 16px from one heading's line to the next title (Figma 2437:2652).
  panelOpen: {
    paddingBlockStart: spacing.md,
    paddingBlockEnd: spacing.xl,
  },
});
