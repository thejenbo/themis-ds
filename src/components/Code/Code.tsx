import * as stylex from '@stylexjs/stylex';

import { border as radius } from '../../tokens/radius.stylex';
import { spacing } from '../../tokens/spacing.stylex';
import { type CodeLanguage, codeStyles, highlight, useCodeFont } from './highlight';

export interface CodeProps {
  /** The code, as plain text, e.g. "themis.theme.json" or "<ThemeProvider theme={theme}>". */
  children: string;
  /**
   * The language to color it as. `text` leaves it in one color.
   * @default 'text'
   */
  language?: CodeLanguage;
  /**
   * Load Space Mono from Google Fonts (a stylesheet link in the page head, added once). Turn off when your app hosts
   * the font itself.
   * @default true
   */
  loadFont?: boolean;
  /** Layout-only StyleX overrides (margin). Do not restyle color or type. */
  xstyle?: stylex.StyleXStyles;
}

/**
 * Code inside a sentence: a file name, a prop, a short snippet. In Space Mono, Monokai colors on black, in every theme, so it reads as
 * code whatever the theme looks like, at 87.5% of the text around it (Space Mono is wide).
 */
export function Code({ children, language = 'text', loadFont = true, xstyle }: CodeProps) {
  useCodeFont(loadFont);
  return <code {...stylex.props(codeStyles.base, styles.inline, xstyle)}>{highlight(children, language)}</code>;
}

const styles = stylex.create({
  inline: {
    // Relative to the text it sits in, so it scales with a heading, body text or a caption alike.
    fontSize: '0.875em',
    paddingBlock: spacing['3xs'],
    paddingInline: spacing['2xs'],
    borderRadius: radius.radiusXs,
    // Each line of a wrapped snippet gets its own padding and corners.
    boxDecorationBreak: 'clone',
    WebkitBoxDecorationBreak: 'clone',
    overflowWrap: 'anywhere',
  },
});
