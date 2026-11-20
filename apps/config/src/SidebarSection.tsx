import * as stylex from '@stylexjs/stylex';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { Button, type ButtonRenderProps, Disclosure, DisclosurePanel, Heading } from 'react-aria-components';
import { Icon } from 'themis-ds';

import { border as borderWidth } from '../../../src/tokens/borderWidth.stylex';
import { color } from '../../../src/tokens/colorTheme.stylex';
import { font as fontTheme } from '../../../src/tokens/fontTheme.stylex';
import { duration, easing } from '../../../src/tokens/motion.stylex';
import { border as radius } from '../../../src/tokens/radius.stylex';
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
  /** The last section draws no line under itself: Export's line is right below it. */
  isLast?: boolean;
}

/**
 * A sidebar section (Colors, Borders, Fonts) that opens and closes. A lighter take on Accordion: a heading and a
 * chevron, no fill or frame, and a line under the section: under the heading while closed, pushed down under the
 * content as it opens. The heading sticks below the theme row while its section scrolls past (the sidebar sets
 * `--theme-bar-height`); an open section's heading gets a border across its bottom edge while stuck. Built on React Aria `Disclosure`:
 * an h2 holding a button with `aria-expanded`.
 */
export function SidebarSection({ title, summary, isExpanded, onExpandedChange, children, isLast = false }: SidebarSectionProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const isStuck = useIsStuck(headingRef);
  // Only an open section's heading gets a border while stuck, between it and the fields scrolling under it. A closed
  // one keeps its line under it (the section's), which scrolls away with it.
  const showStuckBorder = isStuck && isExpanded;
  const contentRef = useRef<HTMLDivElement>(null);
  const duration = usePanelDuration(contentRef);
  return (
    <Disclosure
      isExpanded={isExpanded}
      onExpandedChange={onExpandedChange}
      {...stylex.props(styles.section, !isLast && styles.sectionLine)}
      // The heading and the panel animate together, at the panel's speed.
      style={{ '--panel-duration': duration } as React.CSSProperties}
    >
      <Heading
        ref={headingRef}
        level={2}
        data-stuck={isStuck || undefined}
        {...stylex.props(
          headingStyles.sm,
          styles.heading,
          styles.headingMotion,
          !isExpanded && styles.headingClosed,
          showStuckBorder && styles.headingStuck,
        )}
      >
        <Button
          slot="trigger"
          {...racStyles<ButtonRenderProps>((s) => [styles.trigger, focusRing.base, s.isFocusVisible && focusRing.visible])}
        >
          <span {...stylex.props(styles.title)}>
            {title}
          </span>
          {/* Always there, collapsing as the section opens (with the panel, at the same speed), so the section's line
              moves smoothly instead of jumping up under the title first. Hidden from the button's name while open. */}
          <span aria-hidden={isExpanded || undefined} {...stylex.props(styles.summaryRow, isExpanded && styles.summaryRowOpen)}>
            <span {...stylex.props(styles.summaryClip)}>
              <span {...stylex.props(styles.summary)}>{summary}</span>
            </span>
          </span>
          <span aria-hidden="true" {...stylex.props(styles.chevron, !isExpanded && styles.chevronClosed)}>
            <Icon name="chevron-down" size="small" />
          </span>
        </Button>
      </Heading>
      <DisclosurePanel {...stylex.props(styles.panel)}>
        <div ref={contentRef} {...stylex.props(styles.content)}>
          {children}
        </div>
      </DisclosurePanel>
    </Disclosure>
  );
}

/** The open/close speed of the shorter sections (Borders, Fonts): about 200px in duration.base (150ms). */
const PX_PER_MS = 200 / 150;
const MIN_MS = 150;
const MAX_MS = 350;

/**
 * How long the panel takes to open or close: in proportion to its height, so a tall section (Colors) moves at the
 * similar speed to a short one instead of rushing, within 150–350ms (capped a little quicker for the tallest, Colors).
 */
