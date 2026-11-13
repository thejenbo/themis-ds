import * as stylex from '@stylexjs/stylex';

import { border as borderWidth } from '../../tokens/borderWidth.stylex';
import { color } from '../../tokens/colorTheme.stylex';
import { font as fontTheme } from '../../tokens/fontTheme.stylex';
import { border as radius } from '../../tokens/radius.stylex';
import { spacing } from '../../tokens/spacing.stylex';
import { color as system } from '../../tokens/system.stylex';
import { font } from '../../tokens/typography.stylex';

/**
 * Figma "Input Base": the label, the box, the description/count row and the error message, shared by every input
 * with this look (TextInput now; Select, ComboBox and friends later), so a fix here applies to all of them.
 */
export const fieldStyles = stylex.create({
  // Label, box and helper text, 4px apart.
  field: { display: 'flex', flexDirection: 'column', gap: spacing['2xs'], width: '100%' },
  label: {
    fontFamily: fontTheme.familyBody,
    fontSize: font.sizeLabel,
    lineHeight: font.lineHeightLabel,
    fontWeight: font.weightSemibold,
    color: color.text,
  },
  optional: { fontWeight: font.weightRegular },
  /*
   * Figma "Input Box": 40px tall on every screen (8px + 24px input line + 8px), 16px sides, radius md, and a
   * 2px inside stroke, so the border comes off the padding.
   */
  box: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    minHeight: '2.5rem',
    paddingBlock: `calc(${spacing.xs} - ${borderWidth.widthMandatory})`,
    paddingInline: `calc(${spacing.sm} - ${borderWidth.widthMandatory})`,
    borderStyle: 'solid',
    borderWidth: borderWidth.widthMandatory,
    borderColor: color.border,
    borderRadius: radius.radiusMd,
    backgroundColor: color.background,
    color: color.text,
    cursor: 'text',
  },
  /*
   * Add after `focusRing.visible` and `focusRing.inset`: the ring sits 2px inside the border (Figma "Focus Ring"),
   * its corners following the box's. Inside the box it never crowds the label or help text 4px away, and a
   * container that clips overflow can't cut it off.
   */
  boxRing: { '::before': { borderRadius: `max(0px, calc(${radius.radiusMd} - ${borderWidth.widthMandatory} - ${spacing['3xs']}))` } },
  boxInvalid: { borderColor: color.stateError },
  boxDisabled: {
    backgroundColor: system.backgroundDisabledInverse,
    borderColor: system.borderDisabled,
    color: system.textDisabledDefault,
    cursor: 'not-allowed',
  },
  // Figma type/input/base: fixed 16/24, so the box stays 40px and iPhones don't zoom in on focus.
  input: {
    flexGrow: 1,
    minWidth: 0,
    padding: 0,
    margin: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
    color: 'inherit',
    fontFamily: fontTheme.familyBody,
    fontSize: font.sizeInput,
    lineHeight: font.lineHeightInput,
    fontWeight: font.weightRegular,
    outline: 'none',
    '::placeholder': { color: color.textPlaceholderDefault, opacity: 1 },
  },
  inputDisabled: { cursor: 'not-allowed' },
  // Right-hand icon slot (Figma "Icon Right"), 16px from the text.
  icon: {
    display: 'inline-flex',
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    marginInlineStart: spacing.sm,
    width: '1.25rem',
    height: '1.25rem',
  },
  iconInvalid: { color: color.stateError },
  // Figma "Context": description on the left, character count on the right, caption style.
  contextRow: { display: 'flex', alignItems: 'flex-start', gap: spacing.sm, color: color.text },
  caption: { fontFamily: fontTheme.familyBody, fontSize: font.sizeCaption, lineHeight: font.lineHeightCaption, fontWeight: font.weightRegular },
  description: { flexGrow: 1, minWidth: 0 },
  count: { marginInlineStart: 'auto', flexShrink: 0, fontVariantNumeric: 'tabular-nums' },
  countOver: { color: color.stateError },
  // Figma: the error message is body/base in the error colour, below the context row.
  error: {
    display: { default: 'block', ':empty': 'none' },
    fontFamily: fontTheme.familyBody,
    fontSize: font.sizeSm,
    lineHeight: font.lineHeightSm,
    fontWeight: font.weightRegular,
    color: color.stateError,
  },
  visuallyHidden: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    margin: '-1px',
    padding: 0,
    overflow: 'hidden',
    clip: 'rect(0 0 0 0)',
    whiteSpace: 'nowrap',
    borderWidth: 0,
  },
});
