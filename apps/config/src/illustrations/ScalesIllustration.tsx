import * as stylex from '@stylexjs/stylex';
import { type ReactNode, useId, useLayoutEffect, useRef, useState } from 'react';

import { border as borderWidth } from '../../../../src/tokens/borderWidth.stylex';
import { color } from '../../../../src/tokens/colorTheme.stylex';
import { duration } from '../../../../src/tokens/motion.stylex';
import { HANG, LEFT_ARM, type MarkPart, POST, RIGHT_ARM } from './logomark-shapes';
import { TILT_DEG } from './Logomark';
import { ARM_SHINES, BASE_SHINES, BASE_STEPS, FINIAL_SHINE, PANS, POST_FULL, ROD_SHINE } from './scales-illustration-shapes';
import { starPath } from './star';
import { useTwinkleOnThemeChange } from './twinkle';
import type { ThemeRadius } from 'themis-ds';

const c = { brand: color.brand, line: color.border } as unknown as Record<'brand' | 'line', string>;
/** The brand 50% of the way to white: a dark brand would otherwise read as a heavy blot. */
export const lightBrand = `color-mix(in srgb, ${c.brand} 50%, white)`;
/**
 * The outlines take the theme's border width (border/width/sm: none in borderless themes, 1px small, 2px medium, 3px
 * large) and stay that width on screen whatever size the illustration is drawn at. The strings keep their drawn
 * lines in every theme.
 */
const themeWidth = borderWidth.widthSm as unknown as string;

export interface ScalesIllustrationProps {
  /** Rendered width; the height follows the drawing's proportions. */
  width?: number | string;
  /**
   * The fill, as a CSS color: drawn like the logomark, in this color with the outlines in the surrounding text color
   * (black in the tool), instead of in the theme's brand and border colors. Without it the theme's brand fills it.
   */
  brand?: string;
  /** Lighten the brand fills by 50%, for dark brands. Ignored when `brand` is given. */
  lightenBrand?: boolean;
  /**
   * The outline width, as a CSS length, instead of the theme's border/width/sm. Used with `brand`, e.g. the theme's
   * width but never under 1px, so a white or near-white brand still shows against a white page.
   */
  lineWidth?: string;
  /** Tip the scales, as the logomark does while a theme color fails contrast. */
  isUnbalanced?: boolean;
  /**
   * `rocking`: the scales tip back and forth and the stars twinkle, over and over (a loading screen). Still with
   * reduced motion.
   * @default 'still'
   */
  motion?: 'still' | 'rocking';
  /** The theme's radius: the stars' points are sharp with none, softer from small to large. */
  radius?: ThemeRadius;
  xstyle?: stylex.StyleXStyles;
}

/**
 * The stars: where Figma has them, the two small ones a little bigger (bottom left by a quarter, far left by half) so
 * a large theme's inside outline still leaves the brand showing.
 */
const STAR_SPOTS = [
  { cx: 112.07, cy: 377.97, r: 22.97 * 1.25 },
  { cx: 346.39, cy: 314.57, r: 30.91 },
  { cx: 12.11, cy: 188.18, r: 11.3 * 1.5 },
];

/** How each pan moves with the end of its arm when the arms turn by `deg` around the top of the post. */
function panShift(i: number, deg: number) {
  const [x, y] = HANG[i]!;
  const a = (deg * Math.PI) / 180;
  const dx = x - 240.24;
  const dy = y - 104;
  return `translate(${(240.24 + dx * Math.cos(a) - dy * Math.sin(a) - x).toFixed(2)}px, ${(104 + dx * Math.sin(a) + dy * Math.cos(a) - y).toFixed(
    2,
  )}px)`;
}
const TIPPED = [panShift(0, -TILT_DEG), panShift(1, -TILT_DEG)];

/**
 * The Themis scales (Figma 2484:2768): a finial, curved arms and pans hung on strings, a stepped base, sparkles and
 * highlights. The logomark's drawing in full, and it moves the same way: the arms turn 8° when a color fails contrast
 * and each pan moves with the end of its arm. The stars twinkle when the theme changes. Decoration only: hidden from
 * assistive tech.
 */
