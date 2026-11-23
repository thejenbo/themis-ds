import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { ThemeProvider } from '../../theme/ThemeProvider';
import { collectionModes } from '../../tokens/themes';
import { Chip, type ChipTone, type ChipVariant } from './Chip';
import { Icon } from '../Icon';
import docs from './Chip.docs';

const TONES: ChipTone[] = ['neutral', 'brand', 'success', 'warning', 'danger'];
const VARIANTS: ChipVariant[] = ['outline', 'solid'];
const LABELS: Record<ChipTone, string> = {
  neutral: 'Pending',
  brand: 'Beta',
  success: 'Paid',
  warning: 'Overdue',
  danger: 'Declined',
};

/** Placeholder icon until the icon library exists, drawn at Figma's size (about 9×8). */

const meta = {
  title: 'Data display/Chip',
  component: Chip,
  tags: ['autodocs'],
  parameters: {
    themis: docs,
    docs: { description: { component: docs.summary } },
  },
  args: { children: 'Paid', tone: 'success', variant: 'outline' },
  argTypes: {
    tone: { control: 'inline-radio', options: TONES },
    variant: { control: 'inline-radio', options: VARIANTS },
    children: { control: 'text' },
    iconLeft: { control: false },
    iconRight: { control: false },
  },
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Use the controls for every prop, and the toolbar to switch themes. */
export const Playground: Story = {};

/** Every tone, outline and solid, with and without icons, mirroring the Figma "Chip" frame. */
export const Gallery: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, max-content)', gap: 12, alignItems: 'center' }}>
      {VARIANTS.flatMap((variant) =>
        TONES.map((tone) => (
          <div key={`${variant}-${tone}`} style={{ display: 'contents' }}>
            <span style={{ font: '12px sans-serif' }}>
              {variant} / {tone}
            </span>
            <Chip tone={tone} variant={variant}>
              {LABELS[tone]}
            </Chip>
            <Chip tone={tone} variant={variant} iconLeft={<Icon name="heart" size="xsmall" />}>
              {LABELS[tone]}
            </Chip>
            <Chip tone={tone} variant={variant} iconRight={<Icon name="heart" size="xsmall" />}>
              {LABELS[tone]}
            </Chip>
            <span />
            <span />
          </div>
        )),
      )}
    </div>
  ),
  play: async ({ canvas }) => {
    // Figma: 20px tall whatever the content; read-only (not focusable, no pointer cursor).
    const chips = canvas.getAllByText('Paid').map((label) => label.parentElement!);
    for (const chip of chips) {
      await expect(Math.round(chip.getBoundingClientRect().height)).toBe(20);
      await expect(chip.tabIndex).toBe(-1);
      await expect(getComputedStyle(chip).cursor).not.toBe('pointer');
    }
    // Icons are decorative.
    await expect(chips[1]!.querySelector('[aria-hidden="true"] svg')).not.toBeNull();
  },
};

/** Typical use: one status per row, with the column header saying what it describes. */
export const InATable: Story = {
  render: () => (
    <table style={{ borderCollapse: 'collapse', font: '16px sans-serif' }}>
      <thead>
        <tr>
          <th style={{ textAlign: 'start', padding: 8 }}>Invoice</th>
          <th style={{ textAlign: 'start', padding: 8 }}>Payment status</th>
        </tr>
      </thead>
      <tbody>
        {(
          [
            ['INV-1042', 'success', 'Paid'],
            ['INV-1043', 'warning', 'Overdue'],
            ['INV-1044', 'neutral', 'Pending'],
            ['INV-1045', 'danger', 'Declined'],
          ] as const
        ).map(([invoice, tone, label]) => (
          <tr key={invoice} style={{ borderTop: '1px solid #ccc' }}>
            <td style={{ padding: 8 }}>{invoice}</td>
            <td style={{ padding: 8 }}>
              <Chip tone={tone}>{label}</Chip>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  ),
};

/** Every tone and variant in each color theme. */
export const ThemeMatrix: Story = {
  tags: ['!autodocs'],
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      {collectionModes.colorTheme.map((theme) => (
        <ThemeProvider key={theme} modes={{ colorTheme: theme }}>
          <div style={{ padding: 16, display: 'grid', gap: 8 }}>
            <strong>{theme}</strong>
            {VARIANTS.map((variant) => (
              <div key={variant} style={{ display: 'flex', gap: 8 }}>
                {TONES.map((tone) => (
                  <Chip key={tone} tone={tone} variant={variant}>
                    {LABELS[tone]}
                  </Chip>
                ))}
              </div>
            ))}
          </div>
        </ThemeProvider>
      ))}
    </div>
  ),
};
