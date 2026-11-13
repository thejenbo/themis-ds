import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';
import {
  composeRenderProps,
  SelectionIndicator,
  Tab as AriaTab,
  TabList as AriaTabList,
  type TabListProps as AriaTabListProps,
  type TabListRenderProps,
  TabPanel as AriaTabPanel,
  type TabPanelProps as AriaTabPanelProps,
  type TabPanelRenderProps,
  type TabProps as AriaTabProps,
  type TabRenderProps,
  Tabs as AriaTabs,
  type TabsProps as AriaTabsProps,
  type TabsRenderProps,
} from 'react-aria-components';

import { color } from '../../tokens/colorTheme.stylex';
import { tabs } from '../../tokens/components.stylex';
import { font as fontTheme } from '../../tokens/fontTheme.stylex';
import { duration, easing } from '../../tokens/motion.stylex';
import { border as radius } from '../../tokens/radius.stylex';
import { spacing } from '../../tokens/spacing.stylex';
import { font } from '../../tokens/typography.stylex';
import { focusRing } from '../../utils/focus-ring';
import { interactiveCursor } from '../../utils/interactive-cursor';
import { racStyles } from '../../utils/stylex-rac';
import { touchTarget } from '../../utils/touch-target';

export interface TabsProps extends Omit<AriaTabsProps, 'className' | 'style' | 'orientation'> {
  /** A `TabList` followed by one `TabPanel` per tab (matched by `id`). */
  children: ReactNode;
  /** Layout-only StyleX overrides (margin, flex, grid placement). Do not restyle colours or size. */
  xstyle?: stylex.StyleXStyles;
}

/**
 * Switches between panels of related content in the same place, such as "Overview / Activity / Settings".
 * Built on React Aria `Tabs`: arrow keys move between tabs and select them, Home/End jump to the ends, and each tab
 * is linked to its panel. Horizontal only for now.
 */
export function Tabs({ children, xstyle, ...props }: TabsProps) {
  return (
    <AriaTabs {...props} {...racStyles<TabsRenderProps>(() => [styles.tabs, xstyle])}>
      {children}
    </AriaTabs>
  );
}

export interface TabListProps<T extends object> extends Omit<AriaTabListProps<T>, 'className' | 'style'> {
  /** `Tab`s, each with an `id` matching a `TabPanel`. */
  children: AriaTabListProps<T>['children'];
}

/**
 * The row of tabs. Name it with `aria-label` (or `aria-labelledby`) when the page has more than one set of tabs.
 * If the tabs don't fit, the row scrolls sideways.
 */
export function TabList<T extends object>(props: TabListProps<T>) {
  return <AriaTabList {...props} {...racStyles<TabListRenderProps>(() => [styles.list])} />;
}

export interface TabProps extends Omit<AriaTabProps, 'className' | 'style'> {
  /** Matches the `id` of the `TabPanel` it shows. */
  id: AriaTabProps['id'];
  /** The label. Keep it to one or two words. */
  children: ReactNode;
}

/** One tab. Selected: brand indicator under the label. Hovered: a pale brand indicator. */
export function Tab({ children, ...props }: TabProps) {
  return (
    <AriaTab
      {...props}
      data-themis-touch-target=""
      {...racStyles<TabRenderProps>((s) => [
        styles.tab,
        s.isDisabled && styles.disabled,
        touchTarget.area,
        s.isDisabled ? interactiveCursor.disabled : s.isSelected ? styles.cursorSelected : interactiveCursor.enabled,
      ])}
    >
      {composeRenderProps(children, (children, s) => (
        <>
          {/* Figma: the focus ring hugs the text (an inline box, shorter than the line), so it stays clear of the bar. */}
          <span {...stylex.props(styles.label)}>
            <span
              {...stylex.props(
                styles.labelText,
                focusRing.base,
                s.isFocusVisible && focusRing.visible,
                s.isFocusVisible && focusRing.radiusSm,
              )}
            >
              {children}
            </span>
          </span>
          {/* Hover indicator, under tabs that aren't selected. */}
          <span
            aria-hidden="true"
            {...stylex.props(styles.underline, styles.hoverUnderline, s.isHovered && !s.isSelected && !s.isDisabled && styles.shown)}
          />
          {/* The selected indicator slides from the previous tab to this one. */}
          <SelectionIndicator {...stylex.props(styles.underline, styles.indicator)} />
        </>
      ))}
    </AriaTab>
  );
}

export interface TabPanelProps extends Omit<AriaTabPanelProps, 'className' | 'style'> {
  /** Matches the `id` of its `Tab`. */
  id: AriaTabPanelProps['id'];
  children: AriaTabPanelProps['children'];
}

/** The content for one tab. Only the selected tab's panel is shown. */
export function TabPanel(props: TabPanelProps) {
  return (
    <AriaTabPanel
      {...props}
      {...racStyles<TabPanelRenderProps>((s) => [styles.panel, focusRing.base, s.isFocusVisible && focusRing.visible])}
    />
  );
}


const styles = stylex.create({
  tabs: { display: 'flex', flexDirection: 'column' },
  list: {
    position: 'relative',
    display: 'flex',
    gap: spacing.sm,
    // Too many tabs for the width: scroll sideways, without a visible scrollbar.
    overflowX: 'auto',
    scrollbarWidth: 'none',
    '::-webkit-scrollbar': { display: 'none' },
  },
  tab: {
    position: 'relative',
    zIndex: 1,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    // Figma: 8px above and below, 6px each side (3xs + 2xs, split across nested frames). 40px tall.
    paddingBlock: spacing.xs,
    paddingInline: `calc(${spacing['3xs']} + ${spacing['2xs']})`,
    borderRadius: radius.radiusSm,
    color: color.text,
    // Figma type/heading/sm.
    fontFamily: fontTheme.familyHeading,
    fontSize: font.sizeSm,
    lineHeight: font.lineHeightSm,
    fontWeight: font.weightSemibold,
    whiteSpace: 'nowrap',
    outline: 'none',
    userSelect: 'none',
    WebkitTapHighlightColor: 'transparent',
  },
  disabled: { color: color.textDisabledOnBackground },
  cursorSelected: { cursor: 'default' },
  label: { position: 'relative' },
  labelText: { position: 'relative', borderRadius: radius.radiusSm },
  underline: {
    position: 'absolute',
    insetInlineStart: 0,
    bottom: 0,
    width: '100%',
    // Figma Component Tokens: tabs/item/indicator/height/default.
    height: tabs.itemIndicatorHeightDefault,
    // Figma: a rounded bar (radius sm), not a border.
    borderRadius: radius.radiusSm,
    pointerEvents: 'none',
  },
  // Figma: border-brand-hover, a pale brand bar (40% brand mixed into the background).
  hoverUnderline: {
    backgroundColor: color.borderBrandHover,
    opacity: 0,
    transitionProperty: 'opacity',
    transitionDuration: { default: duration.base, '@media (prefers-reduced-motion: reduce)': '0s' },
    transitionTimingFunction: easing.standard,
  },
  shown: { opacity: 1 },
  indicator: {
    zIndex: 1,
    backgroundColor: color.borderBrand,
    // React Aria animates these from the previously selected tab.
    transitionProperty: 'translate, width',
    transitionDuration: { default: duration.base, '@media (prefers-reduced-motion: reduce)': '0s' },
    transitionTimingFunction: easing.standard,
  },
  // Figma: 16px between the tabs and the panel.
  panel: { position: 'relative', marginBlockStart: spacing.sm, borderRadius: radius.radiusSm, outline: 'none' },
});
