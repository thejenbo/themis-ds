import * as stylex from '@stylexjs/stylex';
import { useLayoutEffect, useRef, useState } from 'react';

import { duration } from '../../../../src/tokens/motion.stylex';
import { BASE, BOWLS, HANG, LEFT_ARM, type MarkPart, PIVOT, POST, RIGHT_ARM, RIM, VIEW_BOX } from './logomark-shapes';

interface LogomarkProps {
  /** The fill: the brand colour of the theme being edited. Without it the mark is drawn in the text colour. */
  brand?: string;
  /** Tip the scales, as when a colour in the theme fails contrast: the arms tilt and the pans drop and rise with them. */
  isUnbalanced?: boolean;
  xstyle?: stylex.StyleXStyles;
}

/** How far the scales tip. */
export const TILT_DEG = 8;
/**
 * The thinnest the strings and the outline get on screen, in pixels. Drawn at 440 units wide they'd be under a
 * fifth of a pixel in the 36px header and vanish; at large sizes (about 160px up) they're drawn as designed (2 units).
 */
const MIN_STRING_PX = 0.9;
const MIN_OUTLINE_PX = 0.5;
const DRAWN = 2;

/** Where a point ends up when the arms turn by `deg` around the pivot (SVG's rotate: positive is clockwise). */
function turn([x, y]: [number, number], deg: number): [number, number] {
  const a = (deg * Math.PI) / 180;
  const dx = x - PIVOT[0];
  const dy = y - PIVOT[1];
  return [PIVOT[0] + dx * Math.cos(a) - dy * Math.sin(a), PIVOT[1] + dx * Math.sin(a) + dy * Math.cos(a)];
}
// Each pan moves with the end of its arm: the left one drops, the right one rises.
const PAN_SHIFT = HANG.map((h) => {
  const [x, y] = turn(h, -TILT_DEG);
  return `translate(${(x - h[0]).toFixed(2)}px, ${(y - h[1]).toFixed(2)}px)`;
});

/**
 * The Themis logomark: a pair of scales with a finial, curved arms and pans hung on strings (Figma "Logomark Scales"
 * 2471:2779, style=tilting; drawn in 2485:3004). Filled with the theme's brand colour and outlined in the text colour,
 * so a pale brand still reads. When the theme fails contrast the arms tip, as if the scales were no longer equal.
 * Decorative; the wordmark names it.
 *
 * Drawn back to front: the strings, then every part's outline (a stroke under its fill), then every fill, so the
 * strings tuck under the arms and bowls and the parts join without seams. The strings and outline keep a minimum
 * thickness on screen, so they still show at header and favicon sizes.
 */
export function Logomark({ brand, isUnbalanced = false, xstyle }: LogomarkProps) {
  const fill = brand ?? 'currentColor';
  const ref = useRef<SVGSVGElement>(null);
  // How many drawing units make a screen pixel at the size it's shown.
  const [unitsPerPx, setUnitsPerPx] = useState(VIEW_BOX.width / 36);
  useLayoutEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    const measure = () => svg.clientWidth > 0 && setUnitsPerPx(VIEW_BOX.width / svg.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(svg);
    return () => observer.disconnect();
  }, []);
  const outline = Math.max(DRAWN, MIN_OUTLINE_PX * unitsPerPx);
  const string = Math.max(DRAWN, MIN_STRING_PX * unitsPerPx);

  const part = ({ d, at }: MarkPart, attrs: React.SVGProps<SVGPathElement>) => (
    <g transform={`translate(${at[0]} ${at[1]})`}>
      {d.map((path) => (
        <path key={path} d={path} {...attrs} />
      ))}
    </g>
  );
  const outlined = { fill: 'currentColor', stroke: 'currentColor', strokeWidth: 2 * outline, strokeLinejoin: 'round' } as const;
  const filled = { fill };
  const arms = (attrs: React.SVGProps<SVGPathElement>) => (
    <g {...stylex.props(styles.moving, styles.arms, isUnbalanced && styles.armsTipped)}>
      {part(LEFT_ARM, attrs)}
      {part(RIGHT_ARM, attrs)}
    </g>
  );
  const pan = (i: number, content: React.ReactNode) => (
    <g key={i} {...stylex.props(styles.moving)} style={isUnbalanced ? { transform: PAN_SHIFT[i] } : undefined}>
      {content}
    </g>
  );

  return (
    <svg
      ref={ref}
      width="48"
      height={((48 * VIEW_BOX.height) / VIEW_BOX.width).toFixed(1)}
      viewBox={`${VIEW_BOX.x} ${VIEW_BOX.y} ${VIEW_BOX.width} ${VIEW_BOX.height}`}
      fill="none"
      aria-hidden="true"
      data-unbalanced={isUnbalanced || undefined}
      {...stylex.props(styles.svg, xstyle)}
    >
      {HANG.map((h, i) =>
        pan(
          i,
          <g stroke={fill} strokeWidth={string} strokeLinecap="round" data-part="strings">
            {RIM[i]!.map(([x, y]) => (
              <line key={x} x1={h[0]} y1={h[1]} x2={x} y2={y} />
            ))}
          </g>,
        ),
      )}
      {BOWLS.map((bowl, i) => pan(i, part(bowl, outlined)))}
      {arms(outlined)}
      {part(POST, outlined)}
      {part(BASE, outlined)}
      <g data-part="fill">
        {BOWLS.map((bowl, i) => pan(i, part(bowl, filled)))}
        {arms(filled)}
        {part(POST, filled)}
        {part(BASE, filled)}
      </g>
    </svg>
  );
}

const styles = stylex.create({
  // The outline reaches a little past the drawing's edges, so let it show.
  svg: { display: 'block', flexShrink: 0, overflow: 'visible' },
  // A tip with a little settle at the end, like a balance coming to rest. None with reduced motion.
  moving: {
    transformBox: 'view-box',
    transitionProperty: 'transform',
    transitionDuration: { default: `calc(${duration.slow} * 3)`, '@media (prefers-reduced-motion: reduce)': '0s' },
    transitionTimingFunction: 'cubic-bezier(0.34, 1.4, 0.64, 1)',
  },
  // The arms turn around the top of the post: PIVOT, measured from the viewBox's corner (43, 37), as view-box
  // transforms are.
  arms: { transformOrigin: '197.24px 67px' },
  // -TILT_DEG
  armsTipped: { transform: 'rotate(-8deg)' },
});
