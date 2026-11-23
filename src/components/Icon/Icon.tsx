import * as stylex from '@stylexjs/stylex';
import { createElement } from 'react';

import { iconStyle } from '../../theme/icon-style.stylex';
import { border as borderWidth } from '../../tokens/borderWidth.stylex';
import { duration, easing } from '../../tokens/motion.stylex';
import { border as radius } from '../../tokens/radius.stylex';
import { type IconName, type IconShape, iconSet } from './icon-set';

export type { IconName } from './icon-set';
export { iconNames } from './icon-set';

export type IconSize = 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge';

export interface IconProps {
  /** Which icon. The Themis set is a chosen subset of Lucide, under Lucide's names (see the Gallery story). */
  name: IconName;
  /**
   * 12, 16, 20, 24 or 32px (in rem, so it follows the text size setting). Icons next to labels in Button, IconButton and
   * inputs are `small`; Chip's are `xsmall`.
   * @default 'small'
   */
  size?: IconSize;
  /**
   * What the icon means, for icons that stand on their own (no visible text says the same thing). Without it the icon
   * is decorative and hidden from screen readers. Inside Button, IconButton and the like, leave it out: they're named
   * by their own label or `aria-label`.
   */
  'aria-label'?: string;
  /**
   * Animates the icon's lines drawing themselves in: `false` hides them, `true` draws them in (motion/duration.fast;
   * instantly under reduced motion). Leave it out for an icon that's simply shown. Checkbox uses it for its tick.
   */
  drawn?: boolean;
  /** Layout-only StyleX overrides (margin, flex, grid placement). Do not restyle color or size. */
  xstyle?: stylex.StyleXStyles;
}

/**
 * An icon from the Themis set, drawn in the current text color. Its lines follow the theme: they're as thick as the
 * component borders (`border/width/mandatory`, from 1.25px up to a cap per size so small icons never clog), and with
 * radius `none` corners turn sharp, line ends flat, and a few icons switch to hand-drawn sharp versions.
 */
export function Icon({ name, size = 'small', 'aria-label': ariaLabel, drawn, xstyle }: IconProps) {
  const { shapes, sharp } = iconSet[name] as { shapes: IconShape[]; sharp?: IconShape[] };
  const a11y = ariaLabel ? { role: 'img', 'aria-label': ariaLabel } : { 'aria-hidden': true };
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      data-themis-icon={name}
      {...a11y}
      {...stylex.props(styles.icon, sizes[size], xstyle)}
    >
      {sharp ? (
        <>
          <g {...stylex.props(styles.round)}>{draw(shapes, size, drawn)}</g>
          <g {...stylex.props(styles.sharp)}>{draw(sharp, size, drawn)}</g>
        </>
      ) : (
        draw(shapes, size, drawn)
      )}
    </svg>
  );
}

/** Lucide draws dots as zero-length lines (a path ending `h.01`, or a `line` 0.01 long) or tiny circles (r 1 or 0.5). */
const isDotLine = (tag: string, attributes: Record<string, string>) =>
  (tag === 'path' && /[hv]\.01$/.test(attributes.d ?? '')) ||
  (tag === 'line' &&
    Math.abs(Number(attributes.x2) - Number(attributes.x1)) + Math.abs(Number(attributes.y2) - Number(attributes.y1)) < 0.1);
const isDotCircle = (tag: string, attributes: Record<string, string>) => tag === 'circle' && Number(attributes.r) <= 1;

function draw(shapes: IconShape[], size: IconSize, drawn: boolean | undefined) {
  return shapes.map(([tag, attributes, options], index) => {
    const dot = isDotLine(tag, attributes) || isDotCircle(tag, attributes);
    return createElement(tag, {
      key: index,
      ...attributes,
      // Drawing in: each line's length counts as 1, so a dash offset of 1 hides it and 0 shows it all. Dots fade instead.
      ...(drawn !== undefined && !dot && { pathLength: 1 }),
      // A tiny circle only looks solid while the stroke covers its center; below a 2-unit stroke it shows a hole.
      ...(isDotCircle(tag, attributes) && { fill: 'currentColor' }),
      ...stylex.props(
        isDotLine(tag, attributes) && styles.dotLine,
        tag === 'rect' && styles.rect,
        options?.detail && details[size],
        drawn !== undefined && (dot ? styles.fade : styles.drawable),
        drawn === false && (dot ? styles.faded : styles.undrawn),
      ),
    });
  });
}

/*
 * Line weight. Icons draw their lines as thick as the component borders (`border/width/mandatory`) at every size, so
 * an icon reads as part of the component it sits in. Each size has a cap, so large borders don't crowd small icons,
 * and a floor of 1.25px for the thin border modes. The 24 × 24 grid is scaled to the icon's size, so each pixel value
 * is converted to grid units (× 24 / size).
 */
const stroke = (cap: string, units: number) => `calc(clamp(1.25px, ${borderWidth.widthMandatory}, ${cap}) * ${units})`;

const styles = stylex.create({
  icon: {
    flexShrink: 0,
    verticalAlign: 'middle',
    strokeLinejoin: iconStyle.join,
    strokeLinecap: iconStyle.cap,
  },
  round: { display: iconStyle.round },
  sharp: { display: iconStyle.sharp },
  // Flat ends would hide a zero-length line, so dots keep round or square ends.
  dotLine: { strokeLinecap: iconStyle.dotCap },
  // Rectangles inside icons (Copy, CreditCard, Calendar) follow the radius, up to Lucide's own corners.
  rect: { rx: `min(calc(${radius.radiusXs} / 2), 4px)` },
  drawable: {
    strokeDasharray: 1,
    strokeDashoffset: 0,
    transitionProperty: 'stroke-dashoffset',
    transitionDuration: { default: duration.fast, '@media (prefers-reduced-motion: reduce)': '0s' },
    transitionTimingFunction: easing.standard,
  },
  undrawn: { strokeDashoffset: 1 },
  fade: {
    transitionProperty: 'opacity',
    transitionDuration: { default: duration.fast, '@media (prefers-reduced-motion: reduce)': '0s' },
    transitionTimingFunction: easing.standard,
  },
  faded: { opacity: 0 },
});

const sizes = stylex.create({
  xsmall: { width: '0.75rem', height: '0.75rem', strokeWidth: stroke('1.5px', 2) },
  small: { width: '1rem', height: '1rem', strokeWidth: stroke('2px', 1.5) },
  medium: { width: '1.25rem', height: '1.25rem', strokeWidth: stroke('2.25px', 1.2) },
  large: { width: '1.5rem', height: '1.5rem', strokeWidth: stroke('2.5px', 1) },
  xlarge: { width: '2rem', height: '2rem', strokeWidth: stroke('2.75px', 0.75) },
});

/** Small marks inside an outline (TriangleAlert's "!") are at most 2 grid units, so they keep clear of thick outlines. */
const details = stylex.create({
  xsmall: { strokeWidth: `min(${stroke('1.5px', 2)}, 2px)` },
  small: { strokeWidth: `min(${stroke('2px', 1.5)}, 2px)` },
  medium: { strokeWidth: `min(${stroke('2.25px', 1.2)}, 2px)` },
  large: { strokeWidth: `min(${stroke('2.5px', 1)}, 2px)` },
  xlarge: { strokeWidth: `min(${stroke('2.75px', 0.75)}, 2px)` },
});