function usePanelDuration(ref: React.RefObject<HTMLElement | null>) {
  const [ms, setMs] = useState(MIN_MS);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // A closed panel's content isn't laid out (height 0), so keep the height it had when last open. A section that
    // starts closed opens at the base speed the first time.
    const measure = () => {
      if (el.offsetHeight > 0) setMs(Math.round(Math.min(MAX_MS, Math.max(MIN_MS, el.offsetHeight / PX_PER_MS))));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return `${ms}ms`;
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
  // The section's line: under the heading while closed, under the content while open (Figma 2437:2652). One line,
  // so opening a section pushes it down with the content. A pseudo-element rather than a border, so its ends can be
  // rounded like the Tabs indicator's.
  section: { position: 'relative', display: 'flex', flexDirection: 'column' },
  sectionLine: {
    paddingBlockEnd: borderWidth.widthSm,
    '::after': {
      content: "''",
      position: 'absolute',
      insetInline: 0,
      insetBlockEnd: 0,
      height: borderWidth.widthSm,
      borderRadius: radius.radiusSm,
      backgroundColor: color.border,
      pointerEvents: 'none',
    },
  },
  // Sticks under the theme row; a background strip as wide as the sidebar, so fields scroll out of sight under it.
  heading: {
    position: 'sticky',
    insetBlockStart: 'var(--theme-bar-height, 0px)',
    zIndex: 1,
    margin: 0,
    marginInline: `calc(-1 * ${spacing.md})`,
    paddingInline: spacing.md,
    paddingBlockStart: spacing.xs,
    // 8px, then room for the border it gets while stuck (Figma 2437:2201: a 38px heading, plus 8px above for the
    // sticky strip).
    paddingBlockEnd: `calc(${spacing.xs} + ${borderWidth.widthSm})`,
    backgroundColor: color.background,
    // The border while stuck (open sections only): across the heading's full width, between the heading and the
    // fields scrolling under it. It appears at once, without growing in.
    '::after': {
      content: "''",
      position: 'absolute',
      insetInlineStart: 0,
      insetBlockEnd: 0,
      width: 0,
      height: borderWidth.widthSm,
      backgroundColor: color.border,
      pointerEvents: 'none',
    },
  },
  // Closed (Figma 2437:2652): the summary under the title, then 16px to the section's line.
  headingClosed: { paddingBlockEnd: spacing.sm },
  // The heading's bottom padding changes with the panel, at its speed.
  headingMotion: {
    transitionProperty: 'padding-block-end',
    transitionDuration: { default: `var(--panel-duration, ${duration.base})`, '@media (prefers-reduced-motion: reduce)': '0s' },
    transitionTimingFunction: easing.standard,
  },
  headingStuck: { '::after': { width: '100%' } },
  // A grid: the title, the summary under it while closed, and the chevron at the end, centred on both.
  trigger: {
    position: 'relative',
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    alignItems: 'center',
    columnGap: spacing.xs,
    rowGap: 0,
    width: '100%',
    padding: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
    color: color.text,
    textAlign: 'start',
    font: 'inherit',
    cursor: 'pointer',
  },
  title: { gridColumn: 1, gridRow: 1, justifySelf: 'start' },
  // The summary's row: its full height while closed, collapsing to nothing as the section opens.
  summaryRow: {
    gridColumn: 1,
    gridRow: 2,
    display: 'grid',
    gridTemplateRows: '1fr',
    transitionProperty: 'grid-template-rows, opacity',
    transitionDuration: { default: `var(--panel-duration, ${duration.base})`, '@media (prefers-reduced-motion: reduce)': '0s' },
    transitionTimingFunction: easing.standard,
  },
  summaryRowOpen: { gridTemplateRows: '0fr', opacity: 0 },
  // What collapses: no padding of its own, so it can reach zero height.
  summaryClip: { minHeight: 0, overflow: 'hidden' },
  // Caption text in the muted colour (6:1 on the background), 4px under the title.
  summary: {
    paddingBlockStart: spacing['2xs'],
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
  // Centred on the title and summary together (just the title while open, as the summary's row is then empty).
  chevron: {
    gridColumn: 2,
    gridRow: '1 / span 2',
    display: 'flex',
    transitionProperty: 'transform',
    transitionDuration: { default: duration.fast, '@media (prefers-reduced-motion: reduce)': '0s' },
    transitionTimingFunction: easing.standard,
  },
  chevronClosed: { transform: 'rotate(-90deg)' },
  // Opens and closes by animating its height (React Aria sets --disclosure-panel-height), pushing the section's line
  // down or up with it, like the DS Accordion. Clipped while it does, so it reaches 8px past the fields on each side:
  // their focus rings sit outside them. Its own stacking context, so raised parts of the fields inside (the colour code
  // control's border) can't draw over the sticky headings.
  panel: {
    isolation: 'isolate',
    height: 'var(--disclosure-panel-height)',
    overflow: 'clip',
    marginInline: `calc(-1 * ${spacing.xs})`,
    paddingInline: spacing.xs,
    transitionProperty: 'height',
    transitionDuration: { default: `var(--panel-duration, ${duration.base})`, '@media (prefers-reduced-motion: reduce)': '0s' },
    transitionTimingFunction: easing.standard,
  },
  // 16px from the heading to the fields, and 24px below the last one, to the section's line; then 16px to the next
  // title, counting the sections' 8px gap and the heading's 8px top padding.
  content: {
    paddingBlockStart: spacing.sm,
    paddingBlockEnd: spacing.md,
  },
});
