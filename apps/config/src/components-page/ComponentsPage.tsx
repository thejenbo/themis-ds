import * as stylex from '@stylexjs/stylex';
import { memo, type RefObject, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Button as AriaButton, type ButtonRenderProps } from 'react-aria-components';
import { Heading, Select, SelectItem, Text, TextInput, type ThemeSettings } from 'themis-ds';

import { border as borderWidth } from '../../../../src/tokens/borderWidth.stylex';
import { color } from '../../../../src/tokens/colorTheme.stylex';
import { font as fontTheme } from '../../../../src/tokens/fontTheme.stylex';
import { duration, easing } from '../../../../src/tokens/motion.stylex';
import { border as radius } from '../../../../src/tokens/radius.stylex';
import { spacing } from '../../../../src/tokens/spacing.stylex';
import { font } from '../../../../src/tokens/typography.stylex';
import { focusRing } from '../../../../src/utils/focus-ring';
import { racStyles } from '../../../../src/utils/stylex-rac';
import { ComponentCard } from './ComponentCard';
import { COMPONENTS, type ComponentEntry } from './registry';
import { SandboxTheme } from './Sandbox';

/**
 * The components page: every Themis component, live, with controls for its design props, grouped by category. The
 * page itself is in the config tool's own style; each component sits in a sandbox that takes the theme being edited.
 * Loaded on demand (it brings the stories with it).
 *
 * Its menu is an index of the page, not more navigation (the header switches pages, the sidebar edits the theme):
 * with room, a quiet "on this page" list beside the cards that jumps to a component and follows the scroll; without,
 * a category select beside the search.
 */
export default function ComponentsPage({ theme }: { theme: ThemeSettings }) {
  return (
    // The theme reaches the sandboxes through context, so a theme change re-renders only them, not the cards.
    <SandboxTheme.Provider value={theme}>
      <ComponentList />
    </SandboxTheme.Provider>
  );
}

// Roughly the order you'd build a screen in: actions and inputs first, typography (the most basic) last.
const CATEGORY_ORDER = ['Actions', 'Inputs', 'Selection', 'Color', 'Navigation', 'Disclosure', 'Overlays', 'Feedback', 'Data display', 'Typography'];
const rank = (category: string) => (CATEGORY_ORDER.includes(category) ? CATEGORY_ORDER.indexOf(category) : CATEGORY_ORDER.length);
const GROUPS: { category: string; entries: ComponentEntry[] }[] = [...new Set(COMPONENTS.map((c) => c.category))]
  .sort((a, b) => rank(a) - rank(b) || a.localeCompare(b))
  .map((category) => ({
    category,
    entries: COMPONENTS.filter((c) => c.category === category),
  }));

const cardId = (name: string) => `component-${name}`;
const ALL = 'All categories';
// Wide enough for the cards and the index beside them.
const INDEX_MIN_WIDTH = 920;

