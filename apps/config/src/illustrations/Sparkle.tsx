// Generated from Figma (Star 5, node 2002:21842). Brand fills follow color.brand and lines color.border.
import * as stylex from '@stylexjs/stylex';
import { useId } from 'react';

import { color } from '../../../../src/tokens/colorTheme.stylex';

const c = { brand: color.brand, line: color.border } as unknown as Record<'brand' | 'line', string>;

export interface SparkleProps {
  /** Rendered width; the height follows the drawing's proportions. */
  width?: number | string;
  xstyle?: stylex.StyleXStyles;
}

/** Decoration only: hidden from assistive tech. */
export function Sparkle({ width, xstyle }: SparkleProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const id = (name: string) => `${uid}${name}`;
  return (
    <svg
      viewBox="0 0 19 19"
      width={width}
      fill="none"
      aria-hidden="true"
      focusable="false"
      {...stylex.props(styles.svg, xstyle)}
    >
      <use href={`#${id('stroke0_2002_21842')}`} style={{ fill: c.brand }} />
      <mask id={id('stroke1_2002_21842')} fill="white">
        <use href={`#${id('stroke0_2002_21842')}`} />
      </mask>
      <path
        d="M12.2686 6.45536L10.0495 0.332233C9.89048 -0.106554 9.2718 -0.111802 9.10536 0.324224L6.78271 6.40882C6.73028 6.54617 6.62047 6.65375 6.48208 6.70335L0.333706 8.90716C-0.107288 9.06523 -0.112564 9.68701 0.325686 9.85254L6.43579 12.1603C6.57332 12.2123 6.68129 12.3217 6.73138 12.4599L8.95047 18.5831C9.10949 19.0218 9.72817 19.0271 9.89461 18.5911L12.2173 12.5065C12.2697 12.3691 12.3795 12.2615 12.5179 12.2119L18.6663 10.0081C19.1073 9.85005 19.1125 9.22828 18.6743 9.06275L12.5642 6.75495C12.4267 6.703 12.3187 6.59357 12.2686 6.45536Z"
        strokeWidth="2.01481"
        mask={`url(#${id('stroke1_2002_21842')})`}
        style={{ stroke: c.line }}
      />
      <defs>
        <path
          id={id('stroke0_2002_21842')}
          d="M18.6743 9.06275C19.1125 9.22828 19.1073 9.85005 18.6663 10.0081L12.5179 12.2119C12.3795 12.2615 12.2697 12.3691 12.2173 12.5065L9.89461 18.5911C9.72817 19.0271 9.10949 19.0218 8.95047 18.583L6.73138 12.4599C6.68129 12.3217 6.57332 12.2123 6.43579 12.1603L0.325686 9.85254C-0.112564 9.68701 -0.107288 9.06523 0.333706 8.90716L6.48208 6.70335C6.62047 6.65375 6.73028 6.54617 6.78271 6.40882L9.10536 0.324224C9.2718 -0.111802 9.89048 -0.106554 10.0495 0.332233L12.2686 6.45536C12.3187 6.59357 12.4267 6.703 12.5642 6.75495L18.6743 9.06275Z"
        />
      </defs>
    </svg>
  );
}

const styles = stylex.create({ svg: { display: 'block', height: 'auto', overflow: 'visible' } });
