import * as stylex from '@stylexjs/stylex';
import type { ThemeColors } from 'themis-ds';

import { color } from '../../../src/tokens/colorTheme.stylex';
import { spacing } from '../../../src/tokens/spacing.stylex';

/**
 * A theme's main colors as three 8px dots (brand, background, text), each with a 1px outline so a dot that matches
 * the surface behind it still shows. Decorative: the theme's name says which theme it is.
 */
export function ThemeDots({ colors }: { colors: ThemeColors }) {
  return (
    <span aria-hidden="true" {...stylex.props(styles.dots)}>
      {[colors.brand, colors.background, colors.text].map((c, i) => (
        <span key={i} {...stylex.props(styles.dot)} style={{ backgroundColor: c }} />
      ))}
    </span>
  );
}

const styles = stylex.create({
  dots: { display: 'inline-flex', alignItems: 'center', gap: spacing['3xs'] },
  dot: {
    width: '0.5rem',
    height: '0.5rem',
    flexShrink: 0,
    boxSizing: 'border-box',
    borderRadius: '50%',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: color.border,
  },
});