const ComponentList = memo(function ComponentList() {
  const pageRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(ALL);
  const [hasIndex, setHasIndex] = useState(false);

  useLayoutEffect(() => {
    const el = pageRef.current!;
    const observer = new ResizeObserver(() => setHasIndex(el.clientWidth >= INDEX_MIN_WIDTH));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // The category select only exists without the index; the index jumps instead of filtering.
  const activeCategory = hasIndex ? ALL : category;
  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    return GROUPS.filter((g) => activeCategory === ALL || g.category === activeCategory)
      .map((g) => ({
        ...g,
        entries: q ? g.entries.filter((c) => `${c.name} ${c.category}`.toLowerCase().includes(q)) : g.entries,
      }))
      .filter((g) => g.entries.length > 0);
  }, [query, activeCategory]);
  const names = useMemo(() => groups.flatMap((g) => g.entries.map((c) => c.name)), [groups]);
  const { current, jumpTo } = useCurrentCard(pageRef, names, hasIndex);

  // The index sticks within the page's scroller, so it can be at most as tall as that (less its gap above and below),
  // scrolling itself beyond that.
  const indexRef = useRef<HTMLElement>(null);
  const [indexHeight, setIndexHeight] = useState<number>();
  useLayoutEffect(() => {
    if (!hasIndex) return;
    const scroller = scrollerOf(pageRef.current!);
    // It can't stick past the end of the page's content, so the page's bottom padding comes off too.
    const observer = new ResizeObserver(() =>
      setIndexHeight(scroller.clientHeight - JUMP_GAP - parseFloat(getComputedStyle(pageRef.current!).paddingBlockEnd)),
    );
    observer.observe(scroller);
    return () => observer.disconnect();
  }, [hasIndex]);
  // …and keeps the current component in view as the cards scroll by.
  useEffect(() => {
    const nav = indexRef.current;
    const item = nav?.querySelector<HTMLElement>('[aria-current]');
    if (!nav || !item) return;
    const { top, bottom } = item.getBoundingClientRect();
    const box = nav.getBoundingClientRect();
    if (top < box.top) nav.scrollTop -= box.top - top + JUMP_GAP;
    else if (bottom > box.bottom) nav.scrollTop += bottom - box.bottom + JUMP_GAP;
  }, [current]);

  return (
    <div ref={pageRef} {...stylex.props(styles.page, hasIndex && styles.pageWithIndex)}>
      <div {...stylex.props(styles.list)}>
        <div {...stylex.props(styles.tools)}>
          <TextInput label="Find a component" type="search" placeholder="Button, inputs…" value={query} onChange={setQuery} xstyle={styles.tool} />
          {!hasIndex && (
            <Select label="Category" value={category} onChange={(k) => setCategory(String(k))} xstyle={styles.tool}>
              {[ALL, ...GROUPS.map((g) => g.category)].map((c) => (
                <SelectItem key={c} id={c}>
                  {c}
                </SelectItem>
              ))}
            </Select>
          )}
        </div>
        {groups.map(({ category: name, entries }) => (
          <section key={name} aria-label={name} {...stylex.props(styles.group)}>
            <Heading level={2} size="base" xstyle={styles.groupHeading}>
              {name}
            </Heading>
            {entries.map((entry) => (
              <div key={entry.name} id={cardId(entry.name)} data-component-card={entry.name} tabIndex={-1} {...stylex.props(styles.card)}>
                <ComponentCard entry={entry} />
              </div>
            ))}
          </section>
        ))}
        {groups.length === 0 && <Text variant="body-base">No components match “{query.trim()}”.</Text>}
      </div>
      {hasIndex && (
        <nav ref={indexRef} aria-label="On this page" {...stylex.props(styles.index)} style={{ maxHeight: indexHeight }}>
          {groups.map(({ category: name, entries }) => (
            <div key={name} {...stylex.props(styles.indexGroup)}>
              <Text variant="label">{name}</Text>
              <ul {...stylex.props(styles.indexList)}>
                {entries.map(({ name: component }) => (
                  <li key={component}>
                    <AriaButton
                      onPress={() => jumpTo(component)}
                      aria-current={current === component ? 'location' : undefined}
                      {...racStyles<ButtonRenderProps>((s) => [
                        styles.indexItem,
                        current === component ? styles.indexCurrent : s.isHovered && styles.indexHovered,
                        focusRing.base,
                        s.isFocusVisible && focusRing.visible,
                      ])}
                    >
                      {component}
                    </AriaButton>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      )}
    </div>
  );
});

const scrollerOf = (el: HTMLElement) => {
  for (let node = el.parentElement; node; node = node.parentElement) {
    if (/auto|scroll/.test(getComputedStyle(node).overflowY) && node.scrollHeight > node.clientHeight) return node;
  }
  return document.scrollingElement as HTMLElement;
};
// Room above a card that's been jumped to.
const JUMP_GAP = 16;

/**
 * The card being read, for the index: the last whose top has passed a line a quarter of the way down the scroller.
 * `jumpTo` scrolls only the page's own scroller (not the window, as scrollIntoView would), and the card it picks
 * stays current even when the scroll runs out before it reaches the top (the last few cards).
 */
function useCurrentCard(pageRef: RefObject<HTMLDivElement | null>, names: string[], isOn: boolean) {
  const [current, setCurrent] = useState<string | undefined>(names[0]);
  const picked = useRef<string | null>(null);
  useEffect(() => {
    const page = pageRef.current;
    if (!isOn || !page) return;
    const scroller = scrollerOf(page);
    let frame = 0;
    const update = () => {
      frame = 0;
      const atEnd = scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 2;
      if (picked.current && atEnd) return setCurrent(picked.current);
      picked.current = null;
      // At the end, the last component, even if its top never reaches the line.
      if (atEnd) return setCurrent(names.at(-1));
      const line = scroller.getBoundingClientRect().top + scroller.clientHeight / 4;
      let reading = names[0];
      for (const name of names) {
        const card = document.getElementById(cardId(name));
        if (card && card.getBoundingClientRect().top <= line) reading = name;
      }
      setCurrent(reading);
    };
    const onScroll = () => {
      frame ||= requestAnimationFrame(update);
    };
    update();
    scroller.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      scroller.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, [pageRef, names, isOn]);

  const jumpTo = (name: string) => {
    const card = document.getElementById(cardId(name));
    if (!card) return;
    const scroller = scrollerOf(card);
    const top = card.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop - JUMP_GAP;
    scroller.scrollTo({ top });
    picked.current = name;
    setCurrent(name);
    // Keyboard and screen reader users carry on from the component they picked.
    card.focus({ preventScroll: true });
  };
  return { current, jumpTo };
}

const styles = stylex.create({
  // As the Settings Sim: 16px sides on phones, 24px on tablets, 64px beside the desktop sidebar.
  // Positioned, so React Aria's hidden inputs (absolute, 1px) are placed within the page. Otherwise they're placed in
  // the document, which then scrolls on long past the last component.
  page: {
    position: 'relative',
    paddingBlock: {
      default: `${spacing.md} ${spacing.md}`,
      '@media (min-width: 64em)': `${spacing.md} ${spacing.xl}`,
    },
    paddingInline: {
      default: spacing.sm,
      '@media (min-width: 48em)': spacing.md,
      '@media (min-width: 64em)': spacing['2xl'],
    },
  },
  // The cards up to 48rem, and the index after them, as wide as its longest name.
  pageWithIndex: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 48rem) max-content',
    columnGap: spacing.xl,
    alignItems: 'start',
  },
  list: { display: 'flex', flexDirection: 'column', gap: spacing['2xl'], minWidth: 0 },
  tools: { display: 'flex', flexWrap: 'wrap', gap: spacing.md },
  tool: { flexBasis: '14rem', flexGrow: 1, maxWidth: '20rem' },
  // Components aren't boxed: room between them, and a line under each category's heading, keep them apart.
  group: { display: 'flex', flexDirection: 'column', gap: spacing.xl },
  groupHeading: {
    paddingBlockEnd: spacing.xs,
    borderBlockEndWidth: borderWidth.widthSm,
    borderBlockEndStyle: 'solid',
    borderBlockEndColor: color.border,
  },
  // Focused (not tabbable) after a jump from the index, so keyboard users carry on from there; it isn't a control, so
  // no ring.
  card: { outline: 'none' },
  // Stays in view while the cards scroll, scrolling itself if it's taller than the screen.
  index: {
    position: 'sticky',
    insetBlockStart: spacing.sm,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.md,
    paddingBlock: spacing['2xs'],
  },
  indexGroup: { display: 'flex', flexDirection: 'column', gap: spacing['2xs'] },
  indexList: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  // Plain text with a line at its start: the header links' language turned on its side. The current component's line
  // is solid; hovering another shows a paler one (40%, as the header and Tabs do).
  indexItem: {
    position: 'relative',
    display: 'block',
    width: '100%',
    textAlign: 'start',
    paddingBlock: spacing['3xs'],
    paddingInlineStart: spacing.sm,
    paddingInlineEnd: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
    color: color.text,
    cursor: 'pointer',
    fontFamily: fontTheme.familyBody,
    fontSize: font.sizeSm,
    lineHeight: font.lineHeightSm,
    '::before': {
      content: "''",
      position: 'absolute',
      insetInlineStart: 0,
      insetBlock: spacing['3xs'],
      width: borderWidth.widthSm,
      borderRadius: radius.radiusSm,
      backgroundColor: color.border,
      opacity: 0,
      pointerEvents: 'none',
      transitionProperty: 'opacity',
      transitionDuration: {
        default: duration.base,
        '@media (prefers-reduced-motion: reduce)': '0s',
      },
      transitionTimingFunction: easing.standard,
    },
  },
  indexHovered: { '::before': { opacity: 0.4 } },
  indexCurrent: { '::before': { opacity: 1 } },
});