export function ScalesIllustration({
  width: renderWidth,
  brand: brandColor,
  lightenBrand = false,
  lineWidth,
  isUnbalanced = false,
  motion = 'still',
  radius = 'medium',
  xstyle,
}: ScalesIllustrationProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  // How many screen pixels a drawing unit takes at the size it's shown, so the thin parts' outlines can be capped.
  const svgRef = useRef<SVGSVGElement>(null);
  const [pxPerUnit, setPxPerUnit] = useState(1);
  useLayoutEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const measure = () => svg.clientWidth > 0 && setPxPerUnit(svg.clientWidth / VIEW_WIDTH);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(svg);
    return () => observer.disconnect();
  }, []);
  /** The outline width, capped at this many screen pixels (a CSS length either way). */
  const capped = (px: number) => `min(${width}, ${px.toFixed(2)}px)`;
  const shine = { fill: 'white', fillOpacity: 0.5 };
  const brand = brandColor ?? (lightenBrand ? lightBrand : c.brand);
  // With an explicit fill the outlines take the surrounding text color, as the logomark does.
  const line = brandColor ? 'currentColor' : c.line;
  const width = lineWidth ?? themeWidth;
  const rocking = motion === 'rocking';
  const stars = [useRef<SVGGElement>(null), useRef<SVGGElement>(null), useRef<SVGGElement>(null)];
  useTwinkleOnThemeChange(stars, !rocking);

  // A shape with an inside stroke (the Figma export's): twice the width, masked to the shape. Anything in `shine` is
  // drawn between the fill and the outline, so it stays inside the outline's edge.
  const inside = (key: string, d: string, shine?: ReactNode, evenOdd = false, lineWidth = width) => (
    <g key={key}>
      <path d={d} fillRule={evenOdd ? 'evenodd' : undefined} style={{ fill: brand }} />
      {shine}
      <mask id={`${uid}${key}`} fill="white">
        <path d={d} fillRule={evenOdd ? 'evenodd' : undefined} />
      </mask>
      <path d={d} mask={`url(#${uid}${key})`} vectorEffect="non-scaling-stroke" style={{ stroke: line, strokeWidth: `calc(2 * ${lineWidth})` }} />
    </g>
  );
  const at = ({ at: [x, y] }: MarkPart, d: string, attrs: React.SVGProps<SVGPathElement>) => (
    <path d={d} transform={`translate(${x} ${y})`} vectorEffect="non-scaling-stroke" {...attrs} />
  );
  // The arms and post join without a seam: their outlines first (a stroke under the fill), then their fills.
  const outline = { style: { fill: line, stroke: line, strokeWidth: `calc(2 * ${width})`, strokeLinejoin: 'round' as const } };
  const fill = { style: { fill: brand } };
  const arms = (content: ReactNode) => (
    <g data-part="arms" {...stylex.props(styles.turning, styles.arms, rocking ? styles.armsRocking : isUnbalanced && styles.armsTipped)}>
      {content}
    </g>
  );
  const pan = (i: number, content: ReactNode) => (
    <g
      key={i}
      data-part="pan"
      {...stylex.props(styles.turning, rocking && (i === 0 ? styles.leftPanRocking : styles.rightPanRocking))}
      style={!rocking && isUnbalanced ? { transform: TIPPED[i] } : undefined}
    >
      {content}
    </g>
  );

  return (
    <svg ref={svgRef} viewBox={`0 0 ${VIEW_WIDTH} 455`} width={renderWidth} fill="none" aria-hidden="true" focusable="false" {...stylex.props(styles.svg, xstyle)}>
      {STAR_SPOTS.map(({ cx, cy, r }) => starPath(cx, cy, r, radius)).map((d, i) => (
        <g key={i} ref={stars[i]} data-part="star" {...stylex.props(styles.star, rocking && styles.starTwinkling, rocking && STAR_DELAY[i])}>
          {inside(`star${i}`, d)}
        </g>
      ))}
      {/* The strings, behind the arms and bowls. */}
      {PANS.map((p, i) =>
        pan(
          i,
          p.strings.map((d) => <path key={d} d={d} fillRule="evenodd" style={{ fill: line }} />),
        ),
      )}
      {arms(
        <>
          {at(LEFT_ARM, LEFT_ARM.d[0]!, outline)}
          {at(RIGHT_ARM, RIGHT_ARM.d[0]!, outline)}
        </>,
      )}
      {at(POST, POST_FULL, outline)}
      {arms(
        <>
          {at(LEFT_ARM, LEFT_ARM.d[0]!, fill)}
          {at(RIGHT_ARM, RIGHT_ARM.d[0]!, fill)}
          {ARM_SHINES.map((d) => (
            <path key={d} d={d} {...shine} />
          ))}
        </>,
      )}
      {at(POST, POST_FULL, fill)}
      <rect {...ROD_SHINE} {...shine} />
      <path d={FINIAL_SHINE} {...shine} />
      {/* The base over the bottom of the rod, its outline included. */}
      {BASE_STEPS.map((d, i) =>
        inside(`base${i}`, d, <path d={BASE_SHINES[i]} {...shine} />, false, i === 0 ? capped(TOP_STEP_HEIGHT * pxPerUnit * THIN_INSIDE) : width),
      )}
      {PANS.map((p, i) =>
        pan(
          i,
          <>
            {inside(`bowl${i}`, p.bowl, <path d={p.bowlShine} {...shine} />)}
            {/* The rim: its fill, its shine, then its outline over both. */}
            <rect {...p.rim} style={{ fill: brand }} />
            <rect {...p.rimShine} {...shine} />
            <rect {...p.rim} vectorEffect="non-scaling-stroke" style={{ fill: 'none', stroke: line, strokeWidth: capped(p.rim.height * pxPerUnit * THIN_CENTERED) }} />
          </>,
        ),
      )}
    </svg>
  );
}

