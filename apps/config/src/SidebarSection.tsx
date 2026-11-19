import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';
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
  /** Shown beside the title while the section is closed: what's set inside, at a glance. */
  summary: ReactNode;
  isExpanded: boolean;
  onExpandedChange: (isExpanded: boolean) => void;
  children: ReactNode;
}

/**
 * A sidebar section (Colors, Borders, Fonts) that opens and closes. A lighter take on Accordion: the underlined
 * heading and a chevron, no fill or frame. The heading sticks below the theme row while its section scrolls past
 * (the sidebar sets `--theme-bar-height`). Built on React Aria `Disclosure`: an h2 holding a button with
 * `aria-expanded`.
 */
export function SidebarSection({ title, summary, isExpanded, onExpandedChange, children }: SidebarSectionProps) {
  return (
    <Disclosure isExpanded={isExpanded} onExpandedChange={onExpandedChange} {...stylex.props(styles.section)}>
      <Heading level={2} {...stylex.props(headingStyles.sm, styles.heading)}>
        <Button
          slot="trigger"
          {...racStyles<ButtonRenderProps>((s) => [styles.trigger, focusRing.base, s.isFocusVisible && focusRing.visible])}
        >
          <span {...stylex.props(styles.title)}>{title}</span>
          {!isExpanded && <span {...stylex.props(styles.summary)}>{summary}</span>}
          <span
            aria-hidden="true"
            {...stylex.props(styles.chevron, isExpanded ? styles.chevronPushed : styles.chevronClosed)}
          >
            <Icon name="chevron-down" size="small" />
          </span>
        </Button>
      </Heading>
      <DisclosurePanel {...stylex.props(styles.panel)}>{children}</DisclosurePanel>
    </Disclosure>
  );
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
    paddingBlock: spacing.xs,
    backgroundColor: color.background,
  },
  trigger: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: spacing.xs,
    width: '100%',
    padding: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
    color: color.text,
    textAlign: 'start',
    font: 'inherit',
    cursor: 'pointer',
  },
  // type/heading/sm, underlined to the width of the text (Figma 2433:38627).
  title: {
    flexShrink: 0,
    borderBlockEndWidth: borderWidth.widthSm,
    borderBlockEndStyle: 'solid',
    borderBlockEndColor: color.border,
  },
  // Caption text in the muted colour (6:1 on the background), floated to the end beside the chevron.
  summary: {
    display: 'flex',
    marginInlineStart: 'auto',
    alignItems: 'center',
    gap: spacing.xs,
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
    display: 'flex',
    flexShrink: 0,
    transitionProperty: 'transform',
    transitionDuration: { default: duration.fast, '@media (prefers-reduced-motion: reduce)': '0s' },
    transitionTimingFunction: easing.standard,
  },
  // While open there's no summary, so the chevron takes the free space itself.
  chevronPushed: { marginInlineStart: 'auto' },
  chevronClosed: { transform: 'rotate(-90deg)' },
  // Its own stacking context, so raised parts of the fields inside (a segmented control's selected item) can't draw
  // over the sticky headings. The space below makes 64px from the last field to the next heading while open (Figma
  // 2422:35486), counting the sections' gap and the heading's top padding; closed sections stay close together.
  panel: {
    isolation: 'isolate',
    paddingBlockStart: spacing.xs,
    paddingBlockEnd: `calc(${spacing['2xl']} - ${spacing.sm} - ${spacing.xs})`,
  },
});
