import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';
import {
  Button as AriaButton,
  type ButtonRenderProps,
  composeRenderProps,
  Disclosure,
  DisclosureGroup,
  type DisclosureGroupProps,
  DisclosurePanel,
  type DisclosureProps,
  Heading,
} from 'react-aria-components';

import { border as borderWidth } from '../../tokens/borderWidth.stylex';
import { color } from '../../tokens/colorTheme.stylex';
import { font as fontTheme } from '../../tokens/fontTheme.stylex';
import { duration, easing } from '../../tokens/motion.stylex';
import { border as radius } from '../../tokens/radius.stylex';
import { spacing } from '../../tokens/spacing.stylex';
import { color as system } from '../../tokens/system.stylex';
import { font } from '../../tokens/typography.stylex';
import { focusRing } from '../../utils/focus-ring';
import { interactiveCursor } from '../../utils/interactive-cursor';
import { racStyles } from '../../utils/stylex-rac';
import { touchTarget } from '../../utils/touch-target';
import { baseStyles, layers } from '../Button/button-base';

export interface AccordionProps extends Omit<DisclosureProps, 'className' | 'style' | 'children'> {
  /** The header text. Keep it short; it wraps onto more lines if needed. */
  title: ReactNode;
  /** The content shown when the accordion is open. */
  children: ReactNode;
  /**
   * Heading level of the header (`<h1>`–`<h6>`), so screen-reader users can jump between items. Pick the
   * level below the nearest heading above the accordion. Doesn't change how it looks.
   * @default 3
   */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Layout-only StyleX overrides (margin, width, grid placement). Do not restyle colours or type. */
  xstyle?: stylex.StyleXStyles;
}

/**
 * A header that shows or hides a section of content. Built on React Aria `Disclosure`: the header is a
 * button inside a heading, with `aria-expanded` and `aria-controls` linking it to the content.
 * On its own, use `defaultExpanded` to start open, or `isExpanded` with `onExpandedChange` to control it.
 * Inside an `AccordionGroup`, give it an `id` and use the group's `defaultExpandedKeys` / `expandedKeys` instead.
 */
export function Accordion({ title, children, headingLevel = 3, xstyle, ...props }: AccordionProps) {
  return (
    <Disclosure
      {...props}
      {...racStyles<{ isDisabled: boolean }>((s) => [styles.root, s.isDisabled && styles.rootDisabled, xstyle])}
    >
      {({ isExpanded, isDisabled }) => (
        <>
          <Heading level={headingLevel} {...stylex.props(styles.heading)}>
            <AriaButton
              slot="trigger"
              data-themis-touch-target=""
              {...racStyles<ButtonRenderProps>((s) => [
                styles.trigger,
                isExpanded && styles.triggerOpen,
                touchTarget.area,
                focusRing.base,
                s.isFocusVisible && focusRing.visible,
                s.isFocusVisible && focusRing.inset,
                s.isFocusVisible && styles.ringRadius,
                s.isFocusVisible && isExpanded && styles.ringRadiusOpen,
                s.isDisabled ? interactiveCursor.disabled : interactiveCursor.enabled,
              ])}
            >
              {composeRenderProps(title, (title, s) => (
                <span
                  data-themis-part="surface"
                  {...stylex.props(
                    baseStyles.surface,
                    styles.header,
                    isExpanded && styles.headerOpen,
                    layers.brand.default,
                    (s.isHovered || s.isPressed) && !s.isDisabled && baseStyles.stateLayerOn,
                    isDisabled && styles.headerDisabled,
                  )}
                >
                  <span {...stylex.props(styles.title)}>{title}</span>
                  <span aria-hidden="true" {...stylex.props(styles.chevron, isExpanded && styles.chevronOpen)}>
                    <ChevronGlyph />
                  </span>
                </span>
              ))}
            </AriaButton>
          </Heading>
          <DisclosurePanel {...stylex.props(styles.panel)}>
            <div {...stylex.props(styles.content, isDisabled && styles.contentDisabled)}>{children}</div>
          </DisclosurePanel>
        </>
      )}
    </Disclosure>
  );
}

export interface AccordionGroupProps extends Omit<DisclosureGroupProps, 'className' | 'style' | 'children'> {
  /** `Accordion`s. Give each an `id` to control which are open with `expandedKeys` / `defaultExpandedKeys`. */
  children: ReactNode;
  /**
   * Whether several accordions can be open at once. Set to `false` so opening one closes the others.
   * @default true
   */
  allowsMultipleExpanded?: boolean;
  /** Layout-only StyleX overrides (margin, width, grid placement). */
  xstyle?: stylex.StyleXStyles;
}