// Rocking (the loading screen): the arms swing between -8° and 8° and each pan swings with the end of its arm
// (panShift at ±8°, worked out here because keyframes need fixed values).
const rock = stylex.keyframes({ from: { transform: 'rotate(-8deg)' }, to: { transform: 'rotate(8deg)' } });
const rockLeftPan = stylex.keyframes({ from: { transform: 'translate(6.93px, 17.66px)' }, to: { transform: 'translate(-4.41px, -18.44px)' } });
const rockRightPan = stylex.keyframes({ from: { transform: 'translate(4.41px, -18.51px)' }, to: { transform: 'translate(-6.93px, 17.73px)' } });
const twinkle = stylex.keyframes({
  '0%': { transform: 'scale(1) rotate(0deg)', opacity: 1 },
  '20%': { transform: 'scale(1.3) rotate(18deg)', opacity: 0.75 },
  '38%': { transform: 'scale(0.92) rotate(0deg)', opacity: 1 },
  '50%, 100%': { transform: 'scale(1) rotate(0deg)', opacity: 1 },
});
const VIEW_WIDTH = 438;
/** The top step of the base (BASE_STEPS[0]), in drawing units. */
const TOP_STEP_HEIGHT = 11.23;
/*
 * The outlines keep their width on screen however small the scales are drawn, so at loading-screen size a thick
 * border would cover the thin parts and turn them black. Their outlines are capped at a share of their height on
 * screen, so some brand always shows: the rims (a centered stroke) at 40%, the base's top step (an inside stroke, at
 * its top and bottom) at 30%. Large drawings and thin borders never reach the caps.
 */
const THIN_CENTERED = 0.4;
const THIN_INSIDE = 0.3;

/** One swing of the rocking scales, in seconds; they swing there and back (`alternate`), so a full round is twice this. */
export const ROCK_SECONDS = 1.4;
const ROCK = `${ROCK_SECONDS}s`;
const rocks = {
  animationDuration: ROCK,
  animationTimingFunction: 'ease-in-out',
  animationIterationCount: 'infinite',
  animationDirection: 'alternate',
} as const;

const styles = stylex.create({
  svg: { display: 'block', height: 'auto', overflow: 'visible' },
  // Tipping, as the logomark: a little settle at the end, like a balance coming to rest. None with reduced motion.
  turning: {
    transformBox: 'view-box',
    transitionProperty: 'transform',
    transitionDuration: { default: `calc(${duration.slow} * 3)`, '@media (prefers-reduced-motion: reduce)': '0s' },
    transitionTimingFunction: 'cubic-bezier(0.34, 1.4, 0.64, 1)',
  },
  // The arms turn around the top of the post.
  arms: { transformOrigin: '240.24px 104px' },
  armsTipped: { transform: 'rotate(-8deg)' },
  armsRocking: { animationName: { default: rock, '@media (prefers-reduced-motion: reduce)': 'none' }, ...rocks },
  leftPanRocking: { animationName: { default: rockLeftPan, '@media (prefers-reduced-motion: reduce)': 'none' }, ...rocks },
  rightPanRocking: { animationName: { default: rockRightPan, '@media (prefers-reduced-motion: reduce)': 'none' }, ...rocks },
  // Each star twinkles around its own middle.
  star: { transformBox: 'fill-box', transformOrigin: 'center' },
  starTwinkling: {
    animationName: { default: twinkle, '@media (prefers-reduced-motion: reduce)': 'none' },
    animationDuration: '1.8s',
    animationTimingFunction: 'ease-in-out',
    animationIterationCount: 'infinite',
  },
});

// The stars take turns.
const delays = stylex.create({
  first: { animationDelay: '0s' },
  second: { animationDelay: '0.6s' },
  third: { animationDelay: '1.2s' },
});
const STAR_DELAY = [delays.first, delays.second, delays.third];
