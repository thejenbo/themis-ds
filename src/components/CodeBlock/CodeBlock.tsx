import * as stylex from '@stylexjs/stylex';
import { useFocusRing } from 'react-aria';

import { border as radius } from '../../tokens/radius.stylex';
import { spacing } from '../../tokens/spacing.stylex';
import { font } from '../../tokens/typography.stylex';
import { focusRing } from '../../utils/focus-ring';
import { type CodeLanguage, codeStyles, highlight, useCodeFont } from '../Code/highlight';

export interface CodeBlockProps {
  /** The code, as plain text. Line breaks and indentation are kept as written. */
  children: string;
  /**
   * The language to colour it as. `text` leaves it in one colour.
   * @default 'text'
   */
  language?: CodeLanguage;
  /**
   * What the code is, read by screen readers when the block is focused, e.g. "Theme file". The block can be focused
   * so keyboard users can scroll it.
   */
  'aria-label': string;
  /**
   * Load Space Mono from Google Fonts (a stylesheet link in the page head, added once). Turn off when your app hosts
   * the font itself.
   * @default true
   */
  loadFont?: boolean;
  /** Layout-only StyleX overrides (margin, max height, grid placement). Do not restyle colour or type. */
  xstyle?: stylex.StyleXStyles;
}

/**
 * A block of code: a file, or a snippet to copy. In Space Mono on Monokai in every theme. Long lines scroll sideways
 * rather than wrap, and the block scrolls (with the keyboard too) when it's taller than its max height.
 */
export function CodeBlock({ children, language = 'text', 'aria-label': ariaLabel, loadFont = true, xstyle }: CodeBlockProps) {
  useCodeFont(loadFont);
  const { isFocusVisible, focusProps } = useFocusRing();
  return (
    <pre
      {...focusProps}
      role="region"
      aria-label={ariaLabel}
      tabIndex={0}
      {...stylex.props(codeStyles.base, styles.block, focusRing.base, isFocusVisible && focusRing.visible, xstyle)}
    >
      <code>{highlight(children, language)}</code>
    </pre>
  );
}

const styles = stylex.create({
  block: {
    position: 'relative',
    margin: 0,
    padding: spacing.sm,
    overflow: 'auto',
    whiteSpace: 'pre',
    tabSize: 2,
    fontSize: font.sizeCode,
    lineHeight: font.lineHeightCode,
    borderRadius: radius.radiusMd,
  },
});
