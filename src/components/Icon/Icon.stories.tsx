import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { ThemeProvider } from '../../theme/ThemeProvider';
import { border as borderWidth } from '../../tokens/borderWidth.stylex';
import { border as radius } from '../../tokens/radius.stylex';
import { collectionModes } from '../../tokens/themes';
import { Button } from '../Button';
import { IconButton } from '../IconButton';
import { TextInput } from '../TextInput';
import { Icon, type IconName, type IconSize, iconNames } from './Icon';
import docs from './Icon.docs';
import { iconSet } from './icon-set';

const SIZES: IconSize[] = ['xsmall', 'small', 'medium', 'large', 'xlarge'];
const SHARP_NAMES = iconNames.filter((name) => 'sharp' in iconSet[name]);
const caption = { fontSize: 12, opacity: 0.7 } as const;

const meta = {
  title: 'Data display/Icon',
  component: Icon,
  tags: ['autodocs'],
  parameters: { themis: docs, docs: { description: { component: docs.summary } } },
  args: { name: 'heart' },
  argTypes: { name: { control: 'select', options: iconNames } },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Use the controls for every prop, and the toolbar's `borderWidth` and `radius` to see the icon follow the theme. */
export const Playground: Story = {};

/** The whole Themis set at 12, 16, 20, 24 and 32px. Follows the toolbar's `borderWidth` and `radius`. */
export const Gallery: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: `160px repeat(${SIZES.length}, 48px)`, gap: 12, alignItems: 'center' }}>
      <span />
      {SIZES.map((s) => <span key={s} style={caption}>{s}</span>)}
      {iconNames.map((name) => (
        <div key={name} style={{ display: 'contents' }}>
          <code style={caption}>{name}</code>
          {SIZES.map((s) => <Icon key={s} name={name} size={s} />)}
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const sizeOf = (size: number) => canvasElement.querySelectorAll('svg[data-themis-icon="heart"]')[size]!.getBoundingClientRect().width;
    await expect([0, 1, 2, 3, 4].map(sizeOf)).toEqual([12, 16, 20, 24, 32]);
    // Dots drawn as tiny circles are filled, so they stay solid with thin strokes.
    const dot = canvasElement.querySelector('svg[data-themis-icon="ellipsis-vertical"] circle') as SVGElement;
    await expect(getComputedStyle(dot).fill).not.toBe('none');
  },
};

const SAMPLE: IconName[] = ['heart', 'check', 'chevron-down', 'triangle-alert', 'settings', 'copy', 'credit-card', 'trash'];

/**
 * Every border width (down) and radius (across), at 20px. The outlined box at the start of each cell uses
 * `border/width/sm` and `border/radius/md`, to compare the icons with component borders.
 */
export const ThemeModes: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: `100px repeat(${collectionModes.radius.length}, auto)`, gap: 16, alignItems: 'center' }}>
      <span />
      {collectionModes.radius.map((r) => <span key={r} style={caption}>radius: {r}</span>)}
      {collectionModes.borderWidth.map((w) => (
        <div key={w} style={{ display: 'contents' }}>
          <span style={caption}>border: {w}</span>
          {collectionModes.radius.map((r) => (
            <ThemeProvider key={r} modes={{ borderWidth: w, radius: r }}>
              <div data-testid={`cell-${w}-${r}`} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: 8 }}>
                <span style={{ width: 20, height: 20, border: `${borderWidth.widthSm} solid currentColor`, borderRadius: radius.radiusMd }} />
                {SAMPLE.map((name) => <Icon key={name} name={name} size="medium" />)}
              </div>
            </ThemeProvider>
          ))}
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const icon = (w: string, r: string, name: IconName) =>
      canvasElement.querySelector(`[data-testid="cell-${w}-${r}"] svg[data-themis-icon="${name}"]`) as SVGElement;
    const style = (w: string, r: string, name: IconName) => getComputedStyle(icon(w, r, name));
    // Radius none: sharp joins and flat line ends; other modes round.
    await expect(style('medium', 'none', 'check').strokeLinejoin).toBe('miter');
    await expect(style('medium', 'none', 'check').strokeLinecap).toBe('butt');
    await expect(style('medium', 'medium', 'check').strokeLinejoin).toBe('round');
    // …dots keep square ends so they don't vanish…
    const dot = icon('medium', 'none', 'triangle-alert').querySelector('g:last-child path[d$="h.01"]') as SVGElement;
    await expect(getComputedStyle(dot).strokeLinecap).toBe('square');
    // …rectangles lose their rounding…
    await expect(getComputedStyle(icon('medium', 'none', 'credit-card').querySelector('rect')!).rx).toBe('0px');
    // …and icons with a hand-drawn sharp version swap to it.
    const [round, sharp] = icon('medium', 'none', 'heart').querySelectorAll('g') as unknown as [SVGElement, SVGElement];
    await expect(getComputedStyle(round).display).toBe('none');
    await expect(getComputedStyle(sharp).display).not.toBe('none');
    const [roundMedium] = icon('medium', 'medium', 'heart').querySelectorAll('g') as unknown as [SVGElement];
    await expect(getComputedStyle(roundMedium).display).not.toBe('none');
    // The stroke follows the border width, with a floor so "none" still draws icons.
    const stroke = (w: string) => parseFloat(style(w, 'medium', 'check').strokeWidth);
    await expect(stroke('none')).toBeGreaterThan(0);
    await expect(stroke('large')).toBeGreaterThan(stroke('medium'));
  },
};

/** The hand-drawn sharp versions (radius none) under Lucide's originals (radius medium), with large borders. */
export const SharpVersions: Story = {
  globals: { borderWidth: 'large' },
  render: () => (
    <div style={{ display: 'grid', gap: 24 }}>
      {(['medium', 'none'] as const).map((r) => (
        <ThemeProvider key={r} modes={{ radius: r }}>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            <span style={{ ...caption, width: 110 }}>radius: {r}</span>
            {SHARP_NAMES.map((name) => <Icon key={name} name={name} size="xlarge" />)}
            {SHARP_NAMES.map((name) => <Icon key={`s-${name}`} name={name} size="medium" />)}
          </div>
        </ThemeProvider>
      ))}
    </div>
  ),
};

/** Icons inside components, at each border width, to judge the icon stroke next to the component borders. */
export const InComponents: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 24, maxWidth: 720 }}>
      {collectionModes.borderWidth.map((w) => (
        <ThemeProvider key={w} modes={{ borderWidth: w }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'end', flexWrap: 'wrap' }}>
            <span style={{ ...caption, width: 90 }}>border: {w}</span>
            <Button iconLeft={<Icon name="plus" />}>Add item</Button>
            <Button variant="outline" iconRight={<Icon name="chevron-down" />}>Sort</Button>
            <IconButton aria-label={`Settings (${w})`}>
              <Icon name="settings" />
            </IconButton>
            <TextInput label={`Search (${w})`} icon={<Icon name="search" />} />
          </div>
        </ThemeProvider>
      ))}
    </div>
  ),
};

/** Decorative by default; with `aria-label`, an image screen readers announce. */
export const Accessibility: Story = {
  render: () => (
    <p style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <Icon name="triangle-alert" aria-label="Warning" />
      <span>Your session expires in 5 minutes.</span>
      <Icon name="info" />
    </p>
  ),
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole('img', { name: 'Warning' })).toBeInTheDocument();
    await expect(canvasElement.querySelector('svg[data-themis-icon="info"]')).toHaveAttribute('aria-hidden', 'true');
  },
};
