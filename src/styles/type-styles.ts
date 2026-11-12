import * as stylex from '@stylexjs/stylex';

import { font as fontTheme } from '../tokens/fontTheme.stylex';
import { font } from '../tokens/typography.stylex';

/**
 * The Figma text styles (`type/…`), as StyleX styles. Heading and Text use these; other components can too, so a
 * label in a component matches `type/label/base` exactly.
 *
 * Sizes and line heights come from the typography tokens, so they switch to the desktop scale at 48em. Colour is
 * inherited. Button labels (`type/button/*`) are left out: only Button uses them.
 */
export const headingStyles = stylex.create({
  xl: { fontFamily: fontTheme.familyHeading, fontSize: font.size4xl, lineHeight: font.lineHeight2xl, fontWeight: font.weightBold },
  lg: { fontFamily: fontTheme.familyHeading, fontSize: font.size3xl, lineHeight: font.lineHeightXl, fontWeight: font.weightBold },
  md: { fontFamily: fontTheme.familyHeading, fontSize: font.size2xl, lineHeight: font.lineHeightLg, fontWeight: font.weightBold },
  base: { fontFamily: fontTheme.familyHeading, fontSize: font.sizeXl, lineHeight: font.lineHeightMd, fontWeight: font.weightSemibold },
  sm: { fontFamily: fontTheme.familyHeading, fontSize: font.sizeSm, lineHeight: font.lineHeightSm, fontWeight: font.weightSemibold },
  xs: { fontFamily: fontTheme.familyHeading, fontSize: font.sizeXs, lineHeight: font.lineHeightXs, fontWeight: font.weightSemibold },
});

export const textStyles = stylex.create({
  'body-large': { fontFamily: fontTheme.familyBody, fontSize: font.sizeLg, lineHeight: font.lineHeightMd, fontWeight: font.weightRegular },
  'body-large-bold': { fontFamily: fontTheme.familyBody, fontSize: font.sizeLg, lineHeight: font.lineHeightMd, fontWeight: font.weightBold },
  'body-medium': { fontFamily: fontTheme.familyBody, fontSize: font.sizeMd, lineHeight: font.lineHeightSm, fontWeight: font.weightRegular },
  'body-medium-bold': { fontFamily: fontTheme.familyBody, fontSize: font.sizeMd, lineHeight: font.lineHeightSm, fontWeight: font.weightBold },
  'body-base': { fontFamily: fontTheme.familyBody, fontSize: font.sizeSm, lineHeight: font.lineHeightSm, fontWeight: font.weightRegular },
  'body-bold': { fontFamily: fontTheme.familyBody, fontSize: font.sizeSm, lineHeight: font.lineHeightSm, fontWeight: font.weightBold },
  label: { fontFamily: fontTheme.familyBody, fontSize: font.sizeLabel, lineHeight: font.lineHeightLabel, fontWeight: font.weightSemibold },
  caption: { fontFamily: fontTheme.familyBody, fontSize: font.sizeCaption, lineHeight: font.lineHeightCaption, fontWeight: font.weightRegular },
});

export type HeadingSize = keyof typeof headingStyles;
export type TextVariant = keyof typeof textStyles;
