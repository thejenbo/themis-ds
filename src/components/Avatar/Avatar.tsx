import * as stylex from '@stylexjs/stylex';
import { type HTMLAttributes, useState } from 'react';

import { border as borderWidth } from '../../tokens/borderWidth.stylex';
import { color } from '../../tokens/colorTheme.stylex';
import { avatar } from '../../tokens/components.stylex';
import { font as fontTheme } from '../../tokens/fontTheme.stylex';
import { components as offsets, border as radius } from '../../tokens/radius.stylex';
import { font } from '../../tokens/typography.stylex';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type AvatarVariant = 'solid' | 'outline';
export type AvatarStatus = 'online';

export interface AvatarProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'className' | 'style' | 'children'> {
  /** The person's (or team's) name. Used for the initials and as the accessible name, e.g. "Taylor Brooks". */
  name: string;
  /** Photo URL. Fills the avatar; if it fails to load, the initials show instead. */
  src?: string;
  /**
   * One or two letters to show instead of the ones taken from `name` (first letters of the first and last words).
   */
  initials?: string;
  /**
   * 24, 32, 40, 48 or 56px square.
   * @default 'md'
   */
  size?: AvatarSize;
  /**
   * `solid`: brand fill with light initials. `outline`: background fill, brand border and initials.
   * @default 'solid'
   */
  variant?: AvatarVariant;
  /** Shows a status dot on the bottom-right corner. It's included in the accessible name ("Taylor Brooks, online"). */
  status?: AvatarStatus;
  /**
   * Words read for each status. Pass translations here.
   * @default { online: 'online' }
   */
  statusLabels?: Partial<Record<AvatarStatus, string>>;
  /**
   * Hide the avatar from screen readers. Use when the name is already shown right next to it, so it isn't read
   * twice. If there's a status, make sure it's said elsewhere too.
   */
  isDecorative?: boolean;
  /** Layout-only StyleX overrides (margin, flex, grid placement). Do not restyle colors or size. */
  xstyle?: stylex.StyleXStyles;
}

/** First letters of the first and last words: "Taylor Brooks" → "TB", "Bug" → "B". */
export function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const first = (word?: string) => (word ? Array.from(word)[0] ?? '' : '');
  const letters = words.length > 1 ? first(words[0]) + first(words[words.length - 1]) : first(words[0]);
  return letters.toLocaleUpperCase();
}

const defaultStatusLabels: Record<AvatarStatus, string> = { online: 'online' };

/**
 * A person's photo or initials, at a fixed size, with an optional status dot. Read-only: to make it clickable,
 * put it inside a Button or link that has its own accessible name.
 */
export function Avatar({
  name,
  src,
  initials,
  size = 'md',
  variant = 'solid',
  status,
  statusLabels,
  isDecorative = false,
  xstyle,
  ...props
}: AvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showImage = src != null && src !== failedSrc;
  const statusLabel = status ? (statusLabels?.[status] ?? defaultStatusLabels[status]) : null;
  const label = statusLabel ? `${name}, ${statusLabel}` : name;
  return (
    <span
      {...props}
      {...(isDecorative ? { 'aria-hidden': true } : { role: 'img', 'aria-label': label })}
      data-themis-size={size}
      {...stylex.props(styles.avatar, sizes[size], xstyle)}
    >
      <span {...stylex.props(styles.content, variant === 'solid' ? styles.solid : styles.outline)}>
        {showImage ? (
          <img src={src} alt="" onError={() => setFailedSrc(src)} {...stylex.props(styles.image)} />
        ) : (
          <span aria-hidden="true">{initials ?? initialsOf(name)}</span>
        )}
      </span>
      {status && <span data-themis-part="status" {...stylex.props(styles.dot, dots[size], statuses[status])} />}
    </span>
  );
}

/*
 * The status dot sits on the corner's curve: its center is where a 45° line from the square corner meets the rounded
 * edge, (1 − 1/√2) × the radius in from each side (capped at half the avatar). Figma stores that distance per radius
 * mode and size (radius collection: components/avatar/indicator-offset), so the dot moves with the radius mode.
 */
const dotAt = (offset: string, dot: number) => `calc(${offset} - ${dot / 2}px)`;

const styles = stylex.create({
  avatar: {
    position: 'relative',
    display: 'inline-flex',
    flexShrink: 0,
    verticalAlign: 'middle',
    borderRadius: radius.radiusMd,
  },
  content: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    borderRadius: 'inherit',
    fontFamily: fontTheme.familyHeading,
    fontWeight: font.weightBold,
    lineHeight: 1,
    userSelect: 'none',
  },
  solid: { backgroundColor: color.brand, color: color.textInverse },
  // The border is drawn on top of the photo or initials, like an inside stroke, so it adds no size.
  outline: {
    backgroundColor: color.background,
    color: color.textBrand,
    '::after': {
      content: "''",
      position: 'absolute',
      inset: 0,
      borderRadius: 'inherit',
      borderStyle: 'solid',
      borderWidth: borderWidth.widthMandatory,
      borderColor: color.borderBrand,
      pointerEvents: 'none',
    },
  },
  image: { display: 'block', width: '100%', height: '100%', objectFit: 'cover' },
  dot: {
    position: 'absolute',
    borderRadius: radius.radiusFull,
    borderStyle: 'solid',
    borderWidth: borderWidth.widthXs,
    borderColor: color.border,
  },
});

/** Figma: box size and initials size (Component Tokens: avatar/font/size), fixed on every breakpoint. */
const sizes = stylex.create({
  xs: { width: '1.5rem', height: '1.5rem', fontSize: avatar.fontSizeXs },
  sm: { width: '2rem', height: '2rem', fontSize: avatar.fontSizeSm },
  md: { width: '2.5rem', height: '2.5rem', fontSize: avatar.fontSizeMd },
  lg: { width: '3rem', height: '3rem', fontSize: avatar.fontSizeLg },
  xl: { width: '3.5rem', height: '3.5rem', fontSize: avatar.fontSizeXl },
});

/** Figma dot sizes: 6, 8, 10, 12, 12px. */
const dots = stylex.create({
  xs: { width: '6px', height: '6px', right: dotAt(offsets.avatarIndicatorOffsetXs, 6), bottom: dotAt(offsets.avatarIndicatorOffsetXs, 6) },
  sm: { width: '8px', height: '8px', right: dotAt(offsets.avatarIndicatorOffsetSm, 8), bottom: dotAt(offsets.avatarIndicatorOffsetSm, 8) },
  md: { width: '10px', height: '10px', right: dotAt(offsets.avatarIndicatorOffsetMd, 10), bottom: dotAt(offsets.avatarIndicatorOffsetMd, 10) },
  lg: { width: '12px', height: '12px', right: dotAt(offsets.avatarIndicatorOffsetLg, 12), bottom: dotAt(offsets.avatarIndicatorOffsetLg, 12) },
  xl: { width: '12px', height: '12px', right: dotAt(offsets.avatarIndicatorOffsetXl, 12), bottom: dotAt(offsets.avatarIndicatorOffsetXl, 12) },
});

const statuses = stylex.create({
  online: { backgroundColor: color.stateSuccess },
});
