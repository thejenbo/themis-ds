import * as stylex from '@stylexjs/stylex';

type StyleArg = stylex.StyleXStyles | false | null | undefined;

/**
 * Bridges StyleX and React Aria Components.
 *
 * RAC exposes interaction state (hovered, pressed, focus-visible, selected, …) through render props
 * on `className` / `style`. StyleX can't target RAC's `data-*` attributes with selectors, so we
 * resolve styles from that state instead:
 *
 *   <AriaButton {...racStyles<ButtonRenderProps>((s) => [styles.base, s.isPressed && styles.pressed])} />
 *
 * Always use this (rather than StyleX `:hover`/`:focus` pseudo-classes) for interactive state, so
 * behaviour matches RAC exactly (e.g. no sticky hover on touch, keyboard-only focus rings).
 */
export function racStyles<State>(resolve: (state: State) => StyleArg[]) {
  return {
    className: (state: State) => stylex.props(...resolve(state)).className ?? '',
    style: (state: State) => stylex.props(...resolve(state)).style,
  };
}
