import * as stylex from '@stylexjs/stylex';

/**
 * How icons draw their corners, set by the radius mode. Hand-written (not generated from /tokens): Figma can't bind
 * line joins or ends to variables, so these exist only in code. ThemeProvider switches them with `iconThemes`.
 *
 * - `join`, `cap`: SVG line joins and ends. Round normally; sharp (mitred, flat) for radius `none`.
 * - `dotCap`: line ends for dots drawn as zero-length lines. Square for radius `none`, since flat ends would hide them.
 * - `round`, `sharp`: `display` of an icon's two drawings, for icons that have a hand-drawn sharp version.
 */
export const iconStyle = stylex.defineVars({
  join: 'round',
  cap: 'round',
  dotCap: 'round',
  round: 'inline',
  sharp: 'none',
});
