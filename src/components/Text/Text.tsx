import * as stylex from '@stylexjs/stylex';
import type { HTMLAttributes, ReactNode } from 'react';

import { type TextVariant, textStyles } from '../../styles/type-styles';

export type { TextVariant };
export type TextElement = 'p' | 'span' | 'div' | 'strong' | 'em' | 'small' | 'label';

export interface TextProps extends Omit<HTMLAttributes<HTMLElement>, 'className' | 'style'> {
  /** The text. */
  children: ReactNode;
  /**
   * The Figma text style (`type/body/…`, `type/label/base`, `type/caption/base`).
   * @default 'body-base'
   */
  variant?: TextVariant;
  /**
   * The HTML element. Paragraphs are `p`; text inside a line is `span`.
   * @default 'p' for body styles, 'span' for label and caption
   */
  as?: TextElement;
  /** For `as="label"`: the id of the form control it labels. */
  htmlFor?: string;
  /** Layout-only StyleX overrides (margin, grid placement). Do not restyle type. */
  xstyle?: stylex.StyleXStyles;
}

/**
 * Body text, labels and captions in the body font, using the Figma text styles. Color is inherited, so it follows
 * the theme (or whatever it sits in).
 */
export function Text({ variant = 'body-base', as, children, xstyle, ...props }: TextProps) {
  const Tag = as ?? (variant.startsWith('body') ? 'p' : 'span');
  return (
    <Tag {...props} {...stylex.props(styles.base, variant.startsWith('body') && styles.paragraph, textStyles[variant], xstyle)}>
      {children}
    </Tag>
  );
}

const styles = stylex.create({
  base: { margin: 0 },
  // Fewer lone words at the ends of paragraphs.
  paragraph: { textWrap: 'pretty' },
});
