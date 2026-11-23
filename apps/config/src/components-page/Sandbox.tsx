import * as stylex from '@stylexjs/stylex';
import { createContext, type ReactNode, useContext } from 'react';
import { ThemeProvider, type ThemeSettings } from 'themis-ds';

import { border as borderWidth } from '../../../../src/tokens/borderWidth.stylex';
import { color } from '../../../../src/tokens/colorTheme.stylex';
import { font as fontTheme } from '../../../../src/tokens/fontTheme.stylex';
import { border as radius } from '../../../../src/tokens/radius.stylex';
import { spacing } from '../../../../src/tokens/spacing.stylex';
import { font } from '../../../../src/tokens/typography.stylex';

/** The theme being edited, for the sandboxes. */
export const SandboxTheme = createContext<ThemeSettings | null>(null);

/**
 * A component's sandbox: a framed box in the config tool's style, with the theme being edited applied inside (its
 * colors, fonts, border width and radius). Overlays opened from it (a modal, a menu) portal into it, so they keep the
 * theme too.
 */
export function Sandbox({ name, children }: { name: string; children: ReactNode }) {
  const theme = useContext(SandboxTheme);
  return (
    <div {...stylex.props(styles.frame)}>
      <ThemeProvider theme={theme ?? undefined} xstyle={styles.themed}>
        <div {...stylex.props(styles.stage)} data-component-stage={name}>
          {children}
        </div>
      </ThemeProvider>
    </div>
  );
}

const styles = stylex.create({
  // The frame is the tool's: its border color and width, a medium radius, clipping the theme's background to it.
  frame: {
    borderStyle: 'solid',
    borderWidth: borderWidth.widthSm,
    borderColor: color.border,
    borderRadius: radius.radiusMd,
    overflow: 'hidden',
  },
  // Inside, everything is the theme's. Loose text in the stories (a tab panel's sentence) takes its body font and color.
  themed: {
    backgroundColor: color.background,
    color: color.text,
    fontFamily: fontTheme.familyBody,
    fontSize: font.sizeSm,
    lineHeight: font.lineHeightSm,
  },
  // Plain block layout, as Storybook shows stories: components that fill their space (ColorArea, Table, sliders) get
  // the stage's width, and buttons and the like sit at the start.
  stage: { display: 'flow-root', minHeight: '7rem', padding: spacing.md, overflowX: 'auto' },
});
