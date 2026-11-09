import * as stylex from '@stylexjs/stylex';
import {
  Button as AriaButton,
  type ButtonProps as AriaButtonProps,
  type ButtonRenderProps,
  composeRenderProps,
  ProgressBar,
} from 'react-aria-components';

import { border, spacing } from '../../tokens/primitives.stylex';
import { font as fontTheme } from '../../tokens/fontTheme.stylex';
import { font } from '../../tokens/typography.stylex';
import { color } from '../../tokens/colorTheme.stylex';
import { racStyles } from '../../utils/stylex-rac';

export type ButtonVariant = 'primary' | 'secondary';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<AriaButtonProps, 'className' | 'style'> {
  /**
   * Visual emphasis.
   * `primary` — the single most important action in a view.
   * `secondary` — every other action.
   * @default 'primary'
   */
  variant?: ButtonVariant;
  /**
   * Height, padding and type size.
   * @default 'md'
   */
  size?: ButtonSize;
  /**
   * Text announced to screen readers while `isPending` is true.
   * @default 'Loading'
   */
  pendingLabel?: string;
  /** Layout-only StyleX overrides (margin, flex, grid placement). Do not restyle colours or type. */
  xstyle?: stylex.StyleXStyles;
}

/**
 * Triggers an action or event — submitting a form, opening a dialog, saving a change.
 * Built on React Aria `Button`; for navigation use `Link` instead.
 */
export function Button({
  variant = 'primary',
  size = 'md',
  pendingLabel = 'Loading',
  xstyle,
  children,
  ...props
}: ButtonProps) {
  return (
    <AriaButton
      {...props}
      {...racStyles<ButtonRenderProps>((s) => [
        styles.base,
        sizes[size],
        variants[variant],
        s.isHovered && hovered[variant],
        s.isPressed && pressed[variant],
        s.isFocusVisible && styles.focusVisible,
        s.isDisabled && styles.disabled,
        xstyle,
      ])}
    >
      {composeRenderProps(children, (children, { isPending }) => (
        <>
          <span {...stylex.props(styles.label, isPending && styles.hidden)}>{children}</span>
          {isPending && (
            <ProgressBar aria-label={pendingLabel} isIndeterminate {...stylex.props(styles.spinnerWrap)}>
              <span {...stylex.props(styles.spinner)} />
            </ProgressBar>
          )}
        </>
      ))}
    </AriaButton>
  );
}

const spin = stylex.keyframes({
  from: { transform: 'rotate(0deg)' },
  to: { transform: 'rotate(360deg)' },
});

const styles = stylex.create({
  base: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing['8'],
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'transparent',
    borderRadius: border.radius6,
    fontFamily: fontTheme.familyBody,
    fontWeight: font.weightRegular,
    lineHeight: 1.25,
    cursor: 'default',
    outline: 'none',
    userSelect: 'none',
    WebkitTapHighlightColor: 'transparent',
    transitionProperty: 'background-color, border-color, color',
    transitionDuration: '120ms',
  },
  focusVisible: {
    outlineWidth: 2,
    outlineStyle: 'solid',
    outlineColor: color.borderBrand,
    outlineOffset: 2,
  },
  disabled: {
    backgroundColor: color.transform5Inverse,
    borderColor: 'transparent',
    color: color.text,
  },
  label: { display: 'inline-flex', alignItems: 'center', gap: spacing['8'] },
  hidden: { visibility: 'hidden' },
  spinnerWrap: { position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  spinner: {
    width: '1em',
    height: '1em',
    borderRadius: border.radius9999,
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: 'currentColor',
    borderTopColor: 'transparent',
    animationName: spin,
    animationDuration: '800ms',
    animationIterationCount: 'infinite',
    animationTimingFunction: 'linear',
  },
});

const sizes = stylex.create({
  sm: { minHeight: 32, paddingInline: spacing['12'], fontSize: font.sizeXs },
  md: { minHeight: 40, paddingInline: spacing['16'], fontSize: font.sizeSm },
  lg: { minHeight: 48, paddingInline: spacing['24'], fontSize: font.sizeMd },
});

const variants = stylex.create({
  primary: { backgroundColor: color.brand, color: color.textInverse },
  secondary: { backgroundColor: color.background, color: color.text, borderColor: color.border },
});

const hovered = stylex.create({
  primary: { backgroundColor: color.brand },
  secondary: { backgroundColor: color.background },
});

const pressed = stylex.create({
  primary: { backgroundColor: color.brand },
  secondary: { backgroundColor: color.background },
});
