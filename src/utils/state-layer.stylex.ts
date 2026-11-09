import * as stylex from '@stylexjs/stylex';

/**
 * State Layer: the hover/press overlay drawn over a component's Surface (Figma layer "State Layer").
 *
 * Figma stores fixed darken/lighten colours per theme (`colorTheme/color.transform-*`). In code the
 * *direction* is calculated from the Surface colour instead, so it stays right for any colour a user
 * picks at runtime: a dark Surface gets a white overlay, a light one a black overlay. The *amount*
 * stays fixed per token (transform-20 → 0.2, transform-90 → 0.9).
 *
 * Use it inside `stylex.create` so the formula resolves against the Surface colour on each element:
 *
 *   backgroundImage: stylex.firstThatWorks(
 *     `linear-gradient(oklch(from ${color.brand} ${stateLayer.direction} 0 0 / 0.2), oklch(from ${color.brand} ${stateLayer.direction} 0 0 / 0.2))`,
 *     `linear-gradient(${color.transform20}, ${color.transform20})`, // browsers without relative colour
 *   )
 *
 * `direction` is an OKLCH lightness: 1 (white) when the base is darker than 0.62, otherwise 0 (black).
 * 0.62 is close to where white text stops reading well on a colour.
 */
export const stateLayer = stylex.defineConsts({
  direction: 'clamp(0, (0.62 - l) * 999, 1)',
});
