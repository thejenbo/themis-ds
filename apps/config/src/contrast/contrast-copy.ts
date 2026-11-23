import type { ColorTokens, ThemeColors } from 'themis-ds';

export const COLOR_LABELS: Record<keyof ThemeColors, string> = {
  brand: 'Brand',
  text: 'Text',
  background: 'Background',
  error: 'Error',
  warning: 'Warning',
  success: 'Success',
};
export const COLOR_KEYS = Object.keys(COLOR_LABELS) as (keyof ThemeColors)[];

/** What the contrast modal shows: one of the six colors, or the explanation of the ratings. */
export type ContrastTab = keyof ThemeColors | 'about';

/**
 * Each pair from tokens/contrast-pairs.json in plain words, for the contrast modal: where people see it, which
 * components use it, and a word to show in the sample.
 */
export interface PairCopy {
  where: string;
  usedBy: string;
  sample: string;
}

const statePairs = (state: 'error' | 'warning' | 'success', Name: string, tone: string): Record<string, PairCopy> => ({
  [state]: {
    where: `${Name} text on the page`,
    usedBy: `${tone} outline and subtle buttons, ${state} chips and toasts${state === 'error' ? ', error messages' : ''}`,
    sample: state === 'error' ? 'Required' : Name,
  },
  [`inverse-on-${state}`]: { where: `Text on ${state} fills`, usedBy: `${tone} buttons and solid ${state} chips`, sample: tone },
  [`inverse-on-${state}-hover`]: { where: `Text on ${state} fills, hovered`, usedBy: `${tone} buttons on hover`, sample: tone },
  [`${state}-on-${state}-tint`]: {
    where: `${Name} text on ${state === 'error' ? 'an' : 'a'} ${state} highlight`,
    usedBy: `${tone} outline and subtle buttons on hover${state === 'error' ? ', danger menu items' : ''}`,
    sample: tone,
  },
});

export const PAIR_COPY: Record<string, PairCopy> = {
  'text-brand': {
    where: 'Brand text on the page',
    usedBy: 'Outline and subtle buttons, toggle buttons, segmented controls, brand chips and toasts',
    sample: 'Edit',
  },
  'inverse-on-brand': {
    where: 'Text on brand fills',
    usedBy: 'Brand buttons, selected toggles and segments, accordion and table headers, solid chips',
    sample: 'Save',
  },
  'inverse-on-brand-hover': {
    where: 'Text on brand fills, hovered',
    usedBy: 'Brand buttons, toggles, accordion and table headers on hover',
    sample: 'Save',
  },
  'text-brand-on-brand-tint': {
    where: 'Brand text on a brand highlight',
    usedBy: 'Outline and subtle buttons, toggle buttons and segments on hover',
    sample: 'Edit',
  },
  text: { where: 'Body text on the page', usedBy: 'Everything', sample: 'Aa Body' },
  'text-on-background-hover': {
    where: 'Text on a hovered neutral button',
    usedBy: 'Neutral outline and subtle buttons on hover',
    sample: 'Cancel',
  },
  'inverse-on-neutral': {
    where: 'Text on neutral fills',
    usedBy: 'Neutral buttons, solid neutral chips, the search field’s clear button',
    sample: 'Done',
  },
  'inverse-on-neutral-hover': { where: 'Text on neutral fills, hovered', usedBy: 'Neutral buttons on hover', sample: 'Done' },
  disabled: {
    where: 'Disabled text',
    usedBy: 'Disabled checkboxes, radios, tabs, menu items and switches; empty tables',
    sample: 'Disabled',
  },
  ...statePairs('error', 'Error', 'Danger'),
  ...statePairs('warning', 'Warning', 'Warning'),
  ...statePairs('success', 'Success', 'Success'),
};

/** A color token's Figma/CSS name: `stateErrorTint` → `state.error-tint`, `textInverse` → `text-inverse`. */
export function tokenName(key: keyof ColorTokens): string {
  const kebab = (s: string) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
  return key.startsWith('state') ? `state.${kebab(key.slice(5)).slice(1)}` : kebab(key);
}