/** Stacks accordions vertically with `spacing.xs` between them, and optionally keeps only one open at a time. */
export function AccordionGroup({ allowsMultipleExpanded = true, xstyle, children, ...props }: AccordionGroupProps) {
  return (
    <DisclosureGroup
      {...props}
      allowsMultipleExpanded={allowsMultipleExpanded}
      {...racStyles<unknown>(() => [styles.group, xstyle])}
    >
      {children}
    </DisclosureGroup>
  );
}

/** Points down; rotated to point right while closed. */
function ChevronGlyph() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M0.75 3.25 6 8.5l5.25-5.25" />
    </svg>
  );
}

// Inside radius of the outer border, so the header's corners (and the focus ring) follow the container.
const innerRadius = `calc(${radius.radiusMd} - ${borderWidth.widthSm})`;
// Figma draws the border inside the padding, so take the border width off the padding to match its sizes.
const padBlock = `calc(${spacing.xs} - ${borderWidth.widthSm})`;
const padInline = `calc(${spacing.sm} - ${borderWidth.widthSm})`;
const motion = { default: duration.base, '@media (prefers-reduced-motion: reduce)': '0s' };

const styles = stylex.create({
  group: { display: 'flex', flexDirection: 'column', gap: spacing.xs },
  // The outer border wraps header and content, so there's no line between them (Figma strokes 2/2/0/2 + 0/2/2/2).
  // No overflow clipping here: it would cut off the header's touch area. Header and panel round their own corners.
  root: {
    display: 'flex',
    flexDirection: 'column',
    borderStyle: 'solid',
    borderWidth: borderWidth.widthSm,
    borderColor: color.border,
    borderRadius: radius.radiusMd,
  },
  rootDisabled: { borderColor: system.borderDisabled },
  heading: { margin: 0, fontSize: 'inherit', fontWeight: 'inherit' },
  // The clickable header: focus ring and touch area. The Surface inside is the visible part.
  trigger: {
    position: 'relative',
    display: 'flex',
    width: '100%',
    padding: 0,
    margin: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
    textAlign: 'start',
    borderRadius: innerRadius,
    WebkitTapHighlightColor: 'transparent',
  },
  triggerOpen: { borderEndStartRadius: 0, borderEndEndRadius: 0 },
  ringRadius: { '::before': { borderRadius: `calc(${innerRadius} - ${spacing['3xs']})` } },
  ringRadiusOpen: { '::before': { borderEndStartRadius: 0, borderEndEndRadius: 0 } },
  header: {
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingBlock: padBlock,
    paddingInline: padInline,
    borderRadius: 'inherit',
    whiteSpace: 'normal',
    textAlign: 'start',
    backgroundColor: color.brand,
    color: color.textInverse,
    // type/heading/sm (the shared surface uses the label size).
    fontFamily: fontTheme.familyHeading,
    fontSize: font.sizeSm,
    fontWeight: font.weightSemibold,
  },
  headerOpen: { paddingBlockEnd: spacing.xs },
  headerDisabled: { backgroundColor: system.backgroundDisabledDefault, color: system.textDisabledInverse },
  title: { position: 'relative', flexGrow: 1, minWidth: 0 },
  chevron: {
    position: 'relative',
    display: 'flex',
    flexShrink: 0,
    transform: 'rotate(-90deg)',
    transitionProperty: 'transform',
    transitionDuration: motion,
    transitionTimingFunction: easing.standard,
  },
  chevronOpen: { transform: 'none' },
  // React Aria sets --disclosure-panel-height while opening and closing, so the height can animate.
  panel: {
    height: 'var(--disclosure-panel-height)',
    overflow: 'clip',
    borderEndStartRadius: innerRadius,
    borderEndEndRadius: innerRadius,
    transitionProperty: 'height',
    transitionDuration: motion,
    transitionTimingFunction: easing.standard,
  },
  content: {
    paddingBlockStart: spacing.xs,
    paddingBlockEnd: padBlock,
    paddingInline: padInline,
    backgroundColor: color.background,
    color: color.text,
    fontFamily: fontTheme.familyBody,
    fontSize: font.sizeSm,
    lineHeight: font.lineHeightSm,
    fontWeight: font.weightRegular,
  },
  contentDisabled: { backgroundColor: system.backgroundDisabledInverse, color: system.textDisabledDefault },
});
