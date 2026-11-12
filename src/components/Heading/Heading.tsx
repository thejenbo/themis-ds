import * as stylex from '@stylexjs/stylex';
import type { HTMLAttributes, ReactNode } from 'react';

import { type HeadingSize, headingStyles } from '../../styles/type-styles';

export type { HeadingSize };
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

/** The size each level gets when `size` isn't set. */
const defaultSize: Record<HeadingLevel, HeadingSize> = { 1: 'xl', 2: 'lg', 3: 'md', 4: 'base', 5: 'sm', 6: 'xs' };

export interface HeadingProps extends Omit<HTMLAttributes<HTMLHeadingElement>, 'className' | 'style'> {
  /** The heading text. */
  children: ReactNode;
  /**
   * The heading's place in the page outline (`<h1>`–`<h6>`). Pick it for structure, not looks: one h1 per page,
   * and don't skip levels going down.
   */
  level: HeadingLevel;
  /**
   * The look (Figma `type/heading/…`), when it should differ from the level's default:
   * h1 xl, h2 lg, h3 md, h4 base, h5 sm, h6 xs.
   */
  size?: HeadingSize;
  /** Layout-only StyleX overrides (margin, grid placement). Do not restyle type. */
  xstyle?: stylex.StyleXStyles;
}

/**
 * A heading in the heading font, using the Figma `type/heading/…` styles. The level (h1–h6) and the size are
 * separate, so the page outline stays correct whatever the design calls for.
 */
export function Heading({ level, size, children, xstyle, ...props }: HeadingProps) {
  const Tag = `h${level}` as const;
  return (
    <Tag {...props} {...stylex.props(styles.base, headingStyles[size ?? defaultSize[level]], xstyle)}>
      {children}
    </Tag>
  );
}

const styles = stylex.create({
  // Balanced line breaks avoid a lone word on the last line.
  base: { margin: 0, textWrap: 'balance' },
});
